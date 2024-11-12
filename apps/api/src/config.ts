import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Always use the provided token
const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN environment variable is not set');
}

export const config = {
  BOT_TOKEN,
  PORT: process.env.PORT || 3001,
  DATABASE_URL: process.env.DATABASE_URL,
  RPC_URL: process.env.RPC_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  NODE_ENV: process.env.NODE_ENV || 'development'
}; 