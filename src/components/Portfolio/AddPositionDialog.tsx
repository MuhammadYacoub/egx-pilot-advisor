import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { Portfolio, AddPositionData } from '@/types/api';
import { formatCurrency } from '@/lib/utils';

const formSchema = z.object({
  symbol: z.string()
    .min(1, 'رمز السهم مطلوب')
    .max(20, 'رمز السهم طويل جداً')
    .transform(val => val.toUpperCase()),
  quantity: z.number()
    .min(0.0001, 'الكمية يجب أن تكون أكبر من صفر'),
  price: z.number()
    .min(0.01, 'السعر يجب أن يكون أكبر من صفر'),
  transactionType: z.enum(['BUY', 'SELL'], {
    required_error: 'يجب اختيار نوع المعاملة',
  }),
  commission: z.number()
    .min(0, 'العمولة لا يمكن أن تكون سالبة')
    .default(0),
});

interface AddPositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolio: Portfolio;
}

const AddPositionDialog: React.FC<AddPositionDialogProps> = ({
  open,
  onOpenChange,
  portfolio,
}) => {
  const { addPosition } = usePortfolio();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symbol: '',
      quantity: 1,
      price: 0,
      transactionType: 'BUY',
      commission: 0,
    },
  });

  const watchedValues = form.watch();
  const totalAmount = (watchedValues.quantity || 0) * (watchedValues.price || 0) + (watchedValues.commission || 0);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      await addPosition(portfolio.id, values as AddPositionData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add position:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen);
      if (!newOpen) {
        form.reset();
      }
    }
  };

  // Check if user has enough cash for BUY order
  const hasEnoughCash = watchedValues.transactionType === 'SELL' || totalAmount <= portfolio.cashBalance;

  // Find existing position for the symbol
  const existingPosition = portfolio.positions?.find(
    p => p.symbol.toLowerCase() === watchedValues.symbol.toLowerCase()
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>إضافة مركز جديد</DialogTitle>
          <DialogDescription>
            شراء أو بيع الأسهم في محفظة {portfolio.name}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">الرصيد النقدي:</span>
              <span className="font-medium ml-2">
                {formatCurrency(portfolio.cashBalance)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">القيمة الإجمالية:</span>
              <span className="font-medium ml-2">
                {formatCurrency(portfolio.currentValue)}
              </span>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="transactionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع المعاملة</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row space-x-4 space-x-reverse"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="BUY" id="buy" />
                        <Label htmlFor="buy" className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                          شراء
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="SELL" id="sell" />
                        <Label htmlFor="sell" className="flex items-center">
                          <TrendingDown className="w-4 h-4 mr-2 text-red-600" />
                          بيع
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رمز السهم</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="مثال: AAPL"
                      {...field}
                      onChange={e => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormDescription>
                    أدخل رمز السهم المراد تداوله
                  </FormDescription>
                  {existingPosition && (
                    <div className="text-sm text-muted-foreground">
                      <Badge variant="outline" className="mr-2">
                        موجود في المحفظة
                      </Badge>
                      الكمية: {existingPosition.quantity} | 
                      متوسط التكلفة: {formatCurrency(existingPosition.avgCost)}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الكمية</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0.0001"
                        step="1"
                        placeholder="1"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      عدد الأسهم
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>السعر (جنيه)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      سعر السهم الواحد
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="commission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العمولة (جنيه)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    عمولة الوسيط (اختيارية)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Order Summary */}
            <div className="border rounded-lg p-4 space-y-2">
              <h4 className="font-medium">ملخص الطلب</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>القيمة الإجمالية:</span>
                  <span>{formatCurrency((watchedValues.quantity || 0) * (watchedValues.price || 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span>العمولة:</span>
                  <span>{formatCurrency(watchedValues.commission || 0)}</span>
                </div>
                <div className="flex justify-between font-medium col-span-2 pt-2 border-t">
                  <span>إجمالي المبلغ:</span>
                  <span className={watchedValues.transactionType === 'BUY' ? 'text-red-600' : 'text-green-600'}>
                    {watchedValues.transactionType === 'BUY' ? '-' : '+'}{formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
              
              {!hasEnoughCash && (
                <div className="text-red-600 text-sm mt-2">
                  ⚠️ الرصيد النقدي غير كافي لإتمام عملية الشراء
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !hasEnoughCash}
                className={watchedValues.transactionType === 'SELL' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    جاري التنفيذ...
                  </>
                ) : (
                  `${watchedValues.transactionType === 'BUY' ? 'شراء' : 'بيع'} ${watchedValues.symbol || 'السهم'}`
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPositionDialog;
