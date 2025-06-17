
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const TechnicalSummary = () => {
  const indicators = [
    { name: 'RSI (14)', value: 67.34, signal: 'BUY', strength: 0.75, description: 'Approaching overbought' },
    { name: 'MACD', value: 45.23, signal: 'BUY', strength: 0.85, description: 'Bullish crossover' },
    { name: 'EMA (20)', value: 18234, signal: 'BUY', strength: 0.70, description: 'Price above EMA' },
    { name: 'Bollinger', value: 0.65, signal: 'NEUTRAL', strength: 0.50, description: 'Mid-band range' },
    { name: 'Stochastic', value: 72.18, signal: 'SELL', strength: 0.60, description: 'Overbought territory' },
    { name: 'Williams %R', value: -28.45, signal: 'BUY', strength: 0.65, description: 'Oversold recovery' }
  ];

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'text-green-400 bg-green-500/20';
      case 'SELL': return 'text-red-400 bg-red-500/20';
      default: return 'text-yellow-400 bg-yellow-500/20';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY': return <TrendingUp size={12} />;
      case 'SELL': return <TrendingDown size={12} />;
      default: return <Minus size={12} />;
    }
  };

  const overallSignal = {
    buy: indicators.filter(i => i.signal === 'BUY').length,
    sell: indicators.filter(i => i.signal === 'SELL').length,
    neutral: indicators.filter(i => i.signal === 'NEUTRAL').length
  };

  const overallRecommendation = overallSignal.buy > overallSignal.sell ? 'BUY' : 
                               overallSignal.sell > overallSignal.buy ? 'SELL' : 'NEUTRAL';

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Technical Analysis Summary</h3>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-slate-400">Overall Signal</div>
            <Badge className={`${getSignalColor(overallRecommendation)} border-0`}>
              {getSignalIcon(overallRecommendation)}
              <span className="ml-1">{overallRecommendation}</span>
            </Badge>
          </div>
          
          <div className="text-xs text-slate-400">
            <div>Buy: {overallSignal.buy}</div>
            <div>Sell: {overallSignal.sell}</div>
            <div>Neutral: {overallSignal.neutral}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {indicators.map((indicator, index) => (
          <div key={index} className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-white text-sm">{indicator.name}</h4>
              <Badge className={`${getSignalColor(indicator.signal)} border-0 text-xs`}>
                {getSignalIcon(indicator.signal)}
                <span className="ml-1">{indicator.signal}</span>
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="text-cyan-400 font-semibold">{indicator.value}</div>
              
              <div className="w-full bg-slate-600 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    indicator.signal === 'BUY' ? 'bg-green-400' : 
                    indicator.signal === 'SELL' ? 'bg-red-400' : 'bg-yellow-400'
                  }`}
                  style={{ width: `${indicator.strength * 100}%` }}
                ></div>
              </div>
              
              <p className="text-xs text-slate-400">{indicator.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-slate-700/20 rounded-lg border border-slate-600/30">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-cyan-400">AI Analysis:</span>
          <Badge className="bg-cyan-500/20 text-cyan-400 border-0 text-xs">Powered by EGXPILOT</Badge>
        </div>
        <p className="text-sm text-slate-300">
          Based on current technical indicators, the EGX 30 shows <strong className="text-green-400">bullish momentum</strong> with 
          strong buying pressure. MACD bullish crossover and RSI approaching overbought levels suggest continued upward movement. 
          However, watch for potential resistance at 18,500 level.
        </p>
      </div>
    </Card>
  );
};
