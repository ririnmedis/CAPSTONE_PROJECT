import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';

// Tambahkan palette colors
const palette = {
    orangeLight: '#FFB5A7',
    orange: '#FF886DFF',
    blue100: '#93B4FF',
    blue200: '#5176F8',
    blue400: '#6366F1',
    green: '#10B981',
    greenDark: '#059669',
    historyBlue100: '#C7D2FE',
    historyBlue200: '#93B4FF'
};
     // ... rest of your component code
export default function Create({ user, mahasiswa }: { user?: { name?: string; email?: string }, mahasiswa?: any }) {
    const { data, setData, post, processing, errors } = useForm<any>({
        nama: mahasiswa?.nama ?? user?.name ?? '',
        npm: mahasiswa?.npm ?? '',
        prodi: mahasiswa?.prodi ?? '',
        email: mahasiswa?.email ?? user?.email ?? '',
    });
    const setAny = setData as any;

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/biodata');
    }

    return (
        <div className="p-6">
            <Head title="Biodata Mahasiswa" />

            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(180deg,#93B4FF,#5176F8)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422M12 14L5.84 10.578" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">Biodata Mahasiswa</h1>
                    <p className="text-slate-500">Kelola informasi data diri mahasiswa</p>
                </div>
            </div>

            {/* thin accent line */}
            <div className="h-1 w-full rounded-md" style={{ background: 'linear-gradient(90deg,#93B4FF,#5176F8)' }} />

            {/* Navigation row (Dashboard / Biodata / Input Poin / History) */}
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

            {/* Card / form */}
            <div className="mt-6 rounded-xl bg-white shadow-md">
                <div className="border-b px-6 py-4 bg-slate-50 rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a5 5 0 100-10 5 5 0 000 10z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21a9 9 0 10-18 0" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-medium">Data Mahasiswa</h2>
                    </div>
                </div>

                <form onSubmit={submit} className="px-6 py-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Nama Lengkap */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Nama Lengkap</label>
                            <input
                                value={data.nama}
                                onChange={(e) => setAny('nama', e.target.value)}
                                placeholder="Masukkan nama lengkap"
                                className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
                            />
                            {errors.nama && <div className="text-xs text-red-600">{errors.nama}</div>}
                        </div>

                        {/* NPM */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700">NPM</label>
                            <input
                                value={data.npm}
                                onChange={(e) => setAny('npm', e.target.value)}
                                placeholder="Masukkan NPM"
                                className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
                            />
                            {errors.npm && <div className="text-xs text-red-600">{errors.npm}</div>}
                        </div>

                        {/* Program Studi */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Program Studi</label>
                            <select
                                value={data.prodi}
                                onChange={(e) => setAny('prodi', e.target.value)}
                                className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
                            >
                                <option value="">Pilih program studi</option>
                                <option value="Informatika">Informatika</option>
                                <option value="Sistem Informasi">Sistem Informasi</option>
                            </select>
                            {errors.prodi && <div className="text-xs text-red-600">{errors.prodi}</div>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email</label>
                            <input
                                value={data.email}
                                onChange={(e) => setAny('email', e.target.value)}
                                placeholder="Masukkan email"
                                className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
                            />
                            {errors.email && <div className="text-xs text-red-600">{errors.email}</div>}
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-lg py-3 text-white font-medium"
                            style={{ background: 'linear-gradient(90deg,#93B4FF,#5176F8)' }}
                        >
                            <span className="inline-flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                Simpan
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
