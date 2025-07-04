
import { TrendingUp, TrendingDown, Activity, DollarSign, Database } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMarketData } from '@/hooks/useMarketData';
import { cn } from '@/lib/utils';

export const MarketOverview = () => {
  const { t, isRTL } = useLanguage();
  const { stats, loading, error, isConnected } = useMarketData();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24 bg-slate-600" />
              <Skeleton className="h-8 w-32 bg-slate-600" />
              <Skeleton className="h-4 w-20 bg-slate-600" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border-red-500/50 p-6">
        <div className="text-center text-red-400">
          <Activity className="h-8 w-8 mx-auto mb-2" />
          <p className="font-medium">خطأ في تحميل البيانات</p>
          <p className="text-sm text-slate-400 mt-1">{error}</p>
        </div>
      </Card>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-EG' : 'en-US').format(num);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const marketStats = [
    {
      title: isRTL ? 'إجمالي السجلات' : 'Total Records',
      value: formatNumber(stats?.totalHistoricalRecords || 0),
      change: '+100%',
      changeValue: isRTL ? 'جديد' : 'New',
      isPositive: true,
      icon: Database
    },
    {
      title: isRTL ? 'الأسهم المتاحة' : 'Available Stocks',
      value: formatNumber(stats?.uniqueSymbols || 0),
      change: '+96%',
      changeValue: isRTL ? 'نشط' : 'Active',
      isPositive: true,
      icon: TrendingUp
    },
    {
      title: isRTL ? 'البيانات المخزنة' : 'Cached Data',
      value: formatNumber(stats?.marketCacheEntries || 0),
      change: '+93%',
      changeValue: isRTL ? 'محدث' : 'Updated',
      isPositive: true,
      icon: Activity
    },
    {
      title: isRTL ? 'متوسط السجلات' : 'Avg Records',
      value: stats ? formatNumber(Math.round(stats.totalHistoricalRecords / stats.uniqueSymbols)) : '0',
      change: '+238',
      changeValue: isRTL ? 'سجل/سهم' : 'per stock',
      isPositive: true,
      icon: DollarSign
    }
  ];

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
        <Badge variant={isConnected ? "default" : "destructive"}>
          {isConnected 
            ? (isRTL ? 'متصل بالخادم' : 'Connected to Server')
            : (isRTL ? 'غير متصل' : 'Disconnected')
          }
        </Badge>
        {stats && (
          <span className="text-sm text-slate-400">
            {isRTL ? 'آخر تحديث:' : 'Last updated:'} {formatDate(stats.dateRange.newest)}
          </span>
        )}
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {marketStats.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <Card key={index} className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6 hover:bg-slate-800/70 transition-all duration-200">
              <div className={cn(
                "flex items-center justify-between mb-3",
                isRTL && "flex-row-reverse"
              )}>
                <div className={cn(
                  "flex items-center gap-2",
                  isRTL && "flex-row-reverse"
                )}>
                  <Icon size={20} className="text-cyan-400" />
                  <h3 className={cn(
                    "text-sm font-medium text-slate-300",
                    isRTL && "text-right"
                  )}>{stat.title}</h3>
                </div>
              </div>
              
              <div className={cn("space-y-1", isRTL && "text-right")}>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className={cn(
                  `flex items-center gap-1 text-sm ${
                    stat.isPositive ? 'text-green-400' : 'text-red-400'
                  }`,
                  isRTL && "flex-row-reverse justify-end"
                )}>
                  {stat.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{stat.change}</span>
                  <span className="text-slate-400">({stat.changeValue})</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
