#!/bin/sh
set -e

echo "Running database migrations..."
python manage.py migrate

echo "Seeding initial cafe data..."
python manage.py seed_cafes

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting server..."
exec gunicorn places_ba.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2
