import { EventEmitter } from 'events';
import { WebSocket } from 'ws';
import { logger } from '../utils/logger';

interface WebSocketMessage {
  type: string;
  channel: string;
  data: any;
}

export class WebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 3000;
  private pingInterval: NodeJS.Timeout | null = null;
  private subscriptions = new Map<string, Set<string>>();

  constructor(private url: string) {
    super();
    this.connect();
    this.setupPing();
  }

  private connect() {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.on('open', () => {
        this.reconnectAttempts = 0;
        this.emit('connected');
        this.resubscribe();
        logger.info('WebSocket connected');
      });

      this.ws.on('message', (data: string) => {
        try {
          const parsedData = JSON.parse(data);
          this.handleMessage(parsedData);
        } catch (error) {
          logger.error('Error parsing WebSocket message', { error });
        }
      });

      this.ws.on('close', () => {
        this.attemptReconnect();
      });

      this.ws.on('error', (error) => {
        logger.error('WebSocket error', { error });
        this.attemptReconnect();
      });
    } catch (error) {
      logger.error('Error creating WebSocket connection', { error });
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      logger.info(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(), this.reconnectTimeout);
    } else {
      logger.error('Max reconnection attempts reached');
      this.emit('disconnected');
    }
  }

  private setupPing() {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }
    }, 30000);
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'pool_update':
        this.emit('pool_update', message.data);
        break;
      case 'position_update':
        this.emit('position_update', message.data);
        break;
      case 'price_update':
        this.emit('price_update', message.data);
        break;
      case 'tvl_alert':
        this.emit('tvl_alert', message.data);
        break;
      default:
        this.emit('message', message);
    }
  }

  private resubscribe() {
    this.subscriptions.forEach((params, channel) => {
      params.forEach(param => {
        this.subscribe(channel, JSON.parse(param));
      });
    });
  }

  subscribe(channel: string, params?: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const message = {
      type: 'subscribe',
      channel,
      params
    };

    this.ws.send(JSON.stringify(message));

    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    this.subscriptions.get(channel)?.add(JSON.stringify(params || {}));
  }

  unsubscribe(channel: string, params?: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const message = {
      type: 'unsubscribe',
      channel,
      params
    };

    this.ws.send(JSON.stringify(message));
    this.subscriptions.get(channel)?.delete(JSON.stringify(params || {}));
  }

  close() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    if (this.ws) {
      this.ws.close();
    }
  }
} 