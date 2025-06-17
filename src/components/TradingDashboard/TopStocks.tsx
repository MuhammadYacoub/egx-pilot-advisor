
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';

interface TopStocksProps {
  onStockSelect: (stock: any) => void;
}

export const TopStocks = ({ onStockSelect }: TopStocksProps) => {
  const [activeTab, setActiveTab] = useState('gainers');

  const stockData = {
    gainers: [
      { symbol: 'COMI.CA', name: 'Commercial International Bank', price: 52.30, change: 8.45, volume: '2.3M', score: 0.85 },
      { symbol: 'ETEL.CA', name: 'Egyptian Company for Mobile Services', price: 18.75, change: 6.20, volume: '1.8M', score: 0.78 },
      { symbol: 'HRHO.CA', name: 'Hassan Allam Holding', price: 15.20, change: 5.80, volume: '956K', score: 0.92 },
      { symbol: 'EGTS.CA', name: 'Egyptian Transport Services', price: 2.85, change: 4.75, volume: '687K', score: 0.73 },
      { symbol: 'MNHD.CA', name: 'Misr National Steel - Alhendya', price: 8.90, change: 4.20, volume: '1.2M', score: 0.69 }
    ],
    losers: [
      { symbol: 'OTMT.CA', name: 'Orascom Telecom Media and Technology', price: 1.45, change: -3.20, volume: '892K', score: 0.25 },
      { symbol: 'SWDY.CA', name: 'El Sewedy Electric Company', price: 12.30, change: -2.85, volume: '654K', score: 0.31 },
    ],
    active: [
      { symbol: 'COMI.CA', name: 'Commercial International Bank', price: 52.30, change: 8.45, volume: '2.3M', score: 0.85 },
      { symbol: 'ETEL.CA', name: 'Egyptian Company for Mobile Services', price: 18.75, change: 6.20, volume: '1.8M', score: 0.78 },
    ]
  };

  const tabs = [
    { id: 'gainers', label: 'Top Gainers', labelAr: 'الأكثر ارتفاعاً' },
    { id: 'losers', label: 'Top Losers', labelAr: 'الأكثر انخفاضاً' },
    { id: 'active', label: 'Most Active', labelAr: 'الأكثر نشاطاً' }
  ];

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Market Movers</h3>
        
        <div className="flex space-x-1 bg-slate-700/50 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 text-xs py-2 px-3 rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-400 font-medium'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <div>{tab.label}</div>
              <div className="text-xs opacity-70">{tab.labelAr}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {stockData[activeTab as keyof typeof stockData].map((stock, index) => (
          <div
            key={stock.symbol}
            onClick={() => onStockSelect(stock)}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                {index + 1}
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{stock.symbol}</span>
                  {stock.score > 0.8 && <Star size={12} className="text-yellow-400 fill-current" />}
                </div>
                <div className="text-xs text-slate-400 truncate max-w-32">{stock.name}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-semibold text-white">{stock.price} EGP</div>
              <div className={`flex items-center gap-1 text-xs ${
                stock.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {stock.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {stock.change >= 0 ? '+' : ''}{stock.change}%
              </div>
              <div className="text-xs text-slate-400">{stock.volume}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
