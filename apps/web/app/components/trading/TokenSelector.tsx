import { useState } from 'react';
import { useWeb3 } from '../../hooks/useWeb3';

interface TokenSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export function TokenSelector({ value, onChange, label }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { web3Service } = useWeb3();

  const commonTokens = [
    { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH' },
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC' },
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT' },
  ];

  const handleSelect = async (address: string) => {
    try {
      // Verify token before selection
      const security = await web3Service.security.scanToken(address);
      if (security.isHoneypot) {
        window.alert('Warning: This token appears to be a honeypot!');
        return;
      }
      onChange(address);
      setIsOpen(false);
    } catch (error) {
      console.error('Error selecting token:', error);
    }
  };

  return (
    <div className="token-selector">
      <label>{label}</label>
      <div className="token-input" onClick={() => setIsOpen(true)}>
        {value ? value.slice(0, 6) + '...' + value.slice(-4) : 'Select Token'}
      </div>

      {isOpen && (
        <div className="token-modal">
          <div className="token-search">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search token address..."
            />
          </div>

          <div className="token-list">
            {commonTokens.map(token => (
              <div
                key={token.address}
                className="token-item"
                onClick={() => handleSelect(token.address)}
              >
                <span>{token.symbol}</span>
                <span className="token-address">
                  {token.address.slice(0, 6)}...{token.address.slice(-4)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 