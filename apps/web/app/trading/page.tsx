"use client";
import { TradingInterface } from '../components/trading/TradingInterface';
import { PriceChart } from '../components/trading/PriceChart';

export default function TradingPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Trading</h1>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="card">
          <TradingInterface />
        </div>
        <div className="card">
          <PriceChart tokenAddress="" />
        </div>
      </div>
    </div>
  );
} 