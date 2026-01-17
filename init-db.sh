#!/bin/bash
set -e

echo "Waiting for app to be ready..."
sleep 10

echo "Running migrations..."
docker compose exec pepero-app npx prisma migrate deploy

echo "Seeding database..."
docker compose exec pepero-app node prisma/seed.js

echo "Database initialized successfully!"
