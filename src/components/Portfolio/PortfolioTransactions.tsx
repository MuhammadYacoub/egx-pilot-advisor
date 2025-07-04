import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TrendingUp, TrendingDown, Search, Filter } from 'lucide-react';
import { Portfolio, Transaction } from '@/types/api';
import { portfolioApi } from '@/services/portfolio.service';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PortfolioTransactionsProps {
  portfolio: Portfolio;
}

const PortfolioTransactions: React.FC<PortfolioTransactionsProps> = ({ portfolio }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchSymbol, setSearchSymbol] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'BUY' | 'SELL'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadTransactions = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const params: any = {
        page,
        limit: 20,
      };
      
      if (searchSymbol) {
        params.symbol = searchSymbol;
      }
      
      if (filterType !== 'all') {
        params.type = filterType;
      }

      const response = await portfolioApi.getTransactions(portfolio.id, params);
      
      if (response.success) {
        setTransactions(response.data || []);
        setCurrentPage(response.pagination?.page || 1);
        setTotalPages(response.pagination?.pages || 1);
        setTotal(response.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions(1);
  }, [portfolio.id]);

  const handleSearch = () => {
    setCurrentPage(1);
    loadTransactions(1);
  };

  const handleFilterChange = (type: 'all' | 'BUY' | 'SELL') => {
    setFilterType(type);
    setCurrentPage(1);
    setTimeout(() => loadTransactions(1), 0);
  };

  const handlePageChange = (page: number) => {
    loadTransactions(page);
  };

  if (transactions.length === 0 && !isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">لا توجد معاملات</h3>
            <p className="text-muted-foreground">
              ستظهر جميع معاملاتك الاستثمارية هنا
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>سجل المعاملات</CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="البحث برمز السهم..."
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} size="sm">
              بحث
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterType} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="BUY">شراء</SelectItem>
                <SelectItem value="SELL">بيع</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Summary Stats */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">إجمالي المعاملات</p>
            <p className="text-2xl font-bold">{total}</p>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">معاملات الشراء</p>
            <p className="text-2xl font-bold text-green-600">
              {transactions.filter(t => t.transactionType === 'BUY').length}
            </p>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">معاملات البيع</p>
            <p className="text-2xl font-bold text-red-600">
              {transactions.filter(t => t.transactionType === 'SELL').length}
            </p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>النوع</TableHead>
                <TableHead>السهم</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>العمولة</TableHead>
                <TableHead>المبلغ الإجمالي</TableHead>
                <TableHead>التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Badge 
                      variant={transaction.transactionType === 'BUY' ? 'default' : 'destructive'}
                      className="flex items-center w-fit"
                    >
                      {transaction.transactionType === 'BUY' ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {transaction.transactionType === 'BUY' ? 'شراء' : 'بيع'}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <span className="font-medium">{transaction.symbol}</span>
                  </TableCell>
                  
                  <TableCell>
                    {transaction.quantity.toLocaleString()}
                  </TableCell>
                  
                  <TableCell>
                    {formatCurrency(transaction.price)}
                  </TableCell>
                  
                  <TableCell>
                    {formatCurrency(transaction.commission)}
                  </TableCell>
                  
                  <TableCell>
                    <span className={
                      transaction.transactionType === 'BUY' ? 'text-red-600' : 'text-green-600'
                    }>
                      {transaction.transactionType === 'BUY' ? '-' : '+'}
                      {formatCurrency(transaction.totalAmount)}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    {formatDate(transaction.transactionDate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              عرض {((currentPage - 1) * 20) + 1} إلى {Math.min(currentPage * 20, total)} من {total} معاملة
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
              >
                السابق
              </Button>
              
              <span className="text-sm">
                صفحة {currentPage} من {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioTransactions;
