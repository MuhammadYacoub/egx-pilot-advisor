import { 
  ApiResponse, 
  PaginatedResponse, 
  User, 
  AuthResponse, 
  TestUserData,
  API_BASE_URL 
} from '@/types/api';

// Token management
let authToken: string | null = localStorage.getItem('authToken');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = () => authToken;

// HTTP Client with auth and timeout
const apiClient = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...options.headers,
    },
    ...options,
  };

  // إضافة timeout للطلبات
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

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

// Auth API Service
export const authApi = {
  // Google OAuth login
  async googleLogin(credential: string): Promise<AuthResponse> {
    const response = await apiClient('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
    
    if (response.success && response.data.tokens?.accessToken) {
      setAuthToken(response.data.tokens.accessToken);
    }
    
    return {
      user: response.data.user,
      token: response.data.tokens.accessToken,
    };
  },

  // Get current user profile
  async getProfile(): Promise<ApiResponse<User>> {
    return apiClient('/auth/profile');
  },

  // Logout
  async logout(): Promise<ApiResponse> {
    const response = await apiClient('/auth/logout', {
      method: 'POST',
    });
    
    setAuthToken(null);
    return response;
  },

  // Delete account
  async deleteAccount(): Promise<ApiResponse> {
    const response = await apiClient('/auth/delete', {
      method: 'DELETE',
    });
    
    setAuthToken(null);
    return response;
  },

  // Create test user (development only)
  async createTestUser(userData: TestUserData): Promise<AuthResponse> {
    const response = await apiClient('/auth/test-user', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.data.tokens?.accessToken) {
      setAuthToken(response.data.tokens.accessToken);
    }
    
    return {
      user: response.data.user,
      token: response.data.tokens.accessToken,
    };
  },
};

// Initialize auth token on module load
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('authToken');
  if (token) {
    setAuthToken(token);
  }
}
