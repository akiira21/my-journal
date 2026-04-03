#!/bin/sh
set -e

echo "Running database migrations..."
# Run goose migrations
cd /app/migrations
 goose postgres "$DATABASE_URL" up

echo "Starting server..."
exec ./server
