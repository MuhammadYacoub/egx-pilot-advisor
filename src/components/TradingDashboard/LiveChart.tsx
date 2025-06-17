
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export const LiveChart = () => {
  const [timeframe, setTimeframe] = useState('1D');
  const [chartType, setChartType] = useState('line');

  // Simulated EGX 30 data
  const chartData = [
    { time: '10:00', value: 18234, volume: 45000000 },
    { time: '10:30', value: 18267, volume: 52000000 },
    { time: '11:00', value: 18298, volume: 48000000 },
    { time: '11:30', value: 18276, volume: 55000000 },
    { time: '12:00', value: 18312, volume: 61000000 },
    { time: '12:30', value: 18345, volume: 58000000 },
    { time: '13:00', value: 18398, volume: 67000000 },
    { time: '13:30', value: 18423, volume: 72000000 },
    { time: '14:00', value: 18457, volume: 78000000 },
  ];

  const timeframes = ['1D', '5D', '1M', '3M', '6M', '1Y'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-slate-300 text-sm">{`Time: ${label}`}</p>
          <p className="text-cyan-400 font-semibold">
            {`Price: ${payload[0].value.toLocaleString()} EGP`}
          </p>
          {payload[1] && (
            <p className="text-purple-400 text-sm">
              {`Volume: ${(payload[1].value / 1000000).toFixed(1)}M EGP`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">EGX 30 Index</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-cyan-400">18,457.23</span>
            <span className="text-green-400 text-sm">+423.12 (+2.34%)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-700/50 rounded-lg p-1">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 text-xs rounded-md transition-all duration-200 ${
                  timeframe === tf
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="flex bg-slate-700/50 rounded-lg p-1">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 text-xs rounded-md transition-all duration-200 ${
                chartType === 'line'
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1 text-xs rounded-md transition-all duration-200 ${
                chartType === 'area'
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Area
            </button>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="time" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                domain={['dataMin - 50', 'dataMax + 50']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#06b6d4" 
                strokeWidth={2}
                dot={{ fill: '#06b6d4', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, fill: '#06b6d4' }}
              />
            </LineChart>
          ) : (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="time" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                domain={['dataMin - 50', 'dataMax + 50']}
              />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#06b6d4" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorValue)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
