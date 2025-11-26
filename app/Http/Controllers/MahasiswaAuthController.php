<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MahasiswaAuthController extends Controller
{
    public function showLogin()
    {
        $user = auth()->user();
        if ($user) {
            $adminEmails = config('admins.emails', []);
            $isAdminFlag = isset($user->is_admin) ? (bool) $user->is_admin : false;

            // if admin, send to admin area; otherwise mahasiswa to dashboard
            if ($isAdminFlag || in_array($user->email, $adminEmails)) {
                return redirect()->route('admin.kegiatans.index');
            }

            return redirect()->route('dashboard');
        }

        // reuse the same Inertia login page used by Fortify
        return Inertia::render('auth/login');
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

        $user = Auth::user();
        $adminEmails = config('admins.emails', []);
        $isAdminFlag = isset($user->is_admin) ? (bool) $user->is_admin : false;

        // If the authenticated user is an admin, send them to the admin area;
        // otherwise send to the mahasiswa dashboard. Use intended() so redirects
        // from middleware-preserved intended targets still work.
        if ($isAdminFlag || in_array($user->email, $adminEmails)) {
            return redirect()->intended(route('admin.kegiatans.index'));
        }

        return redirect()->intended(config('fortify.home', '/dashboard'));
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('home');
    }
}
