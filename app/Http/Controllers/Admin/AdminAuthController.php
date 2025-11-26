<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdminAuthController extends Controller
{
    public function showLogin()
    {
        $user = auth()->user();
        if ($user) {
            $adminEmails = config('admins.emails', []);
            $isAdminFlag = isset($user->is_admin) ? (bool) $user->is_admin : false;

            if ($isAdminFlag || in_array($user->email, $adminEmails)) {
                return redirect()->route('admin.kegiatans.index');
            }

            return redirect()->route('dashboard');
        }

        return Inertia::render('Admin/Login');
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required','email'],
            'password' => ['required'],
        ]);

        if (! Auth::attempt(['email' => $data['email'], 'password' => $data['password']])) {
            return back()->withErrors(['email' => 'Credensial tidak cocok.']);
        }

        $request->session()->regenerate();

        // ensure user is allowed as admin (EnsureAdmin middleware uses config/admins or is_admin flag)
        $user = Auth::user();
        $adminEmails = config('admins.emails', []);
        $isAdminFlag = isset($user->is_admin) ? (bool) $user->is_admin : false;
        // Ensure that only explicitly flagged admin accounts or configured admin emails
        // can pass admin login. If a Mahasiswa record exists and the user is not flagged as admin,
        // deny admin access.
        $isMahasiswa = false;
        try {
            $isMahasiswa = \App\Models\Mahasiswa::where('email', $user->email ?? '')->exists();
        } catch (\Throwable $e) {
            $isMahasiswa = false;
        }

        if (! $isAdminFlag && ! in_array($user->email, $adminEmails)) {
            Auth::logout();
            return back()->withErrors(['email' => 'Akun tidak memiliki hak admin.']);
        }

        return redirect()->route('admin.kegiatans.index');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('home');
    }
}
