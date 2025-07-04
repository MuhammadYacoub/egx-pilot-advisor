import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { cache } from '../services/cache.service';
import { yahooFinanceService } from '../services/yahoo-finance.service';

// Schema للتحقق من صحة المدخلات
const createPortfolioSchema = z.object({
  name: z.string().min(2, 'اسم المحفظة يجب أن يكون على الأقل حرفين').max(100, 'اسم المحفظة طويل جداً'),
  description: z.string().max(500, 'الوصف طويل جداً').optional(),
  portfolioType: z.enum(['paper', 'real'], {
    errorMap: () => ({ message: 'نوع المحفظة يجب أن يكون paper أو real' })
  }).default('paper'),
  initialCapital: z.number().min(1000, 'رأس المال الأولي يجب أن يكون على الأقل 1000 جنيه').max(100000000, 'رأس المال كبير جداً'),
});

const updatePortfolioSchema = z.object({
  name: z.string().min(2, 'اسم المحفظة يجب أن يكون على الأقل حرفين').max(100, 'اسم المحفظة طويل جداً').optional(),
  description: z.string().max(500, 'الوصف طويل جداً').optional(),
});

const addPositionSchema = z.object({
  symbol: z.string().min(1, 'رمز السهم مطلوب').max(20, 'رمز السهم طويل جداً'),
  quantity: z.number().min(0.0001, 'الكمية يجب أن تكون أكبر من صفر'),
  price: z.number().min(0.01, 'السعر يجب أن يكون أكبر من صفر'),
  transactionType: z.enum(['BUY', 'SELL'], {
    errorMap: () => ({ message: 'نوع المعاملة يجب أن يكون BUY أو SELL' })
  }),
  commission: z.number().min(0, 'العمولة لا يمكن أن تكون سالبة').default(0),
});

/**
 * الحصول على جميع محافظ المستخدم
 * GET /api/portfolio
 */
export const getPortfolios = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'غير مصرح له بالوصول',
      });
      return;
    }

    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      include: {
        positions: {
          select: {
            id: true,
            symbol: true,
            companyName: true,
            quantity: true,
            avgCost: true,
            currentPrice: true,
            marketValue: true,
            unrealizedPnl: true,
            sector: true,
            purchaseDate: true,
          }
        },
        _count: {
          select: {
            positions: true,
            transactions: true,
          }
        }
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    // حساب إحصائيات إضافية لكل محفظة
    const portfoliosWithStats = portfolios.map((portfolio: any) => {
      const totalMarketValue = portfolio.positions.reduce(
        (sum: number, position: any) => sum + (position.marketValue?.toNumber() || 0), 0
      );
      
      const totalUnrealizedPnl = portfolio.positions.reduce(
        (sum: number, position: any) => sum + (position.unrealizedPnl?.toNumber() || 0), 0
      );

      const totalInvested = totalMarketValue - totalUnrealizedPnl;
      const returnPercentage = totalInvested > 0 ? (totalUnrealizedPnl / totalInvested) * 100 : 0;

      return {
        id: portfolio.id,
        name: portfolio.name,
        description: portfolio.description,
        portfolioType: portfolio.portfolioType,
        initialCapital: portfolio.initialCapital.toNumber(),
        currentValue: portfolio.currentValue.toNumber(),
        cashBalance: portfolio.cashBalance.toNumber(),
        totalPnl: portfolio.totalPnl.toNumber(),
        dailyPnl: portfolio.dailyPnl.toNumber(),
        isDefault: portfolio.isDefault,
        createdAt: portfolio.createdAt,
        updatedAt: portfolio.updatedAt,
        stats: {
          totalMarketValue,
          totalUnrealizedPnl,
          returnPercentage: Math.round(returnPercentage * 100) / 100,
          positionsCount: portfolio._count.positions,
          transactionsCount: portfolio._count.transactions,
          allocation: portfolio.positions.map((pos: any) => ({
            symbol: pos.symbol,
            marketValue: pos.marketValue?.toNumber() || 0,
            percentage: totalMarketValue > 0 ? 
              Math.round(((pos.marketValue?.toNumber() || 0) / totalMarketValue) * 10000) / 100 : 0
          }))
        },
        positions: portfolio.positions.map((pos: any) => ({
          ...pos,
          quantity: pos.quantity.toNumber(),
          avgCost: pos.avgCost.toNumber(),
          currentPrice: pos.currentPrice?.toNumber(),
          marketValue: pos.marketValue?.toNumber(),
          unrealizedPnl: pos.unrealizedPnl?.toNumber(),
        }))
      };
    });

    res.json({
      success: true,
      data: portfoliosWithStats,
      count: portfoliosWithStats.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('خطأ في جلب المحافظ:', error);

    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم أثناء جلب المحافظ',
    });
  }
};

