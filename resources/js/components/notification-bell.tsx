import React, { useState, useRef, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export default function NotificationBell() {
    const page: any = usePage();
    const notifications = page.props.mahasiswaNotifications || [];
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function onDoc(e: MouseEvent) {
            if (!ref.current) return;
            if (!(e.target instanceof Node)) return;
            if (!ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('click', onDoc);
        return () => document.removeEventListener('click', onDoc);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                aria-label="Notifications"
                onClick={() => setOpen(s => !s)}
                className="relative rounded-full p-2 hover:bg-slate-100"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 17H9v-5a3 3 0 10-6 0v5H1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18 8a6 6 0 10-12 0v4l-2 2v1h16v-1l-2-2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {notifications.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-white text-[10px]">{notifications.length}</span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 z-50 rounded-md bg-white shadow-lg border">
                    <div className="p-3 text-sm font-medium border-b">Notifications</div>
                    <div className="max-h-64 overflow-auto">
                        {notifications.length === 0 && (
                            <div className="p-3 text-xs text-slate-500">Tidak ada pemberitahuan.</div>
                        )}
                        {notifications.map((n: any) => (
                            <div key={n.id} className="p-3 hover:bg-slate-50 border-b last:border-b-0">
                                <div className="text-sm font-medium">{n.data?.message ?? 'Update'}</div>
                                <div className="text-xs text-slate-400">{new Date(n.created_at).toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
