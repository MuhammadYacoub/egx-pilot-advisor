# 📚 دليل استخدام APIs - EGX Pilot Advisor

## 🔗 Base URL
```
http://localhost:3001/api
```

---

## 🏥 Health Check APIs

### GET /health
فحص صحة النظام العام
```bash
curl http://localhost:3001/health
```

### GET /api/health  
فحص صحة الـ API
```bash
curl http://localhost:3001/api/health
```

---

## 📊 Market Data APIs

### GET /api/market/status
حالة السوق المصري (مفتوح/مغلق)
```bash
curl http://localhost:3001/api/market/status
```

### GET /api/market/quote/:symbol
بيانات سهم واحد
```bash
curl http://localhost:3001/api/market/quote/CIB.CA
```

### GET /api/market/historical/:symbol
البيانات التاريخية لسهم
```bash
curl "http://localhost:3001/api/market/historical/CIB.CA?period=6mo&interval=1d"
```

### GET /api/market/search
البحث عن الأسهم
```bash
curl "http://localhost:3001/api/market/search?query=bank&limit=5"
```

### POST /api/market/quotes
بيانات أسهم متعددة
```bash
curl -X POST http://localhost:3001/api/market/quotes \
  -H "Content-Type: application/json" \
  -d '{"symbols": ["CIB.CA", "ETEL.CA", "COMM.CA"]}'
```

### GET /api/market/top-movers
أكثر الأسهم تداولاً
```bash
curl http://localhost:3001/api/market/top-movers
```

---

## 🔐 Authentication APIs

### POST /api/auth/google
تسجيل الدخول مع Google OAuth
```bash
curl -X POST http://localhost:3001/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token": "GOOGLE_ID_TOKEN_HERE"}'
```

**Response:**
```json
{
  "success": true,
  "message": "تم تسجيل الدخول بنجاح",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "avatar": "profile_image_url",
      "isNewUser": false
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "expiresIn": "24h"
    }
  }
}
```

### POST /api/auth/refresh
تحديث access token
```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "JWT_REFRESH_TOKEN"}'
```

### GET /api/auth/profile
ملف المستخدم الشخصي (محمي)
```bash
curl http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer JWT_ACCESS_TOKEN"
```

### PUT /api/auth/profile
تحديث ملف المستخدم (محمي)
```bash
curl -X PUT http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer JWT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Name", "avatar": "new_avatar_url"}'
```

### POST /api/auth/logout
تسجيل الخروج (محمي)
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer JWT_ACCESS_TOKEN"
```

### DELETE /api/auth/account
حذف الحساب نهائياً (محمي)
```bash
curl -X DELETE http://localhost:3001/api/auth/account \
  -H "Authorization: Bearer JWT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"confirmation": "DELETE_MY_ACCOUNT"}'
```

---

## 🔒 المصادقة

### إرسال JWT Token
أضف الـ token في header:
```
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

### معدل الطلبات
- **Market Data**: 100 طلب كل 15 دقيقة
- **Authentication**: 10 محاولات تسجيل دخول كل 15 دقيقة
- **Yahoo Finance**: 100 طلب كل دقيقة

---

## 📝 تنسيق الاستجابات

### استجابة ناجحة
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-07-04T01:45:00.000Z"
}
```

### استجابة خطأ
```json
{
  "success": false,
  "error": "رسالة الخطأ باللغة العربية",
  "timestamp": "2025-07-04T01:45:00.000Z"
}
```

### استجابة validation خطأ
```json
{
  "success": false,
  "error": "بيانات غير صحيحة",
  "details": [
    {
      "path": ["field_name"],
      "message": "Field is required"
    }
  ]
}
```

---

## 🌍 متغيرات البيئة المطلوبة

```bash
# للـ Google OAuth (إجباري للمصادقة)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# للـ JWT tokens
JWT_SECRET=your_super_secure_jwt_secret
JWT_EXPIRES_IN=24h

# قاعدة البيانات (محدثة)
DATABASE_URL="sqlserver://localhost:1433;database=EGX_Pilot_Advisor;user=sa;password=curhi6-qEbfid;trustServerCertificate=true"
```

---

## 🚀 كيفية إعداد Google OAuth

1. **إنشاء مشروع في Google Cloud Console**
2. **تفعيل Google+ API**
3. **إنشاء OAuth 2.0 credentials**
4. **إضافة authorized redirect URIs:**
   - `http://localhost:3000/auth/callback`
5. **نسخ Client ID و Client Secret إلى .env**

---

## 🧪 اختبار APIs

جميع الـ endpoints مختبرة وتعمل بنجاح ✅

**حالة الخادم**: 🟢 يعمل على المنفذ 3001  
**قاعدة البيانات**: 🟢 متصلة  
**Cache**: 🟢 نشط  
**Rate Limiting**: 🟢 فعال  

---

*آخر تحديث: 4 يوليو 2025*
