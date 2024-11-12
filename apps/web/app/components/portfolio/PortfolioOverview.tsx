import { useState, useEffect } from 'react';
import { useWeb3 } from '../../hooks/useWeb3';
import { useWebSocket } from '../../hooks/useWebSocket';

interface PortfolioStats {
  totalValue: string;
  change24h: string;
  tokens: TokenBalance[];
  defiPositions: any[];
}

interface TokenBalance {
  token: string;
  balance: string;
  value: string;
  price: string;
  change24h: string;
}

export function PortfolioOverview({ walletAddress }: { walletAddress: string }) {
  const [portfolio, setPortfolio] = useState<PortfolioStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { web3Service } = useWeb3();
  const ws = useWebSocket();

  useEffect(() => {
    fetchPortfolio();
    subscribeToUpdates();

    return () => {
      ws.unsubscribe('portfolio', { walletAddress });
    };
  }, [walletAddress]);

  const fetchPortfolio = async () => {
    try {
      const data = await web3Service.portfolio.getPortfolio(walletAddress);
      setPortfolio(data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    ws.subscribe('portfolio', { walletAddress });
    ws.on('message', (data: any) => {
      if (data.channel === 'portfolio' && data.data.walletAddress === walletAddress) {
        setPortfolio(data.data.portfolio);
      }
    });
  };

  if (loading) return <div>Loading portfolio...</div>;
  if (!portfolio) return <div>No portfolio data available</div>;

  return (
    <div className="portfolio-overview">
      <div className="portfolio-header">
        <h2>Portfolio Overview</h2>
        <div className="portfolio-stats">
          <div className="stat">
            <span>Total Value</span>
            <span className="value">${portfolio.totalValue}</span>
          </div>
          <div className="stat">
            <span>24h Change</span>
            <span className={`value ${parseFloat(portfolio.change24h) >= 0 ? 'positive' : 'negative'}`}>
              {portfolio.change24h}%
            </span>
          </div>
        </div>
      </div>

      <div className="token-holdings">
        <h3>Token Holdings</h3>
        <div className="token-list">
          {portfolio.tokens.map(token => (
            <div key={token.token} className="token-item">
              <div className="token-info">
                <span className="token-name">{token.token}</span>
                <span className="token-balance">{token.balance}</span>
              </div>
              <div className="token-value">
                <span>${token.value}</span>
                <span className={`change ${parseFloat(token.change24h) >= 0 ? 'positive' : 'negative'}`}>
                  {token.change24h}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="defi-positions">
        <h3>DeFi Positions</h3>
        <div className="positions-list">
          {portfolio.defiPositions.map((position, index) => (
            <div key={index} className="position-item">
              <div className="position-header">
                <span>{position.protocol}</span>
                <span>{position.type}</span>
              </div>
              <div className="position-details">
                <div className="detail">
                  <span>Staked</span>
                  <span>{position.staked}</span>
                </div>
                <div className="detail">
                  <span>Rewards</span>
                  <span>{position.rewards}</span>
                </div>
                <div className="detail">
                  <span>APR</span>
                  <span>{position.apr}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 