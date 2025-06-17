
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const PerformanceChart = () => {
  const performanceData = [
    { date: '2024-01', portfolio: 100000, benchmark: 100000 },
    { date: '2024-02', portfolio: 102500, benchmark: 101200 },
    { date: '2024-03', portfolio: 98000, benchmark: 99800 },
    { date: '2024-04', portfolio: 105000, benchmark: 102500 },
    { date: '2024-05', portfolio: 110000, benchmark: 104000 },
    { date: '2024-06', portfolio: 115000, benchmark: 105500 },
    { date: '2024-07', portfolio: 120000, benchmark: 107000 },
    { date: '2024-08', portfolio: 125000, benchmark: 108500 },
    { date: '2024-09', portfolio: 130000, benchmark: 110000 },
    { date: '2024-10', portfolio: 135000, benchmark: 111500 },
    { date: '2024-11', portfolio: 145000, benchmark: 113000 },
    { date: '2024-12', portfolio: 150000, benchmark: 114500 }
  ];

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Performance vs Benchmark</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
            <span className="text-slate-300">Portfolio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="text-slate-300">EGX 30</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip 
              formatter={(value, name) => [
                `${Number(value).toLocaleString()} EGP`,
                name === 'portfolio' ? 'Portfolio' : 'EGX 30'
              ]}
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#ffffff'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="portfolio" 
              stroke="#06b6d4" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: '#06b6d4' }}
            />
            <Line 
              type="monotone" 
              dataKey="benchmark" 
              stroke="#fbbf24" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 4, fill: '#fbbf24' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-green-400">+50.0%</div>
          <div className="text-xs text-slate-400">Portfolio Return</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-yellow-400">+14.5%</div>
          <div className="text-xs text-slate-400">Benchmark Return</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-cyan-400">+35.5%</div>
          <div className="text-xs text-slate-400">Alpha Generated</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-purple-400">1.34</div>
          <div className="text-xs text-slate-400">Information Ratio</div>
        </div>
      </div>
    </Card>
  );
};
