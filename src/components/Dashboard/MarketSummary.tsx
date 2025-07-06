import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, RefreshCw, Clock, Activity } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

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

interface MarketSummaryProps {
  quoteData: QuoteData | null;
  onRefresh: () => void;
  loading?: boolean;
}

export const MarketSummary = ({ quoteData, onRefresh, loading }: MarketSummaryProps) => {
  const { t, isRTL } = useLanguage();

  if (!quoteData) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-600 rounded w-48"></div>
          <div className="h-4 bg-slate-600 rounded w-32"></div>
          <div className="h-8 bg-slate-600 rounded w-40"></div>
        </div>
      </Card>
    );
  }

  const isPositive = quoteData.priceChange >= 0;
  const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

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
    const currentHour = now.getHours();
    const isWeekend = now.getDay() === 5 || now.getDay() === 6; // Friday or Saturday
    
    // EGX trading hours: 10:00 AM to 2:30 PM, Sunday to Thursday
    const isMarketHours = !isWeekend && currentHour >= 10 && currentHour < 14.5;
    
    return {
      isOpen: isMarketHours,
      status: isMarketHours ? 
        (isRTL ? 'مفتوح' : 'Open') : 
        (isRTL ? 'مغلق' : 'Closed'),
      nextSession: isWeekend ? 
        (isRTL ? 'الأحد 10:00 ص' : 'Sunday 10:00 AM') :
        currentHour < 10 ? 
        (isRTL ? 'اليوم 10:00 ص' : 'Today 10:00 AM') :
        (isRTL ? 'غداً 10:00 ص' : 'Tomorrow 10:00 AM')
    };
  };

  const marketStatus = getMarketStatus();

  return (
    <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/30 backdrop-blur-sm border-slate-700/50 p-6">
      {/* Header */}
      <div className={cn("flex items-center justify-between mb-4", isRTL && "flex-row-reverse")}>
        <div className={cn(isRTL && "text-right")}>
          <h2 className="text-xl font-bold text-white">
            {quoteData.companyName}
          </h2>
          <div className={cn("flex items-center gap-2 mt-1", isRTL && "flex-row-reverse")}>
            <span className="text-slate-400 text-sm">{quoteData.symbol}</span>
            <Badge className={cn(
              "text-xs",
              marketStatus.isOpen ? 
              'bg-green-500/20 text-green-400 border-green-500/30' : 
              'bg-red-500/20 text-red-400 border-red-500/30'
            )}>
              <Activity size={10} className="mr-1" />
              {marketStatus.status}
            </Badge>
          </div>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onRefresh}
          disabled={loading}
          className="text-slate-400 hover:text-white"
        >
          <RefreshCw size={16} className={cn("transition-transform", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Price Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Current Price */}
        <div className={cn(isRTL && "text-right")}>
          <div className="text-3xl font-bold text-white mb-1">
            {formatPrice(quoteData.currentPrice)}
          </div>
          <div className={cn(`flex items-center gap-2 text-sm ${changeColor}`, isRTL && "flex-row-reverse justify-end")}>
            <TrendIcon size={16} />
            <span>
              {isPositive ? '+' : ''}{formatPrice(quoteData.priceChange)}
            </span>
            <span className="text-slate-400">
              ({isPositive ? '+' : ''}{quoteData.priceChangePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Previous Close */}
        <div className={cn(isRTL && "text-right")}>
          <div className="text-slate-400 text-sm mb-1">
            {isRTL ? 'إغلاق سابق' : 'Previous Close'}
          </div>
          <div className="text-xl font-semibold text-white">
            {formatPrice(quoteData.previousClose)}
          </div>
        </div>

        {/* Volume */}
        <div className={cn(isRTL && "text-right")}>
          <div className="text-slate-400 text-sm mb-1">
            {isRTL ? 'حجم التداول' : 'Volume'}
          </div>
          <div className="text-xl font-semibold text-white">
            {formatVolume(quoteData.volume)}
          </div>
        </div>
      </div>

      {/* Footer Information */}
      <div className={cn("flex items-center justify-between text-sm", isRTL && "flex-row-reverse")}>
        <div className={cn("flex items-center gap-2 text-slate-400", isRTL && "flex-row-reverse")}>
          <Clock size={14} />
          <span>
            {isRTL ? 'آخر تحديث:' : 'Last updated:'} {getTimeAgo(quoteData.lastUpdated)}
          </span>
        </div>
        
        {!marketStatus.isOpen && (
          <div className="text-slate-400">
            <span className="text-xs">
              {isRTL ? 'الجلسة القادمة:' : 'Next session:'} {marketStatus.nextSession}
            </span>
          </div>
        )}
      </div>

      {/* Performance Indicator */}
      <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <span className={cn("text-sm text-slate-400", isRTL && "text-right")}>
            {isRTL ? 'أداء اليوم' : "Today's Performance"}
          </span>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <div className={cn(
              "px-2 py-1 rounded text-xs font-medium",
              isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            )}>
              {isPositive ? 
                (isRTL ? 'أداء إيجابي' : 'Positive') : 
                (isRTL ? 'أداء سلبي' : 'Negative')
              }
            </div>
            <span className={`font-bold ${changeColor}`}>
              {Math.abs(quoteData.priceChangePercent).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
