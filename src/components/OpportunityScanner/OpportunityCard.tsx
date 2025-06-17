
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, TrendingUp, Volume, Target, Shield } from 'lucide-react';

interface OpportunityCardProps {
  opportunity: any;
  onSelect: () => void;
}

export const OpportunityCard = ({ opportunity, onSelect }: OpportunityCardProps) => {
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'VERY_HIGH': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'HIGH': return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'STRONG_BUY': return 'text-green-400 bg-green-500/20';
      case 'BUY': return 'text-cyan-400 bg-cyan-500/20';
      case 'HOLD': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const scoreColor = opportunity.opportunityScore >= 0.9 ? 'text-green-400' :
                    opportunity.opportunityScore >= 0.8 ? 'text-cyan-400' :
                    opportunity.opportunityScore >= 0.7 ? 'text-yellow-400' : 'text-slate-400';

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6 hover:bg-slate-800/70 transition-all duration-200 group cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* Rank Badge */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
            {opportunity.rank}
          </div>

          {/* Stock Info */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-xl text-white">{opportunity.symbol}</h3>
              {opportunity.opportunityScore >= 0.9 && (
                <Star size={16} className="text-yellow-400 fill-current" />
              )}
            </div>
            <p className="text-slate-300 font-medium">{opportunity.companyName}</p>
            <p className="text-slate-400 text-sm arabic-text">{opportunity.companyNameAr}</p>
            <Badge className="mt-1 bg-purple-500/20 text-purple-400 border-0 text-xs">
              {opportunity.sector}
            </Badge>
          </div>
        </div>

        {/* Score and Price */}
        <div className="text-right">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-slate-400">Score:</span>
            <span className={`text-2xl font-bold ${scoreColor}`}>
              {(opportunity.opportunityScore * 100).toFixed(0)}%
            </span>
          </div>
          <div className="text-xl font-semibold text-white">{opportunity.currentPrice} EGP</div>
          <Badge className={`${getConfidenceColor(opportunity.confidence)} border text-xs mt-1`}>
            {opportunity.confidence.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Signals Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-green-400" />
            <span className="text-xs font-medium text-slate-300">Momentum</span>
          </div>
          <div className="text-sm font-semibold text-green-400">
            {(opportunity.signals.momentum.score * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-slate-400">{opportunity.signals.momentum.primary}</div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Volume size={14} className="text-purple-400" />
            <span className="text-xs font-medium text-slate-300">Volume</span>
          </div>
          <div className="text-sm font-semibold text-purple-400">
            {(opportunity.signals.volume.score * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-slate-400">{opportunity.signals.volume.primary}</div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target size={14} className="text-cyan-400" />
            <span className="text-xs font-medium text-slate-300">Pattern</span>
          </div>
          <div className="text-sm font-semibold text-cyan-400">
            {(opportunity.signals.pattern.score * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-slate-400">{opportunity.signals.pattern.primary}</div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Star size={14} className="text-yellow-400" />
            <span className="text-xs font-medium text-slate-300">Wyckoff</span>
          </div>
          <div className="text-sm font-semibold text-yellow-400">
            {(opportunity.signals.wyckoff.score * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-slate-400">{opportunity.signals.wyckoff.primary}</div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-slate-700/20 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <Badge className={`${getActionColor(opportunity.recommendation.action)} border-0 font-semibold`}>
            {opportunity.recommendation.action.replace('_', ' ')}
          </Badge>
          <span className="text-sm text-slate-400">Timeframe: {opportunity.recommendation.timeframe}</span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Entry Zone:</span>
            <div className="font-semibold text-cyan-400">
              {opportunity.recommendation.entryZone[0]} - {opportunity.recommendation.entryZone[1]} EGP
            </div>
          </div>
          <div>
            <span className="text-slate-400">Target:</span>
            <div className="font-semibold text-green-400">
              {opportunity.recommendation.targets[0]} EGP
            </div>
          </div>
          <div>
            <span className="text-slate-400">Stop Loss:</span>
            <div className="font-semibold text-red-400">
              {opportunity.recommendation.stopLoss} EGP
            </div>
          </div>
        </div>
      </div>

      {/* Catalysts */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-slate-300 mb-2">Key Catalysts:</h4>
        <div className="flex flex-wrap gap-2">
          {opportunity.catalysts.map((catalyst: string, index: number) => (
            <Badge key={index} className="bg-blue-500/20 text-blue-400 border-0 text-xs">
              {catalyst}
            </Badge>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <Button 
        onClick={onSelect}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold group-hover:scale-[1.02] transition-all duration-200"
      >
        Analyze Stock →
      </Button>
    </Card>
  );
};
