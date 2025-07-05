# 📋 **خطة تنفيذ Backend لتطبيق EGX Pilot Advisor**

## 🎯 **نظرة عامة على المشروع**

تطبيق شامل لتحليل ومتابعة الأسهم في البورصة المصرية مع نظام إدارة المحافظ الاستثمارية وتحليل الفرص.

---

## 🏗️ **المعمارية التقنية المُحدثة**

### **التقنيات المختارة (مع التركيز على البساطة)**

```
Backend Framework: Node.js + Express.js + TypeScript
Database: SQL Server Container (sa/curhi6-qEbfid)
Authentication: Google OAuth 2.0 + JWT
Data Source: Yahoo Finance 2 API
Real-time: WebSocket (Socket.io)
Caching: In-Memory Cache (لتجنب التعقيد)
ORM: Prisma (أبسط في الإعداد)
Validation: Zod
Email Service: Nodemailer
API Documentation: Swagger/OpenAPI
```

### **هيكل المشروع**

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── google-auth.ts
│   │   ├── email.ts
│   │   └── yahoo-finance.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── market.controller.ts
│   │   ├── portfolio.controller.ts
│   │   ├── analysis.controller.ts
│   │   ├── alerts.controller.ts
│   │   └── admin.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── rate-limit.middleware.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Portfolio.ts
│   │   ├── Position.ts
│   │   ├── Alert.ts
│   │   └── MarketData.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── yahoo-finance.service.ts
│   │   ├── portfolio.service.ts
│   │   ├── technical-analysis.service.ts
│   │   ├── fundamental-analysis.service.ts
│   │   ├── email.service.ts
│   │   ├── cache.service.ts
│   │   └── websocket.service.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── market.routes.ts
│   │   ├── portfolio.routes.ts
│   │   ├── analysis.routes.ts
│   │   ├── alerts.routes.ts
│   │   └── admin.routes.ts
│   ├── utils/
│   │   ├── calculations.ts
│   │   ├── validators.ts
│   │   ├── email-templates.ts
│   │   └── constants.ts
│   ├── jobs/
│   │   ├── market-data-sync.ts
│   │   ├── portfolio-updates.ts
│   │   └── alert-processor.ts
│   └── app.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docs/
│   └── api-documentation.md
├── package.json
├── .env.example
└── README.md
```

---

## 🗄️ **تصميم قاعدة البيانات المُحدث**

### **الجداول الأساسية**

```sql
-- Users table
CREATE TABLE users (
    id NVARCHAR(36) PRIMARY KEY,
    google_id NVARCHAR(255) UNIQUE NOT NULL,
    email NVARCHAR(255) UNIQUE NOT NULL,
    name NVARCHAR(255) NOT NULL,
    picture NVARCHAR(500),
    preferred_language NVARCHAR(2) DEFAULT 'en',
    theme NVARCHAR(10) DEFAULT 'dark',
    email_notifications BIT DEFAULT 1,
    alert_preferences NVARCHAR(MAX), -- JSON
    is_paper_trading BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Portfolios table (للمحافظ الحقيقية والتجريبية)
CREATE TABLE portfolios (
    id NVARCHAR(36) PRIMARY KEY,
    user_id NVARCHAR(36) FOREIGN KEY REFERENCES users(id),
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(1000),
    portfolio_type NVARCHAR(20) DEFAULT 'paper', -- 'paper' or 'real'
    initial_capital DECIMAL(18,2) NOT NULL,
    current_value DECIMAL(18,2) NOT NULL,
    cash_balance DECIMAL(18,2) NOT NULL,
    total_pnl DECIMAL(18,2) DEFAULT 0,
    daily_pnl DECIMAL(18,2) DEFAULT 0,
    is_default BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Historical market data (بيانات العام السابق)
CREATE TABLE historical_data (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    symbol NVARCHAR(20) NOT NULL,
    date_time DATETIME2 NOT NULL,
    open_price DECIMAL(10,4),
    high_price DECIMAL(10,4),
    low_price DECIMAL(10,4),
    close_price DECIMAL(10,4),
    volume BIGINT,
    adjusted_close DECIMAL(10,4),
    INDEX IX_symbol_date (symbol, date_time)
);

-- Real-time market data cache
CREATE TABLE market_data_cache (
    symbol NVARCHAR(20) PRIMARY KEY,
    company_name NVARCHAR(255),
    company_name_ar NVARCHAR(255),
    current_price DECIMAL(10,4),
    previous_close DECIMAL(10,4),
    price_change DECIMAL(10,4),
    price_change_percent DECIMAL(8,4),
    volume BIGINT,
    avg_volume BIGINT,
    market_cap DECIMAL(20,2),
    sector NVARCHAR(100),
    sector_ar NVARCHAR(100),
    last_updated DATETIME2 DEFAULT GETDATE(),
    is_active BIT DEFAULT 1
);

-- Technical analysis cache
CREATE TABLE technical_indicators (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    symbol NVARCHAR(20) NOT NULL,
    timeframe NVARCHAR(10), -- '1D', '1W', '1M'
    rsi_14 DECIMAL(8,4),
    macd_line DECIMAL(10,6),
    macd_signal DECIMAL(10,6),
    macd_histogram DECIMAL(10,6),
    ema_20 DECIMAL(10,4),
    ema_50 DECIMAL(10,4),
    bollinger_upper DECIMAL(10,4),
    bollinger_middle DECIMAL(10,4),
    bollinger_lower DECIMAL(10,4),
    support_level DECIMAL(10,4),
    resistance_level DECIMAL(10,4),
    overall_signal NVARCHAR(10), -- 'BUY', 'SELL', 'NEUTRAL'
    signal_strength DECIMAL(4,2),
    calculated_at DATETIME2 DEFAULT GETDATE(),
    INDEX IX_symbol_timeframe (symbol, timeframe)
);

-- Fundamental analysis data
CREATE TABLE fundamental_data (
    symbol NVARCHAR(20) PRIMARY KEY,
    pe_ratio DECIMAL(8,2),
    pb_ratio DECIMAL(8,2),
    roe DECIMAL(8,4),
    roa DECIMAL(8,4),
    debt_to_equity DECIMAL(8,4),
    current_ratio DECIMAL(8,4),
    revenue_growth DECIMAL(8,4),
    earnings_growth DECIMAL(8,4),
    dividend_yield DECIMAL(8,4),
    fundamental_score DECIMAL(4,2), -- من 0 إلى 100
    last_updated DATETIME2 DEFAULT GETDATE()
);

-- User alerts and notifications
CREATE TABLE user_alerts (
    id NVARCHAR(36) PRIMARY KEY,
    user_id NVARCHAR(36) FOREIGN KEY REFERENCES users(id),
    alert_type NVARCHAR(50), -- 'price_target', 'portfolio_alert', 'opportunity', 'technical_signal'
    symbol NVARCHAR(20),
    alert_condition NVARCHAR(MAX), -- JSON
    message NVARCHAR(1000),
    message_ar NVARCHAR(1000),
    is_active BIT DEFAULT 1,
    is_triggered BIT DEFAULT 0,
    trigger_count INT DEFAULT 0,
    email_sent BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    triggered_at DATETIME2
);

-- Email logs
CREATE TABLE email_logs (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id NVARCHAR(36) FOREIGN KEY REFERENCES users(id),
    email_type NVARCHAR(50), -- 'alert', 'analysis_report', 'portfolio_summary'
    recipient_email NVARCHAR(255),
    subject NVARCHAR(500),
    status NVARCHAR(20), -- 'sent', 'failed', 'pending'
    error_message NVARCHAR(1000),
    sent_at DATETIME2 DEFAULT GETDATE()
);

-- Admin monitoring
CREATE TABLE system_metrics (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    metric_type NVARCHAR(50),
    metric_value DECIMAL(18,4),
    details NVARCHAR(MAX),
    recorded_at DATETIME2 DEFAULT GETDATE()
);
```

---

## ⚙️ **استراتيجية إدارة البيانات**

### **1. البيانات التاريخية**
- **التحديث**: تحميل بيانات العام السابق عند إعداد النظام
- **التخزين**: بيانات يومية لجميع الأسهم النشطة في EGX
- **الصيانة**: تحديث تلقائي كل نهاية جلسة

### **2. البيانات المباشرة**
- **أوقات الجلسات**: الأحد - الخميس، 10:00 ص - 2:30 م
- **معدل التحديث**: 
  - داخل الجلسة: كل 30 ثانية
  - خارج الجلسة: كل 5 دقائق
- **Cache Strategy**: In-Memory مع انتهاء صلاحية ذكي

### **3. التحليل الفني**
- **حساب المؤشرات**: كل ساعة خلال الجلسة، مرتين يومياً خارج الجلسة
- **المؤشرات المضمنة**: RSI, MACD, EMA, Bollinger Bands, Support/Resistance

---

## 🔧 **خدمات النظام الأساسية**

### **1. خدمة Yahoo Finance**
```typescript
export class YahooFinanceService {
  private cache = new Map();
  
  async getEGXQuote(symbol: string) {
    const cacheKey = `quote_${symbol}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const quote = await yahooFinance.quote(`${symbol}.CA`);
    this.cache.set(cacheKey, quote, 30000); // 30 seconds cache
    return quote;
  }
  
  async getHistoricalData(symbol: string, period: string) {
    return await yahooFinance.historical(`${symbol}.CA`, {
      period1: this.getPeriodStart(period),
      period2: new Date()
    });
  }
}
```

### **2. خدمة التحليل الفني**
```typescript
export class TechnicalAnalysisService {
  calculateRSI(prices: number[], period = 14): number {
    // حساب RSI
  }
  
  calculateMACD(prices: number[]): { line: number, signal: number, histogram: number } {
    // حساب MACD
  }
  
  calculateBollingerBands(prices: number[], period = 20): { upper: number, middle: number, lower: number } {
    // حساب Bollinger Bands
  }
  
  getOverallSignal(indicators: any): { signal: 'BUY' | 'SELL' | 'NEUTRAL', strength: number } {
    // تجميع الإشارات وحساب القوة الإجمالية
  }
}
```

### **3. خدمة البريد الإلكتروني**
```typescript
export class EmailService {
  async sendAnalysisReport(userId: string, reportData: any) {
    const user = await this.getUserById(userId);
    const template = this.generateAnalysisTemplate(reportData, user.preferred_language);
    
    await this.sendEmail({
      to: user.email,
      subject: user.preferred_language === 'ar' ? 'تقرير التحليل اليومي' : 'Daily Analysis Report',
      html: template
    });
  }
  
  async sendAlertNotification(alert: UserAlert) {
    // إرسال تنبيهات الفرص والتحذيرات
  }
  
  async sendPortfolioSummary(userId: string) {
    // إرسال ملخص المحفظة الأسبوعي
  }
}
```

---

## 📱 **واجهات برمجة التطبيقات (APIs)**

### **1. Market Data APIs**
```
GET /api/market/quotes/:symbol - بيانات سهم محدد
GET /api/market/search?q=query - البحث في الأسهم
GET /api/market/egx-index - بيانات مؤشر EGX 30
GET /api/market/top-movers - الأسهم الأكثر حركة
GET /api/market/historical/:symbol - البيانات التاريخية
GET /api/market/sectors - أداء القطاعات
```

### **2. Analysis APIs**
```
GET /api/analysis/technical/:symbol - التحليل الفني
GET /api/analysis/fundamental/:symbol - التحليل الأساسي
POST /api/analysis/custom - تحليل مخصص
GET /api/analysis/opportunities - الفرص المكتشفة
POST /api/analysis/email-report - إرسال تقرير بالبريد
```

### **3. Portfolio APIs**
```
GET /api/portfolio/portfolios - محافظ المستخدم
POST /api/portfolio/create - إنشاء محفظة جديدة
POST /api/portfolio/transaction - إضافة معاملة
GET /api/portfolio/:id/performance - أداء المحفظة
GET /api/portfolio/:id/risk-metrics - مقاييس المخاطر
```

### **4. Alerts APIs**
```
GET /api/alerts/user-alerts - تنبيهات المستخدم
POST /api/alerts/create - إنشاء تنبيه جديد
PUT /api/alerts/:id/toggle - تفعيل/إلغاء تنبيه
DELETE /api/alerts/:id - حذف تنبيه
```

---

## 🔄 **المهام المجدولة (Cron Jobs)**

### **1. تحديث البيانات**
```typescript
// كل 30 ثانية خلال الجلسة
cron.schedule('*/30 10-14 * * 0-4', () => {
  marketDataSyncJob.updateRealTimeData();
});

// كل 5 دقائق خارج الجلسة
cron.schedule('*/5 * * * *', () => {
  if (!isMarketOpen()) {
    marketDataSyncJob.updateBasicData();
  }
});
```

### **2. التحليل الفني**
```typescript
// كل ساعة خلال الجلسة
cron.schedule('0 10-14 * * 0-4', () => {
  technicalAnalysisJob.calculateIndicators();
});
```

### **3. التنبيهات والإشعارات**
```typescript
// كل دقيقة لفحص التنبيهات
cron.schedule('* * * * *', () => {
  alertProcessor.checkAlerts();
});

// تقرير يومي في 3 عصراً
cron.schedule('0 15 * * 0-4', () => {
  emailService.sendDailyReports();
});
```

---

## 🚀 **الجدول الزمني للتنفيذ (6 أسابيع)**

### **الأسبوع الأول: الأساسيات** ✅ **مكتمل**
- [x] إعداد المشروع والبيئة
- [x] إعداد TypeScript وهيكل المشروع
- [x] تصميم قاعدة البيانات (Prisma Schema)
- [x] إعداد خدمات الـ Cache والحسابات
- [x] إعداد Yahoo Finance Service
- [x] إعداد Email Service
- [x] إنشاء الخادم الرئيسي مع WebSocket
- [x] التوثيق الشامل وسكريبت الإعداد

### **الأسبوع الثاني: بيانات السوق** 🚧 **قيد التطوير**
- [ ] إنشاء قاعدة البيانات واتصال SQL Server 
- [ ] تطبيق Google OAuth والمصادقة
- [ ] تطبيق Yahoo Finance integration (جاهز، يحتاج اختبار)
- [ ] إنشاء Market Data Controllers و APIs
- [ ] تحميل البيانات التاريخية (عام سابق)
- [ ] إعداد WebSocket للبيانات المباشرة

### **الأسبوع الثالث: التحليل الفني والأساسي**
- [ ] حساب المؤشرات الفنية (RSI, MACD, Bollinger)
- [ ] نظام تقييم الإشارات
- [ ] APIs التحليل الفني
- [ ] بداية التحليل الأساسي
- [ ] خدمة اكتشاف الفرص

### **الأسبوع الرابع: إدارة المحافظ**
- [ ] نظام المحافظ التجريبية والحقيقية
- [ ] تتبع المعاملات والأداء
- [ ] حساب مقاييس المخاطر
- [ ] تقارير الأداء
- [ ] APIs إدارة المحافظ

### **الأسبوع الخامس: التنبيهات والبريد الإلكتروني**
- [ ] نظام التنبيهات المرن
- [ ] خدمة البريد الإلكتروني
- [ ] قوالب التقارير (عربي/إنجليزي)
- [ ] نظام الإشعارات البسيط
- [ ] لوحة الإدارة الأساسية

### **الأسبوع السادس: التكامل والاختبار**
- [ ] ربط Frontend بـ APIs الحقيقية
- [ ] استبدال البيانات التجريبية
- [ ] اختبارات النظام الشاملة
- [ ] تحسين الأداء
- [ ] كتابة التوثيق النهائي

---

## 🔒 **الأمان والحماية**

### **1. مصادقة المستخدمين**
- Google OAuth 2.0 مع JWT tokens
- تشفير كلمات المرور (bcrypt)
- Session management آمن

### **2. حماية APIs**
- Rate limiting بسيط (memory-based)
- Input validation مع Zod
- CORS configuration

### **3. حماية البيانات**
- تشفير البيانات الحساسة
- SQL injection prevention مع Prisma
- Audit logging للعمليات المهمة

---

## 📊 **لوحة الإدارة البسيطة**

### **المقاييس الأساسية**
- عدد المستخدمين النشطين
- حالة اتصال Yahoo Finance
- أداء قاعدة البيانات
- عدد التنبيهات المُرسلة
- أخطاء النظام

### **إدارة المحتوى**
- إدارة الأسهم النشطة
- مراقبة جودة البيانات
- إعدادات البريد الإلكتروني
- إحصائيات الاستخدام

---

## 🔄 **خطة التوسعات المستقبلية**

### **المرحلة القادمة**
1. **تحليل الأخبار المالية** - تجميع وتحليل الأخبار المؤثرة
2. **محاكاة المحفظة الذكية** - اقتراحات آلية للاستثمار
3. **تحليل المشاعر** - تحليل مشاعر السوق من وسائل التواصل
4. **تنبيهات ذكية** - تنبيهات مبنية على AI/ML
5. **تطبيق الموبايل** - React Native app

### **تحسينات طويلة المدى**
- **Machine Learning** للتنبؤ بالأسعار
- **Advanced Charting** - مخططات تفاعلية متقدمة
- **Social Trading** - متابعة المتداولين الناجحين
- **Options Trading** - دعم تداول الخيارات
- **Multi-Market Support** - دعم أسواق إقليمية أخرى

---

## 📝 **ملاحظات التنفيذ**

### **أولويات التطوير**
1. **البساطة أولاً** - تجنب التعقيد غير الضروري
2. **الاستقرار** - اختبار شامل لكل feature
3. **الأداء** - تحسين استهلاك الموارد
4. **تجربة المستخدم** - واجهة سهلة ومفهومة

### **التحديات المتوقعة**
- **Yahoo Finance Rate Limits** - إدارة ذكية للطلبات
- **Market Data Quality** - التحقق من صحة البيانات
- **Email Deliverability** - ضمان وصول الرسائل
- **Performance Scaling** - التحسين للمستخدمين المتعددين

---

## 📚 **الموارد والمراجع**

### **التوثيق التقني**
- [Yahoo Finance API Documentation](https://github.com/gadicc/node-yahoo-finance2)
- [Prisma SQL Server Guide](https://www.prisma.io/docs/concepts/database-connectors/sql-server)
- [Google OAuth Setup](https://developers.google.com/identity/oauth2/web/guides/overview)
- [Socket.io Documentation](https://socket.io/docs/v4/)

### **المؤشرات الفنية**
- [Technical Analysis Reference](https://www.investopedia.com/technical-analysis-4689657)
- [RSI Calculation](https://www.investopedia.com/terms/r/rsi.asp)
- [MACD Explanation](https://www.investopedia.com/terms/m/macd.asp)

---

## 📊 **حالة التطوير الحالية**

### ✅ **المنجز (4 يوليو 2025)**

#### البنية الأساسية (100% مكتمل)
- **Project Setup** - package.json, TypeScript, environment configuration
- **Database Design** - Prisma schema مع جميع الجداول المطلوبة
- **Core Services** - Cache service, Market calculations, Yahoo Finance service
- **Email System** - قوالب بريدية (عربي/إنجليزي) مع Nodemailer
- **Main Server** - Express.js مع WebSocket support كامل

#### التوثيق والأدوات (95% مكتمل)
- **README.md** - دليل شامل للمطورين
- **QUICK_START.md** - دليل البدء السريع 
- **Setup Script** - سكريبت إعداد تلقائي (`setup.sh`)
- **Environment Template** - ملف .env.example مفصل

#### الملفات المنشأة
```
backend/
├── ✅ src/config/ (كامل)
├── ✅ src/services/ (75%)
├── ✅ src/utils/ (كامل)
├── ✅ src/app.ts (كامل)
├── ✅ prisma/schema.prisma (كامل)
├── ✅ package.json (كامل)
├── ✅ التوثيق والإعداد (كامل)
└── ⏳ Controllers, Routes, Jobs (قادم)
```

### 🎯 **الأولوية القادمة (الأسبوع الثاني)**
1. إنشاء قاعدة البيانات وتطبيق Schema
2. بناء Market Data Controllers
3. Google OAuth Integration  
4. Testing وAPI Documentation

### 📈 **التقدم العام: 35% مكتمل**

---

*آخر تحديث: 4 يوليو 2025*
