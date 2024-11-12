import { useState, useEffect } from 'react';
import { useWeb3 } from '../../hooks/useWeb3';
import { useWebSocket } from '../../hooks/useWebSocket';

interface PoolInfo {
  address: string;
  token0: string;
  token1: string;
  reserve0: string;
  reserve1: string;
  tvl: string;
  apr: string;
  volume24h: string;
}

interface FarmingPosition {
  protocol: string;
  poolAddress: string;
  staked: string;
  rewards: string;
  apr: string;
  value: string;
}

export function DeFiMonitor({ walletAddress }: { walletAddress: string }) {
  const [watchedPools, setWatchedPools] = useState<PoolInfo[]>([]);
  const [positions, setPositions] = useState<FarmingPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const { web3Service } = useWeb3();
  const ws = useWebSocket();

  useEffect(() => {
    fetchData();
    setupWebSocket();
    return () => cleanup();
  }, [walletAddress]);

  const fetchData = async () => {
    try {
      const [poolsData, positionsData] = await Promise.all([
        fetchWatchedPools(),
        fetchFarmingPositions()
      ]);
      setWatchedPools(poolsData);
      setPositions(positionsData);
    } catch (error) {
      console.error('Error fetching DeFi data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWatchedPools = async () => {
    // Implementation to fetch watched pools
    return [];
  };

  const fetchFarmingPositions = async () => {
    const positions = await web3Service.defi.getYieldFarmingPositions(walletAddress);
    return positions;
  };

  const setupWebSocket = () => {
    ws.subscribe('defi', { walletAddress });
    ws.on((data) => {
      if (data.channel === 'defi') {
        handleWebSocketUpdate(data);
      }
    });
  };

  const handleWebSocketUpdate = (data: any) => {
    switch (data.type) {
      case 'pool_update':
        updatePool(data.pool);
        break;
      case 'position_update':
        updatePosition(data.position);
        break;
      case 'tvl_alert':
        handleTVLAlert(data);
        break;
    }
  };

  const updatePool = (updatedPool: PoolInfo) => {
    setWatchedPools(current =>
      current.map(pool =>
        pool.address === updatedPool.address ? updatedPool : pool
      )
    );
  };

  const updatePosition = (updatedPosition: FarmingPosition) => {
    setPositions(current =>
      current.map(pos =>
        pos.poolAddress === updatedPosition.poolAddress ? updatedPosition : pos
      )
    );
  };

  const handleTVLAlert = (alert: any) => {
    // Implementation for TVL alerts
  };

  const cleanup = () => {
    ws.unsubscribe('defi', { walletAddress });
  };

  if (loading) return <div>Loading DeFi data...</div>;

  return (
    <div className="defi-monitor">
      <section className="watched-pools">
        <h2>Watched Pools</h2>
        <div className="pools-grid">
          {watchedPools.map(pool => (
            <div key={pool.address} className="pool-card">
              <div className="pool-header">
                <span>{pool.token0}/{pool.token1}</span>
                <span className="pool-address">{pool.address}</span>
              </div>
              <div className="pool-stats">
                <div className="stat">
                  <span>TVL</span>
                  <span>${pool.tvl}</span>
                </div>
                <div className="stat">
                  <span>APR</span>
                  <span>{pool.apr}%</span>
                </div>
                <div className="stat">
                  <span>24h Volume</span>
                  <span>${pool.volume24h}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="farming-positions">
        <h2>Your Farming Positions</h2>
        <div className="positions-grid">
          {positions.map((position, index) => (
            <div key={index} className="position-card">
              <div className="position-header">
                <span>{position.protocol}</span>
                <span className="position-address">{position.poolAddress}</span>
              </div>
              <div className="position-stats">
                <div className="stat">
                  <span>Staked</span>
                  <span>{position.staked}</span>
                </div>
                <div className="stat">
                  <span>Rewards</span>
                  <span>{position.rewards}</span>
                </div>
                <div className="stat">
                  <span>APR</span>
                  <span>{position.apr}%</span>
                </div>
                <div className="stat">
                  <span>Value</span>
                  <span>${position.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
} 