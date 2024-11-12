import { useState, useEffect } from 'react';
import { useWeb3 } from '../hooks/useWeb3';

interface Token {
  address: string;
  symbol: string;
  price: string;
  change24h: string;
}

export function TokenList() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const { web3Service } = useWeb3();

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const response = await fetch('/api/tokens/trending');
      const data = await response.json();
      setTokens(data);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading tokens...</div>;

  return (
    <div className="token-list">
      <h2>Trending Tokens</h2>
      <div className="token-grid">
        {tokens.map(token => (
          <div key={token.address} className="token-card">
            <div className="token-info">
              <span className="token-symbol">{token.symbol}</span>
              <span className="token-address">
                {token.address.slice(0, 6)}...{token.address.slice(-4)}
              </span>
            </div>
            <div className="token-metrics">
              <span className="token-price">${token.price}</span>
              <span className={`token-change ${parseFloat(token.change24h) >= 0 ? 'positive' : 'negative'}`}>
                {token.change24h}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 