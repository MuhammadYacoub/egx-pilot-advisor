// API Configuration and Types
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  createdAt: string;
  updatedAt: string;
}

// Portfolio Types
export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  portfolioType: 'paper' | 'real';
  initialCapital: number;
  currentValue: number;
  cashBalance: number;
  totalPnl: number;
  dailyPnl: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  stats?: {
    totalMarketValue: number;
    totalUnrealizedPnl: number;
    returnPercentage: number;
    positionsCount: number;
    transactionsCount: number;
    allocation: Array<{
      symbol: string;
      marketValue: number;
      percentage: number;
    }>;
  };
  positions?: Position[];
}

// Position Types
export interface Position {
  id: string;
  symbol: string;
  companyName: string;
  quantity: number;
  avgCost: number;
  currentPrice?: number;
  marketValue?: number;
  unrealizedPnl?: number;
  realizedPnl: number;
  sector?: string;
  purchaseDate: string;
}

// Transaction Types
export interface Transaction {
  id: string;
  symbol: string;
  transactionType: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  commission: number;
  totalAmount: number;
  transactionDate: string;
}

// Market Data Types
export interface MarketQuote {
  symbol: string;
  companyName: string;
  currentPrice: number;
  changePercent: number;
  previousClose: number;
  marketCap?: number;
  volume?: number;
  sector?: string;
  timestamp: string;
}

// Performance Report Types
export interface PerformanceReport {
  period: string;
  summary: {
    initialCapital: number;
    currentValue: number;
    totalInvested: number;
    totalWithdrawn: number;
    totalPnl: number;
    totalPnlPercent: number;
    unrealizedPnl: number;
    realizedPnl: number;
    cashBalance: number;
  };
  performance: {
    topPerformers: Array<{
      symbol: string;
      companyName: string;
      pnl: number;
      pnlPercent: number;
    }>;
    worstPerformers: Array<{
      symbol: string;
      companyName: string;
      pnl: number;
      pnlPercent: number;
    }>;
    sectorAllocation: Array<{
      sector: string;
      value: number;
      percentage: number;
    }>;
  };
  transactions: {
    total: number;
    buys: number;
    sells: number;
  };
}

// Form Types
export interface CreatePortfolioData {
  name: string;
  description?: string;
  portfolioType: 'paper' | 'real';
  initialCapital: number;
}

export interface UpdatePortfolioData {
  name?: string;
  description?: string;
}

export interface AddPositionData {
  symbol: string;
  quantity: number;
  price: number;
  transactionType: 'BUY' | 'SELL';
  commission?: number;
}

// Auth Types
export interface AuthResponse {
  user: User;
  token: string;
}

export interface TestUserData {
  email: string;
  name: string;
}
