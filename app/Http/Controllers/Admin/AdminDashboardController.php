<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Mahasiswa;
use App\Models\Kegiatan;

class AdminDashboardController extends Controller
{
    public function index(Request $request)
    {
        // basic stats for admin dashboard
        $totalMahasiswa = Mahasiswa::count();
        $totalKegiatan = Kegiatan::count();
        $pendingKegiatan = Kegiatan::whereNotIn('status_verifikasi', ['verified', 'rejected'])->count();
        $verifiedKegiatan = Kegiatan::where('status_verifikasi', 'verified')->count();
        $rejectedKegiatan = Kegiatan::where('status_verifikasi', 'rejected')->count();

        $recent = Kegiatan::with('mahasiswa')->orderBy('created_at', 'desc')->limit(10)->get();
        // compute duplicate groups count (reuse duplicate detection logic lightly)
        $duplicateGroupsCount = 0;
        try {
            $items = Kegiatan::whereNotNull('bukti_dokumen')->get();
            $map = [];
            foreach ($items as $k) {
                $path = $k->bukti_dokumen;
                $hash = $k->bukti_hash ?? null;
                if (! $hash) {
                    // try derive basename as fallback key
                    $hash = 'name:' . basename(parse_url($path, PHP_URL_PATH));
                }
                $map[$hash][] = $k->id;
            }
            foreach ($map as $g) {
                if (count($g) > 1) $duplicateGroupsCount++;
            }
        } catch (\Throwable $e) {
            $duplicateGroupsCount = 0;
        }

        // recent rejected items
        $recentRejected = Kegiatan::with('mahasiswa')->where('status_verifikasi', 'rejected')->orderBy('updated_at', 'desc')->limit(5)->get();

        // counts per prodi - get actual prodi values and count them
        try {
            $prodiCounts = Mahasiswa::selectRaw('prodi, COUNT(*) as total')
                ->groupBy('prodi')
                ->get()
                ->keyBy('prodi');
            
            // Map to expected prodi names (case-insensitive)
            $totalInformatika = 0;
            $totalSistemInfo = 0;
            
            foreach ($prodiCounts as $prodi => $data) {
                $prodiLower = strtolower($prodi);
                if (str_contains($prodiLower, 'informatika')) {
                    $totalInformatika += $data->total;
                } elseif (str_contains($prodiLower, 'sistem informasi') || str_contains($prodiLower, 'sistem info')) {
                    $totalSistemInfo += $data->total;
                }
            }
        } catch (\Throwable $e) {
            $totalInformatika = 0;
            $totalSistemInfo = 0;
        }

        // fetch verified kegiatans (approved) for the admin view and paginate
        $verifiedKegiatans = Kegiatan::with('mahasiswa')
            ->where('status_verifikasi', 'verified')
            ->latest()
            ->paginate(20, ['*'], 'verified_page')
            ->appends($request->except('page'));

        // fetch pending kegiatans (awaiting verification) and paginate separately
        $pendingKegiatans = Kegiatan::with('mahasiswa')
            ->whereNotIn('status_verifikasi', ['verified','rejected'])
            ->latest()
            ->paginate(20, ['*'], 'pending_page')
            ->appends($request->except('page'));

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalMahasiswa' => $totalMahasiswa,
                'totalKegiatan' => $totalKegiatan,
                'pendingKegiatan' => $pendingKegiatan,
                'verifiedKegiatan' => $verifiedKegiatan,
                'rejectedKegiatan' => $rejectedKegiatan,
            ],
            'recent' => $recent,
            'prodiCounts' => [
                'informatika' => $totalInformatika,
                'sistem_informasi' => $totalSistemInfo,
            ],
            'summary' => [
                'duplicateGroups' => $duplicateGroupsCount,
                'recentRejected' => $recentRejected,
            ],
            'verifiedKegiatans' => $verifiedKegiatans,
            'pendingKegiatans' => $pendingKegiatans,
        ]);
    }
}
