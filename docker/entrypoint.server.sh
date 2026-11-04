#!/usr/bin/env sh
set -e

echo "========================================================"
echo "🚀 Systrome WAC Enterprise Controller — Backend Starting"
echo "========================================================"

echo "⏳ Waiting for PostgreSQL database to be reachable..."
MAX_RETRIES=30
RETRY_COUNT=0

until node -e "
  const { PrismaClient } = require('@prisma/client');
  const p = new PrismaClient();
  p.\$connect()
    .then(() => p.\$queryRaw\`SELECT 1\`)
    .then(() => { p.\$disconnect(); process.exit(0); })
    .catch(() => { process.exit(1); });
" > /dev/null 2>&1; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
    echo "❌ Could not reach database after $MAX_RETRIES attempts. Exiting."
    exit 1
  fi
  echo "  Database not ready yet... retrying in 2 seconds ($RETRY_COUNT/$MAX_RETRIES)"
  sleep 2
done

echo "✅ PostgreSQL database connection established."

echo "🔄 Synchronizing database schema via Prisma..."
npx prisma db push --schema=packages/database/prisma/schema.prisma --accept-data-loss
echo "✅ Database schema is up to date."

echo "🔍 Checking database initialization state..."
NEED_SEED=$(node -e "
  const { PrismaClient } = require('@prisma/client');
  const p = new PrismaClient();
  p.user.count()
    .then(c => {
      process.stdout.write(c === 0 ? 'yes' : 'no');
      return p.\$disconnect();
    })
    .catch(() => {
      process.stdout.write('error');
      process.exit(1);
    });
")

if [ "$NEED_SEED" = "yes" ]; then
  echo "🌱 Fresh database detected. Executing automatic initial seed..."
  npx tsx packages/database/prisma/seed.ts
  echo "✅ Seed data populated successfully (Admin: admin@wac.network / Admin123!@#)"
else
  echo "ℹ️ Database already contains records. Skipping initial seed."
fi

echo "🚀 Launching WAC Enterprise API & WebSocket Gateway..."
exec node apps/server/dist/index.js
