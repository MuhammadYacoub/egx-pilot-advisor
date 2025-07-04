import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Portfolio, CreatePortfolioData, UpdatePortfolioData, AddPositionData } from '@/types/api';
import { portfolioApi } from '@/services/portfolio.service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';

interface PortfolioContextType {
  portfolios: Portfolio[];
  selectedPortfolio: Portfolio | null;
  isLoading: boolean;
  
  // Portfolio management
  loadPortfolios: () => Promise<void>;
  selectPortfolio: (portfolioId: string) => Promise<void>;
  createPortfolio: (data: CreatePortfolioData) => Promise<Portfolio>;
  updatePortfolio: (portfolioId: string, data: UpdatePortfolioData) => Promise<Portfolio>;
  deletePortfolio: (portfolioId: string) => Promise<void>;
  
  // Position management
  addPosition: (portfolioId: string, data: AddPositionData) => Promise<void>;
  deletePosition: (portfolioId: string, positionId: string) => Promise<void>;
  syncPortfolio: (portfolioId: string) => Promise<void>;
  
  // Refresh functions
  refreshPortfolios: () => Promise<void>;
  refreshSelectedPortfolio: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

interface PortfolioProviderProps {
  children: ReactNode;
}

export const PortfolioProvider: React.FC<PortfolioProviderProps> = ({ children }) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const loadPortfolios = async () => {
    if (!isAuthenticated || isLoading) return; // منع الطلبات المتكررة
    
    try {
      setIsLoading(true);
      const response = await portfolioApi.getPortfolios();
      if (response.success && response.data) {
        setPortfolios(response.data);
        
        // Auto-select default portfolio if none selected
        if (!selectedPortfolio && response.data.length > 0) {
          const defaultPortfolio = response.data.find(p => p.isDefault) || response.data[0];
          setSelectedPortfolio(defaultPortfolio);
        }
      }
    } catch (error) {
      toast({
        title: "خطأ في تحميل المحافظ",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectPortfolio = async (portfolioId: string) => {
    try {
      setIsLoading(true);
      const response = await portfolioApi.getPortfolioById(portfolioId);
      if (response.success && response.data) {
        setSelectedPortfolio(response.data);
      }
    } catch (error) {
      toast({
        title: "خطأ في تحميل المحفظة",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createPortfolio = async (data: CreatePortfolioData): Promise<Portfolio> => {
    try {
      setIsLoading(true);
      const response = await portfolioApi.createPortfolio(data);
      if (response.success && response.data) {
        await loadPortfolios(); // Refresh list
        
        toast({
          title: "تم إنشاء المحفظة",
          description: `تم إنشاء محفظة "${data.name}" بنجاح`,
        });
        
        return response.data;
      }
      throw new Error(response.error || 'فشل في إنشاء المحفظة');
    } catch (error) {
      toast({
        title: "خطأ في إنشاء المحفظة",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePortfolio = async (portfolioId: string, data: UpdatePortfolioData): Promise<Portfolio> => {
    try {
      setIsLoading(true);
      const response = await portfolioApi.updatePortfolio(portfolioId, data);
      if (response.success && response.data) {
        await loadPortfolios(); // Refresh list
        
        // Update selected portfolio if it's the one being updated
        if (selectedPortfolio?.id === portfolioId) {
          setSelectedPortfolio(response.data);
        }
        
        toast({
          title: "تم تحديث المحفظة",
          description: "تم تحديث بيانات المحفظة بنجاح",
        });
        
        return response.data;
      }
      throw new Error(response.error || 'فشل في تحديث المحفظة');
    } catch (error) {
      toast({
        title: "خطأ في تحديث المحفظة",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePortfolio = async (portfolioId: string) => {
    try {
      setIsLoading(true);
      const response = await portfolioApi.deletePortfolio(portfolioId);
      if (response.success) {
        await loadPortfolios(); // Refresh list
        
        // Clear selected portfolio if it's the one being deleted
        if (selectedPortfolio?.id === portfolioId) {
          setSelectedPortfolio(null);
        }
        
        toast({
          title: "تم حذف المحفظة",
          description: "تم حذف المحفظة بنجاح",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في حذف المحفظة",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addPosition = async (portfolioId: string, data: AddPositionData) => {
    try {
      setIsLoading(true);
      const response = await portfolioApi.addPosition(portfolioId, data);
      if (response.success) {
        await loadPortfolios(); // Refresh list
        
        // Refresh selected portfolio if it's the one being updated
        if (selectedPortfolio?.id === portfolioId) {
          await selectPortfolio(portfolioId);
        }
        
        const action = data.transactionType === 'BUY' ? 'شراء' : 'بيع';
        toast({
          title: `تم ${action} السهم`,
          description: `تم ${action} ${data.quantity} سهم من ${data.symbol} بنجاح`,
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في العملية",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePosition = async (portfolioId: string, positionId: string) => {
    try {
      setIsLoading(true);
      const response = await portfolioApi.deletePosition(portfolioId, positionId);
      if (response.success) {
        await loadPortfolios(); // Refresh list
        
        // Refresh selected portfolio if it's the one being updated
        if (selectedPortfolio?.id === portfolioId) {
          await selectPortfolio(portfolioId);
        }
        
        toast({
          title: "تم حذف المركز",
          description: "تم حذف المركز من المحفظة بنجاح",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في حذف المركز",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const syncPortfolio = async (portfolioId: string) => {
    try {
      setIsLoading(true);
      const response = await portfolioApi.syncPortfolio(portfolioId);
      if (response.success) {
        await loadPortfolios(); // Refresh list
        
        // Refresh selected portfolio if it's the one being updated
        if (selectedPortfolio?.id === portfolioId) {
          await selectPortfolio(portfolioId);
        }
        
        toast({
          title: "تم تحديث الأسعار",
          description: response.message || "تم تحديث أسعار المحفظة بنجاح",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في تحديث الأسعار",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPortfolios = async () => {
    await loadPortfolios();
  };

  const refreshSelectedPortfolio = async () => {
    if (selectedPortfolio?.id) {
      await selectPortfolio(selectedPortfolio.id);
    }
  };

  const value: PortfolioContextType = {
    portfolios,
    selectedPortfolio,
    isLoading,
    loadPortfolios,
    selectPortfolio,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    addPosition,
    deletePosition,
    syncPortfolio,
    refreshPortfolios,
    refreshSelectedPortfolio,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};
