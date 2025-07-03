
import { useState } from 'react';
import { Search, Bell, Globe, Wifi, WifiOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface HeaderProps {
  isConnected: boolean;
  selectedStock: any;
  onStockSelect: (stock: any) => void;
}

export const Header = ({ isConnected, selectedStock, onStockSelect }: HeaderProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { language, setLanguage, t, isRTL } = useLanguage();

  const currentTime = new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const egxStatus = {
    isOpen: new Date().getHours() >= 10 && new Date().getHours() < 15,
    nextSession: '10:00 AM'
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <header className="bg-slate-800/30 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4">
      <div className={cn(
        "flex items-center justify-between",
        isRTL && "flex-row-reverse"
      )}>
        {/* Search & Stock Info */}
        <div className={cn(
          "flex items-center gap-4 flex-1",
          isRTL && "flex-row-reverse"
        )}>
          <div className="relative max-w-md">
            <Search className={cn(
              "absolute top-1/2 transform -translate-y-1/2 text-slate-400",
              isRTL ? "right-3" : "left-3"
            )} size={16} />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "bg-slate-700/50 border-slate-600 focus:border-cyan-500 text-white placeholder-slate-400",
                isRTL ? "pr-10 text-right" : "pl-10"
              )}
            />
          </div>

          {selectedStock && (
            <div className={cn(
              "flex items-center gap-2",
              isRTL && "flex-row-reverse"
            )}>
              <div className={cn("text-sm", isRTL && "text-right")}>
                <span className="font-semibold text-cyan-400">{selectedStock.symbol}</span>
                <span className="text-slate-300 ml-2">{selectedStock.price} جنيه</span>
                <span className={`ml-2 ${selectedStock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Status & Controls */}
        <div className={cn(
          "flex items-center gap-4",
          isRTL && "flex-row-reverse"
        )}>
          {/* Market Status */}
          <div className={cn(
            "flex items-center gap-2",
            isRTL && "flex-row-reverse"
          )}>
            <Badge variant={egxStatus.isOpen ? "default" : "secondary"} className="bg-green-500/20 text-green-400">
              EGX {t(egxStatus.isOpen ? 'open' : 'closed')}
            </Badge>
            <span className="text-xs text-slate-400">{currentTime}</span>
          </div>

          {/* Connection Status */}
          <div className={cn(
            "flex items-center gap-2",
            isRTL && "flex-row-reverse"
          )}>
            {isConnected ? (
              <div className="flex items-center gap-1 text-green-400">
                <Wifi size={16} />
                <span className="text-xs">{t('live')}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-400">
                <WifiOff size={16} />
                <span className="text-xs">{t('offline')}</span>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="text-slate-300 hover:text-cyan-400"
          >
            <Globe size={16} />
            <span className="ml-1 text-xs">{language.toUpperCase()}</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-cyan-400 relative">
            <Bell size={16} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
        </div>
      </div>
    </header>
  );
};
