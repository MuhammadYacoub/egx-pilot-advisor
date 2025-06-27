
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export const MarketOverview = () => {
  const { t, isRTL } = useLanguage();

  const marketStats = [
    {
      title: t('egx30'),
      value: '18,457.23',
      change: '+2.34%',
      changeValue: '+423.12',
      isPositive: true,
      icon: TrendingUp
    },
    {
      title: t('egx70'),
      value: '3,892.45',
      change: '+1.87%',
      changeValue: '+71.34',
      isPositive: true,
      icon: TrendingUp
    },
    {
      title: t('tradingVolume'),
      value: isRTL ? '1.2 مليار جنيه' : '1.2B EGP',
      change: '+45.2%',
      changeValue: isRTL ? '+385 مليون' : '+385M',
      isPositive: true,
      icon: Activity
    },
    {
      title: t('marketCap'),
      value: isRTL ? '892.5 مليار جنيه' : '892.5B EGP',
      change: '+0.98%',
      changeValue: isRTL ? '+8.7 مليار' : '+8.7B',
      isPositive: true,
      icon: DollarSign
    }
  ];

  return (
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
  );
};
