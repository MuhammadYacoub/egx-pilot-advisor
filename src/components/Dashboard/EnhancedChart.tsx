import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface EnhancedChartProps {
  symbol: string;
  currentPrice?: number;
}

export const EnhancedChart = ({ symbol, currentPrice }: EnhancedChartProps) => {
  const [timeframe, setTimeframe] = useState('1mo');
  const [chartType, setChartType] = useState('area');
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { t, isRTL } = useLanguage();

  const timeframes = [
    { value: '5d', label: isRTL ? '5 أيام' : '5D' },
    { value: '1mo', label: isRTL ? 'شهر' : '1M' },
    { value: '3mo', label: isRTL ? '3 شهور' : '3M' },
    { value: '6mo', label: isRTL ? '6 شهور' : '6M' },
    { value: '1y', label: isRTL ? 'سنة' : '1Y' }
  ];

  useEffect(() => {
    const fetchHistoricalData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_BASE_URL}/market/historical/${symbol}?period=${timeframe}`);
        if (!response.ok) throw new Error('فشل في جلب البيانات التاريخية');
        
        const result = await response.json();
        if (!result.success) throw new Error(result.message || 'خطأ في البيانات');
        
        // تحقق من وجود البيانات بشكل صحيح
        const historicalData = result.data || result || [];
        if (!Array.isArray(historicalData)) {
          throw new Error('البيانات التاريخية ليست في الشكل المتوقع');
        }
        
        // تحويل البيانات للرسم البياني
        const chartData = historicalData.map((item: any) => ({
          date: new Date(item.date || item.dateTime).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
            month: 'short',
            day: 'numeric'
          }),
          open: item.open || item.openPrice || 0,
          high: item.high || item.highPrice || 0,
          low: item.low || item.lowPrice || 0,
          close: item.close || item.closePrice || 0,
          volume: item.volume || 0,
          fullDate: item.date || item.dateTime
        }));
        
        setData(chartData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'خطأ غير متوقع';
        setError(errorMessage);
        console.error('Error fetching historical data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchHistoricalData();
    }
  }, [symbol, timeframe, isRTL]);

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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800/95 border border-slate-700/50 rounded-lg p-3 shadow-xl">
          <p className="text-slate-300 text-sm mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-cyan-400">
              <span className="text-slate-400">{isRTL ? 'الإغلاق:' : 'Close:'}</span> {formatPrice(data.close)}
            </p>
            <p className="text-green-400">
              <span className="text-slate-400">{isRTL ? 'الأعلى:' : 'High:'}</span> {formatPrice(data.high)}
            </p>
            <p className="text-red-400">
              <span className="text-slate-400">{isRTL ? 'الأدنى:' : 'Low:'}</span> {formatPrice(data.low)}
            </p>
            <p className="text-purple-400">
              <span className="text-slate-400">{isRTL ? 'الحجم:' : 'Volume:'}</span> {formatVolume(data.volume)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-600 rounded w-48 mb-4"></div>
          <div className="h-64 bg-slate-600 rounded"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
        <div className="text-red-400 text-center">
          <p className="font-medium">{isRTL ? 'خطأ في تحميل البيانات' : 'Error loading data'}</p>
          <p className="text-sm text-slate-400 mt-1">{error}</p>
        </div>
      </Card>
    );
  }

  const currentChange = data.length > 1 ? data[data.length - 1].close - data[0].close : 0;
  const currentChangePercent = data.length > 1 ? (currentChange / data[0].close) * 100 : 0;

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
      {/* Header */}
      <div className={cn("flex items-center justify-between mb-6", isRTL && "flex-row-reverse")}>
        <div>
          <h3 className={cn("text-lg font-semibold text-white", isRTL && "text-right")}>
            {isRTL ? 'الرسم البياني' : 'Price Chart'}
          </h3>
          <div className={cn("flex items-center gap-2 mt-1", isRTL && "flex-row-reverse")}>
            <span className="text-slate-400 text-sm">{symbol}</span>
            {data.length > 0 && (
              <Badge className={cn(
                "text-xs",
                currentChange >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              )}>
                {currentChange >= 0 ? '+' : ''}{currentChangePercent.toFixed(2)}%
              </Badge>
            )}
          </div>
        </div>
        
        <Badge className="bg-cyan-500/20 text-cyan-400 border-0">
          {timeframes.find(t => t.value === timeframe)?.label}
        </Badge>
      </div>

      {/* Controls */}
      <div className={cn("flex gap-4 mb-6", isRTL && "flex-row-reverse")}>
        {/* Timeframe Selector */}
        <div className="flex bg-slate-700/50 rounded-lg p-1">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={cn(
                "px-3 py-1 text-xs rounded-md transition-all duration-200",
                timeframe === tf.value
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-slate-400 hover:text-slate-300'
              )}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Chart Type Selector */}
        <div className="flex bg-slate-700/50 rounded-lg p-1">
          <button
            onClick={() => setChartType('line')}
            className={cn(
              "px-3 py-1 text-xs rounded-md transition-all duration-200",
              chartType === 'line'
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-slate-400 hover:text-slate-300'
            )}
          >
            {isRTL ? 'خط' : 'Line'}
          </button>
          <button
            onClick={() => setChartType('area')}
            className={cn(
              "px-3 py-1 text-xs rounded-md transition-all duration-200",
              chartType === 'area'
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-slate-400 hover:text-slate-300'
            )}
          >
            {isRTL ? 'منطقة' : 'Area'}
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8" 
                fontSize={12}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12}
                domain={['dataMin - 1', 'dataMax + 1']}
                tickFormatter={formatPrice}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="close"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8" 
                fontSize={12}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12}
                domain={['dataMin - 1', 'dataMax + 1']}
                tickFormatter={formatPrice}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="close"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#06b6d4' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart Stats */}
      {data.length > 0 && (
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="text-lg font-bold text-green-400">
              {formatPrice(Math.max(...data.map(d => d.high)))}
            </div>
            <div className="text-xs text-slate-400">
              {isRTL ? 'أعلى سعر' : 'Highest'}
            </div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="text-lg font-bold text-red-400">
              {formatPrice(Math.min(...data.map(d => d.low)))}
            </div>
            <div className="text-xs text-slate-400">
              {isRTL ? 'أدنى سعر' : 'Lowest'}
            </div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="text-lg font-bold text-purple-400">
              {formatVolume(data.reduce((sum, d) => sum + d.volume, 0) / data.length)}
            </div>
            <div className="text-xs text-slate-400">
              {isRTL ? 'متوسط الحجم' : 'Avg Volume'}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
