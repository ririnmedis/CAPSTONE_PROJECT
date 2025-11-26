<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KegiatanAudit extends Model
{
    use HasFactory;

    protected $table = 'kegiatan_audits';

    protected $fillable = [
        'kegiatan_id', 'admin_id', 'admin_name', 'action', 'note',
    ];

    public function kegiatan()
    {
        return $this->belongsTo(Kegiatan::class, 'kegiatan_id');
    }
}
