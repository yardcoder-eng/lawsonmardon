'use client'
import React, { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import type { StockAsset, TimeRange, ChartData } from '@/types'

const STOCK_SYMBOLS = ['SPY', 'AAPL', 'AMZN', 'TSLA', 'MSFT', 'GOOGL', 'NVDA']
const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '90d', value: '90d' },
  { label: '1y', value: '1y' },
  { label: 'All', value: 'all' },
]

// Using environment variable for API key
const ALPHA_VANTAGE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY

// Add error state for API key
export function StockTracker() {
  const [assets, setAssets] = useState<StockAsset[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState<string>('SPY')
  const [timeRange, setTimeRange] = useState<TimeRange>('24h')
  const [chartData, setChartData] = useState<ChartData>({ timestamps: [], prices: [] })
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!ALPHA_VANTAGE_API_KEY) {
      setError('API key not found. Please check your environment variables.')
      return
    }
    const fetchStockData = async () => {
      try {
        const stockData = await Promise.all(
          STOCK_SYMBOLS.map(async (symbol) => {
            const response = await fetch(
              `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
            )
            const data = await response.json()
            const quote = data['Global Quote']
            
            return {
              symbol,
              name: symbol,
              price: parseFloat(quote['05. price']),
              change_percent: parseFloat(quote['10. change percent'].replace('%', '')),
              market_cap: 0, // Alpha Vantage free tier doesn't provide market cap
            }
          })
        )
        setAssets(stockData)
      } catch (error) {
        console.error('Error fetching stock data:', error)
      }
    }

    const interval = setInterval(fetchStockData, 60000) // Update every minute
    fetchStockData()

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const interval = timeRange === '24h' ? '5min' :
                        timeRange === '7d' ? '30min' :
                        timeRange === '30d' ? 'daily' :
                        timeRange === '90d' ? 'daily' :
                        timeRange === '1y' ? 'weekly' : 'monthly'

        const response = await fetch(
          `https://www.alphavantage.co/query?function=TIME_SERIES_${interval.toUpperCase()}&symbol=${selectedSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        )
        const data = await response.json()
        const timeSeries = data[`Time Series (${interval})`]
        
        const timestamps = Object.keys(timeSeries).reverse()
        const prices = timestamps.map(timestamp => 
          parseFloat(timeSeries[timestamp]['4. close'])
        )

        setChartData({ timestamps, prices })
      } catch (error) {
        console.error('Error fetching chart data:', error)
      }
    }

    fetchChartData()
  }, [selectedSymbol, timeRange])

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => (
          <button
            key={asset.symbol}
            onClick={() => setSelectedSymbol(asset.symbol)}
            className={`
              p-4 rounded-lg border transition-colors
              ${
                selectedSymbol === asset.symbol
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-800 hover:border-gray-700 bg-gray-800/50'
              }
            `}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <h3 className="font-medium">{asset.name}</h3>
                <p className="text-sm text-gray-400">{asset.symbol}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">${asset.price.toLocaleString()}</p>
                <p className={`text-sm ${
                  asset.change_percent >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {asset.change_percent.toFixed(2)}%
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex space-x-2">
        {TIME_RANGES.map((range) => (
          <button
            key={range.value}
            onClick={() => setTimeRange(range.value)}
            className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${
                timeRange === range.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }
            `}
          >
            {range.label}
          </button>
        ))}
      </div>

      <div className="bg-gray-800/50 border border-gray-800 rounded-lg p-4">
        <Line
          data={{
            labels: chartData.timestamps,
            datasets: [
              {
                label: selectedSymbol,
                data: chartData.prices,
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.1,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
                labels: {
                  color: '#fff',
                },
              },
            },
            scales: {
              x: {
                grid: {
                  color: 'rgba(75, 85, 99, 0.2)',
                },
                ticks: {
                  color: '#9CA3AF',
                },
              },
              y: {
                grid: {
                  color: 'rgba(75, 85, 99, 0.2)',
                },
                ticks: {
                  color: '#9CA3AF',
                  callback: (value) => `$${value.toLocaleString()}`,
                },
              },
            },
          }}
        />
      </div>
    </div>
  )
} 
