'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OrganizationItem } from '@/types/filesystem';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';

interface ChartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: OrganizationItem | null;
}

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface ChartData {
  data: CandleData[];
}

export function ChartDialog({ open, onOpenChange, token }: ChartDialogProps) {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<string>('3600'); // Default to 1 hour
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const timeframes = [
    { value: '300', label: '5m' },
    { value: '900', label: '15m' },
    { value: '3600', label: '1h' },
    { value: '14400', label: '4h' },
    { value: '86400', label: '1d' },
    { value: '604800', label: '1w' },
  ];

  useEffect(() => {
    if (open && token?.token) {
      fetchChartData();
    }
  }, [open, token, timeframe]);

  const fetchChartData = async () => {
    if (!token?.token || !token.chainId) return;

    setLoading(true);
    setError(null);

    try {
      // For native ETH, use zero address, for tokens use their contract address
      const token0 = token.token.address === '0x0000000000000000000000000000000000000000' 
        ? '0x0000000000000000000000000000000000000000' 
        : token.token.address;
      
      // Use USDC as the quote token for most chains
      const usdcAddresses: { [key: number]: string } = {
        1: '0xA0b86a33E6441d43b72F3C6F0fb9e7E3bD8f6b78', // Ethereum USDC
        8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
        42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum USDC
        137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // Polygon USDC
      };

      const token1 = usdcAddresses[token.chainId] || usdcAddresses[1]; // Fallback to Ethereum USDC

      const response = await fetch(
        `/api/chart?token0=${token0}&token1=${token1}&seconds=${timeframe}&chainId=${token.chainId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }

      const data = await response.json();
      setChartData(data);
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError('Failed to load chart data. This token may not have sufficient trading data.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCurrentPrice = () => {
    if (!chartData?.data || chartData.data.length === 0) return null;
    return chartData.data[chartData.data.length - 1].close;
  };

  const getPriceChange = () => {
    if (!chartData?.data || chartData.data.length < 2) return null;
    const latest = chartData.data[chartData.data.length - 1].close;
    const previous = chartData.data[0].open;
    const change = ((latest - previous) / previous) * 100;
    return change;
  };

  // Candlestick Chart Component
  const CandlestickChart = ({ data }: { data: CandleData[] }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      if (!canvasRef.current || !data.length) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      const width = rect.width;
      const height = rect.height;
      const padding = { top: 20, right: 80, bottom: 40, left: 60 };
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      // Clear canvas with dark background
      ctx.fillStyle = '#1f2937'; // Dark gray background
      ctx.fillRect(0, 0, width, height);

      // Calculate price range
      const prices = data.flatMap(d => [d.high, d.low, d.open, d.close]);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceRange = maxPrice - minPrice;
      const paddedMin = minPrice - priceRange * 0.1;
      const paddedMax = maxPrice + priceRange * 0.1;
      const paddedRange = paddedMax - paddedMin;

      // Helper functions
      const xScale = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth;
      const yScale = (price: number) => padding.top + (1 - (price - paddedMin) / paddedRange) * chartHeight;

      // Draw grid lines
      ctx.strokeStyle = '#374151'; // Darker grid lines for dark theme
      ctx.lineWidth = 1;

      // Horizontal grid lines (price levels)
      const priceSteps = 5;
      for (let i = 0; i <= priceSteps; i++) {
        const price = paddedMin + (paddedRange * i) / priceSteps;
        const y = yScale(price);
        
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartWidth, y);
        ctx.stroke();

        // Price labels
        ctx.fillStyle = '#d1d5db'; // Light text for dark theme
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(formatPrice(price), padding.left - 10, y + 4);
      }

      // Vertical grid lines (time)
      const timeSteps = Math.min(5, data.length - 1);
      for (let i = 0; i <= timeSteps; i++) {
        const index = Math.floor((i / timeSteps) * (data.length - 1));
        const x = xScale(index);
        
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, padding.top + chartHeight);
        ctx.stroke();

        // Time labels
        if (data[index]) {
          ctx.fillStyle = '#d1d5db'; // Light text for dark theme
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          const timeLabel = new Date(data[index].time * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          });
          ctx.fillText(timeLabel, x, padding.top + chartHeight + 20);
        }
      }

      // Draw candlesticks
      const candleWidth = Math.max(2, chartWidth / data.length * 0.6);
      
      data.forEach((candle, index) => {
        const x = xScale(index);
        const openY = yScale(candle.open);
        const closeY = yScale(candle.close);
        const highY = yScale(candle.high);
        const lowY = yScale(candle.low);

        const isGreen = candle.close >= candle.open;
        const bodyColor = isGreen ? '#22c55e' : '#ef4444'; // Brighter colors for dark theme
        const wickColor = isGreen ? '#16a34a' : '#dc2626';

        // Draw wick (high-low line)
        ctx.strokeStyle = wickColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Draw body (open-close rectangle)
        ctx.fillStyle = bodyColor;
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.abs(closeY - openY);
        
        if (bodyHeight < 1) {
          // If body is too small, draw a line
          ctx.strokeStyle = bodyColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x - candleWidth / 2, openY);
          ctx.lineTo(x + candleWidth / 2, openY);
          ctx.stroke();
        } else {
          ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
        }
      });

      // Draw chart border
      ctx.strokeStyle = '#4b5563'; // Lighter border for dark theme
      ctx.lineWidth = 1;
      ctx.strokeRect(padding.left, padding.top, chartWidth, chartHeight);

    }, [data]);

    return (
      <canvas
        ref={canvasRef}
        className="w-full h-[400px] cursor-crosshair"
        style={{ width: '100%', height: '400px' }}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {token?.token?.name} ({token?.token?.symbol}) Chart
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Price Info */}
          {!loading && chartData && (
            <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Current Price</p>
                <p className="text-2xl font-bold">
                  {getCurrentPrice() ? formatPrice(getCurrentPrice()!) : 'N/A'}
                </p>
              </div>
              {getPriceChange() !== null && (
                <div className="flex items-center gap-1">
                  {getPriceChange()! >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      getPriceChange()! >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {getPriceChange()!.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Timeframe Selector */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {timeframes.map((tf) => (
                <Button
                  key={tf.value}
                  variant={timeframe === tf.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeframe(tf.value)}
                  disabled={loading}
                >
                  {tf.label}
                </Button>
              ))}
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex gap-1 border rounded-md p-1">
              <Button
                variant={viewMode === 'chart' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('chart')}
                className="h-8"
              >
                Chart
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="h-8"
              >
                Table
              </Button>
            </div>
          </div>

          {/* Chart Area */}
          <div className="min-h-[400px] border rounded-lg p-4">
            {loading ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Loading chart data...</span>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center">
                  <p className="text-red-500 mb-2">{error}</p>
                  <Button onClick={fetchChartData} variant="outline">
                    Retry
                  </Button>
                </div>
              </div>
            ) : chartData?.data && chartData.data.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    {viewMode === 'chart' ? 'Price Chart' : 'Price Data'}
                  </h3>
                </div>
                
                {viewMode === 'chart' ? (
                  <>
                    {/* Candlestick Chart */}
                    <div className="border rounded-lg bg-gray-900 border-gray-700">
                      <CandlestickChart data={chartData.data} />
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-4 gap-4 p-4 bg-gray-800 rounded-lg text-sm border border-gray-700">
                      <div>
                        <p className="text-gray-400">24h High</p>
                        <p className="font-medium text-green-400">
                          {formatPrice(Math.max(...chartData.data.slice(-24).map(d => d.high)))}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">24h Low</p>
                        <p className="font-medium text-red-400">
                          {formatPrice(Math.min(...chartData.data.slice(-24).map(d => d.low)))}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Volume</p>
                        <p className="font-medium text-gray-200">{chartData.data.length} periods</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Volatility</p>
                        <p className="font-medium text-gray-200">
                          {((Math.max(...chartData.data.map(d => d.high)) - Math.min(...chartData.data.map(d => d.low))) / 
                            Math.min(...chartData.data.map(d => d.low)) * 100).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Table View */
                  <div className="overflow-x-auto bg-gray-900 rounded-lg border border-gray-700">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700 bg-gray-800">
                          <th className="text-left p-3 text-gray-300 font-medium">Time</th>
                          <th className="text-right p-3 text-gray-300 font-medium">Open</th>
                          <th className="text-right p-3 text-gray-300 font-medium">High</th>
                          <th className="text-right p-3 text-gray-300 font-medium">Low</th>
                          <th className="text-right p-3 text-gray-300 font-medium">Close</th>
                          <th className="text-right p-3 text-gray-300 font-medium">Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chartData.data.slice(-20).reverse().map((candle, index) => {
                          const change = ((candle.close - candle.open) / candle.open) * 100;
                          return (
                            <tr key={index} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                              <td className="p-3 text-gray-300">{formatTime(candle.time)}</td>
                              <td className="text-right p-3 text-gray-200">{formatPrice(candle.open)}</td>
                              <td className="text-right p-3 text-green-400">{formatPrice(candle.high)}</td>
                              <td className="text-right p-3 text-red-400">{formatPrice(candle.low)}</td>
                              <td className="text-right p-3 font-medium text-gray-100">{formatPrice(candle.close)}</td>
                              <td className={`text-right p-3 font-medium ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {chartData.data.length > 20 && (
                      <p className="text-xs text-gray-500 text-center mt-2 pb-3">
                        Showing last 20 periods of {chartData.data.length} total
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <p className="text-muted-foreground">No chart data available</p>
              </div>
            )}
          </div>

          {/* Token Info */}
          {token?.token && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-secondary rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="font-medium">{token.token.balance} {token.token.symbol}</p>
              </div>
              {token.token.value && (
                <div>
                  <p className="text-sm text-muted-foreground">Portfolio Value</p>
                  <p className="font-medium text-primary">{token.token.value}</p>
                </div>
              )}
              {token.token.address && token.token.address !== '0x0000000000000000000000000000000000000000' && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Contract Address</p>
                  <p className="font-mono text-xs break-all">{token.token.address}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
