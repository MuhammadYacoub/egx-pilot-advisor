
import { useState, useEffect, useCallback } from 'react';

// Types
export interface StockData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose: number;
}

export interface QuoteData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  eps?: number;
}

export interface MarketStats {
  totalHistoricalRecords: number;
  uniqueSymbols: number;
  marketCacheEntries: number;
  dateRange: {
    oldest: string;
    newest: string;
  };
  symbolStats: Array<{
    symbol: string;
    recordCount: number;
  }>;
}

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Market Data Hook
export const useMarketData = () => {
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Get market statistics
  const getMarketStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/market/stats`);
      if (!response.ok) throw new Error('Failed to fetch market stats');
      const data = await response.json();
      setStats(data.data);
      setIsConnected(true);
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsConnected(false);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get historical data for a symbol
  const getHistoricalData = useCallback(async (
    symbol: string, 
    period: string = '1y', 
    source: 'db' | 'yahoo' = 'db'
  ): Promise<StockData[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/market/historical/${symbol}?period=${period}&source=${source}`
      );
      if (!response.ok) throw new Error(`Failed to fetch data for ${symbol}`);
      const data = await response.json();
      return data.data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get current quote for a symbol
  const getQuote = useCallback(async (symbol: string): Promise<QuoteData> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/market/quote/${symbol}`);
      if (!response.ok) throw new Error(`Failed to fetch quote for ${symbol}`);
      const data = await response.json();
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search symbols
  const searchSymbols = useCallback(async (query: string, limit: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/market/search?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      if (!response.ok) throw new Error('Failed to search symbols');
      const data = await response.json();
      return data.data.results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get top movers
  const getTopMovers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/market/top-movers`);
      if (!response.ok) throw new Error('Failed to fetch top movers');
      const data = await response.json();
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    getMarketStats().catch(console.error);
  }, [getMarketStats]);

  return {
    // State
    stats,
    loading,
    error,
    isConnected,
    
    // Methods
    getMarketStats,
    getHistoricalData,
    getQuote,
    searchSymbols,
    getTopMovers,
    
    // Helpers
    clearError: () => setError(null)
  };
};

// Stock Price Hook
export const useStockPrice = (symbol: string, autoRefresh: boolean = false) => {
  const [data, setData] = useState<StockData[]>([]);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getHistoricalData, getQuote } = useMarketData();

  const loadData = useCallback(async () => {
    if (!symbol) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Load historical data and current quote in parallel
      const [historicalData, quoteData] = await Promise.allSettled([
        getHistoricalData(symbol),
        getQuote(symbol)
      ]);

      if (historicalData.status === 'fulfilled') {
        setData(historicalData.value);
      } else {
        console.warn('Failed to load historical data:', historicalData.reason);
      }

      if (quoteData.status === 'fulfilled') {
        setQuote(quoteData.value);
      } else {
        console.warn('Failed to load quote:', quoteData.reason);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [symbol, getHistoricalData, getQuote]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [loadData, autoRefresh]);

  // Load data when symbol changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    quote,
    loading,
    error,
    refresh: loadData,
    clearError: () => setError(null)
  };
};
