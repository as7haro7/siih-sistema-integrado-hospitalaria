#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Install dependencies"
pip install -r requirements.txt

echo "Collect static files"
python manage.py collectstatic --no-input

echo "Apply database migrations"
python manage.py migrate
