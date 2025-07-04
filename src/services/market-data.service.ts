import { 
  ApiResponse, 
  MarketQuote,
  API_BASE_URL 
} from '@/types/api';
import { getAuthToken } from './auth.service';

// HTTP Client with auth
const apiClient = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP Error: ${response.status}`);
  }

  return response.json();
};

// Market Data API Service
export const marketDataApi = {
  // Get single stock quote
  async getQuote(symbol: string): Promise<ApiResponse<MarketQuote>> {
    return apiClient(`/market-data/quote/${symbol}`);
  },

  // Get multiple stock quotes
  async getMultipleQuotes(symbols: string[]): Promise<ApiResponse<MarketQuote[]>> {
    const symbolsParam = symbols.join(',');
    return apiClient(`/market-data/quotes?symbols=${symbolsParam}`);
  },

  // Get market summary
  async getMarketSummary(): Promise<ApiResponse<{
    totalCompanies: number;
    gainers: number;
    losers: number;
    unchanged: number;
    totalVolume: number;
    marketCap: number;
    topGainers: MarketQuote[];
    topLosers: MarketQuote[];
    mostActive: MarketQuote[];
  }>> {
    return apiClient('/market-data/summary');
  },
};
