<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Illuminate\Http\Request;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     */
    public function toResponse($request)
    {
        $user = $request->user();
        $adminEmails = config('admins.emails', []);
        $isAdminFlag = isset($user->is_admin) ? (bool) $user->is_admin : false;
        // If a Mahasiswa record exists for this user email and the user is not explicitly flagged as admin,
        // treat them as mahasiswa (non-admin). This avoids accidentally treating mahasiswa as admin.
        $isMahasiswa = false;
        try {
            $isMahasiswa = \App\Models\Mahasiswa::where('email', $user->email ?? '')->exists();
        } catch (\Throwable $e) {
            $isMahasiswa = false;
        }

        // JSON consumers expect a 204
        if ($request->wantsJson()) {
            return response()->noContent();
        }

        // If admin -> admin area. If there is a mahasiswa record and the user is not explicitly an admin,
        // ensure they go to mahasiswa dashboard instead.
        if ($user && ($isAdminFlag || in_array($user->email, $adminEmails)) && ! $isMahasiswa) {
            // send admins to the admin dashboard
            return redirect()->intended(route('admin.dashboard'));
        }

        // Otherwise go to mahasiswa dashboard
        return redirect()->intended(config('fortify.home', '/dashboard'));
    }
}
