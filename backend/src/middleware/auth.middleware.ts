import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

// تمديد Request type لإضافة user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

/**
 * Middleware للتحقق من صحة JWT token
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'لم يتم توفير رمز المصادقة',
      });
      return;
    }

    // التحقق من صحة الرمز
    const decoded = authService.verifyToken(token);
    
    if (!decoded) {
      res.status(401).json({
        success: false,
        error: 'رمز المصادقة غير صحيح أو منتهي الصلاحية',
      });
      return;
    }

    // التحقق من وجود المستخدم في قاعدة البيانات
    const user = await authService.findUserById(decoded.sub);
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'المستخدم غير موجود',
      });
      return;
    }

    // إضافة بيانات المستخدم إلى الطلب
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    console.error('خطأ في middleware المصادقة:', error);
    
    res.status(401).json({
      success: false,
      error: 'رمز المصادقة غير صحيح',
    });
  }
};

/**
 * Middleware اختياري للمصادقة (لا يوقف الطلب إذا لم يكن هناك token)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = authService.verifyToken(token);
        const user = await authService.findUserById(decoded.sub);
        
        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        }
      } catch (error) {
        // تجاهل الأخطاء في المصادقة الاختيارية
        console.log('Optional auth failed, continuing without user');
      }
    }

    next();
  } catch (error) {
    // تجاهل الأخطاء والمتابعة
    next();
  }
};

/**
 * Middleware للتحقق من صلاحيات الإدارة
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // في المستقبل يمكن إضافة نظام أدوار
  // حالياً سنتحقق من البريد الإلكتروني
  
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'مطلوب تسجيل الدخول',
    });
    return;
  }

  // التحقق من كون المستخدم مدير (يمكن تحسين هذا لاحقاً)
  const adminEmails = ['admin@egxpilot.com', 'ya3qoup@gmail.com']; // قائمة المدراء
  
  if (!adminEmails.includes(req.user.email)) {
    res.status(403).json({
      success: false,
      error: 'ليس لديك صلاحية للوصول لهذا المورد',
    });
    return;
  }

  next();
};

/**
 * Middleware لحد معدل الطلبات للمصادقة
 */
export const authRateLimit = (maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    // في بيئة التطوير، تجاهل Rate Limiting للـ localhost
    if (process.env.NODE_ENV === 'development') {
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp === 'localhost') {
        next();
        return;
      }
    }

    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // تنظيف المحاولات المنتهية الصلاحية
    for (const [ip, data] of attempts.entries()) {
      if (now > data.resetTime) {
        attempts.delete(ip);
      }
    }
    
    // التحقق من المحاولات الحالية
    const currentAttempts = attempts.get(clientIp);
    
    if (currentAttempts && currentAttempts.count >= maxAttempts) {
      const timeLeft = Math.ceil((currentAttempts.resetTime - now) / 1000);
      
      res.status(429).json({
        success: false,
        error: `تم تجاوز عدد محاولات تسجيل الدخول المسموح. المحاولة مرة أخرى خلال ${timeLeft} ثانية`,
        retryAfter: timeLeft,
      });
      return;
    }
    
    // تسجيل المحاولة
    if (currentAttempts) {
      currentAttempts.count++;
    } else {
      attempts.set(clientIp, {
        count: 1,
        resetTime: now + windowMs,
      });
    }
    
    next();
  };
};
