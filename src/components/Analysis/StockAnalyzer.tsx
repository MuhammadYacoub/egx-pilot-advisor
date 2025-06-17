
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, Target, Activity, BarChart3 } from 'lucide-react';

interface StockAnalyzerProps {
  selectedStock: any;
}

export const StockAnalyzer = ({ selectedStock }: StockAnalyzerProps) => {
  const [searchSymbol, setSearchSymbol] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const mockAnalysis = {
    symbol: 'COMI.CA',
    companyName: 'Commercial International Bank',
    currentPrice: 52.30,
    recommendation: 'BUY',
    targetPrice: 58.00,
    stopLoss: 47.50,
    confidence: 0.85,
    technicalScore: 0.82,
    fundamentalScore: 0.78,
    wyckoffStage: 'Accumulation Phase B',
    elliottWave: '5-Wave Impulse (Wave 3)',
    riskLevel: 'MEDIUM'
  };

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Analyzer Header */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              📊 Stock Analyzer
              <span className="block text-sm text-slate-400 font-normal">محلل الأسهم المتقدم</span>
            </h2>
            <p className="text-slate-300">Deep technical and fundamental analysis powered by AI</p>
          </div>

          <Button 
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3"
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Analyzing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <BarChart3 size={18} />
                Analyze
              </div>
            )}
          </Button>
        </div>

        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <Input
            placeholder="Enter stock symbol (e.g., COMI.CA)"
            value={searchSymbol}
            onChange={(e) => setSearchSymbol(e.target.value)}
            className="pl-10 bg-slate-700/50 border-slate-600 focus:border-purple-500 text-white placeholder-slate-400"
          />
        </div>
      </Card>

      {/* Analysis Results */}
      {!isAnalyzing && (
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">{mockAnalysis.symbol}</h3>
              <p className="text-slate-300">{mockAnalysis.companyName}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{mockAnalysis.currentPrice} EGP</div>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-0 mt-1">
                {mockAnalysis.recommendation}
              </Badge>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-700/30 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-green-400">{mockAnalysis.targetPrice} EGP</div>
              <div className="text-sm text-slate-400">Target Price</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-red-400">{mockAnalysis.stopLoss} EGP</div>
              <div className="text-sm text-slate-400">Stop Loss</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-cyan-400">{(mockAnalysis.confidence * 100).toFixed(0)}%</div>
              <div className="text-sm text-slate-400">Confidence</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-purple-400">{mockAnalysis.riskLevel}</div>
              <div className="text-sm text-slate-400">Risk Level</div>
            </div>
          </div>

          {/* Analysis Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-700/20 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3">Technical Analysis</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">Overall Score</span>
                    <span className="text-cyan-400">{(mockAnalysis.technicalScore * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div 
                      className="bg-cyan-400 h-2 rounded-full"
                      style={{ width: `${mockAnalysis.technicalScore * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm text-slate-300">
                  <strong>Wyckoff Stage:</strong> {mockAnalysis.wyckoffStage}
                </div>
                <div className="text-sm text-slate-300">
                  <strong>Elliott Wave:</strong> {mockAnalysis.elliottWave}
                </div>
              </div>
            </div>

            <div className="bg-slate-700/20 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3">Fundamental Analysis</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">Overall Score</span>
                    <span className="text-purple-400">{(mockAnalysis.fundamentalScore * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div 
                      className="bg-purple-400 h-2 rounded-full"
                      style={{ width: `${mockAnalysis.fundamentalScore * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm text-slate-300">
                  <strong>P/E Ratio:</strong> 12.5
                </div>
                <div className="text-sm text-slate-300">
                  <strong>ROE:</strong> 18.2%
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Analysis in Progress */}
      {isAnalyzing && (
        <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 p-6">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-purple-400 mb-2">🧠 AI Analysis in Progress</h3>
            <p className="text-slate-300 mb-4">
              EGXPILOT is performing comprehensive technical and fundamental analysis...
            </p>
            <div className="space-y-2 text-sm text-slate-400">
              <div>✓ Collecting real-time market data</div>
              <div>✓ Computing technical indicators</div>
              <div>⏳ Analyzing Wyckoff patterns</div>
              <div>⏳ Detecting Elliott Wave structure</div>
              <div>⏳ Evaluating risk factors</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
