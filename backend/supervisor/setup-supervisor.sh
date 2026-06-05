#!/bin/bash
# =============================================================
# ProjectHub — Supervisor Setup Script
# Jalankan sebagai root atau dengan sudo
# Usage: sudo bash setup-supervisor.sh
# =============================================================

set -e

BACKEND_PATH="/var/www/student06/backend"
SUPERVISOR_CONF_DIR="/etc/supervisor/conf.d"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "================================================"
echo "  ProjectHub — Supervisor Setup"
echo "================================================"

# 1. Install Supervisor jika belum ada
if ! command -v supervisord &>/dev/null; then
    echo "[1/5] Installing Supervisor..."
    apt-get update -qq
    apt-get install -y supervisor
    echo "      ✅ Supervisor installed"
else
    echo "[1/5] Supervisor already installed — skipping"
fi

# 2. Pastikan direktori log tersedia & permission benar
echo "[2/5] Preparing log directory..."
mkdir -p "$BACKEND_PATH/storage/logs"
chown -R www-data:www-data "$BACKEND_PATH/storage"
chmod -R 775 "$BACKEND_PATH/storage"
echo "      ✅ Log directory ready"

# 3. Copy config files ke /etc/supervisor/conf.d/
echo "[3/5] Copying Supervisor config files..."
cp "$SCRIPT_DIR/laravel-worker.conf" "$SUPERVISOR_CONF_DIR/laravel-worker.conf"
cp "$SCRIPT_DIR/laravel-reverb.conf" "$SUPERVISOR_CONF_DIR/laravel-reverb.conf"
echo "      ✅ Config files copied to $SUPERVISOR_CONF_DIR"

# 4. Reload & update Supervisor
echo "[4/5] Reloading Supervisor..."
supervisorctl reread
supervisorctl update
echo "      ✅ Supervisor reloaded"

# 5. Start semua program & tampilkan status
echo "[5/5] Starting programs..."
supervisorctl start laravel-worker:*
supervisorctl start laravel-reverb
echo ""
echo "================================================"
echo "  Status:"
echo "================================================"
supervisorctl status
echo ""
echo "✅ Setup complete!"
echo ""
echo "Useful commands:"
echo "  sudo supervisorctl status                  — cek semua status"
echo "  sudo supervisorctl restart laravel-worker:* — restart queue worker"
echo "  sudo supervisorctl restart laravel-reverb   — restart Reverb"
echo "  sudo supervisorctl stop all                 — stop semua"
echo "  tail -f $BACKEND_PATH/storage/logs/worker.log  — log worker"
echo "  tail -f $BACKEND_PATH/storage/logs/reverb.log  — log Reverb"
