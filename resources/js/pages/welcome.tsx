import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

export default function Welcome() {
    const page: any = usePage<SharedData>().props;
    const { auth, isAdmin } = page;

    return (
        <>
            <Head title="Sistem Pengelolaan Point SKP Mahasiswa" />

            <div className="min-h-screen bg-sky-50 flex items-center justify-center">
                <div className="max-w-2xl mx-auto text-center p-8">
                    <img src="/images/UnsikaLogo.png" alt="Unsika" className="mx-auto h-24 mb-6" />
                    <h1 className="text-3xl font-bold mb-2">Sistem Pengelolaan Point SKP</h1>
                    <p className="text-gray-700 mb-6">Selamat datang di SKP Fasilkom. Kelola dan pantau point kegiatan mahasiswa di sini.</p>

                    {auth?.user ? (
                        <Link href={isAdmin ? '/admin' : '/dashboard'} className="inline-block px-6 py-2 bg-sky-600 text-white rounded-md">Buka Dashboard</Link>
                    ) : (
                        <div className="flex gap-4 justify-center">
                            <Link href="/login" className="inline-block px-6 py-2 bg-sky-600 text-white rounded-md">Log in</Link>
                            <Link href="/register" className="inline-block px-6 py-2 border border-sky-600 text-sky-600 rounded-md">Register</Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
