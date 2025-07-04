import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticateToken, authRateLimit } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   POST /api/auth/google
 * @desc    تسجيل الدخول/إنشاء حساب مع Google OAuth
 * @access  Public
 * @body    { token: "google_id_token" }
 * @example POST /api/auth/google
 */
router.post('/google', authRateLimit(10, 15 * 60 * 1000), authController.googleAuth);

/**
 * @route   POST /api/auth/refresh
 * @desc    تحديث access token باستخدام refresh token
 * @access  Public
 * @body    { refreshToken: "jwt_refresh_token" }
 * @example POST /api/auth/refresh
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route   GET /api/auth/profile
 * @desc    الحصول على ملف المستخدم الشخصي
 * @access  Private (يتطلب JWT token)
 * @header  Authorization: Bearer <jwt_token>
 * @example GET /api/auth/profile
 */
router.get('/profile', authenticateToken, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    تحديث ملف المستخدم الشخصي
 * @access  Private (يتطلب JWT token)
 * @header  Authorization: Bearer <jwt_token>
 * @body    { name?: "string", avatar?: "url_string" }
 * @example PUT /api/auth/profile
 */
router.put('/profile', authenticateToken, authController.updateProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    تسجيل الخروج
 * @access  Private (يتطلب JWT token)
 * @header  Authorization: Bearer <jwt_token>
 * @example POST /api/auth/logout
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * @route   DELETE /api/auth/account
 * @desc    حذف الحساب نهائياً
 * @access  Private (يتطلب JWT token)
 * @header  Authorization: Bearer <jwt_token>
 * @body    { confirmation: "DELETE_MY_ACCOUNT" }
 * @example DELETE /api/auth/account
 */
router.delete('/account', authenticateToken, authController.deleteAccount);

/**
 * @route   POST /api/auth/test-user
 * @desc    إنشاء مستخدم اختبار مؤقت (للتطوير فقط)
 * @access  Public
 * @body    { email: "string", name: "string" }
 * @example POST /api/auth/test-user
 */
if (process.env.NODE_ENV === 'development') {
  router.post('/test-user', authController.createTestUser);
}

export default router;
