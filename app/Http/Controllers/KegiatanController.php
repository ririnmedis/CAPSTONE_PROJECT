<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Kegiatan;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Models\Mahasiswa;
use App\Services\DocumentDuplicationService;

class KegiatanController extends Controller
{
    /**
     * Display a listing of kegiatan.
     */
    public function index(Request $request)
    {
        $query = Kegiatan::with('mahasiswa')->orderBy('created_at', 'desc');

        if ($request->filled('mahasiswa_id')) {
            $query->where('mahasiswa_id', $request->get('mahasiswa_id'));
        }

        $perPage = (int) $request->get('per_page', 15);
        $items = $query->paginate($perPage);

        return response()->json($items);
    }

    /**
     * Show Inertia page for input and listing kegiatans for the authenticated user.
     */
    public function create(Request $request)
    {
        $user = $request->user();
        $mahasiswa = null;
        $kegiatans = [];

        if ($user) {
            try {
                $mahasiswa = Mahasiswa::where('email', $user->email)->first();
                if ($mahasiswa) {
                    $kegiatans = Kegiatan::where('mahasiswa_id', $mahasiswa->id)->orderBy('created_at', 'desc')->get();
                }
            } catch (\Throwable $e) {
                // ignore
            }
        }

        // If we couldn't find a mahasiswa for the logged-in user, fall back to
        // showing recent kegiatans so the table isn't empty while debugging.
        if (empty($kegiatans)) {
            try {
                $kegiatans = Kegiatan::orderBy('created_at', 'desc')->limit(20)->get();
            } catch (\Throwable $e) {
                $kegiatans = [];
            }
        }

        // options for kegiatan and subitems with their skor
        $options = [
            [
                'label' => 'Menjadi Pengurus Organisasi Kemahasiswaan',
                'items' => [
                    ['value' => '1.a', 'label' => 'Sebagai Ketua BEM/UKM/BLM di tingkat universitas', 'skor' => 100],
                    ['value' => '1.b', 'label' => 'Sebagai Ketua BEM/UKM/HIMA/BLM di tingkat Fakultas', 'skor' => 75],
                    ['value' => '1.c', 'label' => 'Sebagai Wakil Ketua/Sekretaris/Bendahara', 'skor' => 50],
                    ['value' => '1.d', 'label' => 'Sebagai Anggota', 'skor' => 20],
                ],
            ],
            [
                'label' => 'Mengikuti Kegiatan Seminar Ilmiah',
                'items' => [
                    ['value' => '2.a', 'label' => 'Sebagai presenter oral dalam seminar internasional', 'skor' => 100],
                    ['value' => '2.b', 'label' => 'Sebagai panitia seminar nasional', 'skor' => 50],
                    ['value' => '2.c', 'label' => 'Sebagai peserta seminar internasional', 'skor' => 30],
                    ['value' => '2.d', 'label' => 'Sebagai peserta seminar nasional', 'skor' => 20],
                ],
            ],
            [
                'label' => 'Mengikuti Kejuaraan',
                'items' => [
                    ['value' => '3.a', 'label' => 'Juara 1,2,3 tingkat Internasional', 'skor' => 100],
                    ['value' => '3.b', 'label' => 'Juara 1,2,3 tingkat Nasional', 'skor' => 75],
                    ['value' => '3.c', 'label' => 'Juara 1,2,3 tingkat Regional', 'skor' => 50],
                    ['value' => '3.d', 'label' => 'Juara 1,2,3 tingkat Kabupaten', 'skor' => 40],
                    ['value' => '3.e', 'label' => 'Termasuk 10 besar', 'skor' => 30],
                    ['value' => '3.f', 'label' => 'Mengikuti perlombaan saja', 'skor' => 25],
                ],
            ],
            [
                'label' => 'Mengikuti Lomba Karya Ilmiah',
                'items' => [
                    ['value' => '4.a', 'label' => 'Juara 1,2,3 LKTI tingkat Internasional', 'skor' => 100],
                    ['value' => '4.b', 'label' => 'Juara 1,2,3 LKTI tingkat Nasional', 'skor' => 75],
                    ['value' => '4.c', 'label' => 'Juara 1,2,3 LKTI tingkat Regional', 'skor' => 50],
                    ['value' => '4.d', 'label' => 'Juara Harapan/di Kabupaten', 'skor' => 40],
                    ['value' => '4.e', 'label' => 'Mengikuti perlombaan saja', 'skor' => 25],
                ],
            ],
            [
                'label' => 'Melakukan Publikasi Karya Ilmiah',
                'items' => [
                    ['value' => '5.a', 'label' => 'Membantu/berperan serta dalam publikasi artikel di jurnal Scopus', 'skor' => 100],
                    ['value' => '5.b', 'label' => 'Membantu/berperan serta dalam publikasi artikel di jurnal Sinta 1–3', 'skor' => 50],
                    ['value' => '5.c', 'label' => 'Membantu/berperan serta dalam publikasi artikel di jurnal Sinta 4–6', 'skor' => 30],
                ],
            ],
            [
                'label' => 'Mengikuti Kegiatan MBKM Kompetitif',
                'items' => [
                    ['value' => '6.a', 'label' => 'IISMA', 'skor' => 100],
                    ['value' => '6.b', 'label' => 'PMM', 'skor' => 75],
                    ['value' => '6.c', 'label' => 'MBKM kompetitif lainnya', 'skor' => 50],
                ],
            ],
            [
                'label' => 'Mengikuti Program Kreativitas Mahasiswa/wirausaha/hibah lainnya',
                'items' => [
                    ['value' => '7.a', 'label' => 'Juara Pimnas', 'skor' => 100],
                    ['value' => '7.b', 'label' => 'Lolos masuk Pimnas', 'skor' => 75],
                    ['value' => '7.c', 'label' => 'Berhasil mendapat pendanaan hibah PKM atau lainnya', 'skor' => 50],
                    ['value' => '7.d', 'label' => 'Membuat proposal', 'skor' => 20],
                ],
            ],
            [
                'label' => 'Memiliki Kemampuan Bahasa Inggris',
                'items' => [
                    ['value' => '8.a', 'label' => 'Skor SEP-T ≥ 550', 'skor' => 100],
                    ['value' => '8.b', 'label' => 'Skor SEP-T ≥ 500', 'skor' => 75],
                    ['value' => '8.c', 'label' => 'Skor SEP-T ≥ 450', 'skor' => 50],
                    ['value' => '8.d', 'label' => 'Skor SEP-T ≥ 425', 'skor' => 20],
                ],
            ],
            [
                'label' => 'Memiliki Kemampuan Bahasa Asing Lainnya',
                'items' => [
                    ['value' => '9.a', 'label' => 'Memiliki Kemampuan Bahasa Asing Lainnya', 'skor' => 100],
                ],
            ],
            [
                'label' => 'Peran dalam Kepanitiaan Kegiatan Mahasiswa',
                'items' => [
                    ['value' => '10.a', 'label' => 'Sebagai ketua/wakil ketua/sekretaris/bendahara', 'skor' => 50],
                    ['value' => '10.b', 'label' => 'Sebagai anggota kepanitiaan dengan peserta lebih dari 200 orang', 'skor' => 30],
                ],
            ],
            [
                'label' => 'Memiliki Sertifikat Kompetensi BNSP sesuai bidang',
                'items' => [
                    ['value' => '11.a', 'label' => 'Memiliki sertifikat kompetensi seperti sertifikat hypnosis, sertifikat massage, sertifikat hypnobirthing, sertifikat pijat bayi, sertifikat K3', 'skor' => 100],
                ],
            ],
        ];

        return Inertia::render('Kegiatans/Index', [
            'user' => $user ? $user->only('name','email') : null,
            'mahasiswa' => $mahasiswa ? $mahasiswa->only(['id','nama','npm','email']) : null,
            'kegiatans' => $kegiatans,
            'options' => $options,
        ]);
    }

