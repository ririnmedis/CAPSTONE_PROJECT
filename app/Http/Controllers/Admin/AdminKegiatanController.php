<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Kegiatan;
use App\Models\Mahasiswa;
use App\Notifications\KegiatanStatusChanged;
use App\Models\SKPPoint;
use App\Models\KegiatanAudit;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminKegiatanController extends Controller
{
    public function index(Request $request)
    {
        // paginated listing with optional filters for admin
        $perPage = (int) $request->get('per_page', 20);
        $query = Kegiatan::with('mahasiswa')->orderBy('created_at', 'desc');

        // filter by status_verifikasi (pending, verified, rejected)
        if ($request->filled('status')) {
            $status = $request->get('status');
            if (in_array($status, ['pending','verified','rejected'])) {
                if ($status === 'pending') {
                    $query->whereNotIn('status_verifikasi', ['verified','rejected']);
                } else {
                    $query->where('status_verifikasi', $status);
                }
            }
        }

        // filter by prodi via mahasiswa relation (partial match)
        if ($request->filled('prodi')) {
            $prodi = $request->get('prodi');
            $query->whereHas('mahasiswa', function ($q) use ($prodi) {
                $q->whereRaw('LOWER(prodi) LIKE ?', ['%' . strtolower($prodi) . '%']);
            });
        }

        // search by mahasiswa name or npm
        if ($request->filled('search')) {
            $term = $request->get('search');
            $query->where(function ($q) use ($term) {
                $q->whereHas('mahasiswa', function ($mq) use ($term) {
                    $mq->whereRaw('LOWER(nama) LIKE ?', ['%' . strtolower($term) . '%'])
                       ->orWhere('npm', 'like', "%{$term}%");
                })->orWhere('kegiatan', 'like', "%{$term}%");
            });
        }

        $kegiatans = $query->paginate($perPage)->appends($request->except('page'));

        return Inertia::render('Admin/Kegiatans/Index', [
            'kegiatans' => $kegiatans,
            'filters' => $request->only(['status','prodi','search','per_page']),
        ]);
    }

    /**
     * Detect duplicate uploaded documents among kegiatans.
     * Groups by file hash when file is accessible, otherwise by filename.
     */
    public function duplicates(Request $request)
    {
        $items = Kegiatan::whereNotNull('bukti_dokumen')->get();

        $map = [];

        foreach ($items as $k) {
            $path = $k->bukti_dokumen;
            // prefer stored hash when available (computed at upload time)
            $hash = $k->bukti_hash ?? null;

            // try resolving local file path if we don't already have a hash
            $local = null;
            if (! $hash) {
                $local = $this->resolveLocalFile($path);
                if ($local && file_exists($local)) {
                    try {
                        $hash = hash_file('sha256', $local);
                    } catch (\Throwable $e) {
                        $hash = null;
                    }
                }
            } else {
                // still try to resolve local path for debugging/display purposes
                $local = $this->resolveLocalFile($path);
            }

            $key = $hash ?: 'name:' . basename(parse_url($path, PHP_URL_PATH));

            $lastAudit = null;
            try {
                $lastAudit = \App\Models\KegiatanAudit::where('kegiatan_id', $k->id)->latest()->first();
            } catch (\Throwable $e) {
                $lastAudit = null;
            }

            $map[$key][] = [
                'id' => $k->id,
                'mahasiswa' => $k->mahasiswa ? $k->mahasiswa->only(['nama','npm','email','id']) : null,
                'bukti_dokumen' => $path,
                'local_path' => $local,
                'hash' => $hash,
                'bukti_hash' => $k->bukti_hash ?? null,
                'status_verifikasi' => $k->status_verifikasi,
                'last_audit' => $lastAudit ? $lastAudit->only(['admin_id','admin_name','action','note','created_at']) : null,
            ];
        }

        // only keep groups with more than one item (possible duplicates)
        $groups = collect($map)->map(function ($list, $key) {
            return [ 'key' => $key, 'count' => count($list), 'items' => $list ];
        })->filter(fn($g) => $g['count'] > 1)->values();

        // simple AI-like suggestion: for groups where hash is present or filename identical,
        // suggest marking all but the earliest item as 'mark_rejected' (likely duplicate).
        $groups = $groups->map(function ($g) {
            $items = $g['items'];
            // sort by id ascending (assume earlier id is original)
            usort($items, function ($a, $b) { return $a['id'] <=> $b['id']; });

            // if group key starts with 'name:' it's filename grouping; otherwise hash-based
            $suggestions = [];
            for ($i = 0; $i < count($items); $i++) {
                $suggest = null;
                if ($i === 0) {
                    // keep the first one suggested to keep; admin still can change
                    $suggest = 'keep';
                } else {
                    // for subsequent items suggest rejection as duplicates
                    $suggest = 'mark_rejected';
                }
                $items[$i]['suggested_action'] = $suggest;
            }

            return ['key' => $g['key'], 'count' => $g['count'], 'items' => $items];
        })->values();

        return Inertia::render('Admin/Kegiatans/Duplicates', [
            'groups' => $groups,
        ]);
    }

    /**
     * Trigger a backfill of bukti_hash for existing kegiatans.
     * This will call the console command `kegiatan:backfill-hash` and return its output.
     */
    public function backfillHashes(Request $request)
    {
        // only allow admins (route already protected by EnsureAdmin middleware)
        $chunk = (int) $request->get('chunk', 200);
        try {
            \Artisan::call('kegiatan:backfill-hash', ['--chunk' => $chunk]);
            $out = trim(\Artisan::output());
            return response()->json(['ok' => true, 'output' => $out]);
        } catch (\Throwable $e) {
            return response()->json(['ok' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Perform an admin action on a kegiatan discovered as duplicate.
     * Actions: mark_rejected, delete, request_clarify
     */
    public function duplicateAction(Request $request, $id)
    {
        $action = $request->validate(['action' => ['required', 'string']])['action'];
        $admin_note = $request->input('admin_note');

        $kegiatan = Kegiatan::findOrFail($id);

        // record audit about who performed this duplicate action
        try {
            $user = $request->user();
            KegiatanAudit::create([
                'kegiatan_id' => $kegiatan->id,
                'admin_id' => $user ? $user->id : null,
                'admin_name' => $user ? ($user->name ?? $user->email) : null,
                'action' => $action,
                'note' => $admin_note ?? null,
            ]);
        } catch (\Throwable $e) {
            // ignore audit failures
        }

        if ($action === 'mark_rejected') {
            $kegiatan->status_verifikasi = 'rejected';
            if ($admin_note) $kegiatan->admin_note = $admin_note;
            $kegiatan->save();
            // notify mahasiswa
            try {
                $mahasiswa = Mahasiswa::find($kegiatan->mahasiswa_id);
                if ($mahasiswa) {
                    $mahasiswa->notify(new KegiatanStatusChanged($kegiatan, 'rejected', $admin_note ?? null));
                }
            } catch (\Throwable $e) {
                // ignore
            }

            // Return proper Inertia response
            if ($request->header('X-Inertia')) {
                return back()->with('success', 'Kegiatan berhasil ditolak');
            }
            return response()->json(['ok' => true, 'message' => 'Kegiatan berhasil ditolak']);
        }

        if ($action === 'delete') {
            $kegiatan->delete();
            
            // Return proper Inertia response
            if ($request->header('X-Inertia')) {
                return back()->with('success', 'Kegiatan berhasil dihapus');
            }
            return response()->json(['ok' => true, 'message' => 'Kegiatan berhasil dihapus']);
        }

        if ($action === 'request_clarify') {
            // send notification asking for clarification
            try {
                $mahasiswa = Mahasiswa::find($kegiatan->mahasiswa_id);
                if ($mahasiswa) {
                    $mahasiswa->notify(new KegiatanStatusChanged($kegiatan, 'pending', $admin_note ?? 'Mohon kirimkan bukti yang lebih jelas atau penjelasan mengenai dokumen ini.'));
                }
            } catch (\Throwable $e) {
                // ignore
            }
            
            // Return proper Inertia response
            if ($request->header('X-Inertia')) {
                return back()->with('success', 'Permintaan klarifikasi berhasil dikirim');
            }
            return response()->json(['ok' => true, 'message' => 'Permintaan klarifikasi berhasil dikirim']);
        }

        if ($request->header('X-Inertia')) {
            return back()->withErrors(['error' => 'Aksi tidak dikenali']);
        }
        return response()->json(['ok' => false, 'message' => 'Aksi tidak dikenali'], 422);
    }

    /**
     * Resolve a bukti_dokumen string to a local filesystem path if possible.
     */
    private function resolveLocalFile(?string $path)
    {
        if (! $path) return null;

        // if path is a full URL, extract path
        if (Str::startsWith($path, ['http://','https://'])) {
            $urlPath = parse_url($path, PHP_URL_PATH) ?: '';
            $candidates = [public_path(ltrim($urlPath, '/'))];
        } else {
            $candidates = [];
            // handle storage URLs like storage/..., /storage/..., or direct public paths
            $candidates[] = public_path(ltrim($path, '/'));
            $candidates[] = storage_path('app/public/' . ltrim($path, ' /'));
            $candidates[] = storage_path('app/' . ltrim($path, ' /'));
        }

        // also try basename under storage
        $basename = basename($path);
        $candidates[] = storage_path('app/public/' . $basename);
        $candidates[] = storage_path('app/' . $basename);

        foreach ($candidates as $c) {
            if ($c && file_exists($c)) return $c;
        }

        return null;
    }

    public function show($id)
    {
        $kegiatan = Kegiatan::with('mahasiswa')->findOrFail($id);
        return response()->json($kegiatan);
    }

    /**
     * Update verification status (verified|rejected)
     */
    public function updateStatus(Request $request, $id)
    {
        $kegiatan = Kegiatan::findOrFail($id);
        $previousStatus = $kegiatan->status_verifikasi;
        $data = $request->validate([
            'status_verifikasi' => ['required'],
            'admin_note' => ['nullable','string','max:1000'],
        ]);

        $kegiatan->status_verifikasi = $data['status_verifikasi'];
        $kegiatan->admin_note = $data['admin_note'] ?? null;
        $kegiatan->save();
        // record audit about this status update (who verified/rejected)
        try {
            $user = $request->user();
            KegiatanAudit::create([
                'kegiatan_id' => $kegiatan->id,
                'admin_id' => $user ? $user->id : null,
                'admin_name' => $user ? ($user->name ?? $user->email) : null,
                'action' => 'status_update:' . $data['status_verifikasi'],
                'note' => $data['admin_note'] ?? null,
            ]);
        } catch (\Throwable $e) {
            // ignore
        }
        // manage SKPPoint records: when a kegiatan gets verified, create a SKPPoint
        try {
            if ($data['status_verifikasi'] === 'verified' && $previousStatus !== 'verified') {
                // create or update skp point for this kegiatan
                SKPPoint::updateOrCreate([
                    'kegiatan_id' => $kegiatan->id,
                ], [
                    'mahasiswa_id' => $kegiatan->mahasiswa_id,
                    'kegiatan' => $kegiatan->kegiatan,
                    'tanggal_input' => $kegiatan->tanggal_input,
                    'poin' => $kegiatan->poin,
                    'bobot' => $kegiatan->bobot,
                    'bukti_dokumen' => $kegiatan->bukti_dokumen,
                    'status_verifikasi' => 'verified',
                ]);
            }

            // if it was previously verified but now changed, remove the skp point
            if ($previousStatus === 'verified' && $data['status_verifikasi'] !== 'verified') {
                SKPPoint::where('kegiatan_id', $kegiatan->id)->delete();
            }
        } catch (\Throwable $e) {
            // ignore DB errors to avoid breaking admin flow
        }
        // notify mahasiswa if available
        try {
            $mahasiswa = Mahasiswa::find($kegiatan->mahasiswa_id);
            if ($mahasiswa) {
                $mahasiswa->notify(new KegiatanStatusChanged($kegiatan, $data['status_verifikasi'], $data['admin_note'] ?? null));
            }
        } catch (\Throwable $e) {
            // ignore notification errors
        }

        // Return success response with flash message
        $statusText = $data['status_verifikasi'] === 'verified' ? 'disetujui' : 
                     ($data['status_verifikasi'] === 'rejected' ? 'ditolak' : 'diperbarui');
        
        return redirect()->back()->with('success', "Kegiatan berhasil {$statusText}.");
    }

    /**
     * Serve uploaded files securely for admin access
     */
    public function serveFile($filename)
    {
        $filePath = 'kegiatans/' . $filename;
        
        if (Storage::disk('public')->exists($filePath)) {
            $fullPath = Storage::disk('public')->path($filePath);
            return response()->file($fullPath);
        }
        
        abort(404, 'File not found');
    }
}
