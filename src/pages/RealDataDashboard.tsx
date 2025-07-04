import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  TrendingUp, 
  Activity, 
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { StockChart } from '@/components/StockChart';
import { MarketOverview } from '@/components/TradingDashboard/MarketOverview';
import { useMarketData } from '@/hooks/useMarketData';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

// Popular EGX stocks for quick access
const POPULAR_STOCKS = [
  'EGAS.CA', 'CIB.CA', 'OCDI.CA', 'FWRY.CA', 'SWDY.CA',
  'HRHO.CA', 'MNHD.CA', 'PHDC.CA', 'ORAM.CA', 'IRON.CA'
];

export const RealDataDashboard = () => {
  const { isRTL } = useLanguage();
  const { stats, loading, getMarketStats } = useMarketData();
  const [selectedStock, setSelectedStock] = useState('EGAS.CA');
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleStockSelect = (symbol: string) => {
    setSelectedStock(symbol);
  };

  const handleRefresh = () => {
    getMarketStats();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between",
          isRTL && "flex-row-reverse"
        )}>
          <div className={cn("space-y-1", isRTL && "text-right")}>
            <h1 className="text-3xl font-bold text-white">
              {isRTL ? 'مستشار البورصة المصرية' : 'EGX Pilot Advisor'}
            </h1>
            <p className="text-slate-400">
              {isRTL ? 'بيانات حقيقية ومباشرة من السوق' : 'Real-time market data and analysis'}
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            {isRTL ? 'تحديث' : 'Refresh'}
          </Button>
        </div>

        {/* Market Overview */}
        <MarketOverview />

        {/* Stock Search and Selection */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Search className="h-5 w-5" />
              {isRTL ? 'اختيار السهم' : 'Stock Selection'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search Input */}
              <div className="flex gap-2">
                <Input
                  placeholder={isRTL ? 'ابحث عن سهم...' : 'Search for a stock...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
                <Button variant="outline" className="bg-slate-700 border-slate-600">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Popular Stocks */}
              <div className={cn("space-y-2", isRTL && "text-right")}>
                <p className="text-sm text-slate-400">
                  {isRTL ? 'الأسهم الشائعة:' : 'Popular Stocks:'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_STOCKS.map((stock) => (
                    <Badge
                      key={stock}
                      variant={selectedStock === stock ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer hover:bg-cyan-600 transition-colors",
                        selectedStock === stock && "bg-cyan-600"
                      )}
                      onClick={() => handleStockSelect(stock)}
                    >
                      {stock}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="chart" className="space-y-4">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger value="chart" className="data-[state=active]:bg-cyan-600">
              <LineChart className="h-4 w-4 mr-2" />
              {isRTL ? 'الرسم البياني' : 'Chart'}
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-cyan-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              {isRTL ? 'التحليل' : 'Analysis'}
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-cyan-600">
              <PieChart className="h-4 w-4 mr-2" />
              {isRTL ? 'المحفظة' : 'Portfolio'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-4">
            {/* Stock Chart */}
            <StockChart symbol={selectedStock} height={500} />
            
            {/* Additional Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <StockChart symbol={selectedStock} height={300} />
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
                <CardHeader>
                  <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <Activity className="h-5 w-5" />
                    {isRTL ? 'إحصائيات السهم' : 'Stock Statistics'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={cn("space-y-3", isRTL && "text-right")}>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">
                        {isRTL ? 'الرمز:' : 'Symbol:'}
                      </span>
                      <span className="text-white font-medium">{selectedStock}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">
                        {isRTL ? 'السوق:' : 'Market:'}
                      </span>
                      <span className="text-white font-medium">EGX</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">
                        {isRTL ? 'العملة:' : 'Currency:'}
                      </span>
                      <span className="text-white font-medium">EGP</span>
                    </div>
                    {stats && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">
                          {isRTL ? 'نطاق البيانات:' : 'Data Range:'}
                        </span>
                        <span className="text-white font-medium text-xs">
                          {new Date(stats.dateRange.oldest).toLocaleDateString()} - 
                          {new Date(stats.dateRange.newest).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analysis">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <BarChart3 className="h-5 w-5" />
                  {isRTL ? 'التحليل الفني' : 'Technical Analysis'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 text-slate-400">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{isRTL ? 'التحليل الفني قريباً...' : 'Technical analysis coming soon...'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <PieChart className="h-5 w-5" />
                  {isRTL ? 'إدارة المحفظة' : 'Portfolio Management'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 text-slate-400">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{isRTL ? 'إدارة المحفظة قريباً...' : 'Portfolio management coming soon...'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
