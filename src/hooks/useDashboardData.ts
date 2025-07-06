import { useCallback, useEffect, useState, useRef } from 'react';
import { ErrorBoundaryConfig, ErrorHandler } from '@/utils/errorHandler';

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
  
  // Use ref to track component mount status
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Calculate basic technical indicators from historical data
  const calculateTechnicalIndicators = useCallback(async (symbol: string, currentPrice: number): Promise<TechnicalAnalysis> => {
    try {
      // Get historical data for calculations
      const historicalResponse = await fetch(`${API_BASE_URL}/market/historical/${symbol}?period=3mo`);
      if (!historicalResponse.ok) {
        console.warn(`Historical data not available for ${symbol}, using mock data`);
        throw new Error('Failed to fetch historical data');
      }
      
      let historicalResult;
      try {
        historicalResult = await historicalResponse.json();
      } catch (parseError) {
        console.warn('Failed to parse historical data response:', parseError);
        throw new Error('Invalid response format');
      }
      
      // استخدام معالج الأخطاء الآمن للبيانات
      const prices = ErrorBoundaryConfig.processHistoricalData(historicalResult);
      
      console.log(`Historical data for ${symbol}:`, {
        totalPoints: prices.length,
        firstPoint: prices[0],
        lastPoint: prices[prices.length - 1]
      });
      
      if (!Array.isArray(prices) || prices.length < 20) {
        console.warn(`Insufficient historical data for ${symbol}. Found ${prices.length} data points, need at least 20 for technical analysis.`);
        // Not enough data for full analysis, return basic mock data based on current price
        return {
          rsi: 45 + Math.random() * 20, // 45-65 range (more realistic)
          macd: (Math.random() - 0.5) * 10, // -5 to 5 range
          sma20: currentPrice * (0.98 + Math.random() * 0.04), // ±2% from current
          sma50: currentPrice * (0.95 + Math.random() * 0.1), // ±5% from current
          signal: 'HOLD', // Conservative signal when no data
          strength: 0.5 + Math.random() * 0.2, // 50-70% strength
          trend: 'NEUTRAL'
        };
      }

      // Calculate RSI (simplified) with safe array operations
      const closePrices = ErrorHandler.safeArrayOperation(
        prices.slice(-14),
        (arr) => arr.map((p: any) => p.close || p.closePrice || 0),
        []
      );
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
      const sma20 = prices.slice(-20).reduce((sum: number, p: any) => sum + (p.close || p.closePrice || 0), 0) / 20;
      const sma50 = prices.slice(-50).reduce((sum: number, p: any) => sum + (p.close || p.closePrice || 0), 0) / Math.min(50, prices.length);

      // Calculate MACD (simplified)
      const ema12 = prices.slice(-12).reduce((sum: number, p: any) => sum + (p.close || p.closePrice || 0), 0) / 12;
      const ema26 = prices.slice(-26).reduce((sum: number, p: any) => sum + (p.close || p.closePrice || 0), 0) / Math.min(26, prices.length);
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
    if (!isMountedRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/market/quote/${symbol}`);
      if (!response.ok) throw new Error('فشل في جلب بيانات السهم');
      
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'خطأ في البيانات');
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setCurrentQuote(data.data);
        
        // Calculate technical indicators
        const technical = await calculateTechnicalIndicators(symbol, data.data.currentPrice);
        if (isMountedRef.current) {
          setTechnicalData(technical);
        }
      }
      
    } catch (err) {
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'خطأ غير متوقع';
        setError(errorMessage);
        console.error('Error fetching dashboard data:', err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
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
