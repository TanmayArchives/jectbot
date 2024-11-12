import { useState, useEffect } from 'react';
import { useWeb3 } from '../../hooks/useWeb3';
import { WebSocketService } from '@repo/web3/services/WebSocketService';

interface PriceAlert {
  tokenAddress: string;
  condition: 'above' | 'below';
  value: number;
}

export function PriceMonitor() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const { web3Service } = useWeb3();
  
  useEffect(() => {
    const ws = new WebSocketService('wss://your-websocket-url');

    ws.on('message', (data: any) => {
      if (data.type === 'price') {
        setPrices(prev => ({
          ...prev,
          [data.token]: data.price
        }));
      }
    });

    // Subscribe to price updates for watchlist tokens
    watchlist.forEach(token => {
      ws.subscribe('price', { token });
    });

    return () => {
      ws.close();
    };
  }, [watchlist]);

  const addToWatchlist = async (tokenAddress: string) => {
    try {
      // Verify token and check security
      const security = await web3Service.security.scanToken(tokenAddress);
      
      if (security.isHoneypot) {
        throw new Error('Token appears to be a honeypot');
      }

      setWatchlist(prev => [...prev, tokenAddress]);
    } catch (error) {
      console.error('Error adding token to watchlist:', error);
    }
  };

  const createAlert = (alert: PriceAlert) => {
    setAlerts(prev => [...prev, alert]);
  };

  return (
    <div className="price-monitor">
      <div className="watchlist">
        <h2>Watchlist</h2>
        {watchlist.map(token => (
          <div key={token} className="token-price">
            <span>{token}</span>
            <span>{prices[token] || 'Loading...'}</span>
          </div>
        ))}
      </div>

      <div className="alerts">
        <h2>Price Alerts</h2>
        {alerts.map((alert, index) => (
          <div key={index} className="alert">
            <span>{alert.tokenAddress}</span>
            <span>{alert.condition} {alert.value}</span>
          </div>
        ))}
      </div>

      {/* Add Token Form */}
      <form onSubmit={(e) => {
        e.preventDefault();
        const token = (e.target as any).token.value;
        addToWatchlist(token);
      }}>
        <input name="token" placeholder="Token Address" />
        <button type="submit">Add to Watchlist</button>
      </form>
    </div>
  );
} 