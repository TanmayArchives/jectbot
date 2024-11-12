import { useState, useEffect } from 'react';

interface Trade {
  id: number;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  txHash: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

interface TradeHistoryProps {
  userId: number;
}

export function TradeHistory({ userId }: TradeHistoryProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrades();
  }, [userId]);

  const fetchTrades = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/trades`);
      const data = await response.json();
      setTrades(data);
    } catch (error) {
      console.error('Error fetching trade history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading trade history...</div>;

  return (
    <div className="trade-history">
      <h2>Trade History</h2>
      <div className="trades-list">
        {trades.map(trade => (
          <div key={trade.id} className="trade-item">
            <div className="trade-tokens">
              <span>{trade.tokenIn} → {trade.tokenOut}</span>
            </div>
            <div className="trade-amounts">
              <span>{trade.amountIn} → {trade.amountOut}</span>
            </div>
            <div className="trade-status">
              <span className={`status-${trade.status.toLowerCase()}`}>
                {trade.status}
              </span>
            </div>
            <div className="trade-date">
              {new Date(trade.createdAt).toLocaleDateString()}
            </div>
            <a
              href={`https://etherscan.io/tx/${trade.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="trade-link"
            >
              View Transaction
            </a>
          </div>
        ))}
      </div>
    </div>
  );
} 