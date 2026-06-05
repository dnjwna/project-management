# Supervisor Config — FlowStep

## File Structure

```
supervisor/
├── laravel-worker.conf   # Queue Worker (2 process)
├── laravel-reverb.conf   # Reverb WebSocket Server (1 process)
├── setup-supervisor.sh   # Auto-install & setup script
└── README.md
```

## Quick Setup (VPS)

```bash
# Upload folder ini ke VPS, lalu:
sudo bash setup-supervisor.sh
```

## Manual Setup

```bash
# 1. Install Supervisor
sudo apt-get install supervisor

# 2. Copy config
sudo cp laravel-worker.conf /etc/supervisor/conf.d/
sudo cp laravel-reverb.conf /etc/supervisor/conf.d/

# 3. Reload
sudo supervisorctl reread
sudo supervisorctl update

# 4. Start
sudo supervisorctl start laravel-worker:*
sudo supervisorctl start laravel-reverb
```

## Monitoring

```bash
# Cek status semua proses
sudo supervisorctl status

# Lihat log real-time
tail -f /var/www/html/project-management/backend/storage/logs/worker.log
tail -f /var/www/html/project-management/backend/storage/logs/reverb.log
```

## Catatan Penting

### Queue Worker (`laravel-worker.conf`)
- `numprocs=2` → 2 worker berjalan paralel, bisa dinaikkan sesuai load
- `--tries=3` → job gagal akan di-retry 3x sebelum masuk `failed_jobs`
- `--max-time=3600` → worker restart otomatis tiap 1 jam (mencegah memory leak)
- `--sleep=3` → polling tiap 3 detik jika queue kosong

### Reverb (`laravel-reverb.conf`)
- `--host=0.0.0.0` → listen semua interface (wajib di VPS)
- `--port=8080` → sesuai `VITE_REVERB_PORT` di frontend `.env`
- `numprocs=1` → Reverb cukup 1 instance (sudah handle concurrent connections)

### Setelah Deploy Kode Baru
```bash
# Queue worker perlu restart agar pickup kode terbaru
sudo supervisorctl restart laravel-worker:*

# Reverb juga perlu restart jika ada perubahan broadcast/channel
sudo supervisorctl restart laravel-reverb
```

### Jika `www-data` Bukan User Yang Tepat
Cek user yang menjalankan PHP-FPM:
```bash
ps aux | grep php
```
Ganti `user=www-data` di kedua `.conf` sesuai hasil di atas.
