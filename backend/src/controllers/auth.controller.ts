import { Request, Response } from 'express';
import { z } from 'zod';
import { authService, AuthUser } from '../services/auth.service';

// Schema للتحقق من صحة المدخلات
const googleAuthSchema = z.object({
  token: z.string().min(1, 'Google token is required'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * تسجيل الدخول/إنشاء حساب مع Google OAuth
 * POST /api/auth/google
 */
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = googleAuthSchema.parse(req.body);

    // التحقق من Google token والحصول على بيانات المستخدم
    const googleUser = await authService.verifyGoogleToken(token);
    
    if (!googleUser) {
      res.status(401).json({
        success: false,
        error: 'رمز Google غير صحيح',
      });
      return;
    }

    // البحث عن المستخدم أو إنشاء حساب جديد
    let user = await authService.findUserByEmail(googleUser.email);
    
    if (!user) {
      // إنشاء مستخدم جديد
      user = await authService.createUser({
        email: googleUser.email,
        name: googleUser.name,
        avatar: googleUser.picture,
        provider: 'google',
        providerId: googleUser.id,
      });
      
      console.log(`👤 New user registered: ${user.email}`);
    } else {
      // تحديث آخر دخول
      await authService.updateLastLogin(user.id);
      console.log(`🔑 User logged in: ${user.email}`);
    }

    // إنشاء JWT tokens
    const tokens = authService.generateTokens({
      id: user.id,
      email: user.email,
      name: user.name,
      preferredLanguage: user.preferredLanguage || 'ar',
      theme: user.theme || 'dark',
    });

    // إرسال الاستجابة
    res.json({
      success: true,
      message: user.createdAt.getTime() === user.updatedAt.getTime() 
        ? 'تم إنشاء الحساب بنجاح' 
        : 'تم تسجيل الدخول بنجاح',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          createdAt: user.createdAt,
          isNewUser: user.createdAt.getTime() === user.updatedAt.getTime(),
        },
        tokens,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('خطأ في تسجيل الدخول مع Google:', error);
    
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
      error: 'خطأ في الخادم أثناء تسجيل الدخول',
    });
  }
};

/**
 * تحديث access token باستخدام refresh token
 * POST /api/auth/refresh
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);

    // التحقق من صحة refresh token
    const decoded = authService.verifyToken(refreshToken);
    
    if (!decoded) {
      res.status(401).json({
        success: false,
        error: 'رمز التحديث غير صحيح أو منتهي الصلاحية',
      });
      return;
    }

    // البحث عن المستخدم
    const user = await authService.findUserById(decoded.sub);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود',
      });
      return;
    }

    // إنشاء tokens جديدة
    const tokens = authService.generateTokens({
      id: user.id,
      email: user.email,
      name: user.name,
      preferredLanguage: user.preferredLanguage || 'ar',
      theme: user.theme || 'dark',
    });

    res.json({
      success: true,
      message: 'تم تحديث الرمز بنجاح',
      data: { tokens },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('خطأ في تحديث الرمز:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'بيانات غير صحيحة',
        details: error.errors,
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: 'رمز التحديث غير صحيح',
    });
  }
};

/**
 * الحصول على ملف المستخدم الشخصي
 * GET /api/auth/profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // المستخدم متوفر من middleware
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'غير مصرح له بالوصول',
      });
      return;
    }

    const user = await authService.findUserById(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLoginAt: user.lastLoginAt,
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('خطأ في جلب ملف المستخدم:', error);

    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم أثناء جلب ملف المستخدم',
    });
  }
};

/**
 * تحديث ملف المستخدم الشخصي
 * PUT /api/auth/profile
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'غير مصرح له بالوصول',
      });
      return;
    }

    const updateSchema = z.object({
      name: z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين').optional(),
      avatar: z.string().url('رابط الصورة غير صحيح').optional(),
    });

    const updateData = updateSchema.parse(req.body);

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        success: false,
        error: 'لا توجد بيانات للتحديث',
      });
      return;
    }

    const updatedUser = await authService.updateUser(userId, updateData);
    
    if (!updatedUser) {
      res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود',
      });
      return;
    }

    res.json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          avatar: updatedUser.avatar,
          updatedAt: updatedUser.updatedAt,
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('خطأ في تحديث ملف المستخدم:', error);
    
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
      error: 'خطأ في الخادم أثناء تحديث ملف المستخدم',
    });
  }
};

/**
 * تسجيل الخروج
 * POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (userId) {
      console.log(`👋 User logged out: ${userId}`);
    }

    // في المستقبل يمكن إضافة blacklist للـ tokens
    // أو إبطال جميع sessions للمستخدم

    res.json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('خطأ في تسجيل الخروج:', error);

    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم أثناء تسجيل الخروج',
    });
  }
};

/**
 * حذف الحساب نهائياً
 * DELETE /api/auth/account
 */
export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'غير مصرح له بالوصول',
      });
      return;
    }

    const confirmationSchema = z.object({
      confirmation: z.literal('DELETE_MY_ACCOUNT', {
        errorMap: () => ({ message: 'يجب كتابة "DELETE_MY_ACCOUNT" للتأكيد' })
      }),
    });

    confirmationSchema.parse(req.body);

    // حذف المستخدم وجميع بياناته
    const deleted = await authService.deleteUser(userId);
    
    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود',
      });
      return;
    }

    console.log(`🗑️ User account deleted: ${userId}`);

    res.json({
      success: true,
      message: 'تم حذف الحساب نهائياً',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('خطأ في حذف الحساب:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'يجب تأكيد الحذف بكتابة "DELETE_MY_ACCOUNT"',
        details: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم أثناء حذف الحساب',
    });
  }
};

/**
 * إنشاء مستخدم اختبار (للتطوير فقط)
 * POST /api/auth/test-user
 */
export const createTestUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // التحقق من أن هذا في بيئة التطوير
    if (process.env.NODE_ENV !== 'development') {
      res.status(403).json({
        success: false,
        error: 'هذه الوظيفة متاحة فقط في بيئة التطوير',
      });
      return;
    }

    const testUserSchema = z.object({
      email: z.string().email('البريد الإلكتروني غير صحيح'),
      name: z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين'),
    });

    const { email, name } = testUserSchema.parse(req.body);

    // التحقق من عدم وجود المستخدم
    let user = await authService.findUserByEmail(email);
    
    if (!user) {
      // إنشاء مستخدم جديد
      user = await authService.createUser({
        email,
        name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200&background=random`,
        provider: 'test',
        providerId: `test_${Date.now()}`, // معرف وهمي للاختبار
      });
    }

    // إنشاء JWT tokens
    const tokens = authService.generateTokens({
      id: user.id,
      email: user.email,
      name: user.name,
      preferredLanguage: 'ar',
      theme: 'dark',
    });

    console.log(`🧪 Test user created/accessed: ${email}`);

    res.json({
      success: true,
      message: 'تم إنشاء/الوصول للمستخدم الاختباري بنجاح',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
        tokens,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('خطأ في إنشاء مستخدم اختبار:', error);
    
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
      error: 'خطأ في إنشاء مستخدم اختبار',
    });
  }
};
