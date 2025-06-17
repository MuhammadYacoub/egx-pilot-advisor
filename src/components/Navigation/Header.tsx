
import { useState } from 'react';
import { Search, Bell, Globe, Wifi, WifiOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  isConnected: boolean;
  selectedStock: any;
  onStockSelect: (stock: any) => void;
}

export const Header = ({ isConnected, selectedStock, onStockSelect }: HeaderProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState('en');

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const egxStatus = {
    isOpen: new Date().getHours() >= 10 && new Date().getHours() < 15,
    nextSession: '10:00 AM'
  };

  return (
    <header className="bg-slate-800/30 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search & Stock Info */}
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <Input
              placeholder="Search EGX stocks... (e.g., COMI, ETEL)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700/50 border-slate-600 focus:border-cyan-500 text-white placeholder-slate-400"
            />
          </div>

          {selectedStock && (
            <div className="flex items-center gap-2">
              <div className="text-sm">
                <span className="font-semibold text-cyan-400">{selectedStock.symbol}</span>
                <span className="text-slate-300 ml-2">{selectedStock.price} EGP</span>
                <span className={`ml-2 ${selectedStock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Status & Controls */}
        <div className="flex items-center gap-4">
          {/* Market Status */}
          <div className="flex items-center gap-2">
            <Badge variant={egxStatus.isOpen ? "default" : "secondary"} className="bg-green-500/20 text-green-400">
              EGX {egxStatus.isOpen ? 'OPEN' : 'CLOSED'}
            </Badge>
            <span className="text-xs text-slate-400">{currentTime}</span>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-1 text-green-400">
                <Wifi size={16} />
                <span className="text-xs">Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-400">
                <WifiOff size={16} />
                <span className="text-xs">Offline</span>
              </div>
            )}
          </div>

          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
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
