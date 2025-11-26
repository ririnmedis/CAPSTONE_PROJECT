import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface DuplicateItem {
    id: number;
    mahasiswa_nama: string;
    mahasiswa_npm: string;
    kegiatan: string;
    bukti_dokumen: string;
    status_verifikasi: string;
    tanggal_input: string;
    similarity_percentage: number;
    file_hash: string;
}

interface DuplicateGroup {
    group_id: number;
    file_hash: string;
    items: DuplicateItem[];
    ai_suggestion: {
        action: string;
        reason: string;
        confidence: string;
    };
}

interface PageProps {
    duplicateGroups: DuplicateGroup[];
    totalGroups: number;
    totalDuplicates: number;
    [key: string]: any;
}

export default function DuplicatesIndex() {
    const { duplicateGroups, totalGroups, totalDuplicates } = usePage<PageProps>().props;
    const [expandedGroups, setExpandedGroups] = useState<number[]>([]);
    const { data, setData, post, processing } = useForm({
        action: '',
        kegiatan_ids: [] as number[]
    });

    const toggleGroup = (groupId: number) => {
        setExpandedGroups(prev => 
            prev.includes(groupId) 
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    const applySuggestion = (group: DuplicateGroup) => {
        const kegiatanIds = group.items.map(item => item.id);
        
        setData({
            action: group.ai_suggestion.action,
            kegiatan_ids: kegiatanIds
        });
        
        post(`/admin/duplicates/${group.group_id}/apply-suggestion`);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verified':
                return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Verified</span>;
            case 'rejected':
                return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Rejected</span>;
            default:
                return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
        }
    };

    const getConfidenceBadge = (confidence: string) => {
        const colors = {
            high: 'bg-green-100 text-green-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-red-100 text-red-800'
        };
        
        return (
            <span className={`px-2 py-1 text-xs rounded-full ${colors[confidence as keyof typeof colors] || colors.medium}`}>
                {confidence.toUpperCase()}
            </span>
        );
    };

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="Deteksi Duplikasi Dokumen" />
            <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold mb-2">Deteksi Duplikasi Dokumen</h1>
                        <p className="text-slate-500">
                            Sistem AI telah mendeteksi {totalGroups} grup duplikasi dengan total {totalDuplicates} dokumen
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-white border rounded text-sm shadow hover:bg-gray-50"
                        >
                            Refresh
                        </button>
                        <button
                            onClick={() => post('/admin/duplicates/update-hashes')}
                            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                            Update Hashes
                        </button>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-2xl font-bold text-blue-600">{totalGroups}</div>
                        <div className="text-sm text-gray-600">Total Grup Duplikasi</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-2xl font-bold text-red-600">{totalDuplicates}</div>
                        <div className="text-sm text-gray-600">Total Dokumen Duplikat</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="text-2xl font-bold text-green-600">
                            {duplicateGroups.filter(g => g.ai_suggestion.confidence === 'high').length}
                        </div>
                        <div className="text-sm text-gray-600">High Confidence Suggestions</div>
                    </div>
                </div>

                {/* Duplicate Groups */}
                <div className="space-y-4">
                    {duplicateGroups.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-8 text-center">
                            <div className="text-gray-500">
                                <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-lg font-medium">Tidak ada duplikasi ditemukan</p>
                                <p className="text-sm">Semua dokumen unik dan tidak ada yang duplikat</p>
                            </div>
                        </div>
                    ) : (
                        duplicateGroups.map((group) => (
                            <div key={group.group_id} className="bg-white rounded-lg shadow">
                                <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => toggleGroup(group.group_id)}
                                                className="flex items-center gap-2 text-lg font-medium"
                                            >
                                                <svg 
                                                    className={`w-5 h-5 transition-transform ${expandedGroups.includes(group.group_id) ? 'rotate-90' : ''}`}
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                                Group {group.group_id} — {group.items.length} items
                                            </button>
                                            {getConfidenceBadge(group.ai_suggestion.confidence)}
                                        </div>
                                        
                                        <button
                                            onClick={() => applySuggestion(group)}
                                            disabled={processing}
                                            className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {processing ? 'Processing...' : 'Terapkan Saran AI untuk Group'}
                                        </button>
                                    </div>
                                    
                                    <div className="mt-2 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                                        <div className="text-sm">
                                            <div className="font-medium text-blue-800">AI Suggestion:</div>
                                            <div className="text-blue-700">{group.ai_suggestion.reason}</div>
                                        </div>
                                    </div>
                                </div>

                                {expandedGroups.includes(group.group_id) && (
                                    <div className="p-4">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-sm">
                                                <thead>
                                                    <tr className="text-left text-gray-600 border-b">
                                                        <th className="pb-2">Mahasiswa</th>
                                                        <th className="pb-2">File</th>
                                                        <th className="pb-2">Status</th>
                                                        <th className="pb-2">Saran AI Diperiksa Oleh</th>
                                                        <th className="pb-2">Local Path</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {group.items.map((item, index) => (
                                                        <tr key={item.id} className="border-b hover:bg-gray-50">
                                                            <td className="py-3">
                                                                <div>
                                                                    <div className="font-medium">{item.mahasiswa_nama}</div>
                                                                    <div className="text-gray-500">({item.mahasiswa_npm})</div>
                                                                </div>
                                                            </td>
                                                            <td className="py-3">
                                                                <div>
                                                                    <a 
                                                                        href={`/storage/${item.bukti_dokumen}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-600 hover:text-blue-800 font-mono text-xs"
                                                                    >
                                                                        {item.file_hash.substring(0, 20)}...{item.status_verifikasi}
                                                                    </a>
                                                                    <div className="text-xs text-gray-500 mt-1">
                                                                        Similarity: {item.similarity_percentage}%
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-3">
                                                                {getStatusBadge(item.status_verifikasi)}
                                                            </td>
                                                            <td className="py-3">
                                                                <div className="text-xs">
                                                                    <div className="text-green-600 font-medium">
                                                                        Saran: Admin
                                                                    </div>
                                                                    <div className="text-gray-500">
                                                                        ({group.ai_suggestion.action.replace('_', ' ')}) — {new Date(item.tanggal_input).toLocaleDateString()}, {new Date(item.tanggal_input).toLocaleTimeString().slice(0, 5)}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-3">
                                                                <div className="text-xs font-mono text-gray-600">
                                                                    C:\\Perkuliahan\\Semester 7\\CAPSTONE PROJECT\\MVP\\skp_mahasiswa\\public\\storage\\{item.bukti_dokumen}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}