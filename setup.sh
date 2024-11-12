#!/bin/bash

# Create necessary .env files
echo "Creating .env files..."

# Root .env
cat > .env << EOL
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/crypto_bot"

# Web3
RPC_URL="https://eth-mainnet.g.alchemy.com/v2/your-api-key"
CHAIN_ID="1"

# Telegram Bot
BOT_TOKEN="7668895332:AAEwXnPGqA3xZTh255ECT65Q0SzenVLH-vw"

# API
API_URL="http://localhost:3001/api"
PORT=3001

# Web
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_WS_URL="ws://localhost:3001"
EOL

# Copy .env files
echo "Copying .env files..."
mkdir -p apps/api
mkdir -p packages/database
cp .env ./apps/api/.env
cp .env ./packages/database/.env

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Generate Prisma client
echo "Generating Prisma client..."
cd packages/database
pnpm db:generate

# Push database schema
echo "Pushing database schema..."
pnpm db:push

# Go back to root
cd ../..

echo "Setup complete!"