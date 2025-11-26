<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Share Mahasiswa notifications with all Inertia responses for authenticated users
        Inertia::share('mahasiswaNotifications', function () {
            $user = Auth::user();
            if (! $user) return [];
            try {
                $mahasiswa = \App\Models\Mahasiswa::where('email', $user->email)->first();
                if ($mahasiswa) {
                    return $mahasiswa->notifications()->latest()->take(10)->get()->map(function ($n) {
                        return [
                            'id' => $n->id,
                            'type' => $n->type,
                            'data' => $n->data,
                            'read_at' => $n->read_at,
                            'created_at' => $n->created_at,
                        ];
                    })->toArray();
                }
            } catch (\Throwable $e) {
                // ignore
            }
            return [];
        });

        // Share whether the current authenticated user is an admin (for frontend UI)
        Inertia::share('isAdmin', function () {
            $user = Auth::user();
            if (! $user) return false;
            $adminEmails = config('admins.emails', []);
            $isAdminFlag = isset($user->is_admin) ? (bool) $user->is_admin : false;
            // If a Mahasiswa record exists for this email and the user is not explicitly an admin,
            // treat them as a mahasiswa (not admin) for frontend UI.
            try {
                $isMahasiswa = \App\Models\Mahasiswa::where('email', $user->email ?? '')->exists();
            } catch (\Throwable $e) {
                $isMahasiswa = false;
            }

            if ($isMahasiswa && ! $isAdminFlag) {
                return false;
            }

            return $isAdminFlag || in_array($user->email, $adminEmails);
        });

        // Share session flash messages (success / error) with all Inertia responses
        Inertia::share('flash', function () {
            return [
                'success' => session()->get('success'),
                'error' => session()->get('error'),
            ];
        });
    }
}
