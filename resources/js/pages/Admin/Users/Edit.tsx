import React, { useState } from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditPageProps {
    user: {
        id: number;
        name: string;
        email: string;
        phone?: string | null;
        is_admin: boolean;
    };
    mahasiswa?: {
        npm: string;
        prodi: string;
        email: string;
    };
    [key: string]: any;
}

export default function AdminUsersEdit() {
    const page = usePage<EditPageProps>();
    const props = page.props;
    const user = props.user || { id: 0, name: '', email: '', is_admin: false };
    const mahasiswa = props.mahasiswa || { npm: '', prodi: 'Informatika', email: '' };

    interface UserFormData {
        name: string;
        email: string;
        phone: string;
        password: string;
        password_confirmation: string;
        is_admin: boolean;
        npm: string;
        prodi: string;
    }

    const { data, setData, put, processing, errors } = useForm<UserFormData>({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        password_confirmation: '',
        is_admin: user.is_admin || false,
        npm: mahasiswa.npm || '',
        prodi: mahasiswa.prodi || 'Informatika',
    });

    const [showMahasiswaFields, setShowMahasiswaFields] = useState(!user.is_admin);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/admin/users/${user.id}`);
    }

    function handleRoleChange(isAdmin: boolean) {
        setData('is_admin', isAdmin);
        setShowMahasiswaFields(!isAdmin);
        if (isAdmin) {
            setData('npm', '');
            setData('prodi', '');
        }
    }

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title={`Edit User: ${user.name}`} />
            
            <div className="p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-6">
                        <Link
                            href="/admin/users"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            ← Kembali ke Kelola User
                        </Link>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">Edit User</h1>
                                <p className="text-gray-500">Ubah data akun: {user.name}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Role Selection */}
                            <div className="space-y-3">
                                <Label>Role Pengguna</Label>
                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="role"
                                            checked={!data.is_admin}
                                            onChange={() => handleRoleChange(false)}
                                            className="mr-2"
                                        />
                                        <span>Mahasiswa</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="role"
                                            checked={data.is_admin}
                                            onChange={() => handleRoleChange(true)}
                                            className="mr-2"
                                        />
                                        <span>Admin</span>
                                    </label>
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Masukkan nama lengkap"
                                    className={errors.name ? 'border-red-300' : ''}
                                />
                                {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Masukkan email"
                                    className={errors.email ? 'border-red-300' : ''}
                                />
                                {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">No HP (Opsional)</Label>
                                <Input
                                    id="phone"
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="Masukkan nomor HP"
                                    className={errors.phone ? 'border-red-300' : ''}
                                />
                                {errors.phone && <div className="text-red-500 text-sm">{errors.phone}</div>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password Baru (Opsional)</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Kosongkan jika tidak ingin ubah"
                                        className={errors.password ? 'border-red-300' : ''}
                                    />
                                    {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Ulangi password baru"
                                        className={errors.password_confirmation ? 'border-red-300' : ''}
                                    />
                                    {errors.password_confirmation && <div className="text-red-500 text-sm">{errors.password_confirmation}</div>}
                                </div>
                            </div>

                            {/* Mahasiswa Fields */}
                            {showMahasiswaFields && (
                                <>
                                    <hr className="my-6" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Data Mahasiswa</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="npm">NPM</Label>
                                            <Input
                                                id="npm"
                                                type="text"
                                                value={data.npm}
                                                onChange={(e) => setData('npm', e.target.value)}
                                                placeholder="Masukkan NPM"
                                                className={errors.npm ? 'border-red-300' : ''}
                                            />
                                            {errors.npm && <div className="text-red-500 text-sm">{errors.npm}</div>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="prodi">Program Studi</Label>
                                            <select
                                                id="prodi"
                                                value={data.prodi}
                                                onChange={(e) => setData('prodi', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="Informatika">Informatika</option>
                                                <option value="Sistem Informasi">Sistem Informasi</option>
                                            </select>
                                            {errors.prodi && <div className="text-red-500 text-sm">{errors.prodi}</div>}
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="flex gap-3 pt-6">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                                
                                <Link
                                    href="/admin/users"
                                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
                                >
                                    Batal
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}