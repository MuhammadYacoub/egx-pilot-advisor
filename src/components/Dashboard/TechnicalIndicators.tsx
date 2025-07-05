import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, BarChart3, Activity, Target, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface TechnicalAnalysis {
  rsi: number;
  macd: number;
  sma20: number;
  sma50: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  strength: number;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

interface TechnicalIndicatorsProps {
  technicalData: TechnicalAnalysis | null;
  currentPrice: number;
  loading?: boolean;
}

export const TechnicalIndicators = ({ technicalData, currentPrice, loading }: TechnicalIndicatorsProps) => {
  const { t, isRTL } = useLanguage();

  if (loading || !technicalData) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-600 rounded w-48"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-slate-600 rounded w-20"></div>
                <div className="h-4 bg-slate-600 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const indicators = [
    {
      name: 'RSI (14)',
      value: technicalData.rsi,
      signal: technicalData.rsi > 70 ? 'SELL' : technicalData.rsi < 30 ? 'BUY' : 'NEUTRAL',
      description: technicalData.rsi > 70 ? 
        (isRTL ? 'في منطقة الشراء الزائد' : 'Overbought') : 
        technicalData.rsi < 30 ? 
        (isRTL ? 'في منطقة البيع الزائد' : 'Oversold') : 
        (isRTL ? 'منطقة محايدة' : 'Neutral Zone'),
      icon: Activity,
      color: technicalData.rsi > 70 ? 'text-red-400' : technicalData.rsi < 30 ? 'text-green-400' : 'text-yellow-400'
    },
    {
      name: 'MACD',
      value: technicalData.macd,
      signal: technicalData.macd > 0 ? 'BUY' : 'SELL',
      description: technicalData.macd > 0 ? 
        (isRTL ? 'إشارة صاعدة' : 'Bullish Signal') : 
        (isRTL ? 'إشارة هابطة' : 'Bearish Signal'),
      icon: BarChart3,
      color: technicalData.macd > 0 ? 'text-green-400' : 'text-red-400'
    },
    {
      name: 'SMA 20',
      value: technicalData.sma20,
      signal: currentPrice > technicalData.sma20 ? 'BUY' : 'SELL',
      description: currentPrice > technicalData.sma20 ? 
        (isRTL ? 'السعر فوق المتوسط' : 'Price Above Average') : 
        (isRTL ? 'السعر تحت المتوسط' : 'Price Below Average'),
      icon: TrendingUp,
      color: currentPrice > technicalData.sma20 ? 'text-green-400' : 'text-red-400',
      isPrice: true
    },
    {
      name: 'SMA 50',
      value: technicalData.sma50,
      signal: currentPrice > technicalData.sma50 ? 'BUY' : 'SELL',
      description: currentPrice > technicalData.sma50 ? 
        (isRTL ? 'اتجاه صاعد' : 'Uptrend') : 
        (isRTL ? 'اتجاه هابط' : 'Downtrend'),
      icon: TrendingDown,
      color: currentPrice > technicalData.sma50 ? 'text-green-400' : 'text-red-400',
      isPrice: true
    }
  ];

  const formatValue = (value: number, isPrice: boolean = false) => {
    if (isPrice) {
      return new Intl.NumberFormat(isRTL ? 'ar-EG' : 'en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    }
    return value.toFixed(1);
  };

  const getSignalBadge = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'SELL':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const getSignalText = (signal: string) => {
    if (!isRTL) return signal;
    switch (signal) {
      case 'BUY': return 'شراء';
      case 'SELL': return 'بيع';
      case 'NEUTRAL': return 'محايد';
      default: return signal;
    }
  };

  const overallSignal = technicalData.signal;
  const signalStrength = technicalData.strength;

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
      <div className={cn("flex items-center justify-between mb-6", isRTL && "flex-row-reverse")}>
        <div>
          <h3 className={cn("text-lg font-semibold text-white", isRTL && "text-right")}>
            {isRTL ? 'المؤشرات التقنية' : 'Technical Indicators'}
          </h3>
          <p className={cn("text-sm text-slate-400 mt-1", isRTL && "text-right")}>
            {isRTL ? 'تحليل تقني متقدم للسهم' : 'Advanced technical analysis'}
          </p>
        </div>
        <Badge className="bg-cyan-500/20 text-cyan-400 border-0">
          {isRTL ? 'مباشر' : 'Live'}
        </Badge>
      </div>

      {/* Overall Signal */}
      <div className="mb-6 p-4 bg-slate-700/30 rounded-lg">
        <div className={cn("flex items-center justify-between mb-3", isRTL && "flex-row-reverse")}>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Target className="text-cyan-400" size={20} />
            <span className={cn("font-medium text-white", isRTL && "text-right")}>
              {isRTL ? 'الإشارة العامة' : 'Overall Signal'}
            </span>
          </div>
          <Badge className={`${getSignalBadge(overallSignal)} text-sm font-bold px-3 py-1`}>
            {getSignalText(overallSignal)}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className={cn("flex justify-between text-sm", isRTL && "flex-row-reverse")}>
            <span className="text-slate-400">
              {isRTL ? 'قوة الإشارة:' : 'Signal Strength:'}
            </span>
            <span className="text-cyan-400 font-medium">
              {(signalStrength * 100).toFixed(0)}%
            </span>
          </div>
          <Progress value={signalStrength * 100} className="h-2" />
        </div>
      </div>

      {/* Individual Indicators */}
      <div className="space-y-4">
        {indicators.map((indicator, index) => {
          const Icon = indicator.icon;
          return (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-700/20 rounded-lg hover:bg-slate-700/30 transition-colors">
              <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                <Icon size={18} className={indicator.color} />
                <div className={cn(isRTL && "text-right")}>
                  <div className="font-medium text-white">{indicator.name}</div>
                  <div className="text-xs text-slate-400">{indicator.description}</div>
                </div>
              </div>
              
              <div className={cn("text-right", isRTL && "text-left")}>
                <div className="font-bold text-white">
                  {formatValue(indicator.value, indicator.isPrice)}
                </div>
                <Badge className={`${getSignalBadge(indicator.signal)} text-xs mt-1`}>
                  {getSignalText(indicator.signal)}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trend Analysis */}
      <div className="mt-6 p-4 border border-slate-700/50 rounded-lg">
        <div className={cn("flex items-center gap-2 mb-2", isRTL && "flex-row-reverse")}>
          <AlertTriangle size={16} className="text-orange-400" />
          <span className={cn("text-sm font-medium text-white", isRTL && "text-right")}>
            {isRTL ? 'تحليل الاتجاه' : 'Trend Analysis'}
          </span>
        </div>
        <p className={cn("text-sm text-slate-300", isRTL && "text-right")}>
          {isRTL ? 
            `الاتجاه العام للسهم ${technicalData.trend === 'BULLISH' ? 'صاعد' : technicalData.trend === 'BEARISH' ? 'هابط' : 'محايد'}. ` +
            `المؤشرات التقنية تشير إلى ${overallSignal === 'BUY' ? 'فرصة شراء' : overallSignal === 'SELL' ? 'إشارة بيع' : 'موقف انتظار'} ` +
            `بقوة ${(signalStrength * 100).toFixed(0)}%.` :
            `The overall trend is ${technicalData.trend.toLowerCase()}. ` +
            `Technical indicators suggest a ${overallSignal.toLowerCase()} opportunity ` +
            `with ${(signalStrength * 100).toFixed(0)}% confidence.`
          }
        </p>
      </div>
    </Card>
  );
};
