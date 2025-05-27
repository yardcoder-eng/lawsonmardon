import { Tabs } from '@/components/Tabs'
import { CryptoTracker } from '@/components/CryptoTracker'
import { StockTracker } from '@/components/StockTracker'

export default function Home() {
  return (
    <div className="space-y-8">
      <Tabs 
        tabs={[
          { id: 'crypto', label: 'Cryptocurrencies', content: <CryptoTracker /> },
          { id: 'stocks', label: 'Stocks', content: <StockTracker /> },
        ]} 
      />
    </div>
  )
} 