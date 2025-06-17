
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Shield, TrendingDown } from 'lucide-react';

export const RiskMetrics = () => {
  const riskData = [
    { metric: 'Beta', value: 1.2, benchmark: 1.0, status: 'medium' },
    { metric: 'Volatility', value: 0.18, benchmark: 0.15, status: 'high' },
    { metric: 'VaR (95%)', value: 0.05, benchmark: 0.04, status: 'medium' },
    { metric: 'Max Drawdown', value: 0.085, benchmark: 0.12, status: 'good' }
  ];

  const correlationData = [
    { stock: 'COMI.CA', correlation: 0.75 },
    { stock: 'ETEL.CA', correlation: 0.45 },
    { stock: 'HRHO.CA', correlation: 0.32 },
    { stock: 'MNHD.CA', correlation: 0.58 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'high': return 'text-red-400 bg-red-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Risk Metrics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {riskData.map((item, index) => (
            <div key={index} className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-slate-300">{item.metric}</h4>
                <Badge className={`${getStatusColor(item.status)} border-0 text-xs`}>
                  {item.status}
                </Badge>
              </div>
              <div className="text-xl font-bold text-white">
                {item.metric.includes('%') || item.metric === 'VaR (95%)' 
                  ? `${(item.value * 100).toFixed(1)}%`
                  : item.value.toFixed(2)
                }
              </div>
              <div className="text-xs text-slate-400">
                Benchmark: {item.metric.includes('%') || item.metric === 'VaR (95%)'
                  ? `${(item.benchmark * 100).toFixed(1)}%`
                  : item.benchmark.toFixed(2)
                }
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Correlation Analysis */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Position Correlation with EGX 30</h3>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={correlationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="stock" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                domain={[0, 1]}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <Tooltip 
                formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, 'Correlation']}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
              <Bar 
                dataKey="correlation" 
                fill="#06b6d4" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Risk Alerts */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Risk Alerts</h3>
        
        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-400" size={20} />
              <div>
                <h4 className="font-semibold text-red-400">High Sector Concentration</h4>
                <p className="text-sm text-slate-300 mt-1">
                  Banking sector represents 40% of portfolio. Consider diversification.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="text-yellow-400" size={20} />
              <div>
                <h4 className="font-semibold text-yellow-400">Elevated Volatility</h4>
                <p className="text-sm text-slate-300 mt-1">
                  Portfolio volatility (18%) is above benchmark. Monitor position sizes.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Shield className="text-green-400" size={20} />
              <div>
                <h4 className="font-semibold text-green-400">Good Diversification</h4>
                <p className="text-sm text-slate-300 mt-1">
                  Low correlation between positions provides good risk reduction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Risk Recommendations */}
      <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="text-cyan-400" size={20} />
          <h3 className="text-lg font-semibold text-cyan-400">Risk Management Recommendations</h3>
        </div>
        
        <div className="space-y-3 text-sm text-slate-300">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
            <p>Consider reducing banking sector exposure to below 30% of portfolio</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
            <p>Add defensive stocks or bonds to reduce overall portfolio volatility</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
            <p>Implement trailing stop losses on winning positions to protect gains</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
