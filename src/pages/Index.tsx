
import { useState, useEffect } from 'react';
import { TradingDashboard } from '@/components/TradingDashboard/TradingDashboard';
import { Sidebar } from '@/components/Navigation/Sidebar';
import { Header } from '@/components/Navigation/Header';
import { OpportunityScanner } from '@/components/OpportunityScanner/OpportunityScanner';
import { PortfolioTracker } from '@/components/Portfolio/PortfolioTracker';
import EnhancedPortfolioTracker from '@/components/Portfolio/EnhancedPortfolioTracker';
import { StockAnalyzer } from '@/components/Analysis/StockAnalyzer';
import { useMarketData } from '@/hooks/useMarketData';
import { useToast } from '@/hooks/use-toast';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const MainContent = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedStock, setSelectedStock] = useState(null);
  const { marketData, isConnected } = useMarketData();
  const { toast } = useToast();
  const { isRTL } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    if (isConnected) {
      toast({
        title: "🟢 Market Data Connected",
        description: "Real-time EGX data stream active",
        duration: 3000,
      });
    }
  }, [isConnected, toast]);

  // Auto switch to portfolio view for authenticated users (only once)
  useEffect(() => {
    // Keep dashboard as default view regardless of authentication
    // Portfolio can be accessed via sidebar navigation
    if (user && activeView === 'dashboard') {
      // Don't auto-switch anymore - let user choose
      // setActiveView('portfolio');
    }
  }, [user]); // إزالة activeView من dependencies لمنع الحلقة

  const renderActiveView = () => {
    switch (activeView) {
      case 'opportunities':
        return <OpportunityScanner onStockSelect={setSelectedStock} />;
      case 'portfolio':
        return <EnhancedPortfolioTracker />;
      case 'analysis':
        return <StockAnalyzer selectedStock={selectedStock} />;
      default:
        return <TradingDashboard marketData={marketData} onStockSelect={setSelectedStock} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className={cn("flex h-screen", isRTL && "flex-row-reverse")}>
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            isConnected={isConnected} 
            selectedStock={selectedStock}
            onStockSelect={setSelectedStock}
          />
          
          <main className="flex-1 overflow-auto p-6">
            {renderActiveView()}
          </main>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <MainContent />
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default Index;
