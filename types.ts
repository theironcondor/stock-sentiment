export interface SentimentPoint {
  date: string;
  score: number; // -100 to 100
}

export interface Source {
  title: string;
  url: string;
  domain: string;
}

export interface PlatformSentiment {
  twitter: number; // -100 to 100
  reddit: number;  // -100 to 100
  news: number;    // -100 to 100
}

export interface StockSentiment {
  symbol: string;
  name: string;
  currentScore: number;
  change24h: number;
  change90d: number;
  rankChange: number; // Positions moved in ranking
  volume: number; // Social media mention volume
  description: string; // Brief reason for sentiment
  history: number[]; // Array of scores for last 60-90 days
  sources: Source[]; // Real-world citations
  platformBreakdown: PlatformSentiment; // Specific sentiment per channel
}

export interface MarketAnalysis {
  topPositive: StockSentiment[];
  topNegative: StockSentiment[];
  timestamp: string;
}

export enum TimeRange {
  DAYS_30 = '30D',
  DAYS_60 = '60D',
  DAYS_90 = '90D'
}