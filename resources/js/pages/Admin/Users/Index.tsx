import React, { useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Inertia } from '@inertiajs/inertia';
import { Edit, Trash2 } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    is_admin: boolean | number;
    created_at: string;
    mahasiswa?: {
        npm: string;
        prodi: string;
    };
}

interface UsersData {
    data: User[];
    links: any[];
    meta: any;
}

interface PageProps {
    users: UsersData;
    filters: {
        search?: string;
        role?: string;
    };
    flash?: {
        success?: string;
    };
    [key: string]: any;
}

export default function AdminUsersIndex() {
    const page = usePage<PageProps>();
    const props = page.props;
    const initial = props.users || { data: [], links: [], meta: {} };
    const filters = props.filters || {};
    
    const [users, setUsers] = useState<UsersData>(initial);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Show success message if exists
    React.useEffect(() => {
        if (page.props.flash?.success) {
            setSuccessMessage(page.props.flash.success);
            setTimeout(() => setSuccessMessage(null), 3000);
        }
    }, [page.props.flash]);

    function handleDelete(userId: number, userName: string) {
        if (!confirm(`Yakin ingin menghapus user "${userName}"?\n\nTindakan ini tidak dapat dibatalkan.`)) {
            return;
        }

        Inertia.delete(`/admin/users/${userId}`, {
            onSuccess: () => {
                // Update local state
                setUsers((prev: UsersData) => ({
                    ...prev,
                    data: prev.data.filter((u: User) => u.id !== userId)
                }));
                setSuccessMessage('User berhasil dihapus.');
                setTimeout(() => setSuccessMessage(null), 3000);
            },
            onError: (errors: Record<string, string>) => {
                alert('Gagal menghapus user: ' + (errors.error || 'Unknown error'));
            }
        });
    }

    function renderPagination() {
        const links = users.links || [];
        if (!links.length) return null;
        return (
            <nav className="mt-4 flex items-center gap-2" aria-label="Pagination">
                {links.map((link: any, idx: number) => (
                    <button 
                        key={idx} 
                        disabled={!link.url} 
                        className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'}`} 
                        onClick={() => {
                            if (!link.url) return;
                            Inertia.get(link.url, {}, { 
                                preserveState: true, 
                                preserveScroll: true, 
                                onSuccess: (page: any) => {
                                    const u = page.props?.users || { data: [] };
                                    setUsers(u);
                                }
                            });
                        }} 
                        dangerouslySetInnerHTML={{ __html: link.label }} 
                    />
                ))}
            </nav>
        );
    }

    function getRoleBadge(user: User) {
        const isAdmin = Boolean(user.is_admin);
        if (isAdmin) {
            return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 font-medium">Admin</span>;
        }
        return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">Mahasiswa</span>;
    }

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="Kelola User" />
            
            <div className="p-6">
                {/* Success Message */}
                {successMessage && (
                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center justify-between">
                        <span>{successMessage}</span>
                        <button 
                            onClick={() => setSuccessMessage(null)}
                            className="ml-4 text-green-700 hover:text-green-900"
                        >
                            ×
                        </button>
                    </div>
                )}

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Kelola User</h1>
                        <p className="text-gray-500">Manajemen akun admin dan mahasiswa</p>
                    </div>
                    
                    <Link
                        href="/admin/users/create"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        Tambah User
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    {/* Filters */}
                    <div className="mb-4 flex gap-3 items-center">
                        <select 
                            defaultValue={filters.role || ''} 
                            id="filter-role" 
                            className="border rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="">Semua Role</option>
                            <option value="admin">Admin</option>
                            <option value="mahasiswa">Mahasiswa</option>
                        </select>
                        
                        <input 
                            defaultValue={filters.search || ''} 
                            id="filter-search" 
                            placeholder="Cari nama atau email..." 
                            className="border rounded-lg px-3 py-2 text-sm flex-1 max-w-sm" 
                        />
                        
                        <button 
                            onClick={() => {
                                const role = (document.getElementById('filter-role') as HTMLSelectElement).value;
                                const search = (document.getElementById('filter-search') as HTMLInputElement).value;
                                const params: any = {};
                                if (role) params.role = role;
                                if (search) params.search = search;
                                Inertia.get('/admin/users', params, { preserveState: true });
                            }} 
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                            Filter
                        </button>
                        
                        <button 
                            onClick={() => {
                                (document.getElementById('filter-role') as HTMLSelectElement).value = '';
                                (document.getElementById('filter-search') as HTMLInputElement).value = '';
                                Inertia.get('/admin/users', {}, { preserveState: true });
                            }} 
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                        >
                            Reset
                        </button>
                    </div>

                    {/* Users Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="text-left bg-gray-50">
                                    <th className="pb-3 pt-3 px-4 font-medium text-gray-700">ID</th>
                                    <th className="pb-3 pt-3 px-4 font-medium text-gray-700">Nama</th>
                                    <th className="pb-3 pt-3 px-4 font-medium text-gray-700">Email</th>
                                    <th className="pb-3 pt-3 px-4 font-medium text-gray-700 text-center">Role</th>
                                    <th className="pb-3 pt-3 px-4 font-medium text-gray-700">No HP</th>
                                    <th className="pb-3 pt-3 px-4 font-medium text-gray-700 text-center">Tanggal Dibuat</th>
                                    <th className="pb-3 pt-3 px-4 font-medium text-gray-700">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.length === 0 && (
                                    <tr><td colSpan={7} className="py-8 px-4 text-center text-gray-500">Belum ada data user.</td></tr>
                                )}
                                {users.data.map((user: User) => (
                                    <tr key={user.id} className="border-t hover:bg-gray-50">
                                        <td className="py-4 px-4 font-medium text-gray-900">
                                            {user.id}
                                        </td>
                                        <td className="py-4 px-4 font-medium text-gray-900">
                                            {user.name}
                                        </td>
                                        <td className="py-4 px-4 text-gray-600 text-sm">
                                            {user.email}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            {getRoleBadge(user)}
                                        </td>
                                        <td className="py-4 px-4 text-gray-600 text-sm">
                                            {user.phone || '-'}
                                        </td>
                                        <td className="py-4 px-4 text-center text-gray-600 text-xs">
                                            {new Date(user.created_at).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/admin/users/${user.id}/edit`}
                                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                                                >
                                                    <Edit className="h-3 w-3" />
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(user.id, user.name)}
                                                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-medium"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                    Hapus
                                                </button>
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