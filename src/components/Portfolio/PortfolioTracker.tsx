
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, PieChart, BarChart3, DollarSign, Target } from 'lucide-react';
import { PortfolioOverview } from './PortfolioOverview';
import { PositionsList } from './PositionsList';
import { PerformanceChart } from './PerformanceChart';
import { RiskMetrics } from './RiskMetrics';

export const PortfolioTracker = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const portfolioData = {
    totalValue: 150000,
    cash: 25000,
    invested: 125000,
    todaysPnL: 2500,
    totalReturn: 0.15,
    positions: [
      {
        symbol: 'COMI.CA',
        name: 'Commercial International Bank',
        quantity: 1000,
        avgCost: 45.00,
        currentPrice: 52.30,
        unrealizedPnL: 7300,
        weight: 0.35,
        recommendation: 'HOLD'
      },
      {
        symbol: 'ETEL.CA',
        name: 'Egyptian Company for Mobile Services',
        quantity: 500,
        avgCost: 16.50,
        currentPrice: 18.75,
        unrealizedPnL: 1125,
        weight: 0.06,
        recommendation: 'BUY'
      },
      {
        symbol: 'HRHO.CA',
        name: 'Hassan Allam Holding',
        quantity: 800,
        avgCost: 14.20,
        currentPrice: 15.20,
        unrealizedPnL: 800,
        weight: 0.08,
        recommendation: 'STRONG_BUY'
      }
    ]
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: PieChart },
    { id: 'positions', label: 'Positions', icon: BarChart3 },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'risk', label: 'Risk Analysis', icon: Target }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'positions':
        return <PositionsList positions={portfolioData.positions} />;
      case 'performance':
        return <PerformanceChart />;
      case 'risk':
        return <RiskMetrics />;
      default:
        return <PortfolioOverview data={portfolioData} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Header */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              💼 Portfolio Tracker
              <span className="block text-sm text-slate-400 font-normal">متتبع المحفظة الاستثمارية</span>
            </h2>
            <p className="text-slate-300">Monitor your investments and track performance</p>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-white">{portfolioData.totalValue.toLocaleString()} EGP</div>
            <div className={`flex items-center gap-1 ${portfolioData.todaysPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {portfolioData.todaysPnL >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>Today: {portfolioData.todaysPnL >= 0 ? '+' : ''}{portfolioData.todaysPnL.toLocaleString()} EGP</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-700/30 rounded-lg p-4 text-center">
            <div className="text-xl font-bold text-cyan-400">{portfolioData.invested.toLocaleString()}</div>
            <div className="text-sm text-slate-400">Invested</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4 text-center">
            <div className="text-xl font-bold text-green-400">{portfolioData.cash.toLocaleString()}</div>
            <div className="text-sm text-slate-400">Cash</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4 text-center">
            <div className="text-xl font-bold text-purple-400">{(portfolioData.totalReturn * 100).toFixed(1)}%</div>
            <div className="text-sm text-slate-400">Total Return</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4 text-center">
            <div className="text-xl font-bold text-yellow-400">{portfolioData.positions.length}</div>
            <div className="text-sm text-slate-400">Positions</div>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
        <div className="flex space-x-1 bg-slate-700/50 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-400 font-medium'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};
