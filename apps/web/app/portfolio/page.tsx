"use client";
import { PortfolioOverview } from '../components/portfolio/PortfolioOverview';
import { DeFiMonitor } from '../components/defi/DeFiMonitor';

export default function PortfolioPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Portfolio</h1>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="card">
          <PortfolioOverview walletAddress="your_wallet_address" />
        </div>
        <div className="card">
          <DeFiMonitor walletAddress="your_wallet_address" />
        </div>
      </div>
    </div>
  );
} 