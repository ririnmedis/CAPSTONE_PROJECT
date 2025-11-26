import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import AppLayout from '@/layouts/app-layout';
import KegiatansSection from '@/components/Kegiatans/KegiatansSection';

export default function Index() {
    const page: any = usePage();
    const props = page.props || {};
    const user = props.user || null;
    const mahasiswa = props.mahasiswa || null;
    const kegiatans = props.kegiatans || [];
    const options = props.options || [];

    // Local palette for the top cards to match dashboard styles
    const palette = {
        blue100: '#EEF1FE',
        blue200: '#93B4FF',
        blue400: '#5176F8',
        blueBg: '#F4F8FF',
        orange: '#FF6B4B',
        orangeLight: '#FFEDE6',
        border: '#E8EEF9',
        green: '#10B981',
        greenDark: '#059669',
    };

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="Input Poin SKP" />
            <div className="p-6">
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
                                           <div className="rounded-2xl bg-white p-8 shadow-sm border-2 border-blue-200">
                                               <div className="flex flex-col items-center text-center py-6">
                                                   <div className="mb-6 h-20 w-20 rounded-2xl flex items-center justify-center text-white" style={{ background: `linear-gradient(180deg, ${palette.blue100}, ${palette.blue200})`, boxShadow: '0 18px 40px rgba(81,118,248,0.08)' }}>
                                                       <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                           <circle cx="12" cy="12" r="10"></circle>
                                                           <polyline points="12,6 12,12 16,14"></polyline>
                                                       </svg>
                                                   </div>
                                                   <h3 className="text-lg font-semibold">History</h3>
                                                   <p className="text-sm text-slate-400 mt-3">Lihat riwayat point dan aktivitas</p>
                                                   <button
                                                       onClick={() => Inertia.get('/history')}
                                                       className="mt-6 w-full rounded-full text-white font-medium text-base py-2.5 px-6"
                                                       style={{
                                                           background: `linear-gradient(90deg, ${palette.blue100}, ${palette.blue200})`,
                                                           boxShadow: 'inset 0 -8px 18px rgba(81,118,248,0.10), 0 10px 24px rgba(16,24,40,0.04)'
                                                       }}
                                                   >
                                                       Lihat History
                                                   </button>
                                               </div>
                                           </div>
                                       </div>
                <h1 className="text-2xl font-semibold mb-2">Manajemen Aktivitas Poin</h1>
                <p className="text-slate-500 mb-6">Tambah, edit, dan hapus aktivitas SKP Anda</p>
                <KegiatansSection user={user} mahasiswa={mahasiswa} kegiatans={kegiatans} options={options} />
            </div>
        </AppLayout>
    );
}

