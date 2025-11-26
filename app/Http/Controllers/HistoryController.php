<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SKPPoint;
use App\Models\Kegiatan;
use App\Models\Mahasiswa;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Log;

class HistoryController extends Controller
{
    /**
     * Display a listing of SKP points for the authenticated mahasiswa.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $mahasiswa = null;
    $points = [];
    $kegiatans = [];

        try {
            $mahasiswa = Mahasiswa::where('email', $user->email)->first();
            if ($mahasiswa) {
                // paginate table results for performance (kegiatans table)
                $kegiatans = Kegiatan::where('mahasiswa_id', $mahasiswa->id)
                    ->orderBy('tanggal_input', 'desc')
                    ->paginate(10)
                    ->withQueryString();

                // for aggregations we use the full set
                $allKegiatans = Kegiatan::where('mahasiswa_id', $mahasiswa->id)->orderBy('tanggal_input','desc')->get();

                // Summary numbers (use full set so pagination doesn't affect totals)
                $totalPoints = (int) $allKegiatans->sum('poin');
                $totalKegiatan = (int) $allKegiatans->count();
                $avgPoin = $totalKegiatan ? round($totalPoints / $totalKegiatan, 1) : 0;

                // Bar chart: points per month
                $months = [];
                $monthMap = [];
                foreach ($allKegiatans as $p) {
                    $d = $p->tanggal_input ? \Carbon\Carbon::parse($p->tanggal_input) : null;
                    $key = $d ? $d->format('Y-m') : 'unknown';
                    if (!isset($monthMap[$key])) {
                        $monthMap[$key] = 0;
                    }
                    $monthMap[$key] += (int) $p->poin;
                }
                ksort($monthMap);
                foreach ($monthMap as $k => $v) {
                    $months[] = ['label' => \Carbon\Carbon::createFromFormat('Y-m', $k)->format('M Y'), 'value' => $v];
                }

                // Pie chart: distribution by kegiatan (sum of points per kegiatan)
                $dist = [];
                foreach ($allKegiatans as $p) {
                    $kegiatan = $p->kegiatan ?: 'Lainnya';
                    if (!isset($dist[$kegiatan])) $dist[$kegiatan] = 0;
                    $dist[$kegiatan] += (int) $p->poin;
                }
                arsort($dist);
                $pie = [];
                $others = 0;
                $i = 0;
                foreach ($dist as $k => $v) {
                    $i++;
                    if ($i <= 6) {
                        $pie[] = ['label' => $k, 'value' => $v];
                    } else {
                        $others += $v;
                    }
                }
                if ($others > 0) {
                    $pie[] = ['label' => 'Lainnya', 'value' => $others];
                }

                // Line chart: cumulative points over time (by date ascending)
                $byDate = [];
                foreach ($allKegiatans->sortBy('tanggal_input') as $p) {
                    $d = $p->tanggal_input ? \Carbon\Carbon::parse($p->tanggal_input)->toDateString() : null;
                    if (!$d) continue;
                    if (!isset($byDate[$d])) $byDate[$d] = 0;
                    $byDate[$d] += (int) $p->poin;
                }
                $cumulative = [];
                $running = 0;
                foreach ($byDate as $date => $val) {
                    $running += $val;
                    $cumulative[] = ['date' => $date, 'value' => $running];
                }
            }
        } catch (\Throwable $e) {
            // ignore if table/model not present
            Log::error('HistoryController@index error: '.$e->getMessage());
            $totalPoints = 0;
            $totalKegiatan = 0;
            $avgPoin = 0;
            $months = [];
            $pie = [];
            $cumulative = [];
        }

        return Inertia::render('History/Index', [
            'user' => $user ? $user->only('name', 'email') : null,
            'mahasiswa' => $mahasiswa ? $mahasiswa->only(['nama','npm','prodi','email','id']) : null,
            // provide both names for compatibility: frontend may read 'kegiatans' or 'skp_points'
            'kegiatans' => $kegiatans,
            'skp_points' => $kegiatans,
            'summary' => [
                'total_points' => $totalPoints ?? 0,
                'total_kegiatan' => $totalKegiatan ?? 0,
                'avg_poin' => $avgPoin ?? 0,
            ],
            'bar' => $months ?? [],
            'pie' => $pie ?? [],
            'line' => $cumulative ?? [],
        ]);
    }

    /**
     * Export SKP points as CSV for the authenticated mahasiswa.
     */
    public function exportCsv(Request $request)
    {
        $user = $request->user();
        $mahasiswa = Mahasiswa::where('email', $user->email)->first();
        if (! $mahasiswa) {
            return redirect()->back()->with('error', 'Mahasiswa tidak ditemukan');
        }

    $points = Kegiatan::where('mahasiswa_id', $mahasiswa->id)->orderBy('tanggal_input', 'desc')->get();

        $filename = 'history_skp_' . now()->format('Ymd_His') . '.csv';

        $callback = function () use ($points) {
            $FH = fopen('php://output', 'w');
            // BOM for Excel compatibility
            fprintf($FH, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($FH, ['No', 'Kegiatan', 'Tanggal', 'Poin', 'Bobot', 'Bukti', 'Status']);
            $i = 1;
            foreach ($points as $p) {
                fputcsv($FH, [
                    $i++,
                    $p->kegiatan,
                    $p->tanggal_input,
                    $p->poin,
                    $p->bobot,
                    $p->bukti_dokumen,
                    $p->status_verifikasi,
                ]);
            }
            fclose($FH);
        };

        return response()->streamDownload($callback, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-store, no-cache',
        ]);
    }

    /**
     * Export SKP points as PDF using barryvdh/laravel-dompdf if available.
     */
    public function exportPdf(Request $request)
    {
        $user = $request->user();
        $mahasiswa = Mahasiswa::where('email', $user->email)->first();
        if (! $mahasiswa) {
            return redirect()->back()->with('error', 'Mahasiswa tidak ditemukan');
        }

    $points = Kegiatan::where('mahasiswa_id', $mahasiswa->id)->orderBy('tanggal_input', 'desc')->get();

        // If the PDF package is installed, use it
        if (class_exists(\Barryvdh\DomPDF\Facade\Pdf::class) || class_exists('Barryvdh\\DomPDF\\Facade\\Pdf')) {
            try {
                $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('history_pdf', ['points' => $points, 'mahasiswa' => $mahasiswa]);
                return $pdf->download('history_skp_' . now()->format('Ymd_His') . '.pdf');
            } catch (\Throwable $e) {
                Log::error('HistoryController@exportPdf error: '.$e->getMessage());
                return redirect()->back()->with('error', 'Gagal membuat PDF: '.$e->getMessage());
            }
        }

        // Fallback: instruct user to install the package for proper PDF generation
        return redirect()->back()->with('error', 'PDF generator tidak ditemukan. Jalankan: composer require barryvdh/laravel-dompdf');
    }
}
