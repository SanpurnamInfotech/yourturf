#!/bin/bash
set -e

echo "================================================================="
echo "🚀 Starting YourTurf Deployment"
echo "================================================================="

# Determine directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if backend/.env exists
if [ ! -f backend/.env ]; then
  echo "⚠️ Warning: backend/.env file not found in $SCRIPT_DIR/backend."
  if [ -f backend/.env.example ]; then
    echo "📋 Copying backend/.env.example to backend/.env (Please edit backend/.env with real credentials)..."
    cp backend/.env.example backend/.env
  fi
fi

# Pull latest code from git
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
echo "📥 Pulling latest changes from git (branch: $CURRENT_BRANCH)..."
git pull origin "$CURRENT_BRANCH" || echo "⚠️ Git pull skipped or encountered an issue. Proceeding with existing code..."

# Build and start containers
echo "🔨 Building & starting Docker containers..."
docker compose up -d --build

# Prune dangling Docker images to save VPS disk space
echo "🧹 Pruning unused Docker images..."
docker image prune -f

echo "================================================================="
echo "✅ Deployment Successful!"
echo "================================================================="
docker compose ps
echo "================================================================="