    /**
     * Store a newly created kegiatan in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'mahasiswa_id' => ['nullable', 'integer', 'exists:mahasiswas,id'],
            'kegiatan' => ['required', 'string', 'max:255'],
            'kegiatan_kode' => ['nullable', 'string', 'max:10'],
            'tanggal_input' => ['nullable', 'date'],
            'poin' => ['required', 'integer', 'min:0'],
            'bobot' => ['nullable', 'numeric'],
            'bukti_dokumen' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf,doc,docx', 'max:5120'],
            'status_verifikasi' => ['required', Rule::in(['pending', 'verified', 'rejected'])],
        ]);

        // if authenticated user exists and mahasiswa_id not provided, attempt to attach
        if (empty($data['mahasiswa_id']) && $request->user()) {
            try {
                $mahasiswa = Mahasiswa::where('email', $request->user()->email)->first();
                if ($mahasiswa) {
                    $data['mahasiswa_id'] = $mahasiswa->id;
                }
            } catch (\Throwable $e) {
                // ignore
            }
        }

        // handle file upload and ML-based duplicate detection
        $duplicateWarning = null;
        if ($request->hasFile('bukti_dokumen')) {
            try {
                $uploaded = $request->file('bukti_dokumen');
                
                // Use ML service to check for duplicates before storing
                $duplicateService = new DocumentDuplicationService();
                $duplicateResult = $duplicateService->processUploadedFile($uploaded);
                
                // Store the file
                $path = $uploaded->store('kegiatans', 'public');
                $data['bukti_dokumen'] = '/storage/' . $path;
                $data['bukti_hash'] = $duplicateResult['hash'];
                
                // Check if duplicates were found
                if (!empty($duplicateResult['duplicates'])) {
                    $duplicateWarning = [
                        'message' => 'Dokumen serupa ditemukan! Sistem AI mendeteksi ' . count($duplicateResult['duplicates']) . ' dokumen yang mirip.',
                        'duplicates' => $duplicateResult['duplicates'],
                        'similarity' => $duplicateResult['duplicates'][0]['similarity_percentage'] ?? 0
                    ];
                    
                    // Auto-mark as pending for admin review if high similarity
                    if (($duplicateResult['duplicates'][0]['similarity_percentage'] ?? 0) > 90) {
                        $data['status_verifikasi'] = 'pending';
                        $data['admin_note'] = 'Ditandai untuk review - AI mendeteksi dokumen serupa (' . 
                                            ($duplicateResult['duplicates'][0]['similarity_percentage'] ?? 0) . '% similarity)';
                    }
                }
            } catch (\Throwable $e) {
                \Log::error('ML Duplicate detection failed: ' . $e->getMessage());
                // Fallback to original behavior with better error handling
                try {
                    $path = $uploaded->store('kegiatans', 'public');
                    $data['bukti_dokumen'] = '/storage/' . $path;
                    
                    try {
                        $contents = \Storage::disk('public')->get($path);
                        $hash = hash('sha256', $contents);
                        $data['bukti_hash'] = $hash;
                    } catch (\Throwable $e) {
                        // fallback: if reading fails, leave bukti_hash null
                    }
                } catch (\Throwable $fileError) {
                    \Log::error('File upload failed: ' . $fileError->getMessage());
                    return back()->withErrors(['bukti_dokumen' => 'Gagal mengupload file. Silakan coba lagi.']);
                }
            }
        }

        // Ensure bobot is not null when creating to avoid DB integrity errors.
        // If bobot is missing or an empty string, coerce to 0.00 (float).
        if (!isset($data['bobot']) || $data['bobot'] === null || $data['bobot'] === '') {
            $data['bobot'] = 0.00;
        } else {
            $data['bobot'] = (float) $data['bobot'];
        }

        $kegiatan = Kegiatan::create($data);

        // Temporary debug logging to help diagnose cases where the created
        // kegiatan isn't showing in the listing. Remove or lower level after
        // verification in production.
        try {
            \Log::info('Kegiatan created', [
                'id' => $kegiatan->id ?? null,
                'mahasiswa_id' => $kegiatan->mahasiswa_id ?? null,
                'payload' => $data,
            ]);
        } catch (\Throwable $e) {
            // ignore logging failures
        }

        // Return response with duplicate warning if found
        if ($request->wantsJson()) {
            $response = ['kegiatan' => $kegiatan];
            if ($duplicateWarning) {
                $response['duplicate_warning'] = $duplicateWarning;
            }
            return response()->json($response, 201);
        }

        // Inertia / regular web flow with duplicate warning
        $message = 'Kegiatan berhasil disimpan.';
        $flashData = ['success' => $message];
        
        if ($duplicateWarning) {
            $flashData['duplicate_warning'] = $duplicateWarning;
        }
        
        return redirect()->route('kegiatans.create')->with($flashData);
    }

    /**
     * Display the specified kegiatan.
     */
    public function show($id)
    {
        $kegiatan = Kegiatan::with('mahasiswa')->findOrFail($id);
        return response()->json($kegiatan);
    }

