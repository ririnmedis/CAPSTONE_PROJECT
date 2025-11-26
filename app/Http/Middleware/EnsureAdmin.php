<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = auth()->user();
        $adminEmails = config('admins.emails', []);
        $isAdminFlag = isset($user->is_admin) ? (bool) $user->is_admin : false;

        if (! $user || (! $isAdminFlag && ! in_array($user->email, $adminEmails))) {
            abort(403);
        }

        return $next($request);
    }
}
