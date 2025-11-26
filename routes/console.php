<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');


// Backfill bukti_hash for existing kegiatans that lack it.
Artisan::command('kegiatan:backfill-hash {--chunk=200}', function () {
    $chunk = (int) $this->option('chunk');
    $this->info("Starting backfill of bukti_hash (chunk={$chunk})...");
    $totalUpdated = 0;

    $query = \App\Models\Kegiatan::whereNotNull('bukti_dokumen')->whereNull('bukti_hash');
    $query->chunkById($chunk, function ($items) use (&$totalUpdated) {
        foreach ($items as $k) {
            $path = $k->bukti_dokumen;
            $local = null;
            // try typical locations
            if (preg_match('#^https?://#', $path)) {
                $urlPath = parse_url($path, PHP_URL_PATH) ?: '';
                $candidates = [public_path(ltrim($urlPath, '/'))];
            } else {
                $candidates = [public_path(ltrim($path, '/')), storage_path('app/public/' . ltrim($path, ' /')), storage_path('app/' . ltrim($path, ' /'))];
            }
            $basename = basename($path);
            $candidates[] = storage_path('app/public/' . $basename);
            $candidates[] = storage_path('app/' . $basename);

            foreach ($candidates as $c) {
                if ($c && file_exists($c)) { $local = $c; break; }
            }

            if ($local && file_exists($local)) {
                try {
                    $hash = hash_file('sha256', $local);
                    if ($hash) {
                        $k->bukti_hash = $hash;
                        $k->save();
                        $totalUpdated++;
                        $this->line("[OK] #{$k->id} => {$hash}");
                    }
                } catch (\Throwable $e) {
                    $this->error("[ERR] #{$k->id}: " . $e->getMessage());
                }
            } else {
                $this->line("[SKIP] #{$k->id} - file not found locally: {$path}");
            }
        }
    });

    $this->info("Backfill complete. Total updated: {$totalUpdated}");
})->purpose('Backfill SHA256 bukti_hash for existing kegiatans');
