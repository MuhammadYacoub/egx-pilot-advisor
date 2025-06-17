
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const MarketOverview = () => {
  const marketStats = [
    {
      title: 'EGX 30',
      value: '18,457.23',
      change: '+2.34%',
      changeValue: '+423.12',
      isPositive: true,
      icon: TrendingUp
    },
    {
      title: 'EGX 70',
      value: '3,892.45',
      change: '+1.87%',
      changeValue: '+71.34',
      isPositive: true,
      icon: TrendingUp
    },
    {
      title: 'Trading Volume',
      value: '1.2B EGP',
      change: '+45.2%',
      changeValue: '+385M',
      isPositive: true,
      icon: Activity
    },
    {
      title: 'Market Cap',
      value: '892.5B EGP',
      change: '+0.98%',
      changeValue: '+8.7B',
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
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon size={20} className="text-cyan-400" />
                <h3 className="text-sm font-medium text-slate-300">{stat.title}</h3>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className={`flex items-center gap-1 text-sm ${
                stat.isPositive ? 'text-green-400' : 'text-red-400'
              }`}>
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
