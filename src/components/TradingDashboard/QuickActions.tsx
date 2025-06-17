
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Shield, TrendingUp, Calculator } from 'lucide-react';

export const QuickActions = () => {
  const actions = [
    {
      icon: Target,
      title: 'Opportunity Scanner',
      titleAr: 'صائد الفرص',
      description: 'Find high-probability trades',
      color: 'from-green-500 to-emerald-500',
      action: 'scan'
    },
    {
      icon: Shield,
      title: 'Risk Calculator',
      titleAr: 'حاسبة المخاطر',
      description: 'Calculate position sizing',
      color: 'from-blue-500 to-cyan-500',
      action: 'risk'
    },
    {
      icon: TrendingUp,
      title: 'Technical Analysis',
      titleAr: 'التحليل الفني',
      description: 'Deep stock analysis',
      color: 'from-purple-500 to-pink-500',
      action: 'analysis'
    },
    {
      icon: Calculator,
      title: 'Portfolio Optimizer',
      titleAr: 'محسن المحفظة',
      description: 'Optimize allocations',
      color: 'from-orange-500 to-red-500',
      action: 'optimize'
    }
  ];

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          
          return (
            <Button
              key={index}
              variant="ghost"
              className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-slate-700/50 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-200 group"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                <Icon size={20} className="text-white" />
              </div>
              
              <div className="text-center">
                <div className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">
                  {action.title}
                </div>
                <div className="text-xs text-slate-400 arabic-text">{action.titleAr}</div>
                <div className="text-xs text-slate-500 mt-1">{action.description}</div>
              </div>
            </Button>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-cyan-400">AI Recommendation</span>
        </div>
        <p className="text-sm text-slate-300">
          Based on current market conditions, consider running the <strong>Opportunity Scanner</strong> to identify 
          potential breakout stocks with strong technical setups.
        </p>
      </div>
    </Card>
  );
};
