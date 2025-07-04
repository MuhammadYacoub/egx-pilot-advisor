import yahooFinance from 'yahoo-finance2';
import { cache } from './cache.service';
import { config } from '../config';
import { formatEGXSymbol, cleanEGXSymbol } from '../utils/market-calculations';

export interface StockQuote {
  symbol: string;
  companyName: string;
  currentPrice: number;
  previousClose: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  marketCap?: number;
  sector?: string;
  lastUpdated: Date;
}

export interface HistoricalPrice {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose: number;
}

export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

class YahooFinanceService {
  private requestCount = 0;
  private lastResetTime = Date.now();
  private readonly RATE_LIMIT = config.yahooFinance.rateLimit;
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

  private checkRateLimit(): boolean {
    const now = Date.now();
    
    // Reset counter every minute
    if (now - this.lastResetTime > this.RATE_LIMIT_WINDOW) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }
    
    if (this.requestCount >= this.RATE_LIMIT) {
      console.warn(`⚠️ Yahoo Finance rate limit reached: ${this.requestCount}/${this.RATE_LIMIT}`);
      return false;
    }
    
    return true;
  }

  private incrementRequestCount(): void {
    this.requestCount++;
  }

  async getQuote(symbol: string): Promise<StockQuote | null> {
    try {
      const cacheKey = `quote_${symbol}`;
      const cached = cache.get<StockQuote>(cacheKey);
      
      if (cached) {
        return cached;
      }

      if (!this.checkRateLimit()) {
        throw new Error('Rate limit exceeded');
      }

      const yahooSymbol = formatEGXSymbol(symbol);
      this.incrementRequestCount();
      
      const quote = await yahooFinance.quote(yahooSymbol);

      if (!quote) {
        return null;
      }

      const stockQuote: StockQuote = {
        symbol: cleanEGXSymbol(quote.symbol || symbol),
        companyName: quote.longName || quote.shortName || 'Unknown Company',
        currentPrice: quote.regularMarketPrice || 0,
        previousClose: quote.regularMarketPreviousClose || 0,
        priceChange: quote.regularMarketChange || 0,
        priceChangePercent: quote.regularMarketChangePercent || 0,
        volume: quote.regularMarketVolume || 0,
        marketCap: quote.marketCap,
        sector: (quote as any).sector,
        lastUpdated: new Date()
      };

      // Cache for 30 seconds during market hours, 5 minutes after hours
      const ttl = config.cache.ttlQuotes;
      cache.set(cacheKey, stockQuote, ttl);

      return stockQuote;
    } catch (error) {
      console.error(`❌ Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  async getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
    const quotes: StockQuote[] = [];
    
    // Process symbols in batches to respect rate limits
    const batchSize = 5;
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      
      const batchPromises = batch.map(symbol => this.getQuote(symbol));
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          quotes.push(result.value);
        } else {
          console.warn(`⚠️ Failed to fetch quote for ${batch[index]}`);
        }
      });
      
      // Small delay between batches
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    return quotes;
  }

  async getHistoricalData(symbol: string, period: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' = '1y'): Promise<HistoricalPrice[]> {
    try {
      const cacheKey = `historical_${symbol}_${period}`;
      const cached = cache.get<HistoricalPrice[]>(cacheKey);
      
      if (cached) {
        return cached;
      }

      if (!this.checkRateLimit()) {
        throw new Error('Rate limit exceeded');
      }

      const yahooSymbol = formatEGXSymbol(symbol);
      this.incrementRequestCount();

      const result = await yahooFinance.historical(yahooSymbol, {
        period1: this.getPeriodStart(period),
        period2: new Date(),
        interval: '1d'
      });

      const historicalData: HistoricalPrice[] = result.map(item => ({
        date: item.date,
        open: item.open || 0,
        high: item.high || 0,
        low: item.low || 0,
        close: item.close || 0,
        volume: item.volume || 0,
        adjustedClose: item.adjClose || item.close || 0
      }));

      // Cache historical data for 5 minutes
      cache.set(cacheKey, historicalData, config.cache.ttlHistorical);

      return historicalData;
    } catch (error) {
      console.error(`❌ Error fetching historical data for ${symbol}:`, error);
      return [];
    }
  }

  async searchSymbols(query: string, limit: number = 10): Promise<SearchResult[]> {
    try {
      console.log(`🔍 Searching for: ${query} (limit: ${limit})`);
      
      // Load EGX stocks data from local file
      const egxStocksPath = require('path').join(__dirname, '../data/egx-stocks.json');
      const egxStocks = require(egxStocksPath);
      
      // Filter stocks based on query
      const filteredStocks = egxStocks.filter((stock: any) => {
        const searchTerm = query.toLowerCase();
        return (
          stock.name.toLowerCase().includes(searchTerm) ||
          stock.symbol.toLowerCase().includes(searchTerm) ||
          stock.symbol.replace('.CA', '').toLowerCase().includes(searchTerm)
        );
      });
      
      // Convert to SearchResult format
      const results: SearchResult[] = filteredStocks.slice(0, limit).map((stock: any) => ({
        symbol: stock.symbol.replace('.CA', ''),
        name: stock.name,
        exchange: 'EGX',
        type: 'Stock'
      }));
      
      console.log(`✅ Found ${results.length} stocks matching "${query}"`);
      return results;
    } catch (error) {
      console.error(`❌ Error searching stocks for "${query}":`, error);
      return [];
    }
  }

  async getEGXIndex(): Promise<StockQuote | null> {
    try {
      const cacheKey = 'egx_index';
      const cached = cache.get<StockQuote>(cacheKey);
      
      if (cached) {
        return cached;
      }

      if (!this.checkRateLimit()) {
        throw new Error('Rate limit exceeded');
      }

      this.incrementRequestCount();
      
      // Note: EGX 30 index might not be available on Yahoo Finance
      // This is a fallback implementation
      const quote = await yahooFinance.quote('^EGX30');

      if (!quote) {
        return null;
      }

      const indexQuote: StockQuote = {
        symbol: 'EGX30',
        companyName: 'EGX 30 Index',
        currentPrice: quote.regularMarketPrice || 0,
        previousClose: quote.regularMarketPreviousClose || 0,
        priceChange: quote.regularMarketChange || 0,
        priceChangePercent: quote.regularMarketChangePercent || 0,
        volume: quote.regularMarketVolume || 0,
        lastUpdated: new Date()
      };

      cache.set(cacheKey, indexQuote, config.cache.ttlQuotes);
      return indexQuote;
    } catch (error) {
      console.error('❌ Error fetching EGX index:', error);
      return null;
    }
  }

  async getTopMovers(): Promise<{ gainers: StockQuote[], losers: StockQuote[] }> {
    try {
      const cacheKey = 'top_movers';
      const cached = cache.get<{ gainers: StockQuote[], losers: StockQuote[] }>(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Get quotes for most popular EGX stocks
      const popularSymbols = [
        'COMI', 'ETEL', 'HRHO', 'EGTS', 'MNHD', 'SWDY', 'OTMT', 'EHRS',
        'CLHO', 'TMGH', 'PHDC', 'ORWE', 'OCDI', 'PALM', 'SPMD'
      ];

      const quotes = await this.getMultipleQuotes(popularSymbols);
      
      // Sort by price change percentage
      const sortedQuotes = quotes.sort((a, b) => b.priceChangePercent - a.priceChangePercent);
      
      const result = {
        gainers: sortedQuotes.filter(q => q.priceChangePercent > 0).slice(0, 5),
        losers: sortedQuotes.filter(q => q.priceChangePercent < 0).slice(-5).reverse()
      };

      // Cache for 1 minute
      cache.set(cacheKey, result, 60 * 1000);
      
      return result;
    } catch (error) {
      console.error('❌ Error fetching top movers:', error);
      return { gainers: [], losers: [] };
    }
  }

  private getPeriodStart(period: string): Date {
    const now = new Date();
    const start = new Date(now);
    
    switch (period) {
      case '1d':
        start.setDate(now.getDate() - 1);
        break;
      case '5d':
        start.setDate(now.getDate() - 5);
        break;
      case '1mo':
        start.setMonth(now.getMonth() - 1);
        break;
      case '3mo':
        start.setMonth(now.getMonth() - 3);
        break;
      case '6mo':
        start.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        start.setFullYear(now.getFullYear() - 1);
        break;
      case '2y':
        start.setFullYear(now.getFullYear() - 2);
        break;
      default:
        start.setFullYear(now.getFullYear() - 1);
    }
    
    return start;
  }

  getStats() {
    return {
      requestCount: this.requestCount,
      rateLimitRemaining: this.RATE_LIMIT - this.requestCount,
      cacheStats: cache.getStats()
    };
  }
}

export const yahooFinanceService = new YahooFinanceService();
