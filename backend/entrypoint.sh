#!/bin/bash
set -e

echo "=========================================================="
echo "⚡ Starting YourTurf Backend Services..."
echo "=========================================================="

# Wait for Database connectivity
echo "🔍 Checking database connection..."
python - <<'EOF'
import sys
import time
import os
from django.db import connections
from django.db.utils import OperationalError
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

max_retries = 30
retry_interval = 2

for i in range(max_retries):
    try:
        db_conn = connections['default']
        db_conn.cursor()
        print("✅ Database is ready and reachable!")
        sys.exit(0)
    except OperationalError as err:
        print(f"⏳ Waiting for database ({i+1}/{max_retries})... Error: {err}")
        time.sleep(retry_interval)
    except Exception as e:
        print(f"⚠️ Warning: Non-fatal error during DB check: {e}")
        break

print("⚠️ Could not verify DB connection, proceeding anyway...")
EOF

# Apply database migrations
echo "🔄 Applying database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput

echo "🚀 Starting server..."
exec "$@"