/**
 * الحصول على محفظة واحدة بالتفصيل
 * GET /api/portfolio/:portfolioId
 */
export const getPortfolioById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { portfolioId } = req.params;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'غير مصرح له بالوصول',
      });
      return;
    }

    const portfolio = await prisma.portfolio.findFirst({
      where: { 
        id: portfolioId,
        userId 
      },
      include: {
        positions: {
          orderBy: {
            purchaseDate: 'desc'
          }
        },
        transactions: {
          orderBy: {
            transactionDate: 'desc'
          },
          take: 50 // آخر 50 معاملة
        }
      }
    });

    if (!portfolio) {
      res.status(404).json({
        success: false,
        error: 'المحفظة غير موجودة أو ليس لديك صلاحية للوصول إليها',
      });
      return;
    }

    // تحديث أسعار المراكز الحالية
    if (portfolio.positions.length > 0) {
      const symbols = portfolio.positions.map((pos: any) => pos.symbol);
      const quotes = await Promise.allSettled(
        symbols.map((symbol: string) => yahooFinanceService.getQuote(symbol))
      );

      // تحديث الأسعار في قاعدة البيانات
      const priceUpdates = quotes.map((result, index) => {
        const position = portfolio.positions[index];
        if (result.status === 'fulfilled' && result.value && position) {
          const currentPrice = result.value.currentPrice;
          const marketValue = position.quantity.toNumber() * currentPrice;
          const unrealizedPnl = marketValue - (position.quantity.toNumber() * position.avgCost.toNumber());
          
          return prisma.position.update({
            where: { id: position.id },
            data: {
              currentPrice,
              marketValue,
              unrealizedPnl,
              updatedAt: new Date(),
            }
          });
        }
        return null;
      }).filter(Boolean);

      if (priceUpdates.length > 0) {
        await Promise.allSettled(priceUpdates);
      }

      // إعادة جلب البيانات المحدثة
      const updatedPortfolio = await prisma.portfolio.findFirst({
        where: { id: portfolioId, userId },
        include: {
          positions: { orderBy: { purchaseDate: 'desc' } },
          transactions: { orderBy: { transactionDate: 'desc' }, take: 50 }
        }
      });

      if (updatedPortfolio) {
        // حساب القيمة الإجمالية المحدثة للمحفظة
        const totalMarketValue = updatedPortfolio.positions.reduce(
          (sum: number, pos: any) => sum + (pos.marketValue?.toNumber() || 0), 0
        );
        
        const currentValue = totalMarketValue + updatedPortfolio.cashBalance.toNumber();
        
        await prisma.portfolio.update({
          where: { id: portfolioId },
          data: {
            currentValue,
            totalPnl: currentValue - updatedPortfolio.initialCapital.toNumber(),
            updatedAt: new Date(),
          }
        });
      }
    }

    // إعادة جلب البيانات النهائية
    const finalPortfolio = await prisma.portfolio.findFirst({
      where: { id: portfolioId, userId },
      include: {
        positions: { orderBy: { purchaseDate: 'desc' } },
        transactions: { orderBy: { transactionDate: 'desc' }, take: 50 }
      }
    });

    res.json({
      success: true,
      data: {
        ...finalPortfolio,
        initialCapital: finalPortfolio!.initialCapital.toNumber(),
        currentValue: finalPortfolio!.currentValue.toNumber(),
        cashBalance: finalPortfolio!.cashBalance.toNumber(),
        totalPnl: finalPortfolio!.totalPnl.toNumber(),
        dailyPnl: finalPortfolio!.dailyPnl.toNumber(),
        positions: finalPortfolio!.positions.map((pos: any) => ({
          ...pos,
          quantity: pos.quantity.toNumber(),
          avgCost: pos.avgCost.toNumber(),
          currentPrice: pos.currentPrice?.toNumber(),
          marketValue: pos.marketValue?.toNumber(),
          unrealizedPnl: pos.unrealizedPnl?.toNumber(),
          realizedPnl: pos.realizedPnl.toNumber(),
        })),
        transactions: finalPortfolio!.transactions.map((trans: any) => ({
          ...trans,
          quantity: trans.quantity.toNumber(),
          price: trans.price.toNumber(),
          commission: trans.commission.toNumber(),
          totalAmount: trans.totalAmount.toNumber(),
        }))
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('خطأ في جلب تفاصيل المحفظة:', error);

    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم أثناء جلب تفاصيل المحفظة',
    });
  }
};

