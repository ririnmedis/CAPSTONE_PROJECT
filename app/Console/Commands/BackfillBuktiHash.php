<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Kegiatan;
use Illuminate\Support\Str;

class BackfillBuktiHash extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'kegiatan:backfill-hash {--chunk=200}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Backfill SHA256 bukti_hash for existing kegiatans that have a bukti_dokumen but no bukti_hash.';

    public function handle()
    {
        $chunk = (int) $this->option('chunk');
        $this->info("Starting backfill of bukti_hash (chunk={$chunk})...");

        $totalUpdated = 0;
        $query = Kegiatan::whereNotNull('bukti_dokumen')->whereNull('bukti_hash');

        $query->chunkById($chunk, function ($items) use (&$totalUpdated) {
            foreach ($items as $k) {
                $path = $k->bukti_dokumen;
                $local = $this->resolveLocalFile($path);
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
        return 0;
    }

    private function resolveLocalFile(?string $path)
    {
        if (! $path) return null;

        if (Str::startsWith($path, ['http://','https://'])) {
            $urlPath = parse_url($path, PHP_URL_PATH) ?: '';
            $candidates = [public_path(ltrim($urlPath, '/'))];
        } else {
            $candidates = [];
            $candidates[] = public_path(ltrim($path, '/'));
            $candidates[] = storage_path('app/public/' . ltrim($path, ' /'));
            $candidates[] = storage_path('app/' . ltrim($path, ' /'));
        }

        $basename = basename($path);
        $candidates[] = storage_path('app/public/' . $basename);
        $candidates[] = storage_path('app/' . $basename);

        foreach ($candidates as $c) {
            if ($c && file_exists($c)) return $c;
        }

        return null;
    }
}
