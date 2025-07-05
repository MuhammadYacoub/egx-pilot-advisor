import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Bell, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface LiveStatusProps {
  isConnected: boolean;
  lastUpdate?: string;
  symbol?: string;
  priceChange?: number;
  onToggleNotifications?: () => void;
  notificationsEnabled?: boolean;
}

export const LiveStatus = ({ 
  isConnected, 
  lastUpdate, 
  symbol, 
  priceChange,
  onToggleNotifications,
  notificationsEnabled = true
}: LiveStatusProps) => {
  const [pulseCount, setPulseCount] = useState(0);
  const { t, isRTL } = useLanguage();

  // Pulse animation for live updates
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        setPulseCount(prev => prev + 1);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    
    const now = new Date();
    const updateTime = new Date(dateString);
    const diffMs = now.getTime() - updateTime.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 30) {
      return isRTL ? 'الآن' : 'Just now';
    } else if (diffSecs < 60) {
      return isRTL ? `منذ ${diffSecs} ثانية` : `${diffSecs}s ago`;
    } else {
      const diffMins = Math.floor(diffSecs / 60);
      return isRTL ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
    }
  };

  const getConnectionStatus = () => {
    if (isConnected) {
      return {
        icon: Wifi,
        text: isRTL ? 'متصل - بيانات مباشرة' : 'Connected - Live Data',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/30'
      };
    } else {
      return {
        icon: WifiOff,
        text: isRTL ? 'غير متصل - بيانات مؤقتة' : 'Disconnected - Cached Data',
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/30'
      };
    }
  };

  const status = getConnectionStatus();
  const StatusIcon = status.icon;

  return (
    <Card className={cn(
      "bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-4 transition-all duration-300",
      isConnected && "border-green-500/30"
    )}>
      <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
        {/* Connection Status */}
        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
          <div className="relative">
            <StatusIcon size={20} className={status.color} />
            {isConnected && (
              <div 
                key={pulseCount}
                className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"
              />
            )}
          </div>
          
          <div className={cn(isRTL && "text-right")}>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <span className="text-sm font-medium text-white">
                {status.text}
              </span>
              <Badge className={`${status.bgColor} ${status.color} ${status.borderColor} text-xs`}>
                {isConnected ? (isRTL ? 'مباشر' : 'LIVE') : (isRTL ? 'مؤقت' : 'CACHED')}
              </Badge>
            </div>
            
            {lastUpdate && (
              <div className="text-xs text-slate-400 mt-1">
                {isRTL ? 'آخر تحديث:' : 'Last update:'} {getTimeAgo(lastUpdate)}
              </div>
            )}
          </div>
        </div>

        {/* Price Change Alert */}
        {priceChange !== undefined && Math.abs(priceChange) > 0 && (
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            {priceChange > 0 ? (
              <TrendingUp size={16} className="text-green-400" />
            ) : (
              <TrendingDown size={16} className="text-red-400" />
            )}
            <span className={cn(
              "text-sm font-medium",
              priceChange > 0 ? 'text-green-400' : 'text-red-400'
            )}>
              {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </span>
          </div>
        )}

        {/* Notifications Toggle */}
        {onToggleNotifications && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleNotifications}
            className={cn(
              "transition-colors",
              notificationsEnabled ? 'text-cyan-400 hover:text-cyan-300' : 'text-slate-400 hover:text-slate-300'
            )}
          >
            <Bell size={16} className={notificationsEnabled ? '' : 'opacity-50'} />
          </Button>
        )}
      </div>

      {/* Market Warning */}
      {!isConnected && (
        <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className={cn("flex items-center gap-2 text-yellow-400", isRTL && "flex-row-reverse")}>
            <AlertCircle size={14} />
            <span className="text-xs">
              {isRTL ? 
                'تعذر الاتصال بخادم البيانات المباشرة. تعرض بيانات مؤقتة.' :
                'Unable to connect to live data server. Showing cached data.'
              }
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};
