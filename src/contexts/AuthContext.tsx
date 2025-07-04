import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/types/api';
import { authApi, getAuthToken, setAuthToken } from '@/services/auth.service';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  createTestUser: (email: string, name: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const isAuthenticated = !!user && !!getAuthToken();

  // Load user profile on mount if token exists
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates if component unmounts
    
    const loadProfile = async () => {
      const token = getAuthToken();
      if (token && isMounted) {
        try {
          const response = await authApi.getProfile();
          if (response.success && response.data && isMounted) {
            setUser(response.data);
          } else {
            // Invalid token, clear it
            if (isMounted) {
              setAuthToken(null);
              setUser(null);
            }
          }
        } catch (error) {
          console.error('Failed to load user profile:', error);
          if (isMounted) {
            setAuthToken(null);
            setUser(null);
          }
        }
      }
      if (isMounted) {
        setIsLoading(false);
      }
    };

    loadProfile();

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - run only once on mount

  const login = async (credential: string) => {
    try {
      setIsLoading(true);
      const authResponse = await authApi.googleLogin(credential);
      setUser(authResponse.user);
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً ${authResponse.user.name}`,
      });
    } catch (error) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAuthToken(null);
      
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك بنجاح",
      });
    }
  };

  const deleteAccount = async () => {
    try {
      setIsLoading(true);
      await authApi.deleteAccount();
      setUser(null);
      setAuthToken(null);
      
      toast({
        title: "تم حذف الحساب",
        description: "تم حذف حسابك بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ في حذف الحساب",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createTestUser = async (email: string, name: string) => {
    // منع الطلبات المتكررة
    if (isLoading) {
      toast({
        title: "يرجى الانتظار",
        description: "جاري معالجة طلبك...",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const authResponse = await authApi.createTestUser({ email, name });
      setUser(authResponse.user);
      
      toast({
        title: "تم إنشاء مستخدم تجريبي",
        description: `مرحباً ${authResponse.user.name}`,
      });
    } catch (error) {
      toast({
        title: "خطأ في إنشاء المستخدم التجريبي",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await authApi.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      // On error, maybe the token is invalid
      setUser(null);
      setAuthToken(null);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    deleteAccount,
    createTestUser,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
