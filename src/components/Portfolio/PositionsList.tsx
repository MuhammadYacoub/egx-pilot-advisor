
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, MoreHorizontal } from 'lucide-react';

interface PositionsListProps {
  positions: any[];
}

export const PositionsList = ({ positions }: PositionsListProps) => {
  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'STRONG_BUY': return 'text-green-400 bg-green-500/20';
      case 'BUY': return 'text-cyan-400 bg-cyan-500/20';
      case 'HOLD': return 'text-yellow-400 bg-yellow-500/20';
      case 'SELL': return 'text-red-400 bg-red-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Current Positions</h3>
        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
          Add Position
        </Button>
      </div>

      <div className="space-y-4">
        {positions.map((position, index) => (
          <div key={position.symbol} className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                  {position.symbol.substring(0, 2)}
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white">{position.symbol}</h4>
                    <Badge className={`${getRecommendationColor(position.recommendation)} border-0 text-xs`}>
                      {position.recommendation.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-300">{position.name}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                    <span>Qty: {position.quantity.toLocaleString()}</span>
                    <span>Avg Cost: {position.avgCost} EGP</span>
                    <span>Weight: {(position.weight * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-semibold text-white">
                  {position.currentPrice} EGP
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  position.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {position.unrealizedPnL >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>
                    {position.unrealizedPnL >= 0 ? '+' : ''}{position.unrealizedPnL.toLocaleString()} EGP
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {((position.currentPrice - position.avgCost) / position.avgCost * 100).toFixed(2)}%
                </div>
              </div>

              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-300">
                <MoreHorizontal size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-slate-700/20 rounded-lg border border-slate-600/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Total Unrealized P&L:</span>
          <span className="font-semibold text-green-400">
            +{positions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0).toLocaleString()} EGP
          </span>
        </div>
      </div>
    </Card>
  );
};
