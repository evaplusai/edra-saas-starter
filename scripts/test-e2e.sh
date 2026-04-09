#!/bin/bash
set -e

CONTAINER_NAME="edra-test-db"
TEST_DB_PORT=5433
TEST_DB_URL="postgresql://postgres:postgres@localhost:${TEST_DB_PORT}/edra_test"

cleanup() {
  echo "Cleaning up test database..."
  docker stop "$CONTAINER_NAME" 2>/dev/null && docker rm "$CONTAINER_NAME" 2>/dev/null || true
}

# Always clean up on exit
trap cleanup EXIT

# Remove leftover container if it exists
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

# Start test postgres
echo "Starting test Postgres on port ${TEST_DB_PORT}..."
docker run -d --name "$CONTAINER_NAME" \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=edra_test \
  -p "${TEST_DB_PORT}:5432" \
  postgres:16-alpine

# Wait for postgres to be ready
echo "Waiting for Postgres..."
until docker exec "$CONTAINER_NAME" pg_isready -U postgres > /dev/null 2>&1; do
  sleep 1
done
echo "Postgres is ready."

# Run migrations
echo "Running migrations..."
DATABASE_URL="$TEST_DB_URL" npx tsx src/server/db/migrate.ts

# Seed test data
echo "Seeding test data..."
DATABASE_URL="$TEST_DB_URL" npx tsx src/server/db/seed.ts

# Run Playwright tests
echo "Running E2E tests..."
DATABASE_URL="$TEST_DB_URL" \
JWT_SECRET="test-secret-key-for-e2e-testing-min32chars" \
APP_URL="http://localhost:5173" \
PORT=3001 \
VITE_API_URL="http://localhost:3001" \
npx playwright test "$@"
