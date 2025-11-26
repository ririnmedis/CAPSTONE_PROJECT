<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Admin auth (separate admin login page)
Route::get('/admin/login', [\App\Http\Controllers\Admin\AdminAuthController::class, 'showLogin'])->name('admin.login');
Route::post('/admin/login', [\App\Http\Controllers\Admin\AdminAuthController::class, 'login'])->name('admin.login.post');
Route::post('/admin/logout', [\App\Http\Controllers\Admin\AdminAuthController::class, 'logout'])->name('admin.logout');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = auth()->user();
        $mahasiswa = null;
        $kegiatans = [];
        $options = [];
        try {
            $mahasiswa = \App\Models\Mahasiswa::where('email', $user->email)->first();
            if ($mahasiswa) {
                $kegiatans = \App\Models\Kegiatan::where('mahasiswa_id', $mahasiswa->id)->orderBy('created_at', 'desc')->get();
                // compute verified points only (admin-verified activities advance the student's progress)
                $current_points = (int) $kegiatans->where('status_verifikasi', 'verified')->sum('poin');
                $verified_count = (int) $kegiatans->where('status_verifikasi', 'verified')->count();
            }
        } catch (\Throwable $e) {
            // ignore if model/table missing
        }

        // same options as KegiatanController::create
        $options = [
            ['label' => 'Menjadi Pengurus Organisasi Kemahasiswaan', 'items' => [['value'=>'1.a','label'=>'Sebagai Ketua BEM/UKM/BLM di tingkat universitas','skor'=>100],['value'=>'1.b','label'=>'Sebagai Ketua BEM/UKM/HIMA/BLM di tingkat Fakultas','skor'=>75],['value'=>'1.c','label'=>'Sebagai Wakil Ketua/Sekretaris/Bendahara','skor'=>50],['value'=>'1.d','label'=>'Sebagai Anggota','skor'=>20]]],
            ['label' => 'Mengikuti Kegiatan Seminar Ilmiah', 'items' => [['value'=>'2.a','label'=>'Sebagai presenter oral dalam seminar internasional','skor'=>100],['value'=>'2.b','label'=>'Sebagai panitia seminar nasional','skor'=>50],['value'=>'2.c','label'=>'Sebagai peserta seminar internasional','skor'=>30],['value'=>'2.d','label'=>'Sebagai peserta seminar nasional','skor'=>20]]],
            ['label' => 'Mengikuti Kejuaraan', 'items' => [['value'=>'3.a','label'=>'Juara 1,2,3 tingkat Internasional','skor'=>100],['value'=>'3.b','label'=>'Juara 1,2,3 tingkat Nasional','skor'=>75],['value'=>'3.c','label'=>'Juara 1,2,3 tingkat Regional','skor'=>50],['value'=>'3.d','label'=>'Juara 1,2,3 tingkat Kabupaten','skor'=>40],['value'=>'3.e','label'=>'Termasuk 10 besar','skor'=>30],['value'=>'3.f','label'=>'Mengikuti perlombaan saja','skor'=>25]]],
            ['label' => 'Mengikuti Lomba Karya Ilmiah', 'items' => [['value'=>'4.a','label'=>'Juara 1,2,3 LKTI tingkat Internasional','skor'=>100],['value'=>'4.b','label'=>'Juara 1,2,3 LKTI tingkat Nasional','skor'=>75],['value'=>'4.c','label'=>'Juara 1,2,3 LKTI tingkat Regional','skor'=>50],['value'=>'4.d','label'=>'Juara Harapan/di Kabupaten','skor'=>40],['value'=>'4.e','label'=>'Mengikuti perlombaan saja','skor'=>25]]],
            ['label' => 'Melakukan Publikasi Karya Ilmiah', 'items' => [['value'=>'5.a','label'=>'Membantu/berperan serta dalam publikasi artikel di jurnal Scopus','skor'=>100],['value'=>'5.b','label'=>'Membantu/berperan serta dalam publikasi artikel di jurnal Sinta 1–3','skor'=>50],['value'=>'5.c','label'=>'Membantu/berperan serta dalam publikasi artikel di jurnal Sinta 4–6','skor'=>30]]],
            ['label' => 'Mengikuti Kegiatan MBKM Kompetitif', 'items' => [['value'=>'6.a','label'=>'IISMA','skor'=>100],['value'=>'6.b','label'=>'PMM','skor'=>75],['value'=>'6.c','label'=>'MBKM kompetitif lainnya','skor'=>50]]],
            ['label' => 'Mengikuti Program Kreativitas Mahasiswa/wirausaha/hibah lainnya', 'items' => [['value'=>'7.a','label'=>'Juara Pimnas','skor'=>100],['value'=>'7.b','label'=>'Lolos masuk Pimnas','skor'=>75],['value'=>'7.c','label'=>'Berhasil mendapat pendanaan hibah PKM atau lainnya','skor'=>50],['value'=>'7.d','label'=>'Membuat proposal','skor'=>20]]],
            ['label' => 'Memiliki Kemampuan Bahasa Inggris', 'items' => [['value'=>'8.a','label'=>'Skor SEP-T ≥ 550','skor'=>100],['value'=>'8.b','label'=>'Skor SEP-T ≥ 500','skor'=>75],['value'=>'8.c','label'=>'Skor SEP-T ≥ 450','skor'=>50],['value'=>'8.d','label'=>'Skor SEP-T ≥ 425','skor'=>20]]],
            ['label' => 'Memiliki Kemampuan Bahasa Asing Lainnya', 'items' => [['value'=>'9.a','label'=>'Memiliki Kemampuan Bahasa Asing Lainnya','skor'=>100]]],
            ['label' => 'Peran dalam Kepanitiaan Kegiatan Mahasiswa', 'items' => [['value'=>'10.a','label'=>'Sebagai ketua/wakil ketua/sekretaris/bendahara','skor'=>50],['value'=>'10.b','label'=>'Sebagai anggota kepanitiaan dengan peserta lebih dari 200 orang','skor'=>30]]],
            ['label' => 'Memiliki Sertifikat Kompetensi BNSP sesuai bidang', 'items' => [['value'=>'11.a','label'=>'Memiliki sertifikat kompetensi seperti sertifikat hypnosis, sertifikat massage, sertifikat hypnobirthing, sertifikat pijat bayi, sertifikat K3','skor'=>100]]],
        ];

        return Inertia::render('dashboard', [
            'user' => $user ? $user->only('name', 'email') : null,
            'mahasiswa' => $mahasiswa ? $mahasiswa->only(['nama','npm','prodi','email','id']) : null,
            'kegiatans' => $kegiatans,
            'current_points' => $current_points ?? 0,
            'verified_count' => $verified_count ?? 0,
            'options' => $options,
        ]);
    })->name('dashboard');

    // Kegiatans (Input Poin) - Inertia page + store
    Route::get('/kegiatans', [\App\Http\Controllers\KegiatanController::class, 'create'])->name('kegiatans.create');
    Route::post('/kegiatans', [\App\Http\Controllers\KegiatanController::class, 'store'])->name('kegiatans.store');
    // Helper endpoint to return the most recently created kegiatan for the current user
    Route::get('/kegiatans/latest', [\App\Http\Controllers\KegiatanController::class, 'latest'])->name('kegiatans.latest');

    // Biodata routes
    Route::get('/biodata', [\App\Http\Controllers\BiodataController::class, 'create'])->name('biodata.create');
    Route::post('/biodata', [\App\Http\Controllers\BiodataController::class, 'store'])->name('biodata.store');



    // History (SKP points) - Inertia page
    Route::get('/history', [\App\Http\Controllers\HistoryController::class, 'index'])->name('history.index');
    Route::get('/history/export/csv', [\App\Http\Controllers\HistoryController::class, 'exportCsv'])->name('history.export.csv');
    Route::get('/history/export/pdf', [\App\Http\Controllers\HistoryController::class, 'exportPdf'])->name('history.export.pdf');

    // Admin: verify kegiatans (protected by EnsureAdmin middleware)
    Route::middleware([\App\Http\Middleware\EnsureAdmin::class])->group(function () {
        // Admin dashboard landing
        Route::get('/admin', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])->name('admin.dashboard');
        // Secure file serving for admin
        Route::get('/admin/files/kegiatan/{filename}', [\App\Http\Controllers\Admin\AdminKegiatanController::class, 'serveFile'])->name('admin.files.serve');
        Route::get('/admin/kegiatans', [\App\Http\Controllers\Admin\AdminKegiatanController::class, 'index'])->name('admin.kegiatans.index');
        Route::get('/admin/kegiatans/duplicates', [\App\Http\Controllers\Admin\AdminKegiatanController::class, 'duplicates'])->name('admin.kegiatans.duplicates');
        // Action endpoints for duplicates (mark rejected, delete, request clarification)
        Route::post('/admin/kegiatans/{id}/duplicate-action', [\App\Http\Controllers\Admin\AdminKegiatanController::class, 'duplicateAction'])->name('admin.kegiatans.duplicateAction');
        // Backfill hashes (calls artisan command)
        Route::post('/admin/kegiatans/backfill-hashes', [\App\Http\Controllers\Admin\AdminKegiatanController::class, 'backfillHashes'])->name('admin.kegiatans.backfillHashes');
        Route::post('/admin/kegiatans/{id}/status', [\App\Http\Controllers\Admin\AdminKegiatanController::class, 'updateStatus'])->name('admin.kegiatans.updateStatus');
        
        // User Management
        Route::get('/admin/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('admin.users.index');
        Route::get('/admin/users/create', [\App\Http\Controllers\Admin\UserController::class, 'create'])->name('admin.users.create');
        Route::post('/admin/users', [\App\Http\Controllers\Admin\UserController::class, 'store'])->name('admin.users.store');
        Route::get('/admin/users/{user}/edit', [\App\Http\Controllers\Admin\UserController::class, 'edit'])->name('admin.users.edit');
        Route::put('/admin/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'update'])->name('admin.users.update');
        Route::delete('/admin/users/{user}', [\App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('admin.users.destroy');
        
        // ML Duplicate Detection
        Route::get('/admin/duplicates', [\App\Http\Controllers\Admin\DuplicateDetectionController::class, 'index'])->name('admin.duplicates.index');
        Route::post('/admin/duplicates/check-file', [\App\Http\Controllers\Admin\DuplicateDetectionController::class, 'checkFile'])->name('admin.duplicates.check');
        Route::post('/admin/duplicates/{groupId}/apply-suggestion', [\App\Http\Controllers\Admin\DuplicateDetectionController::class, 'applySuggestion'])->name('admin.duplicates.applySuggestion');
        Route::post('/admin/duplicates/update-hashes', [\App\Http\Controllers\Admin\DuplicateDetectionController::class, 'updateHashes'])->name('admin.duplicates.updateHashes');
    });
});

require __DIR__.'/settings.php';
