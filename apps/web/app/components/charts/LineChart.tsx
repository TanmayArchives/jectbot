import { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

interface LineChartProps {
  data: { x: Date; y: number }[];
  xAxis: string;
  yAxis: string;
  color?: string;
}

export function LineChart({ data, xAxis, yAxis, color = '#3b82f6' }: LineChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    Chart.register(...registerables);

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        datasets: [
          {
            data: data.map(point => ({
              x: point.x,
              y: point.y
            })),
            borderColor: color,
            backgroundColor: `${color}33`,
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'hour'
            },
            title: {
              display: true,
              text: xAxis
            }
          },
          y: {
            title: {
              display: true,
              text: yAxis
            },
            beginAtZero: true
          }
        },
        plugins: {
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) => {
                return `${yAxis}: ${context.parsed.y.toLocaleString()}`;
              }
            }
          },
          legend: {
            display: false
          }
        }
      }
    };

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, xAxis, yAxis, color]);

  return (
    <div className="chart-container">
      <canvas ref={chartRef} />
    </div>
  );
} 