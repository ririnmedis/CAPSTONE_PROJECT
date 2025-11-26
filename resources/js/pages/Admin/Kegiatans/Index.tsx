import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Inertia } from '@inertiajs/inertia';
import { Check, X, RotateCcw } from 'lucide-react';

export default function AdminKegiatansIndex() {
    const page: any = usePage();
    const props = page.props || {};
    const initial = props.kegiatans || { data: [], links: [], meta: {} };
    const flash = props.flash || {};
    const [kegiatans, setKegiatans] = useState(initial);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Show flash message from server
    React.useEffect(() => {
        if (flash.success) {
            setSuccessMessage(flash.success);
            setTimeout(() => setSuccessMessage(null), 5000);
        }
    }, [flash]);

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
            // Gunakan alasan default untuk penolakan
            admin_note = 'Dokumen duplikasi terdeteksi';
        } else if (status === 'verified') {
            if (!confirm('Yakin ingin menyetujui kegiatan ini?')) return;
            admin_note = 'Kegiatan disetujui';
        } else {
            if (!confirm(`Yakin ingin mengubah status menjadi ${status}?`)) return;
            admin_note = 'Status diubah oleh admin';
        }

        // Update status langsung di UI untuk responsifitas
        setKegiatans((prev: any) => {
            const next = { ...prev };
            next.data = prev.data.map((r: any) => 
                r.id === id ? { ...r, status_verifikasi: status, admin_note } : r
            );
            return next;
        });

        Inertia.post(`/admin/kegiatans/${id}/status`, { status_verifikasi: status, admin_note }, {
            onError: (errors: any) => {
                console.error('Error updating status:', errors);
                alert('Gagal memperbarui status kegiatan. Silakan coba lagi.');
            }
        });
    }

    function renderPagination() {
        const links = kegiatans.links || [];
        if (!links.length) return null;
        return (
            <nav className="mt-4 flex items-center gap-2" aria-label="Pagination">
                {links.map((link: any, idx: number) => (
                    <button key={idx} disabled={!link.url} className={`px-3 py-1 rounded ${link.active ? 'bg-sky-600 text-white' : 'bg-white border'}`} onClick={() => {
                        if (!link.url) return;
                        // perform client-side request and update state
                        Inertia.get(link.url, {}, { preserveState: true, preserveScroll: true, onSuccess: (page:any) => {
                            const k = page.props?.kegiatans || { data: [] };
                            setKegiatans(k);
                        }});
                    }} dangerouslySetInnerHTML={{ __html: link.label }} />
                ))}
            </nav>
        );
    }

    return (
        <AppLayout breadcrumbs={[]}> 
            <Head title="Verifikasi Kegiatan" />
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-4">Verifikasi Kegiatan Mahasiswa</h1>
                
                {/* Flash Message */}
                {successMessage && (
                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            {successMessage}
                        </span>
                        <button 
                            onClick={() => setSuccessMessage(null)}
                            className="ml-4 text-green-700 hover:text-green-900"
                        >
                            ×
                        </button>
                    </div>
                )}
                
                <div className="rounded-xl bg-white shadow-sm p-6">
                    <div className="mb-4 flex gap-2 items-center">
                        <select defaultValue={(props.filters && props.filters.status) || ''} id="filter-status" className="border rounded px-3 py-1">
                            <option value="">Semua Status</option>
                            <option value="pending">Menunggu</option>
                            <option value="verified">Diverifikasi</option>
                            <option value="rejected">Ditolak</option>
                        </select>
                        <input defaultValue={(props.filters && props.filters.prodi) || ''} id="filter-prodi" placeholder="Filter Prodi" className="border rounded px-3 py-1" />
                        <input defaultValue={(props.filters && props.filters.search) || ''} id="filter-search" placeholder="Cari nama / NPM / kegiatan" className="border rounded px-3 py-1 flex-1" />
                        <button onClick={() => {
                            const status = (document.getElementById('filter-status') as HTMLSelectElement).value;
                            const prodi = (document.getElementById('filter-prodi') as HTMLInputElement).value;
                            const search = (document.getElementById('filter-search') as HTMLInputElement).value;
                            const params: any = {};
                            if (status) params.status = status;
                            if (prodi) params.prodi = prodi;
                            if (search) params.search = search;
                            Inertia.get('/admin/kegiatans', params, { preserveState: true, preserveScroll: true });
                        }} className="px-3 py-1 rounded bg-sky-600 text-white">Terapkan</button>
                        <button onClick={() => { (document.getElementById('filter-status') as HTMLSelectElement).value = ''; (document.getElementById('filter-prodi') as HTMLInputElement).value = ''; (document.getElementById('filter-search') as HTMLInputElement).value = ''; Inertia.get('/admin/kegiatans', {}, { preserveState: true, preserveScroll: true }); }} className="px-3 py-1 rounded bg-gray-200">Reset</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="text-left bg-gray-50">
                                    <th className="pb-3 pt-3 px-4 font-medium text-gray-700 w-1/6">Mahasiswa</th>
                                    <th className="pb-3 pt-3 px-4 font-medium text-gray-700 w-1/3">Kegiatan</th>
                                    <th className="pb-3 pt-3 px-4 font-medium text-gray-700 w-20 text-center">Tanggal</th>
                                    <th className="pb-3 pt-3 px-4 font-medium text-gray-700 w-16 text-center">Poin</th>
                                    <th className="pb-3 pt-3 px-4 font-medium text-gray-700 w-16 text-center">Bobot</th>
                                    <th className="pb-3 pt-3 px-4 font-medium text-gray-700 w-16 text-center">Bukti</th>
                                    <th className="pb-3 pt-3 px-4 font-medium text-gray-700 w-24 text-center">Status</th>
                                    <th className="pb-3 pt-3 px-4 font-medium text-gray-700 w-32">Catatan Admin</th>
                                    <th className="pb-3 pt-3 px-4 font-medium text-gray-700 w-32"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {kegiatans.data.length === 0 && (
                                    <tr><td colSpan={9} className="py-8 px-4 text-center text-gray-500">Belum ada data.</td></tr>
                                )}
                                {kegiatans.data.map((k: any) => (
                                    <tr key={k.id} className="border-t hover:bg-gray-50">
                                        <td className="py-4 px-4 align-top">
                                            <div className="max-w-[150px]">
                                                <div className="font-medium text-gray-900 truncate">{k.mahasiswa?.nama || '-'}</div>
                                                <div className="text-gray-500 text-xs">({k.mahasiswa?.npm || '-'})</div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 align-top">
                                            <div className="max-w-[250px] text-gray-700 leading-relaxed">{k.kegiatan}</div>
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
                                                    href={k.bukti_dokumen} 
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
                                            <div className="space-y-3 min-w-[200px]">
                                                {/* Catatan Admin */}
                                                {k.admin_note ? (
                                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                        <div className="font-medium text-blue-800 text-xs mb-1">Catatan:</div>
                                                        <div className="text-blue-700 text-xs leading-relaxed break-words">
                                                            {k.admin_note}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-400 text-xs italic">Belum ada catatan</div>
                                                )}
                                                
                                                {/* Action Buttons */}
                                                <div className="space-y-2">
                                                    {k.status_verifikasi !== 'verified' ? (
                                                        <>
                                                            <div className="grid grid-cols-1 gap-2">
                                                                <button 
                                                                    onClick={() => handleAction(k.id, 'verified')} 
                                                                    className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm w-full"
                                                                    title="Setujui kegiatan"
                                                                >
                                                                    <Check className="h-3 w-3" />
                                                                    Setujui
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleAction(k.id, 'rejected')} 
                                                                    className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm w-full"
                                                                    title="Tolak kegiatan"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                    Tolak
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="grid grid-cols-1 gap-2">
                                                            <button 
                                                                onClick={() => handleAction(k.id, 'pending')} 
                                                                className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-white bg-gray-600 hover:bg-gray-700 transition-colors shadow-sm w-full"
                                                                title="Batalkan verifikasi"
                                                            >
                                                                <RotateCcw className="h-3 w-3" />
                                                                Batal
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {renderPagination()}
                </div>
            </div>
        </AppLayout>
    );
}
