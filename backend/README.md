# EGX Pilot Advisor Backend

Backend API للمنصة الشاملة لتحليل ومتابعة الأسهم في البورصة المصرية.

## 🚀 البدء السريع

### المتطلبات الأساسية

- Node.js >= 18.0.0
- SQL Server (Container متاح بالبيانات المحددة)
- حساب Google OAuth للمصادقة
- حساب Gmail للإشعارات البريدية

### التثبيت

1. **استنساخ المشروع**
```bash
cd backend
```

2. **تثبيت الحزم**
```bash
npm install
```

3. **إعداد متغيرات البيئة**
```bash
cp .env.example .env
```

4. **تحديث ملف .env**
```env
DATABASE_URL="sqlserver://localhost:1433;database=EGX_Pilot_Advisor;user=sa;password=curhi6-qEbfid;trustServerCertificate=true"
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_password
```

5. **إنشاء قاعدة البيانات**
```bash
npm run prisma:push
```

6. **توليد Prisma Client**
```bash
npm run prisma:generate
```

7. **تشغيل الخادم**
```bash
# للتطوير
npm run dev

# للإنتاج
npm run build
npm start
```

## 📊 المميزات الأساسية

### 🔐 المصادقة والأمان
- **Google OAuth 2.0** - تسجيل دخول آمن
- **JWT Tokens** - إدارة الجلسات
- **Rate Limiting** - حماية من الإفراط في الطلبات
- **Input Validation** - التحقق من صحة البيانات

### 📈 بيانات السوق
- **Yahoo Finance Integration** - بيانات مباشرة ودقيقة
- **Real-time Updates** - تحديث كل 30 ثانية خلال الجلسة
- **Historical Data** - بيانات تاريخية للعام السابق
- **Smart Caching** - تحسين الأداء وتقليل الطلبات

### 🔬 التحليل الفني
- **RSI (Relative Strength Index)** - مؤشر القوة النسبية
- **MACD** - تقارب وتباعد المتوسطات المتحركة
- **Bollinger Bands** - أحزمة بولينجر
- **EMA/SMA** - المتوسطات المتحركة
- **Support/Resistance** - مستويات الدعم والمقاومة

### 💼 إدارة المحافظ
- **Paper Trading** - التداول التجريبي
- **Real Portfolio Tracking** - متابعة المحافظ الحقيقية
- **Performance Metrics** - مقاييس الأداء التفصيلية
- **Risk Analysis** - تحليل المخاطر

### 🚨 التنبيهات والإشعارات
- **Price Alerts** - تنبيهات الأسعار
- **Technical Signals** - إشارات التحليل الفني
- **Email Notifications** - إشعارات بريدية
- **Portfolio Updates** - تحديثات المحفظة

## 🏗️ المعمارية التقنية

```
src/
├── config/          # إعدادات النظام
├── controllers/     # منطق التطبيق
├── middleware/      # Middleware functions
├── services/        # الخدمات الأساسية
├── routes/          # تعريف المسارات
├── utils/           # وظائف مساعدة
├── jobs/            # المهام المجدولة
└── app.ts           # نقطة البداية
```

### قاعدة البيانات

```sql
-- الجداول الأساسية
users              # المستخدمين
portfolios         # المحافظ الاستثمارية
positions          # المراكز المالية
transactions       # المعاملات
market_data_cache  # كاش بيانات السوق
technical_indicators # المؤشرات الفنية
fundamental_data   # البيانات الأساسية
user_alerts        # تنبيهات المستخدمين
email_logs         # سجل الرسائل
```

## 🔌 واجهات برمجة التطبيقات

### المصادقة
```http
POST /api/auth/google          # تسجيل دخول Google
POST /api/auth/logout          # تسجيل خروج
GET  /api/auth/profile         # بيانات المستخدم
PUT  /api/auth/preferences     # تحديث التفضيلات
```

### بيانات السوق
```http
GET /api/market/quotes/:symbol        # بيانات سهم محدد
GET /api/market/search?q=query        # البحث في الأسهم
GET /api/market/egx-index            # مؤشر EGX 30
GET /api/market/top-movers           # الأسهم الأكثر حركة
GET /api/market/historical/:symbol   # البيانات التاريخية
GET /api/market/sectors              # أداء القطاعات
```

### التحليل
```http
GET  /api/analysis/technical/:symbol    # التحليل الفني
GET  /api/analysis/fundamental/:symbol  # التحليل الأساسي
POST /api/analysis/custom              # تحليل مخصص
GET  /api/analysis/opportunities       # الفرص المكتشفة
POST /api/analysis/email-report        # إرسال تقرير
```

