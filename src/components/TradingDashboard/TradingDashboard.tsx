
import { MarketOverview } from './MarketOverview';
import { TopStocks } from './TopStocks';
import { TradingViewChart } from './TradingViewChart';
import { TechnicalSummary } from './TechnicalSummary';
import { NewsPanel } from './NewsPanel';
import { QuickActions } from './QuickActions';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface TradingDashboardProps {
  marketData: any;
  onStockSelect: (stock: any) => void;
}

export const TradingDashboard = ({ marketData, onStockSelect }: TradingDashboardProps) => {
  const { isRTL } = useLanguage();

  return (
    <div className={cn("space-y-6", isRTL && "text-right")}>
      {/* Market Overview */}
      <MarketOverview />

      {/* Main Content Grid */}
      <div className={cn(
        "grid grid-cols-1 xl:grid-cols-3 gap-6",
        isRTL && "xl:grid-flow-col-dense"
      )}>
        {/* Charts Column */}
        <div className={cn(
          "xl:col-span-2 space-y-6",
          isRTL && "xl:col-start-1"
        )}>
          <TradingViewChart />
          <TechnicalSummary />
        </div>

        {/* Data Column */}
        <div className={cn(
          "space-y-6",
          isRTL && "xl:col-start-3"
        )}>
          <TopStocks onStockSelect={onStockSelect} />
          <QuickActions />
          <NewsPanel />
        </div>
      </div>
    </div>
  );
};
