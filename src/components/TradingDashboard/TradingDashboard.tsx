
import { MarketOverview } from './MarketOverview';
import { TopStocks } from './TopStocks';
import { LiveChart } from './LiveChart';
import { TechnicalSummary } from './TechnicalSummary';
import { NewsPanel } from './NewsPanel';
import { QuickActions } from './QuickActions';

interface TradingDashboardProps {
  marketData: any;
  onStockSelect: (stock: any) => void;
}

export const TradingDashboard = ({ marketData, onStockSelect }: TradingDashboardProps) => {
  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <MarketOverview />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="xl:col-span-2 space-y-6">
          <LiveChart />
          <TechnicalSummary />
        </div>

        {/* Right Column - Data */}
        <div className="space-y-6">
          <TopStocks onStockSelect={onStockSelect} />
          <QuickActions />
          <NewsPanel />
        </div>
      </div>
    </div>
  );
};
