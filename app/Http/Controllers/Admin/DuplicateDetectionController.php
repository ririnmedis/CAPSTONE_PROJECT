<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DocumentDuplicationService;
use App\Models\Kegiatan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DuplicateDetectionController extends Controller
{
    protected $duplicateService;

    public function __construct(DocumentDuplicationService $duplicateService)
    {
        $this->duplicateService = $duplicateService;
    }

    /**
     * Show duplicate detection results
     */
    public function index(Request $request)
    {
        $duplicateGroups = $this->findAllDuplicates();
        
        return Inertia::render('Admin/Duplicates/Index', [
            'duplicateGroups' => $duplicateGroups,
            'totalGroups' => count($duplicateGroups),
            'totalDuplicates' => collect($duplicateGroups)->sum(function($group) {
                return count($group['items']);
            })
        ]);
    }

    /**
     * Check for duplicates of a specific file
     */
    public function checkFile(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
        ]);

        $result = $this->duplicateService->processUploadedFile(
            $request->file('file'),
            $request->input('exclude_id')
        );

        return response()->json([
            'success' => true,
            'hash' => $result['hash'],
            'duplicates' => $result['duplicates'],
            'hasDuplicates' => count($result['duplicates']) > 0
        ]);
    }

    /**
     * Apply AI suggestion for duplicate group
     */
    public function applySuggestion(Request $request, $groupId)
    {
        $request->validate([
            'action' => 'required|in:keep_verified,reject_duplicates,manual_review',
            'kegiatan_ids' => 'required|array',
            'kegiatan_ids.*' => 'exists:kegiatans,id'
        ]);

        $action = $request->input('action');
        $kegiatanIds = $request->input('kegiatan_ids');

        switch ($action) {
            case 'keep_verified':
                // Keep verified ones, mark others as rejected
                $this->applyKeepVerifiedAction($kegiatanIds);
                break;
                
            case 'reject_duplicates':
                // Reject all duplicates, keep the first/oldest one
                $this->applyRejectDuplicatesAction($kegiatanIds);
                break;
                
            case 'manual_review':
                // Mark all for manual review
                $this->applyManualReviewAction($kegiatanIds);
                break;
        }

        return redirect()->back()->with('success', 'AI suggestion applied successfully');
    }

    /**
     * Update document hashes for all existing files
     */
    public function updateHashes()
    {
        $result = $this->duplicateService->updateAllDocumentHashes();
        
        return response()->json([
            'success' => true,
            'message' => "Updated {$result['updated']} documents, {$result['errors']} errors",
            'result' => $result
        ]);
    }

    /**
     * Find all duplicate groups
     */
    private function findAllDuplicates()
    {
        $allKegiatans = Kegiatan::whereNotNull('bukti_hash')
                              ->with('mahasiswa')
                              ->get();

        $duplicateGroups = [];
        $processedHashes = [];

        foreach ($allKegiatans as $kegiatan) {
            if (in_array($kegiatan->bukti_hash, $processedHashes)) {
                continue;
            }

            // Find similar documents
            $similarDocs = [];
            
            foreach ($allKegiatans as $otherKegiatan) {
                if ($kegiatan->id === $otherKegiatan->id) {
                    continue;
                }

                $similarity = $this->calculateSimilarity($kegiatan->bukti_hash, $otherKegiatan->bukti_hash);
                
                if ($similarity >= 95) { // 95% similarity threshold
                    $similarDocs[] = [
                        'id' => $otherKegiatan->id,
                        'mahasiswa_nama' => $otherKegiatan->mahasiswa->nama ?? 'Unknown',
                        'mahasiswa_npm' => $otherKegiatan->mahasiswa->npm ?? 'Unknown',
                        'kegiatan' => $otherKegiatan->kegiatan,
                        'bukti_dokumen' => $otherKegiatan->bukti_dokumen,
                        'status_verifikasi' => $otherKegiatan->status_verifikasi,
                        'tanggal_input' => $otherKegiatan->tanggal_input,
                        'similarity_percentage' => $similarity,
                        'file_hash' => $otherKegiatan->bukti_hash
                    ];
                }
            }

            if (count($similarDocs) > 0) {
                // Add the original document to the group
                array_unshift($similarDocs, [
                    'id' => $kegiatan->id,
                    'mahasiswa_nama' => $kegiatan->mahasiswa->nama ?? 'Unknown',
                    'mahasiswa_npm' => $kegiatan->mahasiswa->npm ?? 'Unknown',
                    'kegiatan' => $kegiatan->kegiatan,
                    'bukti_dokumen' => $kegiatan->bukti_dokumen,
                    'status_verifikasi' => $kegiatan->status_verifikasi,
                    'tanggal_input' => $kegiatan->tanggal_input,
                    'similarity_percentage' => 100,
                    'file_hash' => $kegiatan->bukti_hash
                ]);

                $duplicateGroups[] = [
                    'group_id' => count($duplicateGroups) + 1,
                    'file_hash' => $kegiatan->bukti_hash,
                    'items' => $similarDocs,
                    'ai_suggestion' => $this->generateAISuggestion($similarDocs)
                ];

                // Mark all hashes in this group as processed
                foreach ($similarDocs as $doc) {
                    $processedHashes[] = $doc['file_hash'];
                }
            }
        }

        return $duplicateGroups;
    }

    /**
     * Calculate similarity between two hashes
     */
    private function calculateSimilarity($hash1, $hash2)
    {
        if (strlen($hash1) === 64 && strlen($hash2) === 64) {
            // Perceptual hash comparison
            $distance = $this->duplicateService->hammingDistance($hash1, $hash2);
            return (64 - $distance) / 64 * 100;
        } else {
            // File hash comparison (exact match)
            return $hash1 === $hash2 ? 100 : 0;
        }
    }

    /**
     * Generate AI suggestion for duplicate group
     */
    private function generateAISuggestion($duplicates)
    {
        $verifiedCount = 0;
        $rejectedCount = 0;
        $pendingCount = 0;

        foreach ($duplicates as $duplicate) {
            switch ($duplicate['status_verifikasi']) {
                case 'verified':
                    $verifiedCount++;
                    break;
                case 'rejected':
                    $rejectedCount++;
                    break;
                default:
                    $pendingCount++;
                    break;
            }
        }

        // AI Logic for suggestions
        if ($verifiedCount > 0) {
            return [
                'action' => 'keep_verified',
                'reason' => 'Ada dokumen yang sudah diverifikasi. Pertahankan yang sudah diverifikasi, tolak yang lain.',
                'confidence' => 'high'
            ];
        } elseif ($rejectedCount === count($duplicates)) {
            return [
                'action' => 'manual_review',
                'reason' => 'Semua dokumen sudah ditolak. Perlu review manual.',
                'confidence' => 'medium'
            ];
        } else {
            return [
                'action' => 'reject_duplicates',
                'reason' => 'Dokumen duplikat terdeteksi. Pertahankan yang paling lama, tolak yang lain.',
                'confidence' => 'high'
            ];
        }
    }

    /**
     * Apply keep verified action
     */
    private function applyKeepVerifiedAction($kegiatanIds)
    {
        $kegiatans = Kegiatan::whereIn('id', $kegiatanIds)->get();

        foreach ($kegiatans as $kegiatan) {
            if ($kegiatan->status_verifikasi !== 'verified') {
                $kegiatan->update([
                    'status_verifikasi' => 'rejected',
                    'admin_note' => 'Ditolak otomatis oleh AI - Dokumen duplikat terdeteksi'
                ]);
            }
        }
    }

    /**
     * Apply reject duplicates action
     */
    private function applyRejectDuplicatesAction($kegiatanIds)
    {
        $kegiatans = Kegiatan::whereIn('id', $kegiatanIds)
                            ->orderBy('tanggal_input', 'asc')
                            ->get();

        // Keep the first one, reject the rest
        foreach ($kegiatans as $index => $kegiatan) {
            if ($index > 0) { // Skip the first one
                $kegiatan->update([
                    'status_verifikasi' => 'rejected',
                    'admin_note' => 'Ditolak otomatis oleh AI - Dokumen duplikat terdeteksi'
                ]);
            }
        }
    }

    /**
     * Apply manual review action
     */
    private function applyManualReviewAction($kegiatanIds)
    {
        Kegiatan::whereIn('id', $kegiatanIds)
               ->update([
                   'admin_note' => 'Ditandai untuk review manual - Duplikasi terdeteksi oleh AI'
               ]);
    }
}