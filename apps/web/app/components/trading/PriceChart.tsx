import { useEffect, useRef } from 'react';
import { WebSocketService } from '@repo/web3/services/WebSocketService';

interface PriceChartProps {
  tokenAddress: string;
}

export function PriceChart({ tokenAddress }: PriceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocketService | null>(null);

  useEffect(() => {
    if (!tokenAddress) return;

    wsRef.current = new WebSocketService('wss://your-websocket-url');
    
    wsRef.current.subscribe('price', { token: tokenAddress });
    
    wsRef.current.on('message', (data: any) => {
      if (data.type === 'price' && data.token === tokenAddress) {
        updateChart(data.price);
      }
    });

    return () => {
      wsRef.current?.close();
    };
  }, [tokenAddress]);

  const updateChart = (price: number) => {
    const canvas = chartRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Implement chart drawing logic here
    // You might want to use a charting library like Chart.js
  };

  return (
    <div className="price-chart">
      <h3>Price Chart</h3>
      <canvas ref={chartRef} width={600} height={400} />
    </div>
  );
} 