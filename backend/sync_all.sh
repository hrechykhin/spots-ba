#!/bin/sh
set -e

echo "=== Syncing cafes from Google Places ==="

python manage.py sync_from_google --query "cafes in Bratislava Slovakia" --max 60 --publish
python manage.py sync_from_google --query "kaviareň Bratislava" --max 60 --publish
python manage.py sync_from_google --query "specialty coffee Bratislava" --max 60 --publish
python manage.py sync_from_google --query "bistro Bratislava" --max 60 --publish
python manage.py sync_from_google --query "coffee shop Bratislava" --max 60 --publish

echo "=== Sync complete ==="
