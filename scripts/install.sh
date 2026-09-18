#!/bin/bash
set -e

echo "=== ROBOT PLATFORM INSTALLER ==="

UNAME_M=$(uname -m)
echo "System Architecture: $UNAME_M"

sudo apt update
sudo apt install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    python3-pil \
    python3-smbus \
    i2c-tools \
    libcamera-apps \
    python3-picamera2 \
    python3-rpi.gpio \
    python3-lgpio \
    curl \
    wget

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

if [ ! -d "venv" ]; then
    echo "Creating virtual environment with system site packages..."
    python3 -m venv --system-site-packages venv
fi

source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

python3 scripts/download_model.py

echo "Testing I2C bus..."
if command -v i2cdetect >/dev/null 2>&1; then
    sudo i2cdetect -y 1 || true
fi

echo "Testing camera presence..."
if command -v rpicam-hello >/dev/null 2>&1; then
    rpicam-hello --list-cameras || true
elif command -v libcamera-hello >/dev/null 2>&1; then
    libcamera-hello --list-cameras || true
fi

echo "=== INSTALLATION COMPLETE ==="
echo "If I2C or Camera was just enabled in raspi-config, please reboot the Raspberry Pi."
