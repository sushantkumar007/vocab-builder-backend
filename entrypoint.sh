#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Creating admin..."
npm run seed

echo "Starting application..."
exec npm start