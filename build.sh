#!/usr/bin/env bash
echo "Building the project..."
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --noinput --clear