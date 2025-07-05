import { useCallback, useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface QuoteData {
  symbol: string;
  companyName: string;
  currentPrice: number;
  previousClose: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  lastUpdated: string;
}

interface TechnicalAnalysis {
  rsi: number;
  macd: number;
  sma20: number;
  sma50: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  strength: number;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

interface UseDashboardDataReturn {
  // Current data
  currentQuote: QuoteData | null;
  technicalData: TechnicalAnalysis | null;
  
  // State
  loading: boolean;
  error: string | null;
  
  // Actions
  selectSymbol: (symbol: string) => Promise<void>;
  refreshData: () => Promise<void>;
  
  // Current symbol
  selectedSymbol: string;
}

export const useDashboardData = (defaultSymbol: string = '^CASE30'): UseDashboardDataReturn => {
  const [selectedSymbol, setSelectedSymbol] = useState(defaultSymbol);
  const [currentQuote, setCurrentQuote] = useState<QuoteData | null>(null);
  const [technicalData, setTechnicalData] = useState<TechnicalAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate basic technical indicators from historical data
  const calculateTechnicalIndicators = useCallback(async (symbol: string, currentPrice: number): Promise<TechnicalAnalysis> => {
    try {
      // Get historical data for calculations
      const historicalResponse = await fetch(`${API_BASE_URL}/market/historical/${symbol}?period=3mo`);
      if (!historicalResponse.ok) throw new Error('Failed to fetch historical data');
      
      const historicalData = await historicalResponse.json();
      const prices = historicalData.data || [];
      
      if (prices.length < 20) {
        // Not enough data for full analysis, return basic mock data
        return {
          rsi: 50 + Math.random() * 20, // 50-70 range
          macd: Math.random() * 100 - 50, // -50 to 50
          sma20: currentPrice * (0.98 + Math.random() * 0.04), // ±2%
          sma50: currentPrice * (0.95 + Math.random() * 0.1), // ±5%
          signal: currentPrice > (currentPrice * 0.98) ? 'BUY' : 'HOLD',
          strength: 0.6 + Math.random() * 0.3, // 60-90%
          trend: 'NEUTRAL'
        };
      }

      // Calculate RSI (simplified)
      const closePrices = prices.slice(-14).map((p: any) => p.close);
      let gains = 0, losses = 0;
      for (let i = 1; i < closePrices.length; i++) {
        const change = closePrices[i] - closePrices[i - 1];
        if (change > 0) gains += change;
        else losses += Math.abs(change);
      }
      const avgGain = gains / 13;
      const avgLoss = losses / 13;
      const rs = avgGain / (avgLoss || 1);
      const rsi = 100 - (100 / (1 + rs));

      // Calculate SMAs
      const sma20 = prices.slice(-20).reduce((sum: number, p: any) => sum + p.close, 0) / 20;
      const sma50 = prices.slice(-50).reduce((sum: number, p: any) => sum + p.close, 0) / Math.min(50, prices.length);

      // Calculate MACD (simplified)
      const ema12 = prices.slice(-12).reduce((sum: number, p: any) => sum + p.close, 0) / 12;
      const ema26 = prices.slice(-26).reduce((sum: number, p: any) => sum + p.close, 0) / Math.min(26, prices.length);
      const macd = ema12 - ema26;

      // Determine signal
      let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
      let strength = 0.5;
      let trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';

      // Signal logic
      if (currentPrice > sma20 && macd > 0 && rsi < 70) {
        signal = 'BUY';
        strength = 0.7 + (Math.min(rsi, 70) / 100) * 0.3;
        trend = 'BULLISH';
      } else if (currentPrice < sma20 && macd < 0 && rsi > 30) {
        signal = 'SELL';
        strength = 0.6 + ((100 - Math.max(rsi, 30)) / 100) * 0.3;
        trend = 'BEARISH';
      } else {
        strength = 0.5 + Math.abs(rsi - 50) / 100;
        if (currentPrice > sma50) trend = 'BULLISH';
        else if (currentPrice < sma50) trend = 'BEARISH';
      }

      return {
        rsi: Math.round(rsi * 10) / 10,
        macd: Math.round(macd * 100) / 100,
        sma20: Math.round(sma20 * 100) / 100,
        sma50: Math.round(sma50 * 100) / 100,
        signal,
        strength: Math.round(strength * 100) / 100,
        trend
      };

    } catch (error) {
      console.error('Error calculating technical indicators:', error);
      // Return default values on error
      return {
        rsi: 50,
        macd: 0,
        sma20: currentPrice,
        sma50: currentPrice,
        signal: 'HOLD',
        strength: 0.5,
        trend: 'NEUTRAL'
      };
    }
  }, []);

  // Fetch quote data
  const fetchQuoteData = useCallback(async (symbol: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/market/quote/${symbol}`);
      if (!response.ok) throw new Error('فشل في جلب بيانات السهم');
      
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'خطأ في البيانات');
      
      setCurrentQuote(data.data);
      
      // Calculate technical indicators
      const technical = await calculateTechnicalIndicators(symbol, data.data.currentPrice);
      setTechnicalData(technical);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير متوقع';
      setError(errorMessage);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [calculateTechnicalIndicators]);

  // Select new symbol
  const selectSymbol = useCallback(async (symbol: string) => {
    setSelectedSymbol(symbol);
    await fetchQuoteData(symbol);
  }, [fetchQuoteData]);

  // Refresh current data
  const refreshData = useCallback(async () => {
    await fetchQuoteData(selectedSymbol);
  }, [fetchQuoteData, selectedSymbol]);

  // Load initial data
  useEffect(() => {
    fetchQuoteData(selectedSymbol);
  }, [fetchQuoteData, selectedSymbol]);

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        refreshData();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refreshData, loading]);

  return {
    currentQuote,
    technicalData,
    loading,
    error,
    selectSymbol,
    refreshData,
    selectedSymbol
  };
};
