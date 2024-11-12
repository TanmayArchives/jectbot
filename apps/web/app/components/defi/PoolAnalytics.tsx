import { useState, useEffect } from 'react';
import { useWeb3 } from '../../hooks/useWeb3';
import { useWebSocket } from '../../hooks/useWebSocket';
import { LineChart } from '../charts/LineChart';

interface PoolAnalytics {
  address: string;
  impermanentLoss: string;
  volumeHistory: {
    timestamp: number;
    volume: string;
  }[];
  priceImpact: string;
  liquidity: string;
  fees24h: string;
}

export function PoolAnalytics({ poolAddress }: { poolAddress: string }) {
  const [analytics, setAnalytics] = useState<PoolAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const { web3Service } = useWeb3();
  const ws = useWebSocket();

  useEffect(() => {
    fetchAnalytics();
    setupWebSocket();
    return () => cleanup();
  }, [poolAddress]);

  const fetchAnalytics = async () => {
    try {
      const data = await web3Service.defi.analytics.analyzePool(poolAddress);
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching pool analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    ws.subscribe('pool_analytics', { poolAddress });
    ws.on((data) => {
      if (data.channel === 'pool_analytics' && data.data.poolAddress === poolAddress) {
        setAnalytics(data.data.analytics);
      }
    });
  };

  const cleanup = () => {
    ws.unsubscribe('pool_analytics', { poolAddress });
  };

  if (loading) return <div>Loading pool analytics...</div>;
  if (!analytics) return <div>No analytics data available</div>;

  return (
    <div className="pool-analytics">
      <div className="analytics-header">
        <h2>Pool Analytics</h2>
        <span className="pool-address">{poolAddress}</span>
      </div>

      <div className="analytics-grid">
        <div className="metric-card">
          <h3>Impermanent Loss</h3>
          <span className="value">{analytics.impermanentLoss}%</span>
        </div>

        <div className="metric-card">
          <h3>Price Impact</h3>
          <span className="value">{analytics.priceImpact}%</span>
        </div>

        <div className="metric-card">
          <h3>Liquidity</h3>
          <span className="value">${analytics.liquidity}</span>
        </div>

        <div className="metric-card">
          <h3>24h Fees</h3>
          <span className="value">${analytics.fees24h}</span>
        </div>
      </div>

      <div className="volume-chart">
        <h3>Volume History</h3>
        <LineChart
          data={analytics.volumeHistory.map(item => ({
            x: new Date(item.timestamp * 1000),
            y: parseFloat(item.volume)
          }))}
          xAxis="Time"
          yAxis="Volume"
        />
      </div>
    </div>
  );
} 