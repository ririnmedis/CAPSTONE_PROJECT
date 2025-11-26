import React, { useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import AppLayout from '@/layouts/app-layout';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend);

type BarPoint = { label: string; value: number };
type PiePoint = { label: string; value: number };

function numberWithSep(n: number) {
    return n.toLocaleString();
}
const palette = {
    orangeLight: '#FFB5A7',
    orange: '#F97316',
    blue100: '#A5B4FC',
    blue200: '#818CF8',
    blue400: '#6366F1',
    green: '#10B981',
    greenDark: '#059669'
};

export default function Index() {
    const page: any = usePage();
    const props = page.props || {};
    const user = props.user || null;
    const mahasiswa = props.mahasiswa || null;
    // paginated Inertia data (contains data array) - prefer 'kegiatans' prop
    const kegiatans: any = props.kegiatans || props.skp_points || { data: [] };
    const kegiatans_data: any[] = kegiatans.data || [];
    const summary = props.summary || { total_points: 0, total_kegiatan: 0, avg_poin: 0 };
    const bar: BarPoint[] = props.bar || [];
    const pie: PiePoint[] = props.pie || [];
    const line: any[] = props.line || [];

    const colors = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#94a3b8', '#fb7185'];

    const barData = useMemo(() => ({
        labels: bar.map(b => b.label),
        datasets: [
            {
                label: 'Poin',
                data: bar.map(b => b.value),
                backgroundColor: '#60a5fa',
            },
        ],
    }), [bar]);

    const pieData = useMemo(() => ({
        labels: pie.map(p => p.label),
        datasets: [
            {
                data: pie.map(p => p.value),
                backgroundColor: pie.map((_, i) => colors[i % colors.length]),
            },
        ],
    }), [pie]);

    const lineData = useMemo(() => ({
        labels: line.map(l => l.date),
        datasets: [
            {
                label: 'Kumulatif Poin',
                data: line.map(l => l.value),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16,185,129,0.2)',
                tension: 0.3,
                fill: true,
            },
        ],
    }), [line]);

    const topStats = useMemo(() => {
        return [
            { title: 'Total Poin', value: summary.total_points || 0 },
            { title: 'Total Kegiatan', value: summary.total_kegiatan || 0 },
            { title: 'Rata-rata Poin', value: summary.avg_poin || 0 },
        ];
    }, [summary]);

    return (
        <AppLayout breadcrumbs={[]}> 
            <Head title="History SKP" />
            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold mb-2">History SKP</h1>
                        <p className="text-slate-500 mb-6">Riwayat aktivitas dan point SKP Anda</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <a href="/history/export/csv" target="_blank" rel="noreferrer" className="px-3 py-2 bg-white border rounded text-sm shadow">Export CSV</a>
                        <a href="/history/export/pdf" target="_blank" rel="noreferrer" className="px-3 py-2 bg-sky-600 text-white rounded text-sm">Download PDF</a>
                    </div>
                </div>

                {/* Top cards (Dashboard / Biodata / Input Poin / History) */}
                            {/* Top cards (Dashboard / Biodata / Input Poin / History) */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-8">
                {/* Dashboard card */}
                <div className="rounded-2xl bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col items-center text-center py-6">
                        <div className="mb-6 h-20 w-20 rounded-2xl flex items-center justify-center text-white" style={{ background: `linear-gradient(180deg, ${palette.orangeLight}, ${palette.orange})`, boxShadow: '0 18px 40px rgba(255,107,75,0.08)' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold">Dashboard</h3>
                        <p className="text-sm text-slate-400 mt-3">Kembali ke tampilan utama</p>
                        <button
                            onClick={() => Inertia.get('/dashboard')}
                            className="mt-6 w-full rounded-full text-white font-medium text-sm leading-tight py-2 px-6"
                            style={{
                                background: `linear-gradient(90deg, ${palette.orangeLight}, ${palette.orange})`,
                                boxShadow: 'inset 0 -8px 18px rgba(255,107,75,0.10), 0 10px 24px rgba(16,24,40,0.04)'
                            }}
                        >
                            Buka Dashboard
                        </button>
                    </div>
                </div>

                {/* Biodata card */}
                <div className="rounded-2xl bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col items-center text-center py-6">
                        <div className="mb-6 h-20 w-20 rounded-2xl flex items-center justify-center text-white" style={{ background: `linear-gradient(180deg, ${palette.blue100}, ${palette.blue200})`, boxShadow: '0 18px 40px rgba(81,118,248,0.08)' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9 9 0 0112 15c2.387 0 4.558.892 6.121 2.365" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold">Biodata</h3>
                        <p className="text-sm text-slate-400 mt-3">Kelola data pribadi mahasiswa</p>
                        <button
                            onClick={() => Inertia.get('/biodata')}
                            className="mt-6 w-full rounded-full text-white font-medium text-base py-2.5 px-6"
                            style={{
                                background: `linear-gradient(90deg, ${palette.blue200}, ${palette.blue400})`,
                                boxShadow: 'inset 0 -8px 18px rgba(81,118,248,0.10), 0 10px 24px rgba(16,24,40,0.04)'
                            }}
                        >
                            Buka Biodata
                        </button>
                    </div>
                </div>

                {/* Input Poin card */}
                <div className="rounded-2xl bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col items-center text-center py-6">
                        <div className="mb-6 h-20 w-20 rounded-2xl flex items-center justify-center text-white" style={{ background: `linear-gradient(180deg, ${palette.green}, ${palette.greenDark})`, boxShadow: '0 18px 40px rgba(16,185,129,0.08)' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold">Input Poin</h3>
                        <p className="text-sm text-slate-400 mt-3">Tambah dan kelola aktivitas poin</p>
                        <button
                            onClick={() => Inertia.get('/kegiatans')}
                            className="mt-6 w-full rounded-full text-white font-medium text-base py-2.5 px-6"
                            style={{
                                background: `linear-gradient(90deg, ${palette.green}, ${palette.greenDark})`,
                                boxShadow: 'inset 0 -8px 18px rgba(16,185,129,0.10), 0 10px 24px rgba(16,24,40,0.04)'
                            }}
                        >
                            Input Poin
                        </button>
                    </div>
                </div>

                {/* History card */}
                {/* History card */}
<div className="rounded-2xl bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex flex-col items-center text-center py-6">
        <div className="mb-6 h-20 w-20 rounded-2xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(180deg, #C7D2FE, #93B4FF)', boxShadow: '0 18px 40px rgba(147,180,255,0.08)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <h3 className="text-lg font-semibold">History</h3>
        <p className="text-sm text-slate-400 mt-3">Lihat riwayat point dan aktivitas</p>
        <button
            onClick={() => Inertia.get('/history')}
            className="mt-6 w-full rounded-full text-white font-medium text-base py-2.5 px-6"
            style={{
                background: 'linear-gradient(90deg, #C7D2FE, #93B4FF)',
                boxShadow: 'inset 0 -8px 18px rgba(147,180,255,0.10), 0 10px 24px rgba(16,24,40,0.04)'
            }}
        >
            Lihat History
        </button>
    </div>
</div>
            </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {topStats.map((s, i) => (
                        <div key={i} className="bg-white rounded-lg shadow p-4">
                            <div className="text-sm text-slate-500">{s.title}</div>
                            <div className="text-2xl font-medium mt-2">{numberWithSep(s.value)}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
                        <div className="text-sm text-slate-600 mb-2">Poin per Bulan</div>
                        <div className="w-full h-40">
                            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-4">
                        <div>
                            <div className="text-sm text-slate-600 mb-2">Distribusi Kegiatan</div>
                            <div className="flex items-center gap-4">
                                <div style={{ width: 110, height: 110 }}>
                                    <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
                                </div>
                                <div className="text-sm">
                                    {pie.map((d, i) => (
                                        <div key={i} className="flex items-center gap-2 mb-1">
                                            <span className="w-3 h-3 rounded" style={{ backgroundColor: colors[i % colors.length] }} />
                                            <span className="text-slate-600">{d.label}</span>
                                            <span className="ml-auto text-slate-800 font-medium">{d.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-slate-600 mb-2">Kumulatif Poin</div>
                            <div className="w-full h-36">
                                <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-slate-600">
                                    <th className="px-4 py-3">No</th>
                                    <th className="px-4 py-3">Kegiatan</th>
                                    <th className="px-4 py-3">Tanggal</th>
                                    <th className="px-4 py-3">Poin</th>
                                    <th className="px-4 py-3">Bobot</th>
                                    <th className="px-4 py-3">Bukti</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Catatan Admin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {kegiatans_data.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-6 text-center text-slate-500">Belum ada data history.</td>
                                    </tr>
                                )}
                                {kegiatans_data.map((s: any, idx: number) => (
                                    <tr key={idx} className="border-t">
                                        <td className="px-4 py-3 align-top">{idx + 1}</td>
                                        <td className="px-4 py-3 align-top">{s.kegiatan}</td>
                                        <td className="px-4 py-3 align-top">{s.tanggal_input ? new Date(s.tanggal_input).toLocaleDateString() : '-'}</td>
                                        <td className="px-4 py-3 align-top">{s.poin}</td>
                                        <td className="px-4 py-3 align-top">{s.bobot}</td>
                                        <td className="px-4 py-3 align-top">
                                            {s.bukti_dokumen ? (
                                                <a href={s.bukti_dokumen} target="_blank" rel="noreferrer" className="text-sky-600">Lihat</a>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${s.status_verifikasi === 'verified' ? 'bg-emerald-100 text-emerald-700' : s.status_verifikasi === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                                {s.status_verifikasi === 'verified' ? 'Disetujui' : s.status_verifikasi === 'rejected' ? 'Ditolak' : 'Menunggu'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 align-top">
                                            {s.admin_note ? (
                                                <div className="max-w-xs">
                                                    <div className={`text-xs p-2 rounded border-l-2 ${s.status_verifikasi === 'rejected' ? 'bg-red-50 border-red-400 text-red-700' : s.status_verifikasi === 'verified' ? 'bg-green-50 border-green-400 text-green-700' : 'bg-gray-50 border-gray-400 text-gray-700'}`}>
                                                        <div className="font-medium mb-1">
                                                            {s.status_verifikasi === 'rejected' ? 'Alasan Penolakan:' : s.status_verifikasi === 'verified' ? 'Catatan Persetujuan:' : 'Catatan:'}
                                                        </div>
                                                        <div className="break-words">{s.admin_note}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* Pagination controls (server-side) */}
                        {kegiatans && kegiatans.links && (
                            <div className="mt-4 flex items-center gap-2">
                                {kegiatans.links.map((l: any, i: number) => (
                                    <a key={i} href={l.url ?? '#'} className={`px-3 py-1 rounded border text-sm ${l.active ? 'bg-sky-600 text-white' : 'bg-white text-slate-700'}`} dangerouslySetInnerHTML={{ __html: l.label }} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
