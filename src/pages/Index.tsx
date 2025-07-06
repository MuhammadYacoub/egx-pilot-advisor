
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  const handleSidebarCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  // Calculate sidebar width based on state
  const sidebarWidth = sidebarCollapsed ? 64 : 256; // 16 = 64px, 64 = 256px

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
    <div className={cn(
      "min-h-screen bg-background text-foreground",
      // تطبيق اتجاه النص على المستوى العالي
      isRTL ? "rtl" : "ltr"
    )} 
    style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      {/* Header - Full width across the entire page */}
      <Header 
        isConnected={isConnected} 
        selectedStock={selectedStock}
        onStockSelect={setSelectedStock}
        onMobileMenuToggle={handleMobileMenuToggle}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      
      {/* Main Content Area - Below Header */}
      <div className="relative h-[calc(100vh-80px)]">
        {/* Sidebar - موضع مطلق حسب الاتجاه */}
        <div 
          className={cn(
            "absolute top-0 bottom-0 z-10 transition-all duration-300",
            // في العربية: على اليمين، في الإنجليزية: على اليسار
            isRTL ? "right-0" : "left-0"
          )}
          style={{ 
            width: `${sidebarWidth}px`,
            transition: 'width 0.3s ease-in-out'
          }}
        >
          <Sidebar 
            activeView={activeView} 
            onViewChange={handleViewChange}
            isMobileMenuOpen={isMobileMenuOpen}
            onMobileMenuClose={() => setIsMobileMenuOpen(false)}
            isCollapsed={sidebarCollapsed}
            onCollapseChange={handleSidebarCollapse}
          />
        </div>
        
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ 
              zIndex: 35,  // تحت الـ sidebar لكن فوق باقي المحتوى
              top: '80px'  // Start below the header
            }}
          />
        )}
        
        {/* Main Content - مع مساحة للسايدبار */}
        <div 
          className="h-full transition-all duration-300 ml-0 mr-0"
        >
          {/* CSS Variables للتحكم في الـ margin */}
          <style>{`
            @media (min-width: 768px) {
              .main-content-area {
                ${isRTL ? 'margin-right' : 'margin-left'}: ${sidebarWidth}px;
                transition: margin 0.3s ease-in-out;
              }
            }
          `}</style>
          <div className="main-content-area h-full">
            <main className="h-full overflow-auto p-4 sm:p-6 bg-background">
              {renderActiveView()}
            </main>
          </div>
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
