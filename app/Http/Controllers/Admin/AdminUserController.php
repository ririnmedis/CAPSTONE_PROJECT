<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Mahasiswa;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->get('per_page', 20);
        
        // Get all users with their mahasiswa data if exists
        $users = User::with(['mahasiswa'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->get('search');
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($request->filled('role'), function ($query) use ($request) {
                $role = $request->get('role');
                if ($role === 'admin') {
                    $query->where('is_admin', true);
                } elseif ($role === 'mahasiswa') {
                    $query->where('is_admin', false);
                }
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Users/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'is_admin' => ['required', 'boolean'],
            // Mahasiswa fields (optional, only if not admin)
            'npm' => ['nullable', 'string', 'max:20'],
            'prodi' => ['nullable', 'string', 'max:100'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'is_admin' => $request->is_admin,
            'email_verified_at' => now(),
        ]);

        // If creating mahasiswa, also create mahasiswa record
        if (!$request->is_admin && $request->filled(['npm', 'prodi'])) {
            Mahasiswa::create([
                'nama' => $request->name,
                'npm' => $request->npm,
                'prodi' => $request->prodi,
                'email' => $request->email,
            ]);
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'User berhasil dibuat.');
    }

    public function edit(User $user)
    {
        $mahasiswa = null;
        if (!$user->is_admin) {
            $mahasiswa = Mahasiswa::where('email', $user->email)->first();
        }

        return Inertia::render('Admin/Users/Edit', [
            'user' => $user->only(['id', 'name', 'email', 'is_admin']),
            'mahasiswa' => $mahasiswa ? $mahasiswa->only(['nama', 'npm', 'prodi', 'email']) : null,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'is_admin' => ['required', 'boolean'],
            // Mahasiswa fields
            'npm' => ['nullable', 'string', 'max:20'],
            'prodi' => ['nullable', 'string', 'max:100'],
        ]);

        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
            'is_admin' => $request->is_admin,
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);

        // Update mahasiswa data if not admin
        if (!$request->is_admin && $request->filled(['npm', 'prodi'])) {
            Mahasiswa::updateOrCreate(
                ['email' => $user->email],
                [
                    'nama' => $request->name,
                    'npm' => $request->npm,
                    'prodi' => $request->prodi,
                    'email' => $request->email,
                ]
            );
        } elseif ($request->is_admin) {
            // If changed to admin, remove mahasiswa record
            Mahasiswa::where('email', $user->email)->delete();
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        // Don't allow deleting the last admin
        if ($user->is_admin && User::where('is_admin', true)->count() <= 1) {
            return redirect()->back()->withErrors(['error' => 'Tidak dapat menghapus admin terakhir.']);
        }

        // Delete associated mahasiswa record if exists
        Mahasiswa::where('email', $user->email)->delete();
        
        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User berhasil dihapus.');
    }
}