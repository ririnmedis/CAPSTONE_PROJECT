<?php

namespace App\Services;

use App\Models\Kegiatan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class DocumentDuplicationService
{
    /**
     * Generate perceptual hash for an image
     */
    public function generatePerceptualHash($imagePath)
    {
        try {
            // Validate file exists first
            if (!file_exists($imagePath) || !is_readable($imagePath)) {
                Log::warning('Image file not accessible: ' . $imagePath);
                return null;
            }
            
            // Create image from file using GD library
            $imageInfo = getimagesize($imagePath);
            if (!$imageInfo) {
                Log::warning('Cannot get image info: ' . $imagePath);
                return null;
            }
            $imageType = $imageInfo[2];
            
            switch ($imageType) {
                case IMAGETYPE_JPEG:
                    $image = imagecreatefromjpeg($imagePath);
                    break;
                case IMAGETYPE_PNG:
                    $image = imagecreatefrompng($imagePath);
                    break;
                case IMAGETYPE_GIF:
                    $image = imagecreatefromgif($imagePath);
                    break;
                default:
                    throw new \Exception('Unsupported image type');
            }
            
            // Resize to 8x8 pixels
            $resized = imagecreatetruecolor(8, 8);
            imagecopyresampled($resized, $image, 0, 0, 0, 0, 8, 8, imagesx($image), imagesy($image));
            
            // Convert to grayscale and get pixel values
            $pixels = [];
            for ($y = 0; $y < 8; $y++) {
                for ($x = 0; $x < 8; $x++) {
                    $rgb = imagecolorat($resized, $x, $y);
                    $r = ($rgb >> 16) & 0xFF;
                    $g = ($rgb >> 8) & 0xFF;
                    $b = $rgb & 0xFF;
                    $gray = ($r + $g + $b) / 3;
                    $pixels[] = $gray;
                }
            }
            
            // Calculate average
            $average = array_sum($pixels) / count($pixels);
            
            // Generate hash
            $hash = '';
            foreach ($pixels as $pixel) {
                $hash .= ($pixel > $average) ? '1' : '0';
            }
            
            // Clean up
            imagedestroy($image);
            imagedestroy($resized);
            
            return $hash;
        } catch (\Exception $e) {
            Log::error('Error generating perceptual hash: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Calculate Hamming distance between two hashes
     */
    public function hammingDistance($hash1, $hash2)
    {
        if (strlen($hash1) !== strlen($hash2)) {
            return 64; // Maximum distance
        }
        
        $distance = 0;
        for ($i = 0; $i < strlen($hash1); $i++) {
            if ($hash1[$i] !== $hash2[$i]) {
                $distance++;
            }
        }
        
        return $distance;
    }

    /**
     * Check for duplicate documents
     */
    public function checkForDuplicates($imagePath, $currentKegiatanId = null)
    {
        $newHash = $this->generatePerceptualHash($imagePath);
        
        if (!$newHash) {
            return [];
        }

        $duplicates = [];
        $threshold = 5; // Maximum hamming distance for considering as duplicate

        // Get all kegiatans with bukti_hash (excluding current one if editing)
        $query = Kegiatan::whereNotNull('bukti_hash')
                         ->with('mahasiswa');
        
        if ($currentKegiatanId) {
            $query->where('id', '!=', $currentKegiatanId);
        }

        $existingKegiatans = $query->get();

        foreach ($existingKegiatans as $kegiatan) {
            if ($kegiatan->bukti_hash) {
                $distance = $this->hammingDistance($newHash, $kegiatan->bukti_hash);
                
                if ($distance <= $threshold) {
                    $similarity = (64 - $distance) / 64 * 100; // Convert to percentage
                    
                    $duplicates[] = [
                        'kegiatan_id' => $kegiatan->id,
                        'mahasiswa_nama' => $kegiatan->mahasiswa->nama ?? 'Unknown',
                        'mahasiswa_npm' => $kegiatan->mahasiswa->npm ?? 'Unknown',
                        'kegiatan' => $kegiatan->kegiatan,
                        'bukti_dokumen' => $kegiatan->bukti_dokumen,
                        'status_verifikasi' => $kegiatan->status_verifikasi,
                        'tanggal_input' => $kegiatan->tanggal_input,
                        'similarity_percentage' => round($similarity, 2),
                        'hamming_distance' => $distance
                    ];
                }
            }
        }

        // Sort by similarity (highest first)
        usort($duplicates, function($a, $b) {
            return $b['similarity_percentage'] <=> $a['similarity_percentage'];
        });

        return [
            'hash' => $newHash,
            'duplicates' => $duplicates
        ];
    }

    /**
     * Generate hash for uploaded file and check duplicates
     */
    public function processUploadedFile($uploadedFile, $currentKegiatanId = null)
    {
        try {
            // Use the uploaded file path directly
            $tempPath = $uploadedFile->getPathname();
            
            // Validate file exists and is readable
            if (!file_exists($tempPath) || !is_readable($tempPath)) {
                Log::warning('Uploaded file not accessible: ' . $tempPath);
                return [
                    'hash' => null,
                    'duplicates' => []
                ];
            }

            // Check if it's an image file
            $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
            
            if (in_array($uploadedFile->getMimeType(), $allowedMimeTypes)) {
                $result = $this->checkForDuplicates($tempPath, $currentKegiatanId);
            } else {
                // For non-image files, generate simple hash
                $fileHash = hash_file('sha256', $tempPath);
                $result = [
                    'hash' => $fileHash,
                    'duplicates' => $this->checkFileHashDuplicates($fileHash, $currentKegiatanId)
                ];
            }

            return $result;
        } catch (\Exception $e) {
            Log::error('Error processing uploaded file: ' . $e->getMessage());
            return [
                'hash' => null,
                'duplicates' => []
            ];
        }
    }

    /**
     * Check for exact file hash duplicates (for non-image files)
     */
    private function checkFileHashDuplicates($fileHash, $currentKegiatanId = null)
    {
        $query = Kegiatan::where('bukti_hash', $fileHash)
                         ->with('mahasiswa');
        
        if ($currentKegiatanId) {
            $query->where('id', '!=', $currentKegiatanId);
        }

        $duplicates = [];
        $existingKegiatans = $query->get();

        foreach ($existingKegiatans as $kegiatan) {
            $duplicates[] = [
                'kegiatan_id' => $kegiatan->id,
                'mahasiswa_nama' => $kegiatan->mahasiswa->nama ?? 'Unknown',
                'mahasiswa_npm' => $kegiatan->mahasiswa->npm ?? 'Unknown',
                'kegiatan' => $kegiatan->kegiatan,
                'bukti_dokumen' => $kegiatan->bukti_dokumen,
                'status_verifikasi' => $kegiatan->status_verifikasi,
                'tanggal_input' => $kegiatan->tanggal_input,
                'similarity_percentage' => 100, // Exact match
                'hamming_distance' => 0
            ];
        }

        return $duplicates;
    }

    /**
     * Generate hash for existing file in storage
     */
    public function generateHashForStoredFile($filePath)
    {
        try {
            $fullPath = storage_path('app/public/' . $filePath);
            
            if (!file_exists($fullPath)) {
                return null;
            }

            // Check if it's an image
            $imageInfo = @getimagesize($fullPath);
            
            if ($imageInfo !== false) {
                // It's an image, use perceptual hash
                return $this->generatePerceptualHash($fullPath);
            } else {
                // It's not an image, use file hash
                return hash_file('sha256', $fullPath);
            }
        } catch (\Exception $e) {
            Log::error('Error generating hash for stored file: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Update hashes for all existing documents (migration helper)
     */
    public function updateAllDocumentHashes()
    {
        $kegiatans = Kegiatan::whereNotNull('bukti_dokumen')
                            ->whereNull('bukti_hash')
                            ->get();

        $updated = 0;
        $errors = 0;

        foreach ($kegiatans as $kegiatan) {
            try {
                $hash = $this->generateHashForStoredFile($kegiatan->bukti_dokumen);
                
                if ($hash) {
                    $kegiatan->update(['bukti_hash' => $hash]);
                    $updated++;
                } else {
                    $errors++;
                }
            } catch (\Exception $e) {
                Log::error("Error updating hash for kegiatan {$kegiatan->id}: " . $e->getMessage());
                $errors++;
            }
        }

        return [
            'updated' => $updated,
            'errors' => $errors,
            'total' => count($kegiatans)
        ];
    }
}