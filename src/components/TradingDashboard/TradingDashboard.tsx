import React, { useCallback } from 'react';
import { MarketOverview } from './MarketOverview';
import { TopStocks } from './TopStocks';
import { TechnicalSummary } from './TechnicalSummary';
import { NewsPanel } from './NewsPanel';
import { QuickActions } from './QuickActions';
import { KPICards } from '@/components/Dashboard/KPICards';
import { StockSelector } from '@/components/Dashboard/StockSelector';
import { TechnicalIndicators } from '@/components/Dashboard/TechnicalIndicators';
import { EnhancedChart } from '@/components/Dashboard/EnhancedChart';
import { MarketSummary } from '@/components/Dashboard/MarketSummary';
import { EGXTradingViewWidget } from '@/components/Dashboard/EGXTradingViewWidget';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface TradingDashboardProps {
  onStockSelect?: (stock: any) => void;
}

export const TradingDashboard = ({ onStockSelect }: TradingDashboardProps) => {
  const { isRTL } = useLanguage();
  const { 
    currentQuote, 
    technicalData, 
    loading, 
    error,
    selectSymbol,
    selectedSymbol,
    refreshData
  } = useDashboardData('^CASE30');

  const handleStockSelect = useCallback((symbol: string) => {
    selectSymbol(symbol);
    // Also call the parent callback if provided
    if (onStockSelect) {
      onStockSelect({ symbol, name: symbol });
    }
  }, [onStockSelect, selectSymbol]);

  return (
    <div className={cn("space-y-6", isRTL && "text-right")}>
      {/* Market Summary - Featured Stock Overview */}
      <MarketSummary 
        quoteData={currentQuote}
        onRefresh={refreshData}
        loading={loading}
      />

      {/* Stock Selector */}
      <StockSelector 
        selectedSymbol={selectedSymbol}
        onSymbolSelect={handleStockSelect}
        currentQuote={currentQuote}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <div className="text-red-400 font-medium">
            {isRTL ? 'خطأ في جلب البيانات:' : 'Error fetching data:'} {error}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <KPICards 
        quoteData={currentQuote}
        technicalData={technicalData}
        loading={loading}
      />

      {/* Market Overview */}
      <MarketOverview />

      {/* Main Content Grid */}
      <div className={cn(
        "grid grid-cols-1 xl:grid-cols-3 gap-6",
        isRTL && "xl:grid-flow-col-dense"
      )}>
        {/* Charts Column */}
        <div className={cn(
          "xl:col-span-2 space-y-6",
          isRTL && "xl:col-start-1"
        )}>
          <EGXTradingViewWidget 
            symbol={selectedSymbol}
            height={400}
          />
          <TechnicalIndicators 
            technicalData={technicalData}
            currentPrice={currentQuote?.currentPrice || 0}
            loading={loading}
          />
        </div>

        {/* Data Column */}
        <div className={cn(
          "space-y-6",
          isRTL && "xl:col-start-3"
        )}>
          <EnhancedChart 
            symbol={selectedSymbol}
            currentPrice={currentQuote?.currentPrice}
          />
          <TopStocks onStockSelect={(stock) => handleStockSelect(stock.symbol)} />
          <QuickActions />
          <NewsPanel />
        </div>
      </div>
    </div>
  );
};
