import { WebSocketServer } from 'ws';
import { Server } from 'http';
import { logger } from '@repo/web3';
import { PriceMonitor, Web3Service } from '@repo/web3';

export class WebSocketManager {
  private wss: WebSocketServer;
  private priceMonitor: PriceMonitor;
  private web3Service: Web3Service;
  private subscriptions: Map<string, Set<WebSocket>>;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.priceMonitor = new PriceMonitor();
    this.web3Service = new Web3Service();
    this.subscriptions = new Map();

    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws) => {
      logger.info('New WebSocket connection established');

      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message);
          await this.handleMessage(ws, data);
        } catch (error) {
          logger.error('Error handling WebSocket message', { error });
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });
    });
  }

  private async handleMessage(ws: WebSocket, data: any) {
    const { type, channel, params } = data;

    switch (type) {
      case 'subscribe':
        this.handleSubscribe(ws, channel, params);
        break;
      case 'unsubscribe':
        this.handleUnsubscribe(ws, channel);
        break;
      default:
        ws.send(JSON.stringify({ error: 'Unknown message type' }));
    }
  }

  private handleSubscribe(ws: WebSocket, channel: string, params: any) {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    this.subscriptions.get(channel)?.add(ws);

    switch (channel) {
      case 'price':
        this.startPriceUpdates(params.token);
        break;
      case 'portfolio':
        this.startPortfolioUpdates(params.walletAddress);
        break;
    }
  }

  private handleUnsubscribe(ws: WebSocket, channel: string) {
    this.subscriptions.get(channel)?.delete(ws);
  }

  private handleDisconnect(ws: WebSocket) {
    this.subscriptions.forEach((subscribers) => {
      subscribers.delete(ws);
    });
  }

  private startPriceUpdates(token: string) {
    this.priceMonitor.addToken(token);
  }

  private async startPortfolioUpdates(walletAddress: string) {
    try {
      const portfolio = await this.web3Service.getBalance(walletAddress);
      this.broadcast('portfolio', { walletAddress, portfolio });
    } catch (error) {
      logger.error('Error updating portfolio', { walletAddress, error });
    }
  }

  broadcast(channel: string, data: any) {
    const subscribers = this.subscriptions.get(channel);
    if (!subscribers) return;

    const message = JSON.stringify({ channel, data });
    subscribers.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
} 