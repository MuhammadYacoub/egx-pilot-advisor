
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
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isConnected } = useMarketData();
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

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
    setIsMobileMenuOpen(false); // Close mobile menu when view changes
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'opportunities':
        return <OpportunityScanner onStockSelect={setSelectedStock} />;
      case 'portfolio':
        return <EnhancedPortfolioTracker />;
      case 'analysis':
        return <StockAnalyzer selectedStock={selectedStock} />;
      default:
        return <TradingDashboard onStockSelect={setSelectedStock} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className={cn(
        "flex h-screen",
        // في العربية: السايدبار على اليمين، المحتوى على اليسار
        // في الإنجليزية: السايدبار على اليسار، المحتوى على اليمين
        isRTL ? "flex-row-reverse" : "flex-row"
      )}>
        {/* Sidebar - يمين في العربية، يسار في الإنجليزية */}
        <Sidebar 
          activeView={activeView} 
          onViewChange={handleViewChange}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ 
              zIndex: 35  // تحت الـ sidebar لكن فوق باقي المحتوى
            }}
          />
        )}
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            isConnected={isConnected} 
            selectedStock={selectedStock}
            onStockSelect={setSelectedStock}
            onMobileMenuToggle={handleMobileMenuToggle}
            isMobileMenuOpen={isMobileMenuOpen}
          />
          
          <main className="flex-1 overflow-auto p-4 sm:p-6 bg-background">
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
