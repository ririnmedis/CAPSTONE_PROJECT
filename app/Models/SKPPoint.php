<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SKPPoint extends Model
{
    use HasFactory;

    protected $table = 'skp_points';

    protected $fillable = [
        'mahasiswa_id',
        'kegiatan',
        'tanggal_input',
        'poin',
        'bobot',
        'bukti_dokumen',
        'status_verifikasi',
    ];

    public function mahasiswa()
    {
        return $this->belongsTo(Mahasiswa::class, 'mahasiswa_id');
    }
}
