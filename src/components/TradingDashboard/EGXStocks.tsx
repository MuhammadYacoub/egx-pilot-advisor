import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingUp, TrendingDown, Search, Database, RefreshCw } from 'lucide-react';
import { useEGXData } from '@/hooks/useEGXData';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface EGXStocksProps {
  onStockSelect: (symbol: string) => void;
}

// List of popular EGX stocks to display
const POPULAR_STOCKS = [
  'COMI.CA', 'ETEL.CA', 'HRHO.CA', 'EGTS.CA', 'MNHD.CA',
  'OTMT.CA', 'SWDY.CA', 'EGAS.CA', 'AMER.CA', 'OCDI.CA',
  'CIRA.CA', 'JUFO.CA', 'SKPC.CA', 'ORWE.CA', 'TMGH.CA'
];

export const EGXStocks = ({ onStockSelect }: EGXStocksProps) => {
  const { isRTL } = useLanguage();
  const { getQuote, searchSymbols, isLoading } = useEGXData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStocks, setSelectedStocks] = useState<string[]>(POPULAR_STOCKS.slice(0, 5));
  const [stockQuotes, setStockQuotes] = useState<Record<string, any>>({});
  const [loadingStocks, setLoadingStocks] = useState(false);

  // Load stock quotes for selected stocks
  const loadStockQuotes = async () => {
    setLoadingStocks(true);
    const quotes: Record<string, any> = {};
    
    for (const symbol of selectedStocks) {
      try {
        const quote = await getQuote(symbol);
        quotes[symbol] = quote;
      } catch (error) {
        console.warn(`Failed to fetch quote for ${symbol}:`, error);
        // Mock data for demonstration
        quotes[symbol] = {
          symbol,
          price: Math.random() * 100 + 10,
          change: (Math.random() - 0.5) * 10,
          changePercent: (Math.random() - 0.5) * 20,
          volume: Math.floor(Math.random() * 1000000),
        };
      }
    }
    
    setStockQuotes(quotes);
    setLoadingStocks(false);
  };

  // Search for stocks
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const results = await searchSymbols(searchQuery, 5);
      // Add search results to selected stocks
      const newSymbols = results.map((r: any) => r.symbol).filter((s: string) => !selectedStocks.includes(s));
      setSelectedStocks(prev => [...prev.slice(0, 3), ...newSymbols.slice(0, 2)]);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  useEffect(() => {
    loadStockQuotes();
  }, [selectedStocks]);

  const formatPrice = (price: number) => {
    return price?.toFixed(2) || '0.00';
  };

  const formatChange = (change: number, changePercent: number) => {
    const isPositive = change >= 0;
    return {
      value: `${isPositive ? '+' : ''}${change?.toFixed(2) || '0.00'}`,
      percent: `${isPositive ? '+' : ''}${changePercent?.toFixed(2) || '0.00'}%`,
      isPositive
    };
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className={cn(
            "text-lg font-semibold flex items-center gap-2",
            isRTL && "flex-row-reverse"
          )}>
            <Database className="h-5 w-5 text-primary" />
            {isRTL ? 'أسهم البورصة المصرية' : 'EGX Stocks'}
          </h3>
          
          <Button
            size="sm"
            variant="outline"
            onClick={loadStockQuotes}
            disabled={loadingStocks}
            className="h-8"
          >
            <RefreshCw className={cn("h-4 w-4", loadingStocks && "animate-spin")} />
          </Button>
        </div>

        {/* Search */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className={cn(
              "absolute top-2.5 h-4 w-4 text-muted-foreground",
              isRTL ? "right-3" : "left-3"
            )} />
            <Input
              placeholder={isRTL ? "ابحث عن رمز السهم..." : "Search symbol..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className={cn("h-9", isRTL ? "pr-10" : "pl-10")}
            />
          </div>
          <Button size="sm" onClick={handleSearch} disabled={isLoading}>
            {isRTL ? 'بحث' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Stock List */}
      <div className="space-y-3">
        {selectedStocks.map((symbol) => {
          const quote = stockQuotes[symbol];
          if (!quote && !loadingStocks) return null;
          
          const changeData = quote ? formatChange(quote.change, quote.changePercent) : null;
          
          return (
            <div
              key={symbol}
              onClick={() => onStockSelect(symbol)}
              className={cn(
                "p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-all duration-200 cursor-pointer group hover:bg-accent/50",
                isRTL && "text-right"
              )}
            >
              {loadingStocks ? (
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted/50 rounded animate-pulse w-20" />
                    <div className="h-3 bg-muted/30 rounded animate-pulse w-16" />
                  </div>
                  <div className="h-6 bg-muted/50 rounded animate-pulse w-16" />
                </div>
              ) : (
                <div className={cn(
                  "flex items-center justify-between",
                  isRTL && "flex-row-reverse"
                )}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{symbol}</span>
                      {changeData?.isPositive ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isRTL ? 'حجم التداول' : 'Volume'}: {quote?.volume?.toLocaleString() || 'N/A'}
                    </div>
                  </div>
                  
                  <div className={cn(
                    "text-right space-y-1",
                    isRTL && "text-left"
                  )}>
                    <div className="font-medium">
                      {formatPrice(quote?.price)} {isRTL ? 'ج.م' : 'EGP'}
                    </div>
                    {changeData && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          changeData.isPositive 
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                        )}
                      >
                        {changeData.value} ({changeData.percent})
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedStocks.length === 0 && !loadingStocks && (
        <div className="text-center py-8 text-muted-foreground">
          <Database className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p className="text-sm">
            {isRTL ? 'لا توجد أسهم متاحة' : 'No stocks available'}
          </p>
        </div>
      )}
    </Card>
  );
};
