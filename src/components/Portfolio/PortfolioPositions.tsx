import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { TrendingUp, TrendingDown, Trash2, Plus } from 'lucide-react';
import { Portfolio } from '@/types/api';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { formatCurrency, formatPercentage, formatDate } from '@/lib/utils';

interface PortfolioPositionsProps {
  portfolio: Portfolio;
}

const PortfolioPositions: React.FC<PortfolioPositionsProps> = ({ portfolio }) => {
  const { deletePosition } = usePortfolio();
  const [deletingPosition, setDeletingPosition] = useState<string | null>(null);

  const handleDeletePosition = async (positionId: string) => {
    try {
      setDeletingPosition(positionId);
      await deletePosition(portfolio.id, positionId);
    } catch (error) {
      console.error('Failed to delete position:', error);
    } finally {
      setDeletingPosition(null);
    }
  };

  const positions = portfolio.positions || [];

  if (positions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">لا توجد مراكز</h3>
            <p className="text-muted-foreground">
              ابدأ بإضافة أول مركز استثماري في محفظتك
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>المراكز الاستثمارية</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>السهم</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>متوسط التكلفة</TableHead>
                <TableHead>السعر الحالي</TableHead>
                <TableHead>القيمة السوقية</TableHead>
                <TableHead>الربح/الخسارة</TableHead>
                <TableHead>العائد %</TableHead>
                <TableHead>القطاع</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => {
                const unrealizedPnl = position.unrealizedPnl || 0;
                const marketValue = position.marketValue || 0;
                const totalCost = position.quantity * position.avgCost;
                const returnPercentage = totalCost > 0 ? (unrealizedPnl / totalCost) * 100 : 0;

                return (
                  <TableRow key={position.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{position.symbol}</div>
                        <div className="text-sm text-muted-foreground">
                          {position.companyName}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {position.quantity.toLocaleString()}
                    </TableCell>
                    
                    <TableCell>
                      {formatCurrency(position.avgCost)}
                    </TableCell>
                    
                    <TableCell>
                      {position.currentPrice ? formatCurrency(position.currentPrice) : '-'}
                    </TableCell>
                    
                    <TableCell>
                      {formatCurrency(marketValue)}
                    </TableCell>
                    
                    <TableCell>
                      <div className={`flex items-center ${
                        unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {unrealizedPnl >= 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        {formatCurrency(Math.abs(unrealizedPnl))}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className={
                        returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                      }>
                        {formatPercentage(returnPercentage)}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline">
                        {position.sector || 'غير محدد'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            disabled={deletingPosition === position.id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              حذف المركز
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من حذف مركز {position.symbol}؟ 
                              هذا الإجراء لا يمكن التراجع عنه.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePosition(position.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">إجمالي القيمة السوقية</p>
            <p className="text-2xl font-bold">
              {formatCurrency(positions.reduce((sum, p) => sum + (p.marketValue || 0), 0))}
            </p>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">إجمالي الربح/الخسارة</p>
            <p className={`text-2xl font-bold ${
              positions.reduce((sum, p) => sum + (p.unrealizedPnl || 0), 0) >= 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {formatCurrency(positions.reduce((sum, p) => sum + (p.unrealizedPnl || 0), 0))}
            </p>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">عدد المراكز</p>
            <p className="text-2xl font-bold">{positions.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioPositions;
