'use client'
import React, { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import type { CryptoAsset, TimeRange, ChartData } from '@/types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const CRYPTO_IDS = ['bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana', 'ripple']
const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '90d', value: '90d' },
  { label: '1y', value: '1y' },
  { label: 'All', value: 'all' },
]

export function CryptoTracker() {
  const [assets, setAssets] = useState<CryptoAsset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<string>('bitcoin')
  const [timeRange, setTimeRange] = useState<TimeRange>('24h')
  const [chartData, setChartData] = useState<ChartData>({ timestamps: [], prices: [] })

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${CRYPTO_IDS.join(',')}&order=market_cap_desc&sparkline=false`
        )
        const data = await response.json()
        setAssets(data)
      } catch (error) {
        console.error('Error fetching crypto assets:', error)
      }
    }

    const interval = setInterval(fetchAssets, 30000) // Update every 30 seconds
    fetchAssets()

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const days = timeRange === '24h' ? 1 : 
                    timeRange === '7d' ? 7 :
                    timeRange === '30d' ? 30 :
                    timeRange === '90d' ? 90 :
                    timeRange === '1y' ? 365 : 'max'
        
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${selectedAsset}/market_chart?vs_currency=usd&days=${days}`
        )
        const data = await response.json()
        
        setChartData({
          timestamps: data.prices.map((price: [number, number]) => 
            new Date(price[0]).toLocaleDateString()
          ),
          prices: data.prices.map((price: [number, number]) => price[1])
        })
      } catch (error) {
        console.error('Error fetching chart data:', error)
      }
    }

    fetchChartData()
  }, [selectedAsset, timeRange])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => (
          <button
            key={asset.id}
            onClick={() => setSelectedAsset(asset.id)}
            className={`
              p-4 rounded-lg border transition-colors
              ${
                selectedAsset === asset.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-800 hover:border-gray-700 bg-gray-800/50'
              }
            `}
          >
            <div className="flex items-center space-x-3">
              <img src={asset.image} alt={asset.name} className="w-8 h-8" />
              <div className="flex-1 text-left">
                <h3 className="font-medium">{asset.name}</h3>
                <p className="text-sm text-gray-400">{asset.symbol.toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">${asset.current_price.toLocaleString()}</p>
                <p className={`text-sm ${
                  asset.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {asset.price_change_percentage_24h.toFixed(2)}%
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
                label: assets.find(a => a.id === selectedAsset)?.name || selectedAsset,
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