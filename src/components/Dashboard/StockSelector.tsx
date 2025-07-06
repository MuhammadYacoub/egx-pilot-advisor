import { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, TrendingDown, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
  currency: string;
}

interface PopularStock {
  symbol: string;
  name: string;
  nameAr?: string;
  currentPrice?: number;
  priceChange?: number;
  priceChangePercent?: number;
}

interface StockSelectorProps {
  selectedSymbol: string;
  onSymbolSelect: (symbol: string) => void;
  currentQuote?: any;
}

export const StockSelector = ({ selectedSymbol, onSymbolSelect, currentQuote }: StockSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [popularStocks] = useState<PopularStock[]>([
    { symbol: '^CASE30', name: 'EGX30 Price Return Index', nameAr: 'مؤشر EGX30 للعائد السعري' },
    { symbol: '^CASE30', name: 'EGX 30 Price Return Index', nameAr: 'مؤشر العائد السعري EGX 30' },
    { symbol: 'COMI.CA', name: 'Commercial International Bank', nameAr: 'البنك التجاري الدولي' },
    { symbol: 'ETEL.CA', name: 'Egyptian Company for Mobile Services', nameAr: 'المصرية للاتصالات' },
    { symbol: 'HRHO.CA', name: 'Hassan Allam Holding', nameAr: 'حسن علام هولدنج' },
    { symbol: 'EKHO.CA', name: 'El Kahera Housing', nameAr: 'القاهرة للإسكان والتعمير' },
    { symbol: 'EGAS.CA', name: 'Egyptian Gas', nameAr: 'الغاز المصرية' },
  ]);

  const { t, isRTL } = useLanguage();
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search for stocks
  useEffect(() => {
    const searchStocks = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/market/search?q=${encodeURIComponent(searchTerm)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.data || []);
        }
      } catch (error) {
        console.error('Error searching stocks:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };
 
    const timeoutId = setTimeout(searchStocks, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleStockSelect = (symbol: string) => {
    onSymbolSelect(symbol);
    setIsOpen(false);
    setSearchTerm('');
    setSearchResults([]);
  };

  const getCurrentDisplayName = () => {
    if (currentQuote) {
      return currentQuote.companyName || currentQuote.symbol;
    }
    
    const found = popularStocks.find(stock => stock.symbol === selectedSymbol);
    if (found) {
      return isRTL ? (found.nameAr || found.name) : found.name;
    }
    
    return selectedSymbol;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-EG' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Current Selection Display */}
      <Card 
        className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-4 cursor-pointer hover:bg-slate-800/70 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div className={cn(isRTL && "text-right")}>
              <h3 className="text-lg font-semibold text-white">
                {getCurrentDisplayName()}
              </h3>
              <div className={cn("flex items-center gap-2 text-sm", isRTL && "flex-row-reverse")}>
                <span className="text-slate-400">{selectedSymbol}</span>
                {currentQuote && (
                  <>
                    <span className="text-white font-medium">
                      {formatPrice(currentQuote.currentPrice)}
                    </span>
                    <span className={cn(
                      "flex items-center gap-1",
                      currentQuote.priceChange >= 0 ? 'text-green-400' : 'text-red-400'
                    )}>
                      {currentQuote.priceChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {currentQuote.priceChangePercent >= 0 ? '+' : ''}{currentQuote.priceChangePercent.toFixed(2)}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Search size={20} className="text-slate-400" />
        </div>
      </Card>

      {/* Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-sm border-slate-700/50 shadow-xl z-50 max-h-96 overflow-hidden">
          {/* Search Input */}
          <div className="p-4 border-b border-slate-700/50">
            <div className="relative">
              <Search size={16} className={cn(
                "absolute top-1/2 transform -translate-y-1/2 text-slate-400",
                isRTL ? "right-3" : "left-3"
              )} />
              <Input
                type="text"
                placeholder={isRTL ? "ابحث عن الأسهم..." : "Search stocks..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400",
                  isRTL ? "pr-10 text-right" : "pl-10"
                )}
                autoFocus
              />
              {searchTerm && (
                <Button
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "absolute top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white",
                    isRTL ? "left-1" : "right-1"
                  )}
                  onClick={() => setSearchTerm('')}
                >
                  <X size={14} />
                </Button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {/* Search Results */}
            {searchTerm.length >= 2 && (
              <div className="p-2">
                {loading ? (
                  <div className="p-4 text-center text-slate-400">
                    {isRTL ? 'جاري البحث...' : 'Searching...'}
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="px-3 py-2 text-xs font-medium text-slate-400 uppercase tracking-wide">
                      {isRTL ? 'نتائج البحث' : 'Search Results'}
                    </div>
                    {searchResults.map((stock) => (
                      <div
                        key={stock.symbol}
                        className="p-3 hover:bg-slate-700/50 cursor-pointer rounded-lg transition-colors"
                        onClick={() => handleStockSelect(stock.symbol)}
                      >
                        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                          <div className={cn(isRTL && "text-right")}>
                            <div className="font-medium text-white">{stock.name}</div>
                            <div className="text-sm text-slate-400">{stock.symbol}</div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {stock.exchange}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="p-4 text-center text-slate-400">
                    {isRTL ? 'لا توجد نتائج' : 'No results found'}
                  </div>
                )}
              </div>
            )}

            {/* Popular Stocks */}
            {searchTerm.length < 2 && (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-medium text-slate-400 uppercase tracking-wide">
                  {isRTL ? 'الأسهم الشائعة' : 'Popular Stocks'}
                </div>
                {popularStocks.map((stock) => (
                  <div
                    key={stock.symbol}
                    className={cn(
                      "p-3 hover:bg-slate-700/50 cursor-pointer rounded-lg transition-colors",
                      selectedSymbol === stock.symbol && "bg-cyan-500/20 border border-cyan-500/30"
                    )}
                    onClick={() => handleStockSelect(stock.symbol)}
                  >
                    <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                      <div className={cn(isRTL && "text-right")}>
                        <div className="font-medium text-white">
                          {isRTL ? (stock.nameAr || stock.name) : stock.name}
                        </div>
                        <div className="text-sm text-slate-400">{stock.symbol}</div>
                      </div>
                      {selectedSymbol === stock.symbol && (
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-0 text-xs">
                          {isRTL ? 'محدد' : 'Selected'}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
