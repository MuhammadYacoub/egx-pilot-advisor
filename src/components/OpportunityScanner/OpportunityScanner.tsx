
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Filter, Star, TrendingUp, Volume, Activity } from 'lucide-react';
import { OpportunityCard } from './OpportunityCard';
import { ScannerFilters } from './ScannerFilters';

interface OpportunityScannerProps {
  onStockSelect: (stock: any) => void;
}

export const OpportunityScanner = ({ onStockSelect }: OpportunityScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const opportunities = [
    {
      rank: 1,
      symbol: 'HRHO.CA',
      companyName: 'Hassan Allam Holding',
      companyNameAr: 'حسن علام هولدنج',
      sector: 'Real Estate',
      currentPrice: 15.20,
      opportunityScore: 0.92,
      confidence: 'VERY_HIGH',
      signals: {
        momentum: { score: 0.88, primary: 'RSI oversold recovery' },
        volume: { score: 0.95, primary: 'Volume spike 3.2x' },
        pattern: { score: 0.94, primary: 'Cup and Handle' },
        wyckoff: { score: 0.88, primary: 'Markup Phase A' }
      },
      recommendation: {
        action: 'STRONG_BUY',
        entryZone: [15.10, 15.30],
        targets: [17.50, 18.50, 20.00],
        stopLoss: 14.20,
        timeframe: '2-8 weeks'
      },
      catalysts: ['Resistance breakout', 'Institutional accumulation', 'Sector rotation']
    },
    {
      rank: 2,
      symbol: 'EGTS.CA',
      companyName: 'Egyptian Transport Services',
      companyNameAr: 'الخدمات المصرية للنقل',
      sector: 'Transportation',
      currentPrice: 2.85,
      opportunityScore: 0.87,
      confidence: 'HIGH',
      signals: {
        momentum: { score: 0.82, primary: 'MACD bullish crossover' },
        volume: { score: 0.89, primary: 'Smart money buying' },
        pattern: { score: 0.90, primary: 'Wyckoff Spring' },
        wyckoff: { score: 0.92, primary: 'Accumulation complete' }
      },
      recommendation: {
        action: 'BUY',
        entryZone: [2.80, 2.90],
        targets: [3.20, 3.50],
        stopLoss: 2.60,
        timeframe: '3-6 weeks'
      },
      catalysts: ['Technical breakout', 'Volume confirmation', 'Oversold recovery']
    },
    {
      rank: 3,
      symbol: 'MNHD.CA',
      companyName: 'Misr National Steel',
      companyNameAr: 'مصر الوطنية للصلب',
      sector: 'Industrial',
      currentPrice: 8.90,
      opportunityScore: 0.79,
      confidence: 'HIGH',
      signals: {
        momentum: { score: 0.75, primary: 'Bullish divergence' },
        volume: { score: 0.78, primary: 'Accumulation pattern' },
        pattern: { score: 0.82, primary: 'Ascending triangle' },
        wyckoff: { score: 0.73, primary: 'Phase B accumulation' }
      },
      recommendation: {
        action: 'BUY',
        entryZone: [8.80, 9.10],
        targets: [10.20, 11.50],
        stopLoss: 8.20,
        timeframe: '4-8 weeks'
      },
      catalysts: ['Triangle breakout', 'Industry recovery', 'Volume pickup']
    }
  ];

  const scannerStats = {
    totalScanned: 235,
    qualified: 45,
    hotOpportunities: opportunities.length,
    avgScore: 0.65
  };

  const runScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Scanner Header */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              🎯 Opportunity Hunter
              <span className="block text-sm text-slate-400 font-normal">صائد الفرص الذهبية</span>
            </h2>
            <p className="text-slate-300">Advanced AI-powered market scanner for high-probability opportunities</p>
          </div>

          <Button 
            onClick={runScan}
            disabled={isScanning}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-6 py-3"
          >
            {isScanning ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Scanning...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search size={18} />
                Run Full Scan
              </div>
            )}
          </Button>
        </div>

        {/* Scanner Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">{scannerStats.totalScanned}</div>
            <div className="text-sm text-slate-400">Stocks Scanned</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{scannerStats.qualified}</div>
            <div className="text-sm text-slate-400">Qualified</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{scannerStats.hotOpportunities}</div>
            <div className="text-sm text-slate-400">Hot Opportunities</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{scannerStats.avgScore.toFixed(2)}</div>
            <div className="text-sm text-slate-400">Avg Score</div>
          </div>
        </div>
      </Card>

      {/* Filters and Search */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <Input
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700/50 border-slate-600 focus:border-cyan-500"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
          >
            <Filter size={16} />
            <span className="ml-2">Filters</span>
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {['all', 'high_score', 'breakout', 'wyckoff', 'volume_surge'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                activeFilter === filter
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              {filter.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        {showFilters && <ScannerFilters />}
      </Card>

      {/* Opportunities List */}
      <div className="space-y-4">
        {opportunities.map((opportunity) => (
          <OpportunityCard
            key={opportunity.symbol}
            opportunity={opportunity}
            onSelect={() => onStockSelect(opportunity)}
          />
        ))}
      </div>

      {/* Real-time Alert */}
      {isScanning && (
        <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 p-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <div>
              <h4 className="font-semibold text-green-400">🔍 Live Scanning in Progress</h4>
              <p className="text-sm text-slate-300 mt-1">
                EGXPILOT AI is analyzing {scannerStats.totalScanned} stocks for breakthrough opportunities...
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
