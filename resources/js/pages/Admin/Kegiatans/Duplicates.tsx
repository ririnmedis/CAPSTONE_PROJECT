import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import AppLayout from '@/layouts/app-layout';

export default function Duplicates() {
    const page: any = usePage();
    const groups = page.props.groups || [];

    return (
        <AppLayout breadcrumbs={[]}> 
            <Head title="Duplicate Documents" />
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-4">Deteksi Duplikasi Dokumen</h1>

                {groups.length === 0 && (
                    <div className="rounded-lg bg-white p-6 shadow-sm">Tidak ditemukan duplikasi dokumen.</div>
                )}

                {groups.map((g: any, idx: number) => (
                    <div key={g.key} className="rounded-lg bg-white p-4 shadow-sm mb-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="font-medium">Group {idx + 1} — {g.count} items</div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left">
                                        <th className="pb-2">Mahasiswa</th>
                                        <th className="pb-2">File</th>
                                        <th className="pb-2">Status</th>
                                        <th className="pb-2">Saran AI</th>
                                        <th className="pb-2">Diperiksa Oleh</th>
                                        <th className="pb-2">Local Path</th>
                                        <th className="pb-2">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {g.items.map((it: any) => (
                                        <tr key={it.id} className="border-t align-top">
                                            <td className="py-3">{it.mahasiswa ? `${it.mahasiswa.nama} (${it.mahasiswa.npm})` : '-'}</td>
                                            <td className="py-3 max-w-xs truncate">
                                                {it.bukti_dokumen ? (
                                                    <a 
                                                        href={`/admin/files/kegiatan/${it.bukti_dokumen.split('/').pop()}`} 
                                                        target="_blank" 
                                                        rel="noreferrer" 
                                                        className="text-sky-600"
                                                    >
                                                        {it.bukti_dokumen.split('/').pop()}
                                                    </a>
                                                ) : '-'}
                                            </td>
                                            <td className="py-3">{it.status_verifikasi ?? '-'}</td>
                                            <td className="py-3">{it.suggested_action === 'mark_rejected' ? <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800">Saran: Tolak (duplikat)</span> : <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">Saran: Simpan</span>}</td>
                                            <td className="py-3 text-sm text-slate-600">{it.last_audit ? `${it.last_audit.admin_name} (${it.last_audit.action}) — ${new Date(it.last_audit.created_at).toLocaleString()}` : '-'}</td>
                                            <td className="py-3 text-xs text-slate-500">{it.local_path ?? '-'}</td>
                                            <td className="py-3">
                                                <div className="flex gap-2">
                                                    <button onClick={() => {
                                                        // Extract filename from bukti_dokumen path and use secure admin route
                                                        const filename = it.bukti_dokumen ? it.bukti_dokumen.split('/').pop() : null;
                                                        if (filename) {
                                                            window.open(`/admin/files/kegiatan/${filename}`, '_blank');
                                                        } else {
                                                            alert('File tidak ditemukan');
                                                        }
                                                    }} className="rounded px-3 py-1 text-white bg-sky-600">Preview</button>
                                                    <button onClick={async () => {
                                                        // quick apply AI suggestion if present
                                                        const suggested = it.suggested_action || null;
                                                        if (suggested === 'mark_rejected') {
                                                            if (!confirm('AI menyarankan menolak ini sebagai duplikat. Terapkan saran?')) return;
                                                            Inertia.post(`/admin/kegiatans/${it.id}/duplicate-action`, {
                                                                action: 'mark_rejected',
                                                                admin_note: 'Ditandai sebagai duplikat oleh sistem'
                                                            }, {
                                                                onSuccess: (page) => {
                                                                    // Inertia will handle the success message automatically via flash
                                                                    location.reload();
                                                                },
                                                                onError: (errors) => {
                                                                    alert('Gagal: ' + (errors.message || JSON.stringify(errors)));
                                                                }
                                                            });
                                                        } else {
                                                            // fallback to manual reject
                                                            const note = prompt('Catatan (opsional) untuk mahasiswa ketika menolak:','');
                                                            if (!confirm('Tandai sebagai duplikat dan tolak kegiatan ini?')) return;
                                                            Inertia.post(`/admin/kegiatans/${it.id}/duplicate-action`, {
                                                                action: 'mark_rejected',
                                                                admin_note: note || ''
                                                            }, {
                                                                onSuccess: (page) => {
                                                                    location.reload();
                                                                },
                                                                onError: (errors) => {
                                                                    alert('Gagal: ' + (errors.message || JSON.stringify(errors)));
                                                                }
                                                            });
                                                        }
                                                    }} className="rounded px-3 py-1 text-white bg-red-600">Tolak</button>
                                                    <button onClick={() => {
                                                        if (!confirm('Hapus kegiatan ini dari database?')) return;
                                                        Inertia.post(`/admin/kegiatans/${it.id}/duplicate-action`, {
                                                            action: 'delete'
                                                        }, {
                                                            onSuccess: (page) => {
                                                                location.reload();
                                                            },
                                                            onError: (errors) => {
                                                                alert('Gagal: ' + (errors.message || JSON.stringify(errors)));
                                                            }
                                                        });
                                                    }} className="rounded px-3 py-1 text-white bg-gray-600">Hapus</button>
                                                    <button onClick={() => {
                                                        const note = prompt('Permintaan klarifikasi (akan dikirim ke mahasiswa):','Mohon lampirkan bukti/dokumen yang lebih jelas.');
                                                        if (!note) return;
                                                        Inertia.post(`/admin/kegiatans/${it.id}/duplicate-action`, {
                                                            action: 'request_clarify',
                                                            admin_note: note
                                                        }, {
                                                            onSuccess: (page) => {
                                                                // Success message handled by Inertia flash
                                                            },
                                                            onError: (errors) => {
                                                                alert('Gagal: ' + (errors.message || JSON.stringify(errors)));
                                                            }
                                                        });
                                                    }} className="rounded px-3 py-1 text-white bg-amber-600">Minta Klarifikasi</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-3 flex items-center justify-end">
                            <button onClick={() => {
                                if (!confirm('Terapkan saran AI untuk seluruh grup ini? (akan menolak semua item yang disarankan)')) return;
                                
                                let processedCount = 0;
                                const itemsToProcess = g.items.filter((it: any) => it.suggested_action === 'mark_rejected');
                                
                                if (itemsToProcess.length === 0) {
                                    alert('Tidak ada item yang perlu diproses');
                                    return;
                                }

                                // Process items sequentially
                                const processNext = (index: number) => {
                                    if (index >= itemsToProcess.length) {
                                        alert(`Berhasil menerapkan saran AI untuk ${processedCount} item`);
                                        location.reload();
                                        return;
                                    }
                                    
                                    const item = itemsToProcess[index];
                                    Inertia.post(`/admin/kegiatans/${item.id}/duplicate-action`, {
                                        action: 'mark_rejected',
                                        admin_note: 'Ditandai sebagai duplikat oleh sistem'
                                    }, {
                                        onSuccess: (page) => {
                                            processedCount++;
                                            processNext(index + 1);
                                        },
                                        onError: (errors) => {
                                            alert(`Gagal memproses item ${item.id}: ${errors.message || JSON.stringify(errors)}`);
                                        }
                                    });
                                };
                                
                                processNext(0);
                            }} className="px-3 py-1 rounded bg-red-600 text-white">Terapkan Saran AI untuk Grup</button>
                        </div>
                    </div>
                ))}
            </div>
        </AppLayout>
    );
}
