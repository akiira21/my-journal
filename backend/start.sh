#!/bin/sh
set -e

echo "Running database migrations..."
# Run goose migrations 
cd /app/migrations && goose postgres "$DATABASE_URL" up || true

cd /app

echo "Starting server..."
exec ./server
