import { useEffect, useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import AppLayout from '@/layouts/app-layout';
import NotificationBell from '@/components/notification-bell';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
// KegiatansSection intentionally removed from dashboard per layout change

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const page = usePage();
    const props: any = page.props || {};
    const user = props.user || null;
    const mahasiswa = props.mahasiswa || null;
    // current points (sum of admin-verified kegiatans) provided by server
    const initialPoints = (props.current_points ?? 0) as number;
    const [points, setPoints] = useState<number>(initialPoints);
    const maxPoints = 250;
    const percent = Math.min(100, Math.round((points / maxPoints) * 100));

    // animate points from 0 to current points for a nicer effect
    const [animated, setAnimated] = useState<number>(0);
    useEffect(() => {
        let raf = 0;
        const start = performance.now();
        const duration = 700;
        const from = 0;
        const to = points;

        function frame(now: number) {
            const t = Math.min(1, (now - start) / duration);
            const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOut
            setAnimated(Math.round(from + (to - from) * eased));
            if (t < 1) raf = requestAnimationFrame(frame);
        }

        raf = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(raf);
    }, [points]);

    // Refined palette (from your attachment) — cool blues for UI and warm orange for accents
    const palette = {
        blue100: '#EEF1FE', // very light
        blue200: '#93B4FF', // mid
        blue400: '#5176F8', // dark
        blueBg: '#F4F8FF',
        orange: '#FF6B4B', // primary action
        orangeLight: '#FFEDE6',
        border: '#E8EEF9',
        green: '#10B981',
        greenDark: '#059669',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-hidden rounded-xl p-6">
                {/* Top navigation / header - keep only profile & bell here (moved up) */}
                <header className="flex items-center justify-end">
                    <div className="flex items-center gap-4">
                        {/* Notification bell */}
                        <NotificationBell />

                        {/* Profile */}
                        <div className="flex items-center gap-2">
                            <div className="text-right">
                                <div className="text-sm font-medium">{mahasiswa?.nama ?? user?.name ?? 'Pengguna'}</div>
                                <div className="text-xs text-slate-500">{mahasiswa ? 'Mahasiswa' : 'Belum Lengkap'}</div>
                            </div>
                            <img src="/images/foto2.jpg" alt="Profile" className="h-10 w-10 rounded-full bg-slate-200" />
                        </div>
                    </div>
                </header>



                {/* Page title moved into dashboard content per request */}
                <div className="mb-4">
                    <h1 className="text-2xl font-semibold text-slate-900">Sistem Pengelolaan Point Skp Mahasiswa Fasilkom</h1>
                </div>

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

                {/* Main content - Total Point Mahasiswa */}
                <section className="rounded-lg border p-6 shadow-sm" style={{ borderColor: palette.border, background: '#FFFFFF' }}>
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Total Point Mahasiswa</h2>
                        <div className="text-sm text-slate-500">Goal: {maxPoints} skp</div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <div className="w-full rounded-lg" style={{ background: palette.blueBg }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-slate-500">Current Points</div>
                                        <div className="mt-1 text-3xl font-bold text-slate-900">{animated} Skp</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-slate-500">Remaining</div>
                                        <div className="mt-1 text-lg font-semibold text-slate-800">{Math.max(0, maxPoints - points)} Skp</div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <div className="h-4 w-full overflow-hidden rounded-full" style={{ background: palette.blue100 }}>
                                        <div
                                            className="h-4 rounded-full"
                                            style={{
                                                width: `${percent}%`,
                                                background: `linear-gradient(90deg, ${palette.blue200}, ${palette.blue400})`,
                                                transition: 'width 700ms ease',
                                            }}
                                        />
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                                        <div>{percent}%</div>
                                        <div>{points}/{maxPoints} pts</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <aside className="space-y-3">
                            <div className="rounded-md border p-3 text-sm" style={{ borderColor: palette.orangeLight }}>
                                <div className="font-medium">Quick Tips</div>
                                <div className="mt-1 text-xs text-slate-500">Tambahkan kegiatan SKP untuk meningkatkan poin.</div>
                            </div>
                            <div className="rounded-md border p-3 text-sm" style={{ borderColor: palette.border }}>
                                <div className="font-medium">Legend</div>
                                <div className="mt-1 text-xs text-slate-500">Warna biru: progress • Orange: aksi penting</div>
                            </div>
                        </aside>
                    </div>
                </section>
                {/* Manajemen Aktivitas Poin removed from dashboard as requested */}
            </div>
        </AppLayout>
    );
}
