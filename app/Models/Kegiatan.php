<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kegiatan extends Model
{
    use HasFactory;

    protected $table = 'kegiatans';

    protected $fillable = [
        'mahasiswa_id',
        'kegiatan',
        'kegiatan_kode',
        'tanggal_input',
        'poin',
        'bobot',
        'bukti_dokumen',
        'bukti_hash',
        'status_verifikasi',
        'admin_note',
    ];

    /**
     * Casts for model attributes.
     */
    protected $casts = [
        'bobot' => 'float',
        'tanggal_input' => 'date',
    ];

    /**
     * Relation to Mahasiswa (optional — depends on your schema)
     */
    public function mahasiswa()
    {
        return $this->belongsTo(Mahasiswa::class, 'mahasiswa_id');
    }
}