### المحافظ
```http
GET  /api/portfolio/portfolios         # محافظ المستخدم
POST /api/portfolio/create            # إنشاء محفظة
POST /api/portfolio/transaction       # إضافة معاملة
GET  /api/portfolio/:id/performance   # أداء المحفظة
GET  /api/portfolio/:id/risk-metrics  # مقاييس المخاطر
```

### التنبيهات
```http
GET    /api/alerts/user-alerts   # تنبيهات المستخدم
POST   /api/alerts/create       # إنشاء تنبيه
PUT    /api/alerts/:id/toggle   # تفعيل/إلغاء
DELETE /api/alerts/:id          # حذف تنبيه
```

## 🔄 WebSocket Events

### Client → Server
```javascript
// الاشتراك في بيانات السوق
socket.emit('subscribe-market-data', ['COMI', 'ETEL', 'HRHO']);

// الاشتراك في تحديثات المحفظة
socket.emit('subscribe-portfolio', portfolioId);

// الاشتراك في التنبيهات
socket.emit('subscribe-alerts', userId);
```

### Server → Client
```javascript
// تحديث بيانات السوق
socket.on('market-data-update', (data) => { ... });

// تحديث المحفظة
socket.on('portfolio-update', (data) => { ... });

// تنبيه جديد
socket.on('new-alert', (alert) => { ... });
```

## ⏰ المهام المجدولة

### تحديث البيانات
- **كل 30 ثانية** خلال الجلسة (10ص - 2:30م)
- **كل 5 دقائق** خارج الجلسة
- **يومياً** تحديث البيانات التاريخية

### التحليل الفني
- **كل ساعة** خلال الجلسة
- **مرتين يومياً** خارج الجلسة

### التنبيهات
- **كل دقيقة** فحص شروط التنبيهات
- **يومياً 3 عصراً** إرسال التقارير اليومية

## 🧪 الاختبار

```bash
# تشغيل الاختبارات
npm test

# اختبار التغطية
npm run test:coverage

# اختبار الـ Linting
npm run lint
```

## 📊 المراقبة والصحة

### Health Check
```http
GET /health
```

**الاستجابة:**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-04T12:00:00.000Z",
  "services": {
    "database": "connected",
    "yahooFinance": {
      "status": "active",
      "requestsRemaining": 95
    },
    "cache": {
      "status": "active",
      "size": 142
    }
  }
}
```

## 🔧 التكوين المتقدم

### متغيرات البيئة الإضافية

```env
# تحسين الأداء
CACHE_TTL_QUOTES=30000          # مدة كاش الأسعار (30 ثانية)
CACHE_TTL_HISTORICAL=300000     # مدة كاش البيانات التاريخية (5 دقائق)
CACHE_TTL_ANALYSIS=600000       # مدة كاش التحليل (10 دقائق)

# أوقات السوق
MARKET_OPEN_HOUR=10            # ساعة فتح السوق
MARKET_CLOSE_HOUR=14           # ساعة إغلاق السوق
MARKET_CLOSE_MINUTE=30         # دقيقة الإغلاق
MARKET_DAYS=0,1,2,3,4         # أيام التداول (أحد-خميس)

# حدود الطلبات
API_RATE_LIMIT_WINDOW=900000   # نافزة زمنية (15 دقيقة)
API_RATE_LIMIT_MAX=100         # عدد الطلبات المسموح
YAHOO_FINANCE_RATE_LIMIT=100   # حد Yahoo Finance (100/دقيقة)
```

## 🚀 النشر

### Docker (اختياري)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/app.js"]
```

### PM2 (للإنتاج)
```json
{
  "name": "egx-pilot-advisor-backend",
  "script": "dist/app.js",
  "instances": "max",
  "exec_mode": "cluster",
  "env": {
    "NODE_ENV": "production"
  }
}
```

## 🤝 المساهمة

1. **Fork** المشروع
2. **إنشاء branch** للميزة الجديدة
3. **Commit** التغييرات
4. **Push** إلى الـ branch
5. **إنشاء Pull Request**

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT.

## 📞 الدعم

- **GitHub Issues** - للمشاكل التقنية
- **Email** - admin@egxpilot.com
- **Documentation** - [Wiki Page](link-to-wiki)

---

**EGX Pilot Advisor** - منصتك الشاملة لتحليل الأسهم المصرية 🇪🇬
