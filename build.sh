#!/usr/bin/env bash
echo "Đang build project..."
python -m pip install --upgrade pip

# Cài đặt các dependencies
pip install -r requirements.txt

# Thu thập file tĩnh
python manage.py collectstatic --noinput --clear