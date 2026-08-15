#!/usr/bin/env bash

set -e

echo "Installing system dependencies..."

apt-get update

apt-get install -y libreoffice python3 python3-pip

echo "Installing Node dependencies..."

npm install

echo "Installing Python dependencies..."

python3 -m pip install --break-system-packages pdf2docx

echo "Checking LibreOffice..."

soffice --version

echo "Checking Python..."

python3 --version

echo "Build completed successfully."