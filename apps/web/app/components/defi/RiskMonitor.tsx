import { useState, useEffect } from 'react';
import { useWeb3 } from '../../hooks/useWeb3';
import { useWebSocket } from '../../hooks/useWebSocket';
import { LineChart } from '../charts/LineChart';

interface RiskMetrics {
  rugPullRisk: number;
  liquidityConcentration: number;
  ownershipRisk: number;
  tradingVolatility: number;
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface LiquidityEvent {
  timestamp: number;
  amount: string;
  type: 'ADD' | 'REMOVE';
}

export function RiskMonitor({ tokenAddress }: { tokenAddress: string }) {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [liquidityEvents, setLiquidityEvents] = useState<LiquidityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { web3Service } = useWeb3();
  const ws = useWebSocket();

  useEffect(() => {
    fetchRiskData();
    setupWebSocket();
    return () => cleanup();
  }, [tokenAddress]);

  const fetchRiskData = async () => {
    try {
      const [metrics, events] = await Promise.all([
        web3Service.risk.analyzeTokenRisk(tokenAddress),
        web3Service.risk.monitorLiquidityChanges(tokenAddress)
      ]);
      setRiskMetrics(metrics);
      setLiquidityEvents(events);
    } catch (error) {
      console.error('Error fetching risk data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    ws.subscribe('risk_monitor', { tokenAddress });
    ws.on((data) => {
      if (data.channel === 'risk_monitor' && data.data.tokenAddress === tokenAddress) {
        handleRiskUpdate(data.data);
      }
    });
  };

  const handleRiskUpdate = (data: any) => {
    if (data.type === 'metrics_update') {
      setRiskMetrics(data.metrics);
    } else if (data.type === 'liquidity_event') {
      setLiquidityEvents(prev => [...prev, data.event]);
    }
  };

  const cleanup = () => {
    ws.unsubscribe('risk_monitor', { tokenAddress });
  };

  if (loading) return <div>Loading risk analysis...</div>;
  if (!riskMetrics) return <div>No risk data available</div>;

  return (
    <div className="risk-monitor">
      <div className="risk-header">
        <h2>Risk Analysis</h2>
        <span className={`risk-badge ${riskMetrics.overallRisk.toLowerCase()}`}>
          {riskMetrics.overallRisk} RISK
        </span>
      </div>

      <div className="risk-metrics">
        <div className="metric-card">
          <h3>Rug Pull Risk</h3>
          <div className="risk-gauge">
            <div 
              className="risk-level"
              style={{ width: `${riskMetrics.rugPullRisk}%` }}
            />
          </div>
          <span>{riskMetrics.rugPullRisk}%</span>
        </div>

        <div className="metric-card">
          <h3>Liquidity Concentration</h3>
          <div className="risk-gauge">
            <div 
              className="risk-level"
              style={{ width: `${riskMetrics.liquidityConcentration}%` }}
            />
          </div>
          <span>{riskMetrics.liquidityConcentration}%</span>
        </div>

        <div className="metric-card">
          <h3>Ownership Risk</h3>
          <div className="risk-gauge">
            <div 
              className="risk-level"
              style={{ width: `${riskMetrics.ownershipRisk}%` }}
            />
          </div>
          <span>{riskMetrics.ownershipRisk}%</span>
        </div>

        <div className="metric-card">
          <h3>Trading Volatility</h3>
          <div className="risk-gauge">
            <div 
              className="risk-level"
              style={{ width: `${riskMetrics.tradingVolatility}%` }}
            />
          </div>
          <span>{riskMetrics.tradingVolatility}%</span>
        </div>
      </div>

      <div className="liquidity-events">
        <h3>Liquidity Events</h3>
        <LineChart
          data={liquidityEvents.map(event => ({
            x: new Date(event.timestamp * 1000),
            y: parseFloat(event.amount)
          }))}
          xAxis="Time"
          yAxis="Liquidity"
          color={liquidityEvents[0]?.type === 'ADD' ? '#10b981' : '#ef4444'}
        />
      </div>
    </div>
  );
} 