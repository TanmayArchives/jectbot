import { EventEmitter } from 'events';
import axios from 'axios';
import { logger } from '../utils/logger';

export class PriceMonitor extends EventEmitter {
  private watchlist: Map<string, {
    price: number;
    alerts: Array<{
      condition: 'above' | 'below';
      value: number;
      callback: (price: number) => void;
    }>;
  }>;
  private interval: NodeJS.Timeout | null;

  constructor() {
    super();
    this.watchlist = new Map();
    this.interval = null;
  }

  addToken(tokenAddress: string) {
    if (!this.watchlist.has(tokenAddress)) {
      this.watchlist.set(tokenAddress, {
        price: 0,
        alerts: []
      });
    }
  }

  setAlert(params: {
    tokenAddress: string;
    condition: 'above' | 'below';
    value: number;
    callback: (price: number) => void;
  }) {
    const token = this.watchlist.get(params.tokenAddress);
    if (token) {
      token.alerts.push({
        condition: params.condition,
        value: params.value,
        callback: params.callback
      });
    }
  }

  async startMonitoring(interval = 60000) {
    if (this.interval) return;

    this.interval = setInterval(async () => {
      try {
        for (const [address, data] of this.watchlist) {
          const price = await this.fetchPrice(address);
          this.checkAlerts(address, price);
        }
      } catch (error) {
        logger.error('Error in price monitoring', { error });
      }
    }, interval);
  }

  stopMonitoring() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private async fetchPrice(tokenAddress: string): Promise<number> {
    // Implementation to fetch price from DEX or price feed
    return 0;
  }

  private checkAlerts(tokenAddress: string, currentPrice: number) {
    const token = this.watchlist.get(tokenAddress);
    if (!token) return;

    token.alerts.forEach(alert => {
      if (alert.condition === 'above' && currentPrice > alert.value) {
        alert.callback(currentPrice);
      } else if (alert.condition === 'below' && currentPrice < alert.value) {
        alert.callback(currentPrice);
      }
    });
  }
} 