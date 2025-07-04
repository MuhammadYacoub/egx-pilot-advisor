import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { useEGXData, HistoricalDataPoint } from '@/hooks/useEGXData';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Calendar, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface EGXChartProps {
  symbol?: string;
  onSymbolChange?: (symbol: string) => void;
}

const CHART_PERIODS = [
  { key: '1m', label: '1M', days: 30 },
  { key: '3m', label: '3M', days: 90 },
  { key: '6m', label: '6M', days: 180 },
  { key: '1y', label: '1Y', days: 365 },
  { key: '2y', label: '2Y', days: 730 },
];

const DEFAULT_SYMBOLS = ['EGAS.CA', 'COMI.CA', 'ETEL.CA', 'HRHO.CA'];

export const EGXChart = ({ symbol: externalSymbol, onSymbolChange }: EGXChartProps) => {
  const { isRTL } = useLanguage();
  const { getHistoricalData, isLoading } = useEGXData();
  
  const [selectedSymbol, setSelectedSymbol] = useState(externalSymbol || DEFAULT_SYMBOLS[0]);
  const [selectedPeriod, setSelectedPeriod] = useState('1y');
  const [chartData, setChartData] = useState<HistoricalDataPoint[]>([]);
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  const [error, setError] = useState<string | null>(null);

  // Load chart data
  const loadChartData = async () => {
    if (!selectedSymbol) return;
    
    setError(null);
    try {
      const data = await getHistoricalData(selectedSymbol, selectedPeriod, 'db');
      
      // Transform data for chart
      const transformedData = data
        .map(point => ({
          ...point,
          date: new Date(point.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          timestamp: new Date(point.date).getTime(),
        }))
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(-100); // Show last 100 data points for performance
      
      setChartData(transformedData);
    } catch (err) {
      console.error('Failed to load chart data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    }
  };

  useEffect(() => {
    loadChartData();
  }, [selectedSymbol, selectedPeriod]);

  useEffect(() => {
    if (externalSymbol && externalSymbol !== selectedSymbol) {
      setSelectedSymbol(externalSymbol);
    }
  }, [externalSymbol]);

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
    onSymbolChange?.(symbol);
  };

  // Calculate price change
  const firstPrice = chartData[0]?.close || 0;
  const lastPrice = chartData[chartData.length - 1]?.close || 0;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = firstPrice ? (priceChange / firstPrice) * 100 : 0;
  const isPositive = priceChange >= 0;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover/90 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{label}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{isRTL ? 'الافتتاح:' : 'Open:'}</span>
              <span>{data.open?.toFixed(2)} EGP</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{isRTL ? 'الأعلى:' : 'High:'}</span>
              <span>{data.high?.toFixed(2)} EGP</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{isRTL ? 'الأدنى:' : 'Low:'}</span>
              <span>{data.low?.toFixed(2)} EGP</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{isRTL ? 'الإغلاق:' : 'Close:'}</span>
              <span className="font-medium">{data.close?.toFixed(2)} EGP</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{isRTL ? 'الحجم:' : 'Volume:'}</span>
              <span>{data.volume?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-destructive">
          <BarChart3 className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p className="text-sm">{isRTL ? 'خطأ في تحميل بيانات المخطط' : 'Error loading chart data'}</p>
          <p className="text-xs opacity-70 mt-1">{error}</p>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={loadChartData} 
            className="mt-3"
          >
            {isRTL ? 'إعادة المحاولة' : 'Try Again'}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between mb-6",
        isRTL && "flex-row-reverse"
      )}>
        <div>
          <h3 className="text-lg font-semibold mb-1">
            {isRTL ? 'مخطط الأسعار' : 'Price Chart'}
          </h3>
          <div className={cn(
            "flex items-center gap-2",
            isRTL && "flex-row-reverse"
          )}>
            <span className="text-sm text-muted-foreground">{selectedSymbol}</span>
            {chartData.length > 0 && (
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs",
                  isPositive 
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                )}
              >
                {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
              </Badge>
            )}
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-2",
          isRTL && "flex-row-reverse"
        )}>
          {/* Chart Type Toggle */}
          <Button
            size="sm"
            variant={chartType === 'line' ? 'default' : 'outline'}
            onClick={() => setChartType('line')}
            className="h-8 px-3"
          >
            Line
          </Button>
          <Button
            size="sm"
            variant={chartType === 'area' ? 'default' : 'outline'}
            onClick={() => setChartType('area')}
            className="h-8 px-3"
          >
            Area
          </Button>
        </div>
      </div>

      {/* Symbol Selection */}
      <div className="flex flex-wrap gap-2 mb-4">
        {DEFAULT_SYMBOLS.map((symbol) => (
          <Button
            key={symbol}
            size="sm"
            variant={selectedSymbol === symbol ? 'default' : 'outline'}
            onClick={() => handleSymbolChange(symbol)}
            className="h-8 px-3 text-xs"
          >
            {symbol.replace('.CA', '')}
          </Button>
        ))}
      </div>

      {/* Period Selection */}
      <div className="flex gap-1 mb-6 p-1 bg-muted/30 rounded-lg w-fit">
        {CHART_PERIODS.map((period) => (
          <Button
            key={period.key}
            size="sm"
            variant={selectedPeriod === period.key ? 'default' : 'ghost'}
            onClick={() => setSelectedPeriod(period.key)}
            className="h-7 px-3 text-xs"
          >
            {period.label}
          </Button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-64 md:h-80">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BarChart3 className="mx-auto h-8 w-8 mb-2 opacity-50 animate-pulse" />
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'جاري تحميل البيانات...' : 'Loading chart data...'}
              </p>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BarChart3 className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'لا توجد بيانات متاحة' : 'No data available'}
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  domain={['dataMin * 0.98', 'dataMax * 1.02']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorClose)"
                  strokeWidth={2}
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  domain={['dataMin * 0.98', 'dataMax * 1.02']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Chart Summary */}
      {chartData.length > 0 && (
        <div className={cn(
          "flex items-center justify-between mt-4 pt-4 border-t border-border text-xs text-muted-foreground",
          isRTL && "flex-row-reverse"
        )}>
          <span>
            {isRTL ? 'عدد النقاط:' : 'Data Points:'} {chartData.length}
          </span>
          <span>
            {isRTL ? 'آخر سعر:' : 'Last Price:'} {lastPrice.toFixed(2)} EGP
          </span>
        </div>
      )}
    </Card>
  );
};
