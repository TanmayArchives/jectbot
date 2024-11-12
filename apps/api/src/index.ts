import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import './bot'; // This will initialize the bot
import { WebSocketManager } from './websocket/server';
import { errorHandler } from './middleware/errorHandler';
import walletRoutes from './routes/wallet';
import { config } from './config';
import { logger } from '@repo/web3';

const app = express();
const server = createServer(app);

// Initialize WebSocket server
new WebSocketManager(server);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/wallets', walletRoutes);

// Error handling
app.use(errorHandler);

const PORT = config.PORT || 3001;

// Start HTTP/WebSocket server with port retry logic
const startServer = (port: number) => {
  server.listen(port)
    .on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        logger.warn(`Port ${port} is in use, trying ${port + 1}`);
        startServer(port + 1);
      } else {
        logger.error('Server error:', err);
        process.exit(1);
      }
    })
    .on('listening', () => {
      const actualPort = (server.address() as any).port;
      logger.info(`Server running on port ${actualPort}`);
    });
};

startServer(PORT);

// Enable graceful stop
process.once('SIGINT', () => server.close());
process.once('SIGTERM', () => server.close()); 