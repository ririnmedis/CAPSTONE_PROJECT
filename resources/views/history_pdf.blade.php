<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>History SKP</title>
    <style>
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 12px; color: #111827; }
        .header { text-align: center; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 6px 8px; border: 1px solid #ddd; }
        th { background: #f3f4f6; text-align: left; }
    </style>
</head>
<body>
    <div class="header">
        <h2>History SKP</h2>
        @if(isset($mahasiswa))
            <div>{{ $mahasiswa->nama ?? '' }} - {{ $mahasiswa->npm ?? '' }}</div>
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Kegiatan</th>
                <th>Tanggal</th>
                <th>Poin</th>
                <th>Bobot</th>
                <th>Bukti</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($points as $idx => $p)
                <tr>
                    <td>{{ $idx + 1 }}</td>
                    <td>{{ $p->kegiatan }}</td>
                    <td>{{ $p->tanggal_input }}</td>
                    <td>{{ $p->poin }}</td>
                    <td>{{ $p->bobot }}</td>
                    <td>{{ $p->bukti_dokumen }}</td>
                    <td>{{ $p->status_verifikasi }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>