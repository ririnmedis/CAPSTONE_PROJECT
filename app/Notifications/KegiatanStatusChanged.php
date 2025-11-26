<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Notification;

class KegiatanStatusChanged extends Notification
{
    use Queueable;

    protected $kegiatan;
    protected $status;
    protected $note;

    public function __construct($kegiatan, string $status, $note = null)
    {
        $this->kegiatan = $kegiatan;
        $this->status = $status;
        $this->note = $note;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        return new DatabaseMessage([
            'kegiatan_id' => $this->kegiatan->id ?? null,
            'kegiatan' => $this->kegiatan->kegiatan ?? null,
            'status' => $this->status,
            'note' => $this->note,
            'message' => $this->status === 'verified'
                ? 'Kegiatan Anda telah disetujui oleh admin.'
                : 'Kegiatan Anda ditolak oleh admin.',
        ]);
    }
}
