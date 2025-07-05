# EGX Pilot Advisor - Development Server Management

## 🚀 إدارة خوادم التطوير بطريقة ذكية

تم إنشاء نظام إدارة ذكي للخوادم لتجنب مشاكل تضارب المنافذ والعمليات المعلقة.

## 📋 الأوامر المتاحة

### 🎯 الأوامر الأساسية

```bash
# بدء جميع الخدمات (Backend + Frontend)
./dev-server.sh start
# أو
npm run dev:start

# إيقاف جميع الخدمات
./dev-server.sh stop
# أو
npm run dev:stop

# إعادة تشغيل جميع الخدمات
./dev-server.sh restart
# أو
npm run dev:restart
```

### 📊 مراقبة الخدمات

```bash
# فحص حالة الخدمات
./dev-server.sh status
# أو
npm run dev:status

# متابعة سجلات الأحداث
./dev-server.sh logs
# أو
npm run dev:logs
```

### 🔧 إدارة فردية

```bash
# تشغيل Backend فقط
./dev-server.sh backend
# أو
npm run dev:backend

# تشغيل Frontend فقط
./dev-server.sh frontend
# أو
npm run dev:frontend
```

## 🌐 عناوين الخدمات

- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

## 📂 ملفات السجلات

- **Backend Logs:** `/tmp/egx-backend.log`
- **Frontend Logs:** `/tmp/egx-frontend.log`

## 🔧 المميزات

### ✅ إدارة ذكية للمنافذ
- يتحقق من المنافذ المستخدمة تلقائياً
- يوقف العمليات المتضاربة قبل البدء
- يتأكد من تحرير المنافذ بالكامل

### 🔄 إدارة العمليات
- يحفظ PID للعمليات لإدارة أفضل
- يستخدم SIGTERM ثم SIGKILL عند الحاجة
- ينظف العمليات المعلقة تلقائياً

### 📊 مراقبة مستمرة
- يتحقق من صحة الخدمات بعد البدء
- يعرض سجلات الأحداث الحديثة
- يوفر معلومات مفصلة عن الحالة

### 🚨 معالجة الأخطاء
- يعرض رسائل خطأ واضحة
- يوجه إلى ملفات السجلات عند الحاجة
- يتعامل مع الحالات الاستثنائية بأمان

## 🔍 استكشاف الأخطاء

### مشكلة: الخدمة لا تبدأ
```bash
# تحقق من السجلات
./dev-server.sh logs

# أو فحص سجل محدد
tail -f /tmp/egx-backend.log
tail -f /tmp/egx-frontend.log
```

### مشكلة: تضارب المنافذ
```bash
# إيقاف قسري لجميع الخدمات
./dev-server.sh stop

# التحقق من العمليات
ps aux | grep -E "(node|tsx|vite)" | grep -v grep

# بدء جديد
./dev-server.sh start
```

### مشكلة: API لا يعمل
```bash
# اختبار Backend مباشرة
curl "http://localhost:3001/health"

# اختبار عبر Frontend proxy  
curl "http://localhost:8080/api/market/quote/%5ECASE30"
```

## 📦 المتطلبات

- Node.js 18+
- npm أو yarn
- curl (للاختبارات)
- lsof (لفحص المنافذ)

## 🎯 المؤشر المستخدم

التطبيق يستخدم مؤشر **EGX 30 Price Return Index** (^CASE30) كمؤشر افتراضي:
- بيانات حقيقية من Yahoo Finance
- تحديث تلقائي
- دعم للبيانات التاريخية

## 🚀 البدء السريع

```bash
# استنساخ المشروع والانتقال إليه
cd /path/to/egx-pilot-advisor

# بدء التطوير
./dev-server.sh start

# فتح التطبيق
open http://localhost:8080
```

## 🔗 روابط مفيدة

- [Frontend Development Server](http://localhost:8080)
- [Backend API Documentation](http://localhost:3001/api/status)
- [Health Check](http://localhost:3001/health)
- [API Test: EGX30 Quote](http://localhost:8080/api/market/quote/%5ECASE30)
