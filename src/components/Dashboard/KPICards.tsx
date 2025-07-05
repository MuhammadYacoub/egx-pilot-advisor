import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Volume, BarChart3, Target } from 'lucide-react';
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

interface TechnicalAnalysis {
  rsi: number;
  macd: number;
  sma20: number;
  sma50: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  strength: number;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

interface KPICardsProps {
  quoteData: QuoteData | null;
  technicalData?: TechnicalAnalysis | null;
  loading?: boolean;
}

export const KPICards = ({ quoteData, technicalData, loading }: KPICardsProps) => {
  const { t, isRTL } = useLanguage();

  if (loading || !quoteData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6 animate-pulse">
            <div className="space-y-3">
              <div className="h-4 bg-slate-600 rounded w-20"></div>
              <div className="h-8 bg-slate-600 rounded w-24"></div>
              <div className="h-3 bg-slate-600 rounded w-16"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const isPositive = quoteData.priceChange >= 0;
  const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  // حساب المؤشرات التقنية الأساسية (مؤقتة حتى يتم ربطها بالخادم)
  const mockTechnical = technicalData || {
    rsi: 65.4,
    macd: 150.2,
    sma20: quoteData.currentPrice * 0.98,
    sma50: quoteData.currentPrice * 0.95,
    signal: isPositive ? 'BUY' : 'HOLD',
    strength: 0.75,
    trend: isPositive ? 'BULLISH' : 'NEUTRAL'
  } as TechnicalAnalysis;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-EG' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'SELL': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* السعر الحالي والتغيير */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6 hover:bg-slate-800/70 transition-all duration-200">
        <div className={cn("flex items-center justify-between mb-3", isRTL && "flex-row-reverse")}>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <BarChart3 size={20} className="text-cyan-400" />
            <h3 className={cn("text-sm font-medium text-slate-300", isRTL && "text-right")}>
              {isRTL ? 'السعر الحالي' : 'Current Price'}
            </h3>
          </div>
        </div>
        
        <div className={cn("space-y-1", isRTL && "text-right")}>
          <div className="text-2xl font-bold text-white">
            {formatPrice(quoteData.currentPrice)}
          </div>
          <div className={cn(`flex items-center gap-1 text-sm ${changeColor}`, isRTL && "flex-row-reverse justify-end")}>
            <TrendIcon size={14} />
            <span>{isPositive ? '+' : ''}{formatPrice(quoteData.priceChange)}</span>
            <span className="text-slate-400">
              ({isPositive ? '+' : ''}{quoteData.priceChangePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </Card>

      {/* حجم التداول */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6 hover:bg-slate-800/70 transition-all duration-200">
        <div className={cn("flex items-center justify-between mb-3", isRTL && "flex-row-reverse")}>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Volume size={20} className="text-purple-400" />
            <h3 className={cn("text-sm font-medium text-slate-300", isRTL && "text-right")}>
              {isRTL ? 'حجم التداول' : 'Volume'}
            </h3>
          </div>
        </div>
        
        <div className={cn("space-y-1", isRTL && "text-right")}>
          <div className="text-2xl font-bold text-white">
            {formatVolume(quoteData.volume)}
          </div>
          <div className="text-xs text-slate-400">
            {isRTL ? 'آخر جلسة تداول' : 'Last trading session'}
          </div>
        </div>
      </Card>

      {/* المؤشر التقني الرئيسي (RSI) */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6 hover:bg-slate-800/70 transition-all duration-200">
        <div className={cn("flex items-center justify-between mb-3", isRTL && "flex-row-reverse")}>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Activity size={20} className="text-orange-400" />
            <h3 className={cn("text-sm font-medium text-slate-300", isRTL && "text-right")}>
              RSI (14)
            </h3>
          </div>
        </div>
        
        <div className={cn("space-y-2", isRTL && "text-right")}>
          <div className="text-2xl font-bold text-white">
            {mockTechnical.rsi.toFixed(1)}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-full bg-slate-600 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-green-500 to-red-500"
                style={{ width: `${Math.min(mockTechnical.rsi, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            {mockTechnical.rsi > 70 ? (isRTL ? 'في منطقة الشراء الزائد' : 'Overbought') : 
             mockTechnical.rsi < 30 ? (isRTL ? 'في منطقة البيع الزائد' : 'Oversold') : 
             (isRTL ? 'في المنطقة المحايدة' : 'Neutral Zone')}
          </div>
        </div>
      </Card>

      {/* الإشارة التقنية */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6 hover:bg-slate-800/70 transition-all duration-200">
        <div className={cn("flex items-center justify-between mb-3", isRTL && "flex-row-reverse")}>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Target size={20} className="text-cyan-400" />
            <h3 className={cn("text-sm font-medium text-slate-300", isRTL && "text-right")}>
              {isRTL ? 'إشارة تقنية' : 'Technical Signal'}
            </h3>
          </div>
        </div>
        
        <div className={cn("space-y-2", isRTL && "text-right")}>
          <Badge className={`${getSignalColor(mockTechnical.signal)} text-lg font-bold px-4 py-2`}>
            {isRTL ? 
              (mockTechnical.signal === 'BUY' ? 'شراء' : mockTechnical.signal === 'SELL' ? 'بيع' : 'انتظار') :
              mockTechnical.signal
            }
          </Badge>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              {isRTL ? 'قوة الإشارة:' : 'Signal Strength:'}
            </span>
            <div className="flex-1 bg-slate-600 rounded-full h-1">
              <div 
                className="h-1 rounded-full bg-cyan-400"
                style={{ width: `${mockTechnical.strength * 100}%` }}
              ></div>
            </div>
            <span className="text-xs text-cyan-400">
              {(mockTechnical.strength * 100).toFixed(0)}%
            </span>
          </div>
          <div className="text-xs text-slate-400">
            {isRTL ? 'اتجاه عام:' : 'Trend:'} 
            <span className={cn(
              "ml-1 font-medium",
              mockTechnical.trend === 'BULLISH' ? 'text-green-400' : 
              mockTechnical.trend === 'BEARISH' ? 'text-red-400' : 'text-yellow-400'
            )}>
              {isRTL ? 
                (mockTechnical.trend === 'BULLISH' ? 'صاعد' : 
                 mockTechnical.trend === 'BEARISH' ? 'هابط' : 'محايد') :
                mockTechnical.trend
              }
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
