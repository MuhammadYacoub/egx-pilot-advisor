# نظام البيانات المالية الحقيقية - EGX Pilot Advisor

## نظرة عامة

تم تطوير نظام شامل لجلب وإدارة البيانات المالية الحقيقية للأسهم المصرية في البورصة المصرية (EGX). يعتمد النظام على Yahoo Finance كمصدر رئيسي مع إمكانية التوسع لمصادر أخرى مستقبلاً.

## الميزات الجديدة

### 1. قاعدة بيانات الأسهم المصرية
- **الملف**: `backend/src/data/egx-stocks.json`
- **المحتوى**: 105+ سهم مصري مع الأسماء والرموز الصحيحة
- **التحديث**: قابل للتحديث والتوسع

### 2. خدمة البيانات التاريخية
- **الملف**: `backend/src/services/historical-data.service.ts`
- **الوظائف**:
  - جلب البيانات التاريخية بشكل تلقائي
  - حفظ البيانات في قاعدة البيانات
  - تحديث cache السوق
  - احصائيات شاملة

### 3. خدمة البحث المحسنة
- **تحسين**: `yahoo-finance.service.ts`
- **البحث**: بالاسم العربي والإنجليزي والرمز
- **النتائج**: دقيقة ومحدثة من قاعدة البيانات المحلية

### 4. API endpoints جديدة
- **الملف**: `backend/src/routes/market.routes.ts`
- **المسارات**:
  - `GET /api/market/historical/:symbol` - البيانات التاريخية
  - `GET /api/market/quote/:symbol` - السعر الحالي
  - `GET /api/market/search` - البحث عن الأسهم
  - `GET /api/market/top-movers` - الأسهم الأكثر حركة
  - `POST /api/market/populate-data` - جلب البيانات (dev only)
  - `GET /api/market/stats` - احصائيات البيانات
  - `POST /api/market/update-active` - تحديث البيانات

### 5. سكريپتات إدارية
- **جلب البيانات**: `npm run populate-data [1y|2y]`
- **تحديث السوق**: `npm run update-market`

## البيانات المتوفرة

### أسهم البورصة المصرية (105+ سهم)
```
البنوك: COMI, QNBE, HDBK, CIEB, ADIB, FAIT
التطوير العقاري: PHDC, TMGH, MASR, EMFD, OCDI
الاتصالات والتكنولوجيا: ETEL, FWRY, EFIH
الصناعات: SWDY, ESRS, GBCO, IRON
الأدوية: ISPH, SPMD, RMDA, PHAR
```

### البيانات التاريخية
- **الفترات**: 1 سنة أو 2 سنة
- **التفاصيل**: سعر الفتح، الإغلاق، الأعلى، الأدنى، الحجم
- **التحديث**: يومي للبيانات الجديدة

### بيانات السوق الحالية
- **السعر الحالي** مع التغيير اليومي
- **الحجم** والأحجام المتوسطة
- **معلومات الشركة** والقطاع
- **Cache ذكي** لتحسين الأداء

## كيفية الاستخدام

### 1. جلب البيانات التاريخية (أول مرة)
```bash
cd backend
npm run populate-data 1y    # سنة واحدة
npm run populate-data 2y    # سنتان
```

### 2. تحديث بيانات السوق
```bash
cd backend
npm run update-market
```

### 3. استخدام API
```javascript
// البحث عن سهم
GET /api/market/search?q=Commercial

// جلب السعر الحالي
GET /api/market/quote/COMI

// البيانات التاريخية
GET /api/market/historical/COMI?period=1y&source=db

// احصائيات البيانات
GET /api/market/stats
```

### 4. من الواجهة الأمامية
```typescript
// في services/market.service.ts
const historicalData = await fetch('/api/market/historical/COMI?period=1y');
const quote = await fetch('/api/market/quote/COMI');
const searchResults = await fetch('/api/market/search?q=بنك');
```

## قاعدة البيانات

### الجداول المستخدمة
- **HistoricalData**: البيانات التاريخية اليومية
- **MarketDataCache**: cache البيانات الحالية
- **TechnicalIndicator**: المؤشرات الفنية (للمستقبل)
- **FundamentalData**: البيانات الأساسية (للمستقبل)

### مثال على البيانات
```sql
-- البيانات التاريخية
SELECT symbol, dateTime, closePrice, volume 
FROM historical_data 
WHERE symbol = 'COMI' 
ORDER BY dateTime DESC 
LIMIT 30;

-- Cache السوق
SELECT symbol, companyName, currentPrice, priceChangePercent 
FROM market_data_cache 
WHERE isActive = 1 
ORDER BY priceChangePercent DESC;
```

## الأداء والكفاءة

### التخزين المؤقت (Caching)
- **البيانات الحالية**: 30 ثانية أثناء التداول، 5 دقائق خارجه
- **البيانات التاريخية**: 5 دقائق
- **نتائج البحث**: فورية من قاعدة البيانات المحلية

### إدارة الطلبات
- **Rate Limiting**: محترم لـ Yahoo Finance
- **Batch Processing**: معالجة الأسهم في مجموعات
- **Error Handling**: تجاهل الأخطاء ومتابعة العملية

### الموثوقية
- **Fallback**: جلب من cache في حالة فشل API
- **Retry Logic**: إعادة المحاولة عند الفشل
- **Data Validation**: التحقق من صحة البيانات

## المراقبة والصيانة

### الإحصائيات المتوفرة
```javascript
GET /api/market/stats
{
  "totalHistoricalRecords": 50000,
  "uniqueSymbols": 105,
  "marketCacheEntries": 98,
  "dateRange": {
    "oldest": "2023-07-04",
    "newest": "2024-07-04"
  }
}
```

### السجلات (Logs)
- جلب البيانات التاريخية مع تقرير مفصل
- تحديث cache السوق مع النتائج
- أخطاء API مع التفاصيل
- احصائيات الأداء

### المهام الدورية المقترحة
1. **يومياً**: `npm run update-market` (خارج ساعات التداول)
2. **أسبوعياً**: فحص احصائيات البيانات
3. **شهرياً**: تحديث قائمة الأسهم من المرفقات الجديدة

## الخطوات التالية

### التحسينات المقترحة
1. **إضافة مصادر بيانات بديلة** (Fallback sources)
2. **Web Scraping** للبورصة المصرية الرسمية
3. **المؤشرات الفنية** المحسوبة تلقائياً
4. **البيانات الأساسية** للشركات
5. **API للأخبار المالية**

### التكامل مع الواجهة الأمامية
1. **مكون البحث المحسن** مع اقتراحات فورية
2. **رسوم بيانية تفاعلية** للبيانات التاريخية
3. **لوحة قيادة** لمراقبة البيانات
4. **إعدادات المستخدم** للتحديث التلقائي

---

## ملاحظات مهمة

⚠️ **تنبيه**: عملية جلب البيانات التاريخية لأول مرة قد تستغرق 30-60 دقيقة لجميع الأسهم.

💡 **نصيحة**: شغل `npm run populate-data` خارج ساعات التداول لتجنب التأثير على الأداء.

🔄 **تحديث**: استخدم `npm run update-market` بانتظام للحصول على أحدث الأسعار.

📊 **مراقبة**: راجع `/api/market/stats` بانتظام لمتابعة حالة البيانات.

---

**تاريخ الإنشاء**: 4 يوليو 2025  
**آخر تحديث**: 4 يوليو 2025  
**الحالة**: جاهز للاستخدام ✅
