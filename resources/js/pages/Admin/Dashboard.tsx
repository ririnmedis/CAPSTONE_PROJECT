import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Inertia } from '@inertiajs/inertia';

export default function AdminDashboard() {
    const page: any = usePage();
    const props = page.props || {};
    const stats = props.stats || {};
    // paginated payloads for each tab
    const paginatedVerified = props.verifiedKegiatans && props.verifiedKegiatans.data ? props.verifiedKegiatans : null;
    const paginatedPending = props.pendingKegiatans && props.pendingKegiatans.data ? props.pendingKegiatans : null;

    // UI state: which tab is active ('pending' or 'verified')
    const [currentTab, setCurrentTab] = useState<'pending'|'verified'>(paginatedPending ? 'pending' : 'verified');

    // items shown in the active tab
    const recentPending = paginatedPending ? paginatedPending.data : (props.pendingKegiatans || []);
    const recentVerified = paginatedVerified ? paginatedVerified.data : (props.verifiedKegiatans || []);
    const [items, setItems] = useState(currentTab === 'pending' ? (recentPending || []) : (recentVerified || []));

    // keep items in sync if server props change (pagination / filters / tab)
    useEffect(() => {
        if (currentTab === 'pending') setItems(recentPending || []);
        else setItems(recentVerified || []);
    }, [recentPending, recentVerified, currentTab]);



    // Auto-refresh (polling) state
    const [autoRefresh, setAutoRefresh] = useState(false);
    
    // Success message state
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    useEffect(() => {
        if (!autoRefresh) return;
        const id = setInterval(() => {
            // re-request current page to refresh Inertia props
            Inertia.get(window.location.pathname + window.location.search, {}, { preserveState: true, replace: true });
        }, 30000); // 30s
        return () => clearInterval(id);
    }, [autoRefresh]);

    // helper to navigate pagination links using Inertia
    function goToPage(url: string | null) {
        if (!url) return;
        // Inertia.get will preserve the SPA navigation; preserveState true to keep local state
        Inertia.get(url, {}, { preserveState: true, replace: true });
    }

    function badgeFor(status: string) {
        if (!status) return <span className="text-sm text-gray-500">-</span>;
        const s = status.toLowerCase();
        if (s === 'verified') return <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">Diverifikasi</span>;
        if (s === 'rejected') return <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800">Ditolak</span>;
        return <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">Menunggu</span>;
    }

    async function handleAction(id: number, status: string) {
        let admin_note = '';
        
        if (status === 'rejected') {
            // Show rejection reason options
            const reasons = [
                'Dokumen duplikasi terdeteksi',
                'Dokumen tidak valid atau tidak jelas',
                'Kegiatan tidak sesuai dengan kriteria SKP',
                'Data kegiatan tidak lengkap',
                'Bukti dokumen tidak mendukung kegiatan',
                'Lainnya (tuliskan alasan)'
            ];
            
            let selectedReason = '';
            const reasonsText = reasons.map((r, i) => `${i + 1}. ${r}`).join('\n');
            const choice = prompt(`Pilih alasan penolakan (masukkan nomor 1-${reasons.length}):\n\n${reasonsText}`);
            
            if (!choice) return; // User cancelled
            
            const choiceNum = parseInt(choice);
            if (choiceNum >= 1 && choiceNum <= reasons.length) {
                if (choiceNum === reasons.length) {
                    // Custom reason
                    selectedReason = prompt('Tuliskan alasan penolakan:') || '';
                } else {
                    selectedReason = reasons[choiceNum - 1];
                }
            } else {
                alert('Pilihan tidak valid');
                return;
            }
            
            admin_note = selectedReason;
        } else if (status === 'verified') {
            const confirmText = 'Yakin ingin menyetujui kegiatan ini?';
            if (!confirm(confirmText)) return;
            
            admin_note = prompt('Tambahkan catatan persetujuan (opsional):') || '';
        } else {
            const confirmText = `Yakin ingin mengubah status menjadi ${status}?`;
            if (!confirm(confirmText)) return;
            
            admin_note = prompt('Tambahkan catatan (opsional):') || '';
        }

        Inertia.post(`/admin/kegiatans/${id}/status`, { status_verifikasi: status, admin_note }, {
            onSuccess: (page: any) => {
                // update local item with fresh data from server
                const updatedKegiatan = page.props?.kegiatan;
                if (updatedKegiatan) {
                    setItems((prev: any) => prev.map((r: any) => 
                        r.id === id ? updatedKegiatan : r
                    ));
                }
                
                // show success message
                const statusText = status === 'verified' ? 'disetujui' : status === 'rejected' ? 'ditolak' : 'dibatalkan';
                setSuccessMessage(`Verifikasi berhasil! Kegiatan telah ${statusText}.`);
                
                // hide message after 3 seconds
                setTimeout(() => setSuccessMessage(null), 3000);
            },
            onError: (errors: any) => {
                alert('Gagal mengubah status: ' + JSON.stringify(errors));
            }
        });
    }

    return (
        <AppLayout breadcrumbs={[]}> 
            <Head title="Admin Dashboard" />
            <div className="p-6">
                {/* Success Message */}
                {successMessage && (
                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center justify-between">
                        <span>{successMessage}</span>
                        <button 
                            onClick={() => setSuccessMessage(null)}
                            className="ml-4 text-green-700 hover:text-green-900"
                        >
                            ×
                        </button>
                    </div>
                )}
                
                <h1 className="text-2xl font-semibold mb-4">Sistem Pengelolaan Point SKP Mahasiswa Fasilkom</h1>

                <div className="mb-6">
                    <p className="text-sm text-slate-600">Selamat datang, Admin. Gunakan panel di bawah untuk meninjau kegiatan mahasiswa, melakukan verifikasi, dan memeriksa kemungkinan duplikasi dokumen/sertifikat yang diunggah.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="rounded-xl bg-white shadow p-6">
                        <div className="text-sm text-slate-500">Menunggu Verifikasi</div>
                        <div className="text-2xl font-bold">{(props.stats && props.stats.pendingKegiatan) ? props.stats.pendingKegiatan : 0}</div>
                    </div>
                    <div className="rounded-xl bg-white shadow p-6">
                        <div className="text-sm text-slate-500">Grup Duplikat Terdeteksi</div>
                        <div className="text-2xl font-bold">{(props.summary && props.summary.duplicateGroups) ? props.summary.duplicateGroups : 0}</div>
                    </div>
                    <div className="rounded-xl bg-white shadow p-6">
                        <div className="text-sm text-slate-500">Penolakan Terbaru</div>
                        <div className="text-2xl font-bold">{(props.summary && props.summary.recentRejected) ? props.summary.recentRejected.length : 0}</div>
                    </div>
                </div>

                <div className="rounded-xl bg-white shadow p-6 mb-6">
                    <h2 className="text-lg font-medium mb-3">Total Mahasiswa per Prodi</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded">
                            <div className="text-sm text-slate-500">Prodi Informatika</div>
                            <div className="text-3xl font-bold">{props.prodiCounts?.informatika ?? 0}</div>
                        </div>
                        <div className="p-4 border rounded">
                            <div className="text-sm text-slate-500">Prodi Sistem Informasi</div>
                            <div className="text-3xl font-bold">{props.prodiCounts?.sistem_informasi ?? 0}</div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl bg-white shadow p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-medium">Verifikasi Kegiatan Mahasiswa</h2>
                            <div className="mt-2 flex gap-2">
                                <button onClick={() => setCurrentTab('pending')} className={`px-3 py-1 rounded ${currentTab === 'pending' ? 'bg-sky-600 text-white' : 'bg-white border text-slate-700'}`}>Menunggu Verifikasi</button>
                                <button onClick={() => setCurrentTab('verified')} className={`px-3 py-1 rounded ${currentTab === 'verified' ? 'bg-sky-600 text-white' : 'bg-white border text-slate-700'}`}>Terverifikasi</button>
                                <label className="inline-flex items-center ml-4 text-sm gap-2">
                                    <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
                                    <span>Auto-refresh (30s)</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <a href="/admin/kegiatans/duplicates" className="px-3 py-1 rounded bg-amber-500 text-white">Periksa Duplikasi Dokumen</a>
                            <a href="/admin/kegiatans" className="px-3 py-1 rounded bg-sky-600 text-white">Lihat Selengkapnya</a>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="text-left bg-gray-50">
                                    <th className="pb-3 pt-3 px-4 font-medium text-gray-700 w-1/5">Mahasiswa</th>
                                    <th className="pb-3 pt-3 px-4 font-medium text-gray-700 w-2/5">Kegiatan</th>
                                    <th className="pb-3 pt-3 px-4 font-medium text-gray-700 w-20 text-center">Tanggal</th>
                                    <th className="pb-3 pt-3 px-4 font-medium text-gray-700 w-16 text-center">Poin</th>
                                    <th className="pb-3 pt-3 px-4 font-medium text-gray-700 w-16 text-center">Bobot</th>
                                    <th className="pb-3 pt-3 px-4 font-medium text-gray-700 w-16 text-center">Bukti</th>
                                    <th className="pb-3 pt-3 px-4 font-medium text-gray-700 w-24 text-center">Status</th>
                                    <th className="pb-3 pt-3 px-4 font-medium text-gray-700 w-32">Catatan Admin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 && (
                                    <tr><td colSpan={8} className="py-8 px-4 text-center text-gray-500">Belum ada data.</td></tr>
                                )}
                                {items.map((k: any) => (
                                    <tr key={k.id} className="border-t hover:bg-gray-50">
                                        <td className="py-4 px-4 align-top">
                                            <div className="max-w-[200px]">
                                                <div className="font-medium text-gray-900 truncate">{k.mahasiswa?.nama || '-'}</div>
                                                <div className="text-gray-500 text-xs">({k.mahasiswa?.npm || '-'})</div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 align-top">
                                            <div className="max-w-[300px] text-gray-700 leading-relaxed">{k.kegiatan}</div>
                                        </td>
                                        <td className="py-4 px-4 align-top text-center text-gray-600">
                                            {k.tanggal_input ? new Date(k.tanggal_input).toLocaleDateString('id-ID', { 
                                                day: '2-digit', 
                                                month: '2-digit', 
                                                year: 'numeric' 
                                            }) : '-'}
                                        </td>
                                        <td className="py-4 px-4 align-top text-center font-medium text-gray-900">{k.poin}</td>
                                        <td className="py-4 px-4 align-top text-center text-gray-600">{k.bobot || '-'}</td>
                                        <td className="py-4 px-4 align-top text-center">
                                            {k.bukti_dokumen ? (
                                                <a 
                                                    href={`/admin/files/kegiatan/${k.bukti_dokumen.split('/').pop()}`} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="text-green-600 hover:text-green-800 font-medium"
                                                >
                                                    Lihat
                                                </a>
                                            ) : '-'}
                                        </td>
                                        <td className="py-4 px-4 align-top text-center">{badgeFor(k.status_verifikasi)}</td>
                                        <td className="py-4 px-4 align-top">
                                            <div className="space-y-2">
                                                {k.admin_note ? (
                                                    <div className="text-gray-600 text-xs max-w-[150px] p-2 bg-gray-50 rounded border-l-2 border-blue-400">
                                                        <div className="font-medium text-gray-700 mb-1">Catatan Admin:</div>
                                                        <div title={k.admin_note} className="break-words">
                                                            {k.admin_note.length > 50 ? k.admin_note.substring(0, 50) + '...' : k.admin_note}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )}
                                                
                                                <div className="flex gap-1">
                                                    {(k.status_verifikasi !== 'verified') ? (
                                                        <>
                                                            <button 
                                                                onClick={() => handleAction(k.id, 'verified')} 
                                                                className="rounded px-2 py-1 text-xs text-white bg-green-600 hover:bg-green-700"
                                                            >
                                                                Setujui
                                                            </button>
                                                            <button 
                                                                onClick={() => handleAction(k.id, 'rejected')} 
                                                                className="rounded px-2 py-1 text-xs text-white bg-red-600 hover:bg-red-700"
                                                            >
                                                                Tolak
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleAction(k.id, 'pending')} 
                                                            className="rounded px-2 py-1 text-xs text-white bg-gray-600 hover:bg-gray-700"
                                                        >
                                                            Batal
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* Render pagination for the active tab */}
                        {((currentTab === 'pending' && paginatedPending) || (currentTab === 'verified' && paginatedVerified)) && (
                            <div className="mt-4 flex items-center gap-2">
                                {((currentTab === 'pending' ? paginatedPending : paginatedVerified).links || []).map((link: any, idx: number) => (
                                    <button
                                        key={idx}
                                        disabled={!link.url}
                                        onClick={() => goToPage(link.url)}
                                        className={`px-3 py-1 rounded ${link.active ? 'bg-sky-600 text-white' : 'bg-white border text-slate-700'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
