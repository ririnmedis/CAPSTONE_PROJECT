<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('mahasiswa')
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        
        // Transform users to include proper role information
        $users->getCollection()->transform(function ($user) {
            $user->role = $user->is_admin ? 'admin' : 'mahasiswa';
            return $user;
        });
        
        return Inertia::render('Admin/Users/Index', [
            'users' => $users
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Users/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'password_confirmation' => 'required|same:password',
            'phone' => 'nullable|string|max:20',
            'is_admin' => 'required|boolean',
            'npm' => 'nullable|string|max:20|required_if:is_admin,false',
            'prodi' => 'nullable|string|max:100|required_if:is_admin,false',
        ]);

        // Remove confirmation field
        unset($validated['password_confirmation']);
        
        // Hash password
        $validated['password'] = bcrypt($validated['password']);

        // Create user
        $user = User::create($validated);

        // Create mahasiswa record if not admin
        if (!$validated['is_admin']) {
            \App\Models\Mahasiswa::create([
                'nama' => $validated['name'],
                'npm' => $validated['npm'] ?? '',
                'prodi' => $validated['prodi'] ?? 'Informatika',
                'email' => $validated['email'],
            ]);
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'User berhasil ditambahkan.');
    }

    public function edit(User $user)
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'password_confirmation' => 'nullable|same:password',
            'phone' => 'nullable|string|max:20',
            'is_admin' => 'required|boolean',
            'npm' => 'nullable|string|max:20',
            'prodi' => 'nullable|string|max:100',
        ]);

        // Remove confirmation field
        unset($validated['password_confirmation']);

        if (empty($validated['password'])) {
            unset($validated['password']);
        } else {
            $validated['password'] = bcrypt($validated['password']);
        }

        $user->update($validated);

        // Update or create mahasiswa record if not admin
        if (!$validated['is_admin']) {
            \App\Models\Mahasiswa::updateOrCreate(
                ['email' => $validated['email']],
                [
                    'nama' => $validated['name'],
                    'npm' => $validated['npm'] ?? '',
                    'prodi' => $validated['prodi'] ?? 'Informatika',
                    'email' => $validated['email'],
                ]
            );
        } else {
            // If changing to admin, remove mahasiswa record
            \App\Models\Mahasiswa::where('email', $validated['email'])->delete();
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User berhasil dihapus.');
    }
}