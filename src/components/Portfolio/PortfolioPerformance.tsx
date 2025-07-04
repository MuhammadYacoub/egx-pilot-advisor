import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, PieChart, BarChart3, RefreshCw } from 'lucide-react';
import { Portfolio, PerformanceReport } from '@/types/api';
import { portfolioApi } from '@/services/portfolio.service';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface PortfolioPerformanceProps {
  portfolio: Portfolio;
}

const PortfolioPerformance: React.FC<PortfolioPerformanceProps> = ({ portfolio }) => {
  const [performanceData, setPerformanceData] = useState<PerformanceReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'ALL'>('1M');

  const loadPerformanceData = async (period: typeof selectedPeriod) => {
    try {
      setIsLoading(true);
      const response = await portfolioApi.getPerformanceReport(portfolio.id, period);
      
      if (response.success && response.data) {
        setPerformanceData(response.data);
      }
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPerformanceData(selectedPeriod);
  }, [portfolio.id, selectedPeriod]);

  const handlePeriodChange = (period: typeof selectedPeriod) => {
    setSelectedPeriod(period);
  };

  const handleRefresh = () => {
    loadPerformanceData(selectedPeriod);
  };

  if (!performanceData) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <RefreshCw className={`w-8 h-8 mx-auto mb-4 ${isLoading ? 'animate-spin' : ''}`} />
          <p className="text-muted-foreground">
            {isLoading ? 'جاري تحميل بيانات الأداء...' : 'لا توجد بيانات أداء متاحة'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const { summary, performance, transactions } = performanceData;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>تقرير الأداء</CardTitle>
            <div className="flex items-center gap-4">
              <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1D">يوم واحد</SelectItem>
                  <SelectItem value="1W">أسبوع</SelectItem>
                  <SelectItem value="1M">شهر</SelectItem>
                  <SelectItem value="3M">3 أشهر</SelectItem>
                  <SelectItem value="6M">6 أشهر</SelectItem>
                  <SelectItem value="1Y">سنة</SelectItem>
                  <SelectItem value="YTD">من بداية السنة</SelectItem>
                  <SelectItem value="ALL">الكل</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">القيمة الحالية</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.currentValue)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الربح/الخسارة</p>
                <p className={`text-2xl font-bold ${
                  summary.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(summary.totalPnl)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatPercentage(summary.totalPnlPercent)}
                </p>
              </div>
              {summary.totalPnl >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">المبلغ المستثمر</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalInvested)}</p>
              </div>
              <PieChart className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">الرصيد النقدي</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.cashBalance)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top/Worst Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              أفضل الأسهم أداءً
            </CardTitle>
          </CardHeader>
          <CardContent>
            {performance.topPerformers.length > 0 ? (
              <div className="space-y-4">
                {performance.topPerformers.map((stock, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{stock.symbol}</p>
                      <p className="text-sm text-muted-foreground">{stock.companyName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        {formatCurrency(stock.pnl)}
                      </p>
                      <p className="text-sm text-green-600">
                        {formatPercentage(stock.pnlPercent)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                لا توجد بيانات متاحة
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
              أسوأ الأسهم أداءً
            </CardTitle>
          </CardHeader>
          <CardContent>
            {performance.worstPerformers.length > 0 ? (
              <div className="space-y-4">
                {performance.worstPerformers.map((stock, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{stock.symbol}</p>
                      <p className="text-sm text-muted-foreground">{stock.companyName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">
                        {formatCurrency(stock.pnl)}
                      </p>
                      <p className="text-sm text-red-600">
                        {formatPercentage(stock.pnlPercent)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                لا توجد بيانات متاحة
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sector Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>توزيع القطاعات</CardTitle>
        </CardHeader>
        <CardContent>
          {performance.sectorAllocation.length > 0 ? (
            <div className="space-y-4">
              {performance.sectorAllocation.map((sector, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{sector.sector}</span>
                    <div className="text-right">
                      <span className="font-medium">{formatCurrency(sector.value)}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({formatPercentage(sector.percentage)})
                      </span>
                    </div>
                  </div>
                  <Progress value={sector.percentage} className="h-2" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              لا توجد مراكز لعرض التوزيع القطاعي
            </p>
          )}
        </CardContent>
      </Card>

      {/* Transaction Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>إحصائيات المعاملات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">إجمالي المعاملات</p>
              <p className="text-2xl font-bold">{transactions.total}</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">عمليات الشراء</p>
              <p className="text-2xl font-bold text-green-600">{transactions.buys}</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">عمليات البيع</p>
              <p className="text-2xl font-bold text-red-600">{transactions.sells}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>المقاييس التفصيلية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>رأس المال الأولي:</span>
                <span className="font-medium">{formatCurrency(summary.initialCapital)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>المبلغ المستثمر:</span>
                <span className="font-medium">{formatCurrency(summary.totalInvested)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>المبلغ المسحوب:</span>
                <span className="font-medium">{formatCurrency(summary.totalWithdrawn)}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>الربح/الخسارة غير المحققة:</span>
                <span className={`font-medium ${
                  summary.unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(summary.unrealizedPnl)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>الربح/الخسارة المحققة:</span>
                <span className={`font-medium ${
                  summary.realizedPnl >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(summary.realizedPnl)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>العائد الإجمالي:</span>
                <span className={`font-medium ${
                  summary.totalPnlPercent >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(summary.totalPnlPercent)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioPerformance;
