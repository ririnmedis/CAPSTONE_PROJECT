<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\DocumentDuplicationService;
use App\Models\Kegiatan;

class UpdateDocumentHashes extends Command
{
    protected $signature = 'documents:update-hashes {--force : Force update even if hash exists}';
    protected $description = 'Update perceptual hashes for all existing documents for ML duplicate detection';

    public function handle()
    {
        $this->info('Starting document hash update...');
        
        $duplicateService = new DocumentDuplicationService();
        
        $query = Kegiatan::whereNotNull('bukti_dokumen');
        
        if (!$this->option('force')) {
            $query->whereNull('bukti_hash');
        }
        
        $kegiatans = $query->get();
        $total = $kegiatans->count();
        
        if ($total === 0) {
            $this->info('No documents to process.');
            return 0;
        }
        
        $this->info("Found {$total} documents to process...");
        
        $updated = 0;
        $errors = 0;
        $skipped = 0;
        
        $bar = $this->output->createProgressBar($total);
        $bar->start();
        
        foreach ($kegiatans as $kegiatan) {
            try {
                // Remove '/storage/' prefix if present
                $filePath = str_replace('/storage/', '', $kegiatan->bukti_dokumen);
                $hash = $duplicateService->generateHashForStoredFile($filePath);
                
                if ($hash) {
                    $kegiatan->update(['bukti_hash' => $hash]);
                    $updated++;
                } else {
                    $this->newLine();
                    $this->warn("Failed to generate hash for kegiatan ID {$kegiatan->id}: File not found or invalid");
                    $errors++;
                }
            } catch (\Exception $e) {
                $this->newLine();
                $this->error("Error processing kegiatan ID {$kegiatan->id}: " . $e->getMessage());
                $errors++;
            }
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        
        $this->info("Hash update completed!");
        $this->info("Updated: {$updated}");
        $this->info("Errors: {$errors}");
        $this->info("Total processed: {$total}");
        
        return 0;
    }
}
