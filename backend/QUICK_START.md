# 🚀 دليل البدء السريع - Backend

## إعداد سريع (خطوة واحدة)

```bash
cd backend
chmod +x setup.sh
./setup.sh
```

هذا السكريبت سيقوم بكل الإعدادات تلقائياً!

---

## الإعداد اليدوي

### 1. تثبيت الحزم
```bash
cd backend
npm install
```

### 2. إعداد البيئة
```bash
cp .env.example .env
nano .env  # أو محرر النصوص المفضل لديك
```

**تحديث المتغيرات المطلوبة:**
```env
DATABASE_URL="sqlserver://localhost:1433;database=EGX_Pilot_Advisor;user=sa;password=curhi6-qEbfid;trustServerCertificate=true"
JWT_SECRET=your_super_secure_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 3. إعداد قاعدة البيانات
```bash
npm run prisma:generate
npm run prisma:push
```

### 4. بناء المشروع
```bash
npm run build
```

### 5. تشغيل الخادم
```bash
# للتطوير
npm run dev

# للإنتاج
npm start
```

---

## ✅ التحقق من التثبيت

### فحص صحة النظام
```bash
curl http://localhost:3001/health
```

### فحص حالة API
```bash
curl http://localhost:3001/api/status
```

### Expected Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-07-04T12:00:00.000Z",
  "services": {
    "database": "connected",
    "yahooFinance": {
      "status": "active",
      "requestsRemaining": 100
    }
  }
}
```

---

## 🔧 أوامر مفيدة

```bash
# إدارة قاعدة البيانات
npm run prisma:studio     # واجهة قاعدة البيانات
npm run prisma:migrate    # تطبيق تغييرات الـ schema

# التطوير
npm run dev               # تشغيل مع Hot Reload
npm run lint              # فحص الكود
npm run lint:fix          # إصلاح مشاكل الكود

# الاختبار
npm test                  # تشغيل الاختبارات
npm run test:coverage     # تقرير التغطية

# الإنتاج
npm run build             # بناء المشروع
npm start                 # تشغيل الإنتاج
```

---

## 🐛 حل المشاكل الشائعة

### Database Connection Error
```bash
# تأكد من تشغيل SQL Server Container
docker ps | grep sql

# اختبار الاتصال
sqlcmd -S localhost -U sa -P curhi6-qEbfid -Q "SELECT 1"
```

### Google OAuth Setup
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. إنشاء مشروع جديد أو اختيار موجود
3. تفعيل Google+ API
4. إنشاء OAuth 2.0 credentials
5. إضافة `http://localhost:3000` في Authorized origins

### Email Configuration
1. تفعيل 2-Factor Authentication في Gmail
2. إنشاء App Password
3. استخدام App Password في `EMAIL_PASSWORD`

---

## 📊 مراقبة النظام

### Real-time Logs
```bash
# عرض logs مباشرة
npm run dev

# أو في الإنتاج
tail -f logs/app.log
```

### Performance Monitoring
```bash
# إحصائيات الـ Cache
curl http://localhost:3001/health | jq '.services.cache'

# إحصائيات Yahoo Finance
curl http://localhost:3001/health | jq '.services.yahooFinance'
```

---

## 🔄 التحديث

```bash
# سحب آخر التحديثات
git pull origin main

# تحديث الحزم
npm update

# إعادة بناء
npm run build

# إعادة تشغيل
npm start
```

---

**🎯 الهدف:** خادم Backend جاهز خلال 5 دقائق!

**💡 نصيحة:** استخدم `npm run dev` للتطوير - يعيد التشغيل تلقائياً عند التغيير.

**📞 مساعدة:** إذا واجهت مشكلة، تحقق من ملف README.md للتفاصيل الكاملة.
