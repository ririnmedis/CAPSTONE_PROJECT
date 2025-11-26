<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('kegiatans', function (Blueprint $table) {
            $table->bigIncrements('id');
            // reference to mahasiswa (if you use a separate mahasiswas table)
            $table->unsignedBigInteger('mahasiswa_id')->nullable();
            $table->string('kegiatan', 255);
            $table->dateTime('tanggal_input')->nullable();
            $table->integer('poin')->default(0);
            $table->decimal('bobot', 5, 2)->default(0.00);
            $table->string('bukti_dokumen')->nullable();
            // verification status: pending, verified, rejected
            $table->enum('status_verifikasi', ['pending', 'verified', 'rejected'])->default('pending');
            $table->timestamps();

            // foreign key (optional) - only add if mahasiswas table exists
            $table->foreign('mahasiswa_id')->references('id')->on('mahasiswas')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('kegiatans', function (Blueprint $table) {
            $table->dropForeign(['mahasiswa_id']);
        });
        Schema::dropIfExists('kegiatans');
    }
};
