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
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { CreatePortfolioData } from '@/types/api';

const formSchema = z.object({
  name: z.string()
    .min(2, 'اسم المحفظة يجب أن يكون على الأقل حرفين')
    .max(100, 'اسم المحفظة طويل جداً'),
  description: z.string()
    .max(500, 'الوصف طويل جداً')
    .optional(),
  portfolioType: z.enum(['paper', 'real'], {
    required_error: 'يجب اختيار نوع المحفظة',
  }),
  initialCapital: z.number()
    .min(1000, 'رأس المال الأولي يجب أن يكون على الأقل 1000 جنيه')
    .max(100000000, 'رأس المال كبير جداً'),
});

interface CreatePortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreatePortfolioDialog: React.FC<CreatePortfolioDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { createPortfolio, isLoading } = usePortfolio();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      portfolioType: 'paper',
      initialCapital: 100000,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      await createPortfolio(values as CreatePortfolioData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create portfolio:', error);
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>إنشاء محفظة جديدة</DialogTitle>
          <DialogDescription>
            أنشئ محفظة استثمارية جديدة لبدء تتبع استثماراتك
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المحفظة</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="مثال: محفظة الأسهم الرئيسية"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    أدخل اسماً وصفياً لمحفظتك
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="وصف موجز لاستراتيجية المحفظة أو أهدافها..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    أضف وصفاً لتوضيح استراتيجية أو أهداف المحفظة
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="portfolioType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع المحفظة</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="paper" id="paper" />
                        <Label htmlFor="paper" className="flex-1">
                          <div>
                            <div className="font-medium">محفظة تجريبية</div>
                            <div className="text-sm text-muted-foreground">
                              للتدريب والتعلم بدون أموال حقيقية
                            </div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="real" id="real" />
                        <Label htmlFor="real" className="flex-1">
                          <div>
                            <div className="font-medium">محفظة حقيقية</div>
                            <div className="text-sm text-muted-foreground">
                              لتتبع الاستثمارات الفعلية
                            </div>
                          </div>
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
              name="initialCapital"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رأس المال الأولي (جنيه مصري)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1000"
                      max="100000000"
                      step="1000"
                      placeholder="100000"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    المبلغ المتاح للاستثمار في هذه المحفظة
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    جاري الإنشاء...
                  </>
                ) : (
                  'إنشاء المحفظة'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePortfolioDialog;
