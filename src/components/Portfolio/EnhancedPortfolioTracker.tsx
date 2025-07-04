import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart,
  Activity,
  BarChart3
} from 'lucide-react';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { Portfolio } from '@/types/api';
import CreatePortfolioDialog from './CreatePortfolioDialog';
import AddPositionDialog from './AddPositionDialog';
import PortfolioPositions from './PortfolioPositions';
import PortfolioTransactions from './PortfolioTransactions';
import PortfolioPerformance from './PortfolioPerformance';

const EnhancedPortfolioTracker: React.FC = () => {
  const { user } = useAuth();
  const {
    portfolios,
    selectedPortfolio,
    isLoading,
    loadPortfolios,
    selectPortfolio,
    syncPortfolio,
  } = usePortfolio();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddPositionDialog, setShowAddPositionDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [syncCooldown, setSyncCooldown] = useState(false); // منع التحديث المتكرر

  useEffect(() => {
    if (user) {
      loadPortfolios();
    }
  }, [user]); // إزالة loadPortfolios من dependencies لمنع الحلقة اللا نهائية

  const handlePortfolioSelect = (portfolio: Portfolio) => {
    selectPortfolio(portfolio.id);
  };

  const handleSyncPortfolio = async () => {
    if (selectedPortfolio && !syncCooldown && !isLoading) {
      try {
        setSyncCooldown(true);
        await syncPortfolio(selectedPortfolio.id);
        
        // منع التحديث لمدة 5 ثوان
        setTimeout(() => {
          setSyncCooldown(false);
        }, 5000);
      } catch (error) {
        setSyncCooldown(false);
      }
    }
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (isLoading && portfolios.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحميل المحافظ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">محافظ الاستثمار</h2>
          <p className="text-muted-foreground">
            إدارة ومتابعة محافظك الاستثمارية
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleSyncPortfolio}
            disabled={!selectedPortfolio || isLoading || syncCooldown}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(isLoading || syncCooldown) ? 'animate-spin' : ''}`} />
            {syncCooldown ? 'جاري التحديث...' : 'تحديث الأسعار'}
          </Button>
          
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            محفظة جديدة
          </Button>
        </div>
      </div>

      {/* Portfolio Selection */}
      {portfolios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>المحافظ المتاحة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolios.map((portfolio) => (
                <Card 
                  key={portfolio.id}
                  className={`cursor-pointer transition-all ${
                    selectedPortfolio?.id === portfolio.id 
                      ? 'ring-2 ring-primary' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handlePortfolioSelect(portfolio)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{portfolio.name}</h3>
                      {portfolio.isDefault && (
                        <Badge variant="secondary">افتراضي</Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>القيمة الحالية:</span>
                        <span className="font-medium">
                          {formatCurrency(portfolio.currentValue)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>الربح/الخسارة:</span>
                        <span className={`font-medium flex items-center ${
                          portfolio.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {portfolio.totalPnl >= 0 ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {formatCurrency(portfolio.totalPnl)}
                        </span>
                      </div>
                      
                      {portfolio.stats && (
                        <div className="flex justify-between">
                          <span>العائد:</span>
                          <span className={`font-medium ${
                            portfolio.stats.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatPercentage(portfolio.stats.returnPercentage)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolio Details */}
      {selectedPortfolio ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="positions">المراكز</TabsTrigger>
            <TabsTrigger value="transactions">المعاملات</TabsTrigger>
            <TabsTrigger value="performance">الأداء</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        القيمة الإجمالية
                      </p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(selectedPortfolio.currentValue)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        الرصيد النقدي
                      </p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(selectedPortfolio.cashBalance)}
                      </p>
                    </div>
                    <PieChart className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        الربح/الخسارة الإجمالي
                      </p>
                      <p className={`text-2xl font-bold ${
                        selectedPortfolio.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(selectedPortfolio.totalPnl)}
                      </p>
                    </div>
                    {selectedPortfolio.totalPnl >= 0 ? (
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
                      <p className="text-sm font-medium text-muted-foreground">
                        الربح/الخسارة اليومي
                      </p>
                      <p className={`text-2xl font-bold ${
                        selectedPortfolio.dailyPnl >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(selectedPortfolio.dailyPnl)}
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>إجراءات سريعة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button onClick={() => setShowAddPositionDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    إضافة مركز
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleSyncPortfolio}
                    disabled={isLoading || syncCooldown}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${(isLoading || syncCooldown) ? 'animate-spin' : ''}`} />
                    {syncCooldown ? 'جاري التحديث...' : 'تحديث الأسعار'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="positions">
            <PortfolioPositions portfolio={selectedPortfolio} />
          </TabsContent>

          <TabsContent value="transactions">
            <PortfolioTransactions portfolio={selectedPortfolio} />
          </TabsContent>

          <TabsContent value="performance">
            <PortfolioPerformance portfolio={selectedPortfolio} />
          </TabsContent>
        </Tabs>
      ) : portfolios.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <PieChart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">لا توجد محافظ</h3>
            <p className="text-muted-foreground mb-4">
              ابدأ رحلتك الاستثمارية بإنشاء محفظتك الأولى
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              إنشاء محفظة جديدة
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">اختر محفظة</h3>
            <p className="text-muted-foreground">
              اختر محفظة من القائمة أعلاه لعرض التفاصيل
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <CreatePortfolioDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
      
      {selectedPortfolio && (
        <AddPositionDialog
          open={showAddPositionDialog}
          onOpenChange={setShowAddPositionDialog}
          portfolio={selectedPortfolio}
        />
      )}
    </div>
  );
};

export default EnhancedPortfolioTracker;
