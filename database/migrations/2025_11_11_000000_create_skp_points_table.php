<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('skp_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mahasiswa_id')->constrained('mahasiswas')->onDelete('cascade');
            $table->foreignId('kegiatan_id')->nullable()->constrained('kegiatans')->onDelete('set null');
            $table->string('kegiatan')->nullable();
            $table->date('tanggal_input')->nullable();
            $table->integer('poin')->default(0);
            $table->float('bobot')->default(0);
            $table->string('bukti_dokumen')->nullable();
            $table->string('status_verifikasi')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('skp_points');
    }
};
