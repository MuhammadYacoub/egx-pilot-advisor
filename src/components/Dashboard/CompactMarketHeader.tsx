import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  X, 
  RefreshCw, 
  Activity, 
  Clock,
  ChevronDown,
  BarChart3
} from 'lucide-react';
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

interface QuoteData {
  symbol: string;
  companyName: string;
  currentPrice: number;
  previousClose: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  lastUpdated: string;
}

interface CompactMarketHeaderProps {
  selectedSymbol: string;
  onSymbolSelect: (symbol: string) => void;
  quoteData: QuoteData | null;
  onRefresh: () => void;
  loading?: boolean;
}

export const CompactMarketHeader = ({ 
  selectedSymbol, 
  onSymbolSelect, 
  quoteData, 
  onRefresh, 
  loading 
}: CompactMarketHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  
  const { t, isRTL } = useLanguage();
  const searchRef = useRef<HTMLDivElement>(null);

  // Popular stocks list
  const [popularStocks] = useState<PopularStock[]>([
    { symbol: '^CASE30', name: 'EGX30 Price Return Index', nameAr: 'مؤشر EGX30 للعائد السعري' },
    { symbol: 'COMI.CA', name: 'Commercial International Bank', nameAr: 'البنك التجاري الدولي' },
    { symbol: 'ETEL.CA', name: 'Egyptian Company for Mobile Services', nameAr: 'المصرية للاتصالات' },
    { symbol: 'HRHO.CA', name: 'Hassan Allam Holding', nameAr: 'حسن علام هولدنج' },
    { symbol: 'EKHO.CA', name: 'El Kahera Housing', nameAr: 'القاهرة للإسكان والتعمير' },
    { symbol: 'EGAS.CA', name: 'Egyptian Gas', nameAr: 'الغاز المصرية' },
    { symbol: 'PHDC.CA', name: 'Palm Hills Developments', nameAr: 'بالم هيلز للتطوير' },
    { symbol: 'EMCO.CA', name: 'Egyptian Media Production City', nameAr: 'مدينة الإنتاج الإعلامي' },
    { symbol: 'ADCO.CA', name: 'Abu Dhabi Commercial Bank Egypt', nameAr: 'أبو ظبي التجاري مصر' },
    { symbol: 'GBAH.CA', name: 'Giza Beni Suef Automotive', nameAr: 'الجيزة بني سويف للسيارات' },
    { symbol: 'EAST.CA', name: 'Eastern Company', nameAr: 'الشرقية للدخان' },
    { symbol: 'OCDI.CA', name: 'Orascom Construction', nameAr: 'أوراسكوم للإنشاء' },
  ]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Search for stocks
  useEffect(() => {
    const searchStocks = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const response = await fetch(`${API_BASE_URL}/market/search?q=${encodeURIComponent(searchTerm)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.data?.results || []);
        }
      } catch (error) {
        console.error('Error searching stocks:', error);
        // Fallback to local search if API fails
        const localResults = popularStocks
          .filter(stock => 
            stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (stock.nameAr && stock.nameAr.includes(searchTerm))
          )
          .map(stock => ({
            symbol: stock.symbol,
            name: stock.name,
            type: 'Stock',
            exchange: 'EGX',
            currency: 'EGP'
          }));
        setSearchResults(localResults);
      } finally {
        setSearching(false);
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
    if (quoteData) {
      return quoteData.companyName || quoteData.symbol;
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

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}${isRTL ? ' مليون' : 'M'}`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}${isRTL ? ' ألف' : 'K'}`;
    }
    return volume.toString();
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const updateTime = new Date(dateString);
    const diffMs = now.getTime() - updateTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) {
      return isRTL ? 'الآن' : 'Just now';
    } else if (diffMins < 60) {
      return isRTL ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      return isRTL ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    }
  };

  const getMarketStatus = () => {
    const now = new Date();
    // Convert to Cairo time (UTC+2)
    const cairoTime = new Date(now.getTime() + (2 * 60 * 60 * 1000));
    const currentHour = cairoTime.getHours();
    const currentMinutes = cairoTime.getMinutes();
    const dayOfWeek = cairoTime.getDay(); // 0 = Sunday, 6 = Saturday
    
    // EGX trading hours: Sunday to Thursday, 10:00 AM to 2:30 PM Cairo time
    const isWeekday = dayOfWeek >= 0 && dayOfWeek <= 4; // Sunday (0) to Thursday (4)
    const isWithinHours = (currentHour > 10) || (currentHour === 10 && currentMinutes >= 0);
    const isBeforeClose = (currentHour < 14) || (currentHour === 14 && currentMinutes < 30);
    const isMarketHours = isWeekday && isWithinHours && isBeforeClose;
    
    return {
      isOpen: isMarketHours,
      status: isMarketHours ? 
        (isRTL ? 'مفتوح' : 'Open') : 
        (isRTL ? 'مغلق' : 'Closed')
    };
  };

  const marketStatus = getMarketStatus();
  const isPositive = quoteData ? quoteData.priceChange >= 0 : true;
  const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  if (!quoteData) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-4">
        <div className="animate-pulse space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-600 rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-600 rounded w-48"></div>
              <div className="h-3 bg-slate-600 rounded w-24"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-6 bg-slate-600 rounded w-32"></div>
            <div className="h-6 bg-slate-600 rounded w-24"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative" ref={searchRef}>
      {/* Main Compact Header */}
      <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/30 backdrop-blur-sm border-slate-700/50 overflow-hidden">
        {/* Top Row - Stock Selection & Refresh */}
        <div className={cn("flex items-center justify-between p-4 pb-2", isRTL && "flex-row-reverse")}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "flex items-center gap-2 hover:bg-slate-700/30 p-2 rounded-lg transition-colors group",
              isRTL && "flex-row-reverse"
            )}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <BarChart3 size={16} className="text-white" />
            </div>
            <div className={cn("text-left", isRTL && "text-right")}>
              <div className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-[300px]">
                {getCurrentDisplayName()}
              </div>
              <div className={cn("flex items-center gap-1 text-xs text-slate-400", isRTL && "flex-row-reverse")}>
                <span>{selectedSymbol}</span>
                <div className="flex items-center gap-1">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    marketStatus.isOpen ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                  )}></div>
                  <Badge className={cn(
                    "text-xs h-4 px-1",
                    marketStatus.isOpen ? 
                    'bg-green-500/20 text-green-400 border-green-500/30' : 
                    'bg-red-500/20 text-red-400 border-red-500/30'
                  )}>
                    {marketStatus.status}
                  </Badge>
                </div>
              </div>
            </div>
            <ChevronDown size={16} className="text-slate-400 group-hover:text-white transition-colors" />
          </button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onRefresh}
            disabled={loading}
            className="text-slate-400 hover:text-white h-8 w-8"
          >
            <RefreshCw size={14} className={cn("transition-transform", loading && "animate-spin")} />
          </Button>
        </div>

        {/* Bottom Row - Price Information */}
        <div className={cn("px-4 pb-4", isRTL && "text-right")}>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Current Price */}
            <div>
              <div className="text-2xl font-bold text-white mb-1">
                {formatPrice(quoteData.currentPrice)}
                <span className="text-sm text-slate-400 ml-1">
                  {isRTL ? 'جنيه' : 'EGP'}
                </span>
              </div>
              <div className={cn(`flex items-center gap-1 text-sm ${changeColor}`, isRTL && "flex-row-reverse")}>
                <TrendIcon size={14} />
                <span>
                  {isPositive ? '+' : ''}{formatPrice(quoteData.priceChange)}
                </span>
                <span className="text-slate-400">
                  ({isPositive ? '+' : ''}{quoteData.priceChangePercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* Previous Close - Hidden on extra small screens */}
            <div className="hidden xs:block">
              <div className="text-slate-400 text-xs mb-1">
                {isRTL ? 'سعر الإغلاق السابق' : 'Previous Close'}
              </div>
              <div className="text-lg font-semibold text-white">
                {formatPrice(quoteData.previousClose)}
              </div>
            </div>

            {/* Volume - Hidden on small screens */}
            <div className="hidden sm:block">
              <div className="text-slate-400 text-xs mb-1">
                {isRTL ? 'حجم التداول' : 'Volume'}
              </div>
              <div className="text-lg font-semibold text-white">
                {formatVolume(quoteData.volume)}
              </div>
            </div>

            {/* Last Updated */}
            <div className="hidden sm:block">
              <div className="text-slate-400 text-xs mb-1">
                {isRTL ? 'آخر تحديث' : 'Last Updated'}
              </div>
              <div className={cn("flex items-center gap-1 text-sm text-slate-300", isRTL && "flex-row-reverse")}>
                <Clock size={12} />
                <span>{getTimeAgo(quoteData.lastUpdated)}</span>
              </div>
            </div>
          </div>
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
                {searching ? (
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
