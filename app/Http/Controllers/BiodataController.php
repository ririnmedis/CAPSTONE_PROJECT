<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Mahasiswa;

class BiodataController extends Controller
{
    public function create(Request $request)
    {
        $user = $request->user();
        $mahasiswa = null;
        
        if ($user) {
            $mahasiswa = Mahasiswa::where('email', $user->email)->first();
        }

        return Inertia::render('Biodata/Create', [
            'mahasiswa' => $mahasiswa ? $mahasiswa->only(['nama','npm','prodi','email']) : null,
            'user' => $user ? $user->only('name', 'email') : null,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'npm' => ['required', 'string', 'max:20'],
            'prodi' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
        ]);

        $user = $request->user();
        if (!$user) {
            return redirect()->back()->withErrors(['error' => 'User tidak ditemukan']);
        }

        // Update or create mahasiswa record
        $mahasiswa = Mahasiswa::updateOrCreate(
            ['email' => $user->email],
            $data
        );

        return redirect()->route('biodata.create')->with('success', 'Biodata berhasil disimpan.');
    }
}