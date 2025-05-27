export type TimeRange = '24h' | '7d' | '30d' | '90d' | '1y' | 'all';

export interface CryptoAsset {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    price_change_percentage_24h: number;
    market_cap: number;
    image: string;
}

export interface StockAsset {
    symbol: string;
    name: string;
    price: number;
    change_percent: number;
    market_cap: number;
}

export interface ChartData {
    timestamps: string[];
    prices: number[];
} 