import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

export default function AdminLogin() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/login');
    }

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="Admin Login" />
            <div className="max-w-md mx-auto mt-12">
                <div className="bg-white shadow rounded p-6">
                    <h2 className="text-xl font-semibold mb-4">Masuk sebagai Admin</h2>
                    <form onSubmit={submit}>
                        <div className="mb-3">
                            <label className="block text-sm mb-1">Email</label>
                            <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full border rounded px-3 py-2" />
                            {errors.email && <div className="text-red-600 text-sm mt-1">{errors.email}</div>}
                        </div>
                        <div className="mb-3">
                            <label className="block text-sm mb-1">Password</label>
                            <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full border rounded px-3 py-2" />
                            {errors.password && <div className="text-red-600 text-sm mt-1">{errors.password}</div>}
                        </div>
                        <div className="flex items-center justify-between">
                            <button type="submit" disabled={processing} className="bg-sky-600 text-white px-4 py-2 rounded">Masuk</button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