/**
 * إنشاء محفظة جديدة
 * POST /api/portfolio
 */
export const createPortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'غير مصرح له بالوصول',
      });
      return;
    }

    const portfolioData = createPortfolioSchema.parse(req.body);

    // التحقق من عدد المحافظ الحالية (حد أقصى 10 محافظ للمستخدم الواحد)
    const existingPortfoliosCount = await prisma.portfolio.count({
      where: { userId }
    });

    if (existingPortfoliosCount >= 10) {
      res.status(400).json({
        success: false,
        error: 'لا يمكن إنشاء أكثر من 10 محافظ للمستخدم الواحد',
      });
      return;
    }

    // التحقق من عدم وجود محفظة بنفس الاسم
    const existingPortfolio = await prisma.portfolio.findFirst({
      where: {
        userId,
        name: portfolioData.name
      }
    });

    if (existingPortfolio) {
      res.status(400).json({
        success: false,
        error: 'يوجد محفظة بهذا الاسم بالفعل',
      });
      return;
    }

    // التحقق من وجود محفظة افتراضية
    const defaultPortfolio = await prisma.portfolio.findFirst({
      where: {
        userId,
        isDefault: true
      }
    });

    const isDefault = !defaultPortfolio; // إذا لم توجد محفظة افتراضية، اجعل هذه افتراضية

    const portfolio = await prisma.portfolio.create({
      data: {
        userId,
        name: portfolioData.name,
        description: portfolioData.description,
        portfolioType: portfolioData.portfolioType,
        initialCapital: portfolioData.initialCapital,
        currentValue: portfolioData.initialCapital,
        cashBalance: portfolioData.initialCapital,
        isDefault,
      }
    });

    console.log(`💼 New portfolio created: ${portfolio.name} for user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء المحفظة بنجاح',
      data: {
        ...portfolio,
        initialCapital: portfolio.initialCapital.toNumber(),
        currentValue: portfolio.currentValue.toNumber(),
        cashBalance: portfolio.cashBalance.toNumber(),
        totalPnl: portfolio.totalPnl.toNumber(),
        dailyPnl: portfolio.dailyPnl.toNumber(),
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('خطأ في إنشاء المحفظة:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'بيانات غير صحيحة',
        details: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم أثناء إنشاء المحفظة',
    });
  }
};

/**
 * تحديث بيانات المحفظة
 * PUT /api/portfolio/:portfolioId
 */
export const updatePortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { portfolioId } = req.params;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'غير مصرح له بالوصول',
      });
      return;
    }

    const updateData = updatePortfolioSchema.parse(req.body);

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        success: false,
        error: 'لا توجد بيانات للتحديث',
      });
      return;
    }

    // التحقق من ملكية المحفظة
    const existingPortfolio = await prisma.portfolio.findFirst({
      where: { id: portfolioId, userId }
    });

    if (!existingPortfolio) {
      res.status(404).json({
        success: false,
        error: 'المحفظة غير موجودة أو ليس لديك صلاحية للوصول إليها',
      });
      return;
    }

    // التحقق من عدم وجود محفظة أخرى بنفس الاسم
    if (updateData.name) {
      const duplicatePortfolio = await prisma.portfolio.findFirst({
        where: {
          userId,
          name: updateData.name,
          id: { not: portfolioId }
        }
      });

      if (duplicatePortfolio) {
        res.status(400).json({
          success: false,
          error: 'يوجد محفظة أخرى بهذا الاسم',
        });
        return;
      }
    }

    const updatedPortfolio = await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      }
    });

    res.json({
      success: true,
      message: 'تم تحديث المحفظة بنجاح',
      data: {
        ...updatedPortfolio,
        initialCapital: updatedPortfolio.initialCapital.toNumber(),
        currentValue: updatedPortfolio.currentValue.toNumber(),
        cashBalance: updatedPortfolio.cashBalance.toNumber(),
        totalPnl: updatedPortfolio.totalPnl.toNumber(),
        dailyPnl: updatedPortfolio.dailyPnl.toNumber(),
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('خطأ في تحديث المحفظة:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'بيانات غير صحيحة',
        details: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم أثناء تحديث المحفظة',
    });
  }
};

/**
 * حذف محفظة
 * DELETE /api/portfolio/:portfolioId
 */
export const deletePortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { portfolioId } = req.params;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'غير مصرح له بالوصول',
      });
      return;
    }

    // التحقق من ملكية المحفظة
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: portfolioId, userId }
    });

    if (!portfolio) {
      res.status(404).json({
        success: false,
        error: 'المحفظة غير موجودة أو ليس لديك صلاحية للوصول إليها',
      });
      return;
    }

    // منع حذف المحفظة الافتراضية إذا كانت الوحيدة
    if (portfolio.isDefault) {
      const portfoliosCount = await prisma.portfolio.count({
        where: { userId }
      });

      if (portfoliosCount === 1) {
        res.status(400).json({
          success: false,
          error: 'لا يمكن حذف المحفظة الافتراضية الوحيدة',
        });
        return;
      }

      // تعيين محفظة أخرى كافتراضية
      await prisma.portfolio.updateMany({
        where: {
          userId,
          id: { not: portfolioId }
        },
        data: { isDefault: true }
      });
    }

    // حذف المحفظة (cascade سيحذف المراكز والمعاملات)
    await prisma.portfolio.delete({
      where: { id: portfolioId }
    });

    console.log(`🗑️ Portfolio deleted: ${portfolio.name} for user ${userId}`);

    res.json({
      success: true,
      message: 'تم حذف المحفظة بنجاح',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('خطأ في حذف المحفظة:', error);

    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم أثناء حذف المحفظة',
    });
  }
};

/**
 * إضافة/تحديث مركز في المحفظة (شراء/بيع)
 * POST /api/portfolio/:portfolioId/position
 */
export const addPosition = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { portfolioId } = req.params;
    
    if (!userId || !portfolioId) {
      res.status(400).json({
        success: false,
        error: 'معرف المستخدم أو المحفظة مطلوب',
      });
      return;
    }

    const positionData = addPositionSchema.parse(req.body);

    // التحقق من ملكية المحفظة
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: portfolioId, userId }
    });

    if (!portfolio) {
      res.status(404).json({
        success: false,
        error: 'المحفظة غير موجودة أو ليس لديك صلاحية للوصول إليها',
      });
      return;
    }

    // جلب معلومات السهم
    const stockQuote = await yahooFinanceService.getQuote(positionData.symbol);
    const companyName = stockQuote?.companyName || 'Unknown Company';
    const sector = stockQuote?.sector || 'Unknown';

    const totalAmount = (positionData.quantity * positionData.price) + positionData.commission;

    // التحقق من وجود رصيد كافي للشراء
    if (positionData.transactionType === 'BUY') {
      if (portfolio.cashBalance.toNumber() < totalAmount) {
        res.status(400).json({
          success: false,
          error: 'الرصيد النقدي غير كافي لإتمام عملية الشراء',
          availableCash: portfolio.cashBalance.toNumber(),
          requiredAmount: totalAmount,
        });
        return;
      }
    }

    // التحقق من وجود المركز الحالي
    const existingPosition = await prisma.position.findFirst({
      where: {
        portfolioId,
        symbol: positionData.symbol
      }
    });

    let updatedPosition: any = null;
    let transaction: any;

    await prisma.$transaction(async (tx: any) => {
      // إنشاء سجل المعاملة
      transaction = await tx.transaction.create({
        data: {
          portfolioId,
          symbol: positionData.symbol,
          transactionType: positionData.transactionType,
          quantity: positionData.quantity,
          price: positionData.price,
          commission: positionData.commission,
          totalAmount: positionData.transactionType === 'BUY' ? totalAmount : totalAmount - positionData.commission,
        }
      });

      if (positionData.transactionType === 'BUY') {
        if (existingPosition) {
          // تحديث المركز الموجود
          const newQuantity = existingPosition.quantity.toNumber() + positionData.quantity;
          const newAvgCost = ((existingPosition.quantity.toNumber() * existingPosition.avgCost.toNumber()) + 
                             (positionData.quantity * positionData.price)) / newQuantity;
          
          updatedPosition = await tx.position.update({
            where: { id: existingPosition.id },
            data: {
              quantity: newQuantity,
              avgCost: newAvgCost,
              currentPrice: positionData.price,
              marketValue: newQuantity * positionData.price,
              unrealizedPnl: (newQuantity * positionData.price) - (newQuantity * newAvgCost),
              updatedAt: new Date(),
            }
          });
        } else {
          // إنشاء مركز جديد
          updatedPosition = await tx.position.create({
            data: {
              portfolioId,
              symbol: positionData.symbol,
              companyName,
              quantity: positionData.quantity,
              avgCost: positionData.price,
              currentPrice: positionData.price,
              marketValue: positionData.quantity * positionData.price,
              unrealizedPnl: 0,
              sector,
            }
          });
        }

        // تحديث الرصيد النقدي للمحفظة
        await tx.portfolio.update({
          where: { id: portfolioId },
          data: {
            cashBalance: portfolio.cashBalance.toNumber() - totalAmount,
            updatedAt: new Date(),
          }
        });

      } else { // SELL
        if (!existingPosition) {
          throw new Error('لا يمكن بيع سهم غير موجود في المحفظة');
        }

        if (existingPosition.quantity.toNumber() < positionData.quantity) {
          throw new Error('الكمية المطلوب بيعها أكبر من الكمية المتاحة');
        }

        const newQuantity = existingPosition.quantity.toNumber() - positionData.quantity;
        const realizedPnl = (positionData.price - existingPosition.avgCost.toNumber()) * positionData.quantity;

        if (newQuantity === 0) {
          // حذف المركز إذا تم بيع كامل الكمية
          await tx.position.delete({
            where: { id: existingPosition.id }
          });
        } else {
          // تحديث الكمية
          updatedPosition = await tx.position.update({
            where: { id: existingPosition.id },
            data: {
              quantity: newQuantity,
              currentPrice: positionData.price,
              marketValue: newQuantity * positionData.price,
              unrealizedPnl: (newQuantity * positionData.price) - (newQuantity * existingPosition.avgCost.toNumber()),
              realizedPnl: existingPosition.realizedPnl.toNumber() + realizedPnl,
              updatedAt: new Date(),
            }
          });
        }

        // تحديث الرصيد النقدي للمحفظة
        const saleAmount = (positionData.quantity * positionData.price) - positionData.commission;
        await tx.portfolio.update({
          where: { id: portfolioId },
          data: {
            cashBalance: portfolio.cashBalance.toNumber() + saleAmount,
            updatedAt: new Date(),
          }
        });
      }
    });

    console.log(`📈 Position ${positionData.transactionType}: ${positionData.symbol} in portfolio ${portfolioId}`);

    res.json({
      success: true,
      message: `تم ${positionData.transactionType === 'BUY' ? 'شراء' : 'بيع'} السهم بنجاح`,
      data: {
        transaction: {
          ...transaction!,
          quantity: transaction!.quantity.toNumber(),
          price: transaction!.price.toNumber(),
          commission: transaction!.commission.toNumber(),
          totalAmount: transaction!.totalAmount.toNumber(),
        },
        position: updatedPosition ? {
          ...updatedPosition,
          quantity: updatedPosition.quantity.toNumber(),
          avgCost: updatedPosition.avgCost.toNumber(),
          currentPrice: updatedPosition.currentPrice?.toNumber(),
          marketValue: updatedPosition.marketValue?.toNumber(),
          unrealizedPnl: updatedPosition.unrealizedPnl?.toNumber(),
          realizedPnl: updatedPosition.realizedPnl.toNumber(),
        } : null
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('خطأ في إضافة مركز:', error);

    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'خطأ في إضافة المركز',
    });
  }
};

/**
 * الحصول على معاملات المحفظة
 * GET /api/portfolio/:portfolioId/transactions
 */
export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { portfolioId } = req.params;
    const { page = 1, limit = 50, symbol, type } = req.query;

    if (!userId || !portfolioId) {
      res.status(400).json({
        success: false,
        error: 'معرف المستخدم أو المحفظة مطلوب',
      });
      return;
    }

    // التحقق من ملكية المحفظة
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: portfolioId, userId }
    });

    if (!portfolio) {
      res.status(404).json({
        success: false,
        error: 'المحفظة غير موجودة',
      });
      return;
    }

    // بناء فلتر البحث
    const where: any = { portfolioId };
    if (symbol) where.symbol = symbol;
    if (type) where.transactionType = type;

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { transactionDate: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.transaction.count({ where })
    ]);

    const formattedTransactions = transactions.map(transaction => ({
      ...transaction,
      quantity: transaction.quantity.toNumber(),
      price: transaction.price.toNumber(),
      commission: transaction.commission.toNumber(),
      totalAmount: transaction.totalAmount.toNumber(),
    }));

    res.json({
      success: true,
      data: formattedTransactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('خطأ في جلب المعاملات:', error);

    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم أثناء جلب المعاملات',
    });
  }
};

/**
 * تقرير أداء المحفظة
 * GET /api/portfolio/:portfolioId/performance
 */
export const getPerformanceReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { portfolioId } = req.params;
    const { period = '1M' } = req.query; // 1D, 1W, 1M, 3M, 6M, 1Y, YTD, ALL

    if (!userId || !portfolioId) {
      res.status(400).json({
        success: false,
        error: 'معرف المستخدم أو المحفظة مطلوب',
      });
      return;
    }

    // التحقق من ملكية المحفظة
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: portfolioId, userId },
      include: {
        positions: true,
        transactions: {
          orderBy: { transactionDate: 'asc' }
        }
      }
    });

    if (!portfolio) {
      res.status(404).json({
        success: false,
        error: 'المحفظة غير موجودة',
      });
      return;
    }

    // حساب الفترة الزمنية
    const endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '1D':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '1W':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '1Y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'YTD':
        startDate = new Date(endDate.getFullYear(), 0, 1);
        break;
      case 'ALL':
        startDate = portfolio.createdAt;
        break;
    }

    // معاملات الفترة
    const periodTransactions = portfolio.transactions.filter(
      (t: any) => t.transactionDate >= startDate && t.transactionDate <= endDate
    );

    // حساب الإحصائيات
    const totalInvested = periodTransactions
      .filter((t: any) => t.transactionType === 'BUY')
      .reduce((sum: number, t: any) => sum + t.totalAmount.toNumber(), 0);

    const totalWithdrawn = periodTransactions
      .filter((t: any) => t.transactionType === 'SELL')
      .reduce((sum: number, t: any) => sum + t.totalAmount.toNumber(), 0);

    const currentValue = portfolio.currentValue.toNumber();
    const totalPnl = portfolio.totalPnl.toNumber();
    const unrealizedPnl = portfolio.positions.reduce(
      (sum, p) => sum + (p.unrealizedPnl?.toNumber() || 0), 0
    );
    const realizedPnl = portfolio.positions.reduce(
      (sum, p) => sum + p.realizedPnl.toNumber(), 0
    );

    // تحليل الأسهم
    const topPerformers = portfolio.positions
      .map(pos => ({
        symbol: pos.symbol,
        companyName: pos.companyName,
        pnl: pos.unrealizedPnl?.toNumber() || 0,
        pnlPercent: pos.avgCost.toNumber() > 0 ? 
          ((pos.unrealizedPnl?.toNumber() || 0) / (pos.quantity.toNumber() * pos.avgCost.toNumber())) * 100 : 0
      }))
      .sort((a, b) => b.pnlPercent - a.pnlPercent)
      .slice(0, 5);

    const worstPerformers = portfolio.positions
      .map(pos => ({
        symbol: pos.symbol,
        companyName: pos.companyName,
        pnl: pos.unrealizedPnl?.toNumber() || 0,
        pnlPercent: pos.avgCost.toNumber() > 0 ? 
          ((pos.unrealizedPnl?.toNumber() || 0) / (pos.quantity.toNumber() * pos.avgCost.toNumber())) * 100 : 0
      }))
      .sort((a, b) => a.pnlPercent - b.pnlPercent)
      .slice(0, 5);

    // توزيع القطاعات
    const sectorAllocation: Record<string, number> = {};
    portfolio.positions.forEach(pos => {
      const sector = pos.sector || 'أخرى';
      const value = pos.marketValue?.toNumber() || 0;
      sectorAllocation[sector] = (sectorAllocation[sector] || 0) + value;
    });

    res.json({
      success: true,
      data: {
        period,
        summary: {
          initialCapital: portfolio.initialCapital.toNumber(),
          currentValue,
          totalInvested,
          totalWithdrawn,
          totalPnl,
          totalPnlPercent: totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0,
          unrealizedPnl,
          realizedPnl,
          cashBalance: portfolio.cashBalance.toNumber(),
        },
        performance: {
          topPerformers,
          worstPerformers,
          sectorAllocation: Object.entries(sectorAllocation).map(([sector, value]) => ({
            sector,
            value,
            percentage: currentValue > 0 ? (value / currentValue) * 100 : 0
          }))
        },
        transactions: {
          total: periodTransactions.length,
          buys: periodTransactions.filter(t => t.transactionType === 'BUY').length,
          sells: periodTransactions.filter(t => t.transactionType === 'SELL').length,
        }
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('خطأ في تقرير الأداء:', error);

    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم أثناء إنشاء تقرير الأداء',
    });
  }
};

/**
 * حذف مركز من المحفظة
 * DELETE /api/portfolio/:portfolioId/positions/:positionId
 */
export const deletePosition = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { portfolioId, positionId } = req.params;

    if (!userId || !portfolioId || !positionId) {
      res.status(400).json({
        success: false,
        error: 'معرف المستخدم أو المحفظة أو المركز مطلوب',
      });
      return;
    }

    // التحقق من ملكية المحفظة والمركز
    const position = await prisma.position.findFirst({
      where: { 
        id: positionId,
        portfolioId,
        portfolio: { userId }
      },
      include: { portfolio: true }
    });

    if (!position) {
      res.status(404).json({
        success: false,
        error: 'المركز غير موجود',
      });
      return;
    }

    // حذف المركز
    await prisma.position.delete({
      where: { id: positionId }
    });

    console.log(`🗑️ Position deleted: ${position.symbol} from portfolio ${portfolioId}`);

    res.json({
      success: true,
      message: 'تم حذف المركز بنجاح',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('خطأ في حذف المركز:', error);

    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم أثناء حذف المركز',
    });
  }
};

/**
 * مزامنة أسعار المحفظة
 * POST /api/portfolio/:portfolioId/sync
 */
export const syncPortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { portfolioId } = req.params;

    if (!userId || !portfolioId) {
      res.status(400).json({
        success: false,
        error: 'معرف المستخدم أو المحفظة مطلوب',
      });
      return;
    }

    // التحقق من ملكية المحفظة
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: portfolioId, userId },
      include: { positions: true }
    });

    if (!portfolio) {
      res.status(404).json({
        success: false,
        error: 'المحفظة غير موجودة',
      });
      return;
    }

    if (portfolio.positions.length === 0) {
      res.json({
        success: true,
        message: 'لا توجد مراكز للمزامنة',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // جلب الأسعار الحالية
    const symbols = portfolio.positions.map(p => p.symbol);
    const quotes = await yahooFinanceService.getMultipleQuotes(symbols);

    // تحديث المراكز
    const updatedPositions = [];
    for (const position of portfolio.positions) {
      const quote = quotes.find((q: any) => q.symbol === position.symbol);
      if (quote && quote.currentPrice) {
        const newPrice = quote.currentPrice;
        const quantity = position.quantity.toNumber();
        const avgCost = position.avgCost.toNumber();
        const marketValue = quantity * newPrice;
        const unrealizedPnl = marketValue - (quantity * avgCost);

        const updatedPosition = await prisma.position.update({
          where: { id: position.id },
          data: {
            currentPrice: newPrice,
            marketValue,
            unrealizedPnl,
            updatedAt: new Date(),
          }
        });

        updatedPositions.push({
          ...updatedPosition,
          quantity: updatedPosition.quantity.toNumber(),
          avgCost: updatedPosition.avgCost.toNumber(),
          currentPrice: updatedPosition.currentPrice?.toNumber(),
          marketValue: updatedPosition.marketValue?.toNumber(),
          unrealizedPnl: updatedPosition.unrealizedPnl?.toNumber(),
          realizedPnl: updatedPosition.realizedPnl.toNumber(),
        });
      }
    }

    // تحديث قيم المحفظة
    const totalMarketValue = updatedPositions.reduce((sum, p) => sum + (p.marketValue || 0), 0);
    const totalUnrealizedPnl = updatedPositions.reduce((sum, p) => sum + (p.unrealizedPnl || 0), 0);
    const currentValue = totalMarketValue + portfolio.cashBalance.toNumber();

    await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        currentValue,
        totalPnl: totalUnrealizedPnl,
        updatedAt: new Date(),
      }
    });

    console.log(`🔄 Portfolio synced: ${portfolioId} with ${updatedPositions.length} positions`);

    res.json({
      success: true,
      message: 'تم مزامنة المحفظة بنجاح',
      data: {
        updatedPositions: updatedPositions.length,
        totalMarketValue,
        totalUnrealizedPnl,
        currentValue,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('خطأ في مزامنة المحفظة:', error);

    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم أثناء مزامنة المحفظة',
    });
  }
};
