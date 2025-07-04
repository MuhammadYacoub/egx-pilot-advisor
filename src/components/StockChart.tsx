import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Bar,
  BarChart
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, RefreshCw } from 'lucide-react';
import { useStockPrice } from '@/hooks/useMarketData';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface StockChartProps {
  symbol: string;
  height?: number;
}

type ChartType = 'line' | 'area' | 'candlestick' | 'volume';
type TimeRange = '1d' | '1w' | '1m' | '3m' | '6m' | '1y';

export const StockChart = ({ symbol, height = 400 }: StockChartProps) => {
  const { isRTL } = useLanguage();
  const [chartType, setChartType] = useState<ChartType>('line');
  const [timeRange, setTimeRange] = useState<TimeRange>('1y');
  
  const { data, quote, loading, error, refresh } = useStockPrice(symbol, true);

  // Process data for charts
  const chartData = useMemo(() => {
    if (!data.length) return [];
    
    return data.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      timestamp: new Date(item.date).getTime(),
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
      adjustedClose: item.adjustedClose
    })).sort((a, b) => a.timestamp - b.timestamp);
  }, [data]);

  // Calculate price change
  const priceChange = useMemo(() => {
    if (chartData.length < 2) return { value: 0, percent: 0, isPositive: true };
    
    const first = chartData[0].close;
    const last = chartData[chartData.length - 1].close;
    const change = last - first;
    const percent = (change / first) * 100;
    
    return {
      value: change,
      percent,
      isPositive: change >= 0
    };
  }, [chartData]);

  // Format numbers for display
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatVolume = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-600 p-3 rounded-lg shadow-lg">
          <p className="text-slate-200 font-medium mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">{isRTL ? 'افتتاح:' : 'Open:'}</span>
              <span className="text-white font-medium">{formatPrice(data.open)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">{isRTL ? 'أعلى:' : 'High:'}</span>
              <span className="text-green-400 font-medium">{formatPrice(data.high)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">{isRTL ? 'أدنى:' : 'Low:'}</span>
              <span className="text-red-400 font-medium">{formatPrice(data.low)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">{isRTL ? 'إغلاق:' : 'Close:'}</span>
              <span className="text-white font-medium">{formatPrice(data.close)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">{isRTL ? 'الحجم:' : 'Volume:'}</span>
              <span className="text-cyan-400 font-medium">{formatVolume(data.volume)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Render chart based on type
  const renderChart = () => {
    if (!chartData.length) return null;

    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `${value.toFixed(1)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="close"
              stroke="#06B6D4"
              fill="url(#colorGradient)"
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </AreaChart>
        );

      case 'volume':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={formatVolume}
            />
            <Tooltip 
              content={<CustomTooltip />}
              formatter={(value: number) => [formatVolume(value), 'Volume']}
            />
            <Bar
              dataKey="volume"
              fill="#8B5CF6"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        );

      case 'line':
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `${value.toFixed(1)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="close"
              stroke="#06B6D4"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: '#06B6D4', strokeWidth: 2 }}
            />
          </LineChart>
        );
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32 bg-slate-600" />
            <Skeleton className="h-8 w-24 bg-slate-600" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className={`w-full bg-slate-600`} style={{ height }} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border-red-500/50">
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <div className="text-center text-red-400">
            <Activity className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">{isRTL ? 'خطأ في تحميل البيانات' : 'Error loading data'}</p>
            <p className="text-sm text-slate-400 mt-1">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refresh}
              className="mt-3"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {isRTL ? 'إعادة المحاولة' : 'Retry'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
      <CardHeader>
        <div className={cn(
          "flex items-center justify-between",
          isRTL && "flex-row-reverse"
        )}>
          <div className={cn("space-y-1", isRTL && "text-right")}>
            <CardTitle className="text-white flex items-center gap-2">
              {symbol}
              {quote && (
                <Badge 
                  variant={priceChange.isPositive ? "default" : "destructive"}
                  className="text-xs"
                >
                  {priceChange.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {priceChange.percent.toFixed(2)}%
                </Badge>
              )}
            </CardTitle>
            {quote && (
              <div className="text-2xl font-bold text-white">
                {formatPrice(quote.price)}
              </div>
            )}
          </div>
          
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
              <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">{isRTL ? 'خطي' : 'Line'}</SelectItem>
                <SelectItem value="area">{isRTL ? 'منطقة' : 'Area'}</SelectItem>
                <SelectItem value="volume">{isRTL ? 'الحجم' : 'Volume'}</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
              className="bg-slate-700 border-slate-600 hover:bg-slate-600"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
