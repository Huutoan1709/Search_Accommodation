#!/usr/bin/env bash
echo "Đang bắt đầu quá trình build..."

# Nâng cấp pip
python -m pip install --upgrade pip

# Tạo thư mục static nếu chưa tồn tại
mkdir -p static
mkdir -p staticfiles

# Cài đặt dependencies
pip install -r requirements.txt

# Thu thập file tĩnh
python manage.py collectstatic --noinput

# Chạy migrations
python manage.py migrate --noinput