    /**
     * Return the most recently created kegiatan for the authenticated mahasiswa as JSON.
     * This is used by the frontend to append the created item immediately after store.
     */
    public function latest(Request $request)
    {
        $user = $request->user();
        $kegiatan = null;
        try {
            if ($user) {
                $mahasiswa = \App\Models\Mahasiswa::where('email', $user->email)->first();
                if ($mahasiswa) {
                    $kegiatan = Kegiatan::where('mahasiswa_id', $mahasiswa->id)->orderBy('id', 'desc')->first();
                }
            }
        } catch (\Throwable $e) {
            // ignore
        }

        // fallback: return the latest kegiatan globally if none for the user
        if (! $kegiatan) {
            $kegiatan = Kegiatan::orderBy('id', 'desc')->first();
        }

        return response()->json($kegiatan);
    }

    /**
     * Update the specified kegiatan in storage.
     */
    public function update(Request $request, $id)
    {
        $kegiatan = Kegiatan::findOrFail($id);

        $data = $request->validate([
            'mahasiswa_id' => ['nullable', 'integer', 'exists:mahasiswas,id'],
            'kegiatan' => ['required', 'string', 'max:255'],
            'tanggal_input' => ['nullable', 'date'],
            'poin' => ['required', 'integer', 'min:0'],
            'bobot' => ['nullable', 'numeric'],
            'bukti_dokumen' => ['nullable', 'string', 'max:255'],
            'status_verifikasi' => ['required', Rule::in(['pending', 'verified', 'rejected'])],
        ]);

        // Ensure bobot is not null when updating to avoid DB integrity errors.
        if (!isset($data['bobot']) || $data['bobot'] === null || $data['bobot'] === '') {
            $data['bobot'] = 0.00;
        } else {
            $data['bobot'] = (float) $data['bobot'];
        }

        $kegiatan->update($data);

        return response()->json($kegiatan);
    }

    /**
     * Remove the specified kegiatan from storage.
     */
    public function destroy($id)
    {
        $kegiatan = Kegiatan::findOrFail($id);
        $kegiatan->delete();
        return response()->json(['deleted' => true]);
    }
}
