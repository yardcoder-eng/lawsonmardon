import { FC } from 'react'

declare module 'react-chartjs-2' {
  import { ChartProps } from 'chart.js'
  export const Line: FC<ChartProps>
}

declare module 'chart.js' {
  interface ChartProps {
    data: any
    options?: any
  }
}

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY: string
  }
} 
