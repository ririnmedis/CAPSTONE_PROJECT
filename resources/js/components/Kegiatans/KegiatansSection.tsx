import { useForm } from '@inertiajs/react';
import React from 'react';

import { usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function KegiatansSection({
    user,
    mahasiswa,
    kegiatans = [],
    options = [],
}: any) {
    // Normalize incoming `kegiatans` prop which might be:
    // - an array of items
    // - a paginated object { data: [...] }
    // - an empty value
    const normalizeKegiatans = (raw: any) => {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        if (raw.data && Array.isArray(raw.data)) return raw.data;
        // if it's an object with numeric keys, try to convert to array
        try {
            const vals = Object.values(raw);
            if (Array.isArray(vals)) return vals;
        } catch (e) {}
        return [];
    };

    const [items, setItems] = useState<any[]>(normalizeKegiatans(kegiatans));
    const page: any = usePage();
    const flash = page.props?.flash || {};
    const [showFlash, setShowFlash] = useState<boolean>(!!flash.success);

    React.useEffect(() => {
        if (flash && flash.success) {
            setShowFlash(true);
            const t = setTimeout(() => setShowFlash(false), 4000);
            return () => clearTimeout(t);
        }
    }, [flash.success]);

    // Temporary debug logs to help diagnose why items might be empty
    // Remove after debugging
    React.useEffect(() => {
        try {
            // eslint-disable-next-line no-console
            console.log(
                '[KegiatansSection] incoming kegiatans prop:',
                kegiatans,
            );
            // eslint-disable-next-line no-console
            console.log(
                '[KegiatansSection] normalized items:',
                normalizeKegiatans(kegiatans),
            );
        } catch (e) {}
    }, [kegiatans]);
    const { data, setData, post, processing, errors, reset } = useForm<any>({
        kegiatan: '',
        kegiatan_kode: '',
        tanggal_input: '',
        poin: '',
        bobot: '',
        bukti_dokumen: null,
        status_verifikasi: 'pending',
    });
    const setAny = setData as any;
    const resetAny = reset as any;

    function onKegiatanChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const val = e.target.value;
        let found: any = null;
        for (const group of options) {
            for (const it of group.items) {
                if (it.value === val) {
                    found = it;
                    break;
                }
            }
            if (found) break;
        }
        if (found) {
            // Simpan nama kegiatan yang sebenarnya, bukan kode
            setAny('kegiatan', found.label);
            setAny('kegiatan_kode', val); // Simpan kode untuk kategorisasi
            setAny('poin', found.skor);
        } else {
            setAny('kegiatan', val);
            setAny('kegiatan_kode', val);
            setAny('poin', '');
        }
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/kegiatans', {
            onSuccess: (page?: any) => {
                // reset form
                resetAny();
                // Inertia akan otomatis reload halaman dan update data
                // Tidak perlu manual fetch untuk mencegah duplikasi
            },
        });
    }

    // Keep items in sync if parent props change (e.g., initial server render or reload)
    React.useEffect(() => {
        setItems(normalizeKegiatans(kegiatans));
    }, [kegiatans]);

    // If items are empty on mount, try fetching recent kegiatans (frontend-only fallback)
    React.useEffect(() => {
        if (items.length === 0) {
            // fetch paginated kegiatans (uses existing GET /kegiatans endpoint)
            fetch('/kegiatans?per_page=20', {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            })
                .then((res) => res.json())
                .then((json) => {
                    // response may be a paginated object with `data` or an array
                    const list =
                        json && json.data
                            ? json.data
                            : Array.isArray(json)
                              ? json
                              : [];
                    if (Array.isArray(list) && list.length > 0) {
                        setItems(list);
                    }
                })
                .catch(() => {
                    // ignore
                });
        }
    }, []); // run once on mount

    return (
        <div className="p-6">
            {showFlash && flash.success && (
                <div className="mb-4 rounded bg-green-50 p-3 text-green-800">
                    {flash.success}
                </div>
            )}
            <div className="mb-6 flex rounded-xl bg-white p-6 shadow-sm">
                <div
                    className="w-1 rounded-l-xl"
                    style={{ background: '#10B981' }}
                />
                <div className="flex-1 pl-4">
                    <h2 className="mb-4 font-medium text-slate-800">
                        Input Poin SKP
                    </h2>
                    <form
                        onSubmit={submit}
                        className="grid grid-cols-1 gap-4 md:grid-cols-2"
                    >
                        <div>
                            <label className="block text-sm font-medium text-slate-700">
                                Pilih Kegiatan{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.kegiatan}
                                onChange={onKegiatanChange}
                                className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
                            >
                                <option value="">-- Pilih Kegiatan --</option>
                                {options.map((group: any) => (
                                    <optgroup
                                        label={group.label}
                                        key={group.label}
                                    >
                                        {group.items.map((it: any) => (
                                            <option
                                                key={it.value}
                                                value={it.value}
                                            >
                                                {it.label} ({it.skor})
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            {errors.kegiatan && (
                                <div className="text-xs text-red-600">
                                    {errors.kegiatan}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">
                                Tanggal Input{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.tanggal_input}
                                onChange={(e) =>
                                    setAny('tanggal_input', e.target.value)
                                }
                                className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
                            />
                            {errors.tanggal_input && (
                                <div className="text-xs text-red-600">
                                    {errors.tanggal_input}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">
                                Poin <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={data.poin}
                                onChange={(e) => setAny('poin', e.target.value)}
                                placeholder="Masukkan poin"
                                className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
                            />
                            {errors.poin && (
                                <div className="text-xs text-red-600">
                                    {errors.poin}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">
                                Bobot
                            </label>
                            <input
                                value={data.bobot}
                                onChange={(e) =>
                                    setAny('bobot', e.target.value)
                                }
                                placeholder="Kode kegiatan"
                                className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
                            />
                            {errors.bobot && (
                                <div className="text-xs text-red-600">
                                    {errors.bobot}
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Upload Bukti Dokumen{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-2 rounded-lg border-2 border-dashed border-slate-200 p-6 text-center">
                                <input
                                    type="file"
                                    onChange={(e) =>
                                        setAny(
                                            'bukti_dokumen',
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                                {errors.bukti_dokumen && (
                                    <div className="text-xs text-red-600">
                                        {errors.bukti_dokumen}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-4 rounded-lg px-6 py-2 text-white"
                                style={{
                                    background:
                                        'linear-gradient(90deg,#10B981,#059669)',
                                }}
                            >
                                Simpan
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-medium text-slate-800">
                    Daftar Kegiatan
                </h3>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left">
                            <th className="pb-2 text-green-700">Kegiatan</th>
                            <th className="pb-2 text-green-700">Tanggal</th>
                            <th className="pb-2 text-green-700">Poin</th>
                            <th className="pb-2 text-green-700">Bobot</th>
                            <th className="pb-2 text-green-700">Bukti</th>
                            <th className="pb-2 text-green-700">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={6} className="py-4 text-slate-500">
                                    Belum ada kegiatan.
                                </td>
                            </tr>
                        )}
                        {items.map((k: any) => (
                            <tr key={k.id} className="border-t">
                                <td className="py-3">{k.kegiatan}</td>
                                <td className="py-3">
                                    {k.tanggal_input
                                        ? new Date(
                                              k.tanggal_input,
                                          ).toLocaleDateString()
                                        : '-'}
                                </td>
                                <td className="py-3">{k.poin}</td>
                                <td className="py-3">{k.bobot}</td>
                                <td className="py-3">
                                    {k.bukti_dokumen ? (
                                        <a
                                            href={k.bukti_dokumen}
                                            className="font-medium text-green-700"
                                        >
                                            Lihat
                                        </a>
                                    ) : (
                                        '-'
                                    )}
                                </td>
                                <td className="py-3">
                                    {k.status_verifikasi === 'verified' ? (
                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                                            Verified
                                        </span>
                                    ) : k.status_verifikasi === 'rejected' ? (
                                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                                            Rejected
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-0.5 text-xs text-yellow-700">
                                            Pending
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
