import { useEffect, useState } from 'react';
import { useWeb3 } from '../../hooks/useWeb3';

interface SecurityInfoProps {
  tokenAddress: string;
}

interface SecurityData {
  hasSourceCode: boolean;
  liquidityScore: number;
  isHoneypot: boolean;
  ownershipRisk: string;
}

export function SecurityInfo({ tokenAddress }: SecurityInfoProps) {
  const [security, setSecurity] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(false);
  const { web3Service } = useWeb3();

  useEffect(() => {
    if (!tokenAddress) return;

    const checkSecurity = async () => {
      setLoading(true);
      try {
        const data = await web3Service.security.scanToken(tokenAddress);
        setSecurity(data);
      } catch (error) {
        console.error('Error scanning token:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSecurity();
  }, [tokenAddress]);

  if (loading) return <div>Scanning token security...</div>;
  if (!security) return null;

  return (
    <div className="security-info">
      <h3>Security Analysis</h3>
      <div className="security-details">
        <div className="security-row">
          <span>Verified Source Code</span>
          <span className={security.hasSourceCode ? 'success' : 'warning'}>
            {security.hasSourceCode ? '✓' : '✗'}
          </span>
        </div>
        <div className="security-row">
          <span>Liquidity Score</span>
          <span className={security.liquidityScore > 50 ? 'success' : 'warning'}>
            {security.liquidityScore}/100
          </span>
        </div>
        <div className="security-row">
          <span>Honeypot Check</span>
          <span className={!security.isHoneypot ? 'success' : 'error'}>
            {security.isHoneypot ? 'DANGER' : 'SAFE'}
          </span>
        </div>
        <div className="security-row">
          <span>Ownership Risk</span>
          <span className={security.ownershipRisk === 'LOW' ? 'success' : 'warning'}>
            {security.ownershipRisk}
          </span>
        </div>
      </div>
    </div>
  );
} 