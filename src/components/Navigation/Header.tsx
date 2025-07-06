
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Bell, Globe, Wifi, WifiOff, User, LogOut, Settings, Menu, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

// Utility function for debouncing
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

interface StockData {
  symbol: string;
  companyName: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
}

interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
}

interface HeaderProps {
  isConnected: boolean;
  selectedStock?: StockData | null;
  onStockSelect: (stock: StockData) => void;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Header = ({ 
  isConnected, 
  selectedStock, 
  onStockSelect, 
  onMobileMenuToggle,
  isMobileMenuOpen = false 
}: HeaderProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Logo selection based on theme
  const logoSrc = useMemo(() => {
    return theme === 'dark' ? '/logoD.png' : '/logoL.png';
  }, [theme]);

  // Market status logic
  const egxStatus = useMemo(() => {
    const hour = currentTime.getHours();
    const isOpen = hour >= 10 && hour < 15;
    return {
      isOpen,
      nextSession: isOpen ? '15:00' : '10:00'
    };
  }, [currentTime]);

  // Format current time
  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, [currentTime, language]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (term.length < 2) {
        setSearchResults([]);
        setIsSearchLoading(false);
        return;
      }

      setIsSearchLoading(true);
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
        const response = await fetch(`${API_BASE_URL}/market/search?q=${encodeURIComponent(term)}`);
        
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.data || []);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearchLoading(false);
      }
    }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.length >= 2) {
      setIsSearchLoading(true);
      debouncedSearch(value);
    } else {
      setSearchResults([]);
      setIsSearchLoading(false);
    }
  };

  // Handle search result selection
  const handleSearchSelect = (result: SearchResult) => {
    const stockData: StockData = {
      symbol: result.symbol,
      companyName: result.name,
      currentPrice: 0,
      priceChange: 0,
      priceChangePercent: 0
    };
    onStockSelect(stockData);
    setSearchTerm('');
    setSearchResults([]);
    setIsSearchOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-EG' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <header className="bg-slate-800/30 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-40 w-full">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className={cn(
          "flex items-center justify-between gap-4",
          isRTL && "flex-row-reverse"
        )}>
          
          {/* Mobile Menu Toggle & Logo */}
          <div className={cn(
            "flex items-center gap-3",
            isRTL && "flex-row-reverse"
          )}>
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-slate-300 hover:text-cyan-400"
              onClick={onMobileMenuToggle}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>

            {/* Logo مع العنوان */}
            <div className="flex items-center gap-3">
              <img 
                src={logoSrc} 
                alt="EGX Pilot" 
                className="h-10 w-10 object-contain"
                onError={(e) => {
                  // Fallback if logo fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  EGXPILOT
                </h1>
                <p className="text-xs text-slate-400 leading-none">
                  {isRTL ? 'مستشار البورصة المصرية' : 'Egyptian Exchange Advisor'}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar - Hidden on small screens */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className={cn(
                "absolute top-1/2 transform -translate-y-1/2 text-slate-400",
                isRTL ? "right-3" : "left-3"
              )} size={16} />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                className={cn(
                  "bg-slate-700/50 border-slate-600 focus:border-cyan-500 text-white placeholder-slate-400 transition-all",
                  isRTL ? "pr-10 text-right" : "pl-10"
                )}
              />
              
              {/* Search Results Dropdown */}
              {isSearchOpen && (searchResults.length > 0 || isSearchLoading) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                  {isSearchLoading ? (
                    <div className="p-3 text-center text-slate-400">
                      {isRTL ? 'جاري البحث...' : 'Searching...'}
                    </div>
                  ) : (
                    searchResults.map((result, index) => (
                      <div
                        key={result.symbol}
                        className="p-3 hover:bg-slate-700/50 cursor-pointer border-b border-slate-700/30 last:border-b-0"
                        onClick={() => handleSearchSelect(result)}
                      >
                        <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
                          <div className={cn(isRTL && "text-right")}>
                            <div className="font-medium text-white">{result.name}</div>
                            <div className="text-sm text-slate-400">{result.symbol}</div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {result.exchange}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Selected Stock Info - Hidden on small screens */}
          {selectedStock && (
            <div className="hidden lg:flex items-center gap-3 bg-slate-700/30 rounded-lg px-3 py-2">
              <div className={cn("text-sm", isRTL && "text-right")}>
                <div className="font-semibold text-cyan-400">
                  {selectedStock.symbol}
                </div>
                <div className="text-xs text-slate-400">
                  {selectedStock.companyName}
                </div>
              </div>
              <div className={cn("text-sm", isRTL && "text-right")}>
                <div className="text-white font-medium">
                  {formatPrice(selectedStock.currentPrice)} {isRTL ? 'جنيه' : 'EGP'}
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs",
                  selectedStock.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400',
                  isRTL && "flex-row-reverse"
                )}>
                  <span>
                    {selectedStock.priceChangePercent >= 0 ? '+' : ''}{selectedStock.priceChangePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Status & Controls */}
          <div className={cn(
            "flex items-center gap-2 sm:gap-3",
            isRTL && "flex-row-reverse"
          )}>
            
            {/* Market Status - Hidden on small screens */}
            <div className={cn(
              "hidden sm:flex items-center gap-2",
              isRTL && "flex-row-reverse"
            )}>
              <Badge 
                variant={egxStatus.isOpen ? "default" : "secondary"} 
                className={cn(
                  "text-xs",
                  egxStatus.isOpen 
                    ? "bg-green-500/20 text-green-400 border-green-500/30" 
                    : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                )}
              >
                EGX {t(egxStatus.isOpen ? 'open' : 'closed')}
              </Badge>
              <span className="hidden md:inline text-xs text-slate-400">
                {formattedTime}
              </span>
            </div>

            {/* Connection Status */}
            <div className={cn(
              "flex items-center gap-1",
              isRTL && "flex-row-reverse"
            )}>
              {isConnected ? (
                <>
                  <Wifi size={14} className="text-green-400" />
                  <span className="hidden sm:inline text-xs text-green-400">
                    {t('live')}
                  </span>
                </>
              ) : (
                <>
                  <WifiOff size={14} className="text-red-400" />
                  <span className="hidden sm:inline text-xs text-red-400">
                    {t('offline')}
                  </span>
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="text-slate-300 hover:text-cyan-400 h-8 w-8"
              title={isRTL ? 'تغيير اللغة' : 'Change Language'}
            >
              <Globe size={16} />
              <span className="sr-only">{language.toUpperCase()}</span>
            </Button>

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-300 hover:text-cyan-400 relative h-8 w-8"
              title={isRTL ? 'الإشعارات' : 'Notifications'}
            >
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.picture} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className={cn("cursor-pointer", isRTL && "flex-row-reverse")}>
                  <User className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  <span>{isRTL ? 'الملف الشخصي' : 'Profile'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className={cn("cursor-pointer", isRTL && "flex-row-reverse")}>
                  <Settings className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  <span>{isRTL ? 'الإعدادات' : 'Settings'}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className={cn("cursor-pointer text-red-400 hover:text-red-300", isRTL && "flex-row-reverse")}
                >
                  <LogOut className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  <span>{isRTL ? 'تسجيل الخروج' : 'Logout'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden mt-3">
          <div className="relative">
            <Search className={cn(
              "absolute top-1/2 transform -translate-y-1/2 text-slate-400",
              isRTL ? "right-3" : "left-3"
            )} size={16} />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className={cn(
                "bg-slate-700/50 border-slate-600 focus:border-cyan-500 text-white placeholder-slate-400",
                isRTL ? "pr-10 text-right" : "pl-10"
              )}
            />
          </div>
          
          {/* Mobile Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-2 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-xl max-h-48 overflow-y-auto">
              {searchResults.map((result) => (
                <div
                  key={result.symbol}
                  className="p-3 hover:bg-slate-700/50 cursor-pointer border-b border-slate-700/30 last:border-b-0"
                  onClick={() => handleSearchSelect(result)}
                >
                  <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
                    <div className={cn(isRTL && "text-right")}>
                      <div className="font-medium text-white text-sm">{result.name}</div>
                      <div className="text-xs text-slate-400">{result.symbol}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {result.exchange}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Selected Stock Info */}
        {selectedStock && (
          <div className="lg:hidden mt-3 bg-slate-700/30 rounded-lg p-3">
            <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
              <div className={cn(isRTL && "text-right")}>
                <div className="font-semibold text-cyan-400 text-sm">
                  {selectedStock.symbol}
                </div>
                <div className="text-xs text-slate-400">
                  {selectedStock.companyName}
                </div>
              </div>
              <div className={cn("text-right", isRTL && "text-left")}>
                <div className="text-white font-medium text-sm">
                  {formatPrice(selectedStock.currentPrice)} {isRTL ? 'جنيه' : 'EGP'}
                </div>
                <div className={cn(
                  "text-xs",
                  selectedStock.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'
                )}>
                  {selectedStock.priceChangePercent >= 0 ? '+' : ''}{selectedStock.priceChangePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
