import { 
  ApiResponse, 
  PaginatedResponse, 
  Portfolio, 
  Position, 
  Transaction, 
  PerformanceReport,
  CreatePortfolioData,
  UpdatePortfolioData,
  AddPositionData,
  API_BASE_URL 
} from '@/types/api';
import { getAuthToken } from './auth.service';

// HTTP Client with auth and timeout
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

  // إضافة timeout للطلبات
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

  try {
    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP Error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
};

// Portfolio API Service
export const portfolioApi = {
  // Get all portfolios
  async getPortfolios(): Promise<ApiResponse<Portfolio[]>> {
    return apiClient('/portfolio');
  },

  // Get portfolio by ID
  async getPortfolioById(portfolioId: string): Promise<ApiResponse<Portfolio>> {
    return apiClient(`/portfolio/${portfolioId}`);
  },

  // Create new portfolio
  async createPortfolio(data: CreatePortfolioData): Promise<ApiResponse<Portfolio>> {
    return apiClient('/portfolio', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update portfolio
  async updatePortfolio(portfolioId: string, data: UpdatePortfolioData): Promise<ApiResponse<Portfolio>> {
    return apiClient(`/portfolio/${portfolioId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete portfolio
  async deletePortfolio(portfolioId: string): Promise<ApiResponse> {
    return apiClient(`/portfolio/${portfolioId}`, {
      method: 'DELETE',
    });
  },

  // Add position (buy/sell)
  async addPosition(portfolioId: string, data: AddPositionData): Promise<ApiResponse<{
    transaction: Transaction;
    position: Position | null;
  }>> {
    return apiClient(`/portfolio/${portfolioId}/positions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Delete position
  async deletePosition(portfolioId: string, positionId: string): Promise<ApiResponse> {
    return apiClient(`/portfolio/${portfolioId}/positions/${positionId}`, {
      method: 'DELETE',
    });
  },

  // Get transactions
  async getTransactions(
    portfolioId: string,
    params?: {
      page?: number;
      limit?: number;
      symbol?: string;
      type?: 'BUY' | 'SELL';
    }
  ): Promise<PaginatedResponse<Transaction>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.symbol) searchParams.append('symbol', params.symbol);
    if (params?.type) searchParams.append('type', params.type);

    const query = searchParams.toString();
    const endpoint = `/portfolio/${portfolioId}/transactions${query ? `?${query}` : ''}`;
    
    return apiClient(endpoint);
  },

  // Get performance report
  async getPerformanceReport(
    portfolioId: string,
    period: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'ALL' = '1M'
  ): Promise<ApiResponse<PerformanceReport>> {
    return apiClient(`/portfolio/${portfolioId}/performance?period=${period}`);
  },

  // Sync portfolio prices
  async syncPortfolio(portfolioId: string): Promise<ApiResponse<{
    updatedPositions: number;
    totalMarketValue: number;
    totalUnrealizedPnl: number;
    currentValue: number;
  }>> {
    return apiClient(`/portfolio/${portfolioId}/sync`, {
      method: 'POST',
    });
  },
};
