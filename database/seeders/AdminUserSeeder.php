<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@example.com');
        $password = env('ADMIN_PASSWORD', 'password');

        $user = User::firstOrNew(['email' => $email]);
        $user->name = $user->name ?? 'Admin';
        $user->password = Hash::make($password);
        $user->email_verified_at = $user->email_verified_at ?? now();
        // mark as admin flag when migration exists
        if (Schema::hasColumn('users', 'is_admin')) {
            $user->is_admin = true;
        }
        $user->save();

        // Note: EnsureAdmin middleware uses config('admins.emails') or users.is_admin flag.
        // We recommend setting ADMIN_EMAIL in your .env to the admin account created by this seeder.
    }
}
