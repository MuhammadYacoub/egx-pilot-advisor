
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface PortfolioOverviewProps {
  data: any;
}

export const PortfolioOverview = ({ data }: PortfolioOverviewProps) => {
  const allocationData = [
    { name: 'COMI.CA', value: 35, amount: 52500 },
    { name: 'ETEL.CA', value: 6, amount: 9000 },
    { name: 'HRHO.CA', value: 8, amount: 12000 },
    { name: 'Cash', value: 17, amount: 25000 },
    { name: 'Others', value: 34, amount: 51500 }
  ];

  const sectorData = [
    { name: 'Banking', value: 40, color: '#06b6d4' },
    { name: 'Real Estate', value: 15, color: '#8b5cf6' },
    { name: 'Telecom', value: 10, color: '#10b981' },
    { name: 'Industrial', value: 18, color: '#f59e0b' },
    { name: 'Cash', value: 17, color: '#64748b' }
  ];

  const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#64748b'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Asset Allocation */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Asset Allocation</h3>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [`${value}%`, name]}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          {allocationData.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <span className="text-sm text-slate-300">{item.name}</span>
              <span className="text-sm text-slate-400">({item.value}%)</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Sector Distribution */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Sector Distribution</h3>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sectorData} layout="horizontal">
              <XAxis type="number" domain={[0, 50]} stroke="#64748b" />
              <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} />
              <Tooltip 
                formatter={(value) => [`${value}%`]}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
              <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Performance Summary */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-white mb-6">Performance Summary</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">+15.0%</div>
            <div className="text-sm text-slate-400">Total Return</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">1.34</div>
            <div className="text-sm text-slate-400">Sharpe Ratio</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">-8.5%</div>
            <div className="text-sm text-slate-400">Max Drawdown</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">68%</div>
            <div className="text-sm text-slate-400">Win Rate</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
