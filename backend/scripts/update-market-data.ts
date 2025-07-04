#!/usr/bin/env node

/**
 * Script لتحديث بيانات السوق للأسهم النشطة
 * يمكن تشغيله دورياً لتحديث الأسعار الحالية
 */

require('dotenv').config();

import { historicalDataService } from '../src/services/historical-data.service';
import { prisma } from '../src/config/database';

async function main() {
  try {
    console.log('🔄 بدء سكريبت تحديث بيانات السوق');
    console.log('⏰ بدء العملية...\n');

    // التحقق من اتصال قاعدة البيانات
    await prisma.$connect();
    console.log('✅ تم الاتصال بقاعدة البيانات\n');

    // جلب احصائيات قبل البدء
    const statsBefore = await historicalDataService.getDataStats();
    console.log('📊 احصائيات قبل التحديث:');
    console.log(`- Cache السوق: ${statsBefore?.marketCacheEntries || 0} سهم`);
    
    if (statsBefore?.marketCacheEntries) {
      const lastUpdateInfo = await prisma.marketDataCache.findFirst({
        orderBy: { lastUpdated: 'desc' },
        select: { lastUpdated: true }
      });
      
      if (lastUpdateInfo) {
        const timeSinceUpdate = Date.now() - lastUpdateInfo.lastUpdated.getTime();
        const minutesSinceUpdate = Math.floor(timeSinceUpdate / (1000 * 60));
        console.log(`- آخر تحديث: ${minutesSinceUpdate} دقيقة مضت`);
      }
    }
    
    console.log();

    // بدء تحديث البيانات
    await historicalDataService.updateActiveStocks();

    // جلب احصائيات بعد الانتهاء
    const statsAfter = await historicalDataService.getDataStats();
    console.log('\n📊 احصائيات بعد التحديث:');
    console.log(`- Cache السوق: ${statsAfter?.marketCacheEntries || 0} سهم`);

    console.log('\n🎉 انتهت عملية التحديث بنجاح!');

  } catch (error) {
    console.error('\n❌ خطأ في تشغيل سكريپت التحديث:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 تم قطع الاتصال بقاعدة البيانات');
    process.exit(0);
  }
}

// معلومات الاستخدام
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
📖 كيفية الاستخدام:

  npm run update-market

📝 الوصف:
  يحدث هذا السكريپت أسعار الأسهم الحالية في cache السوق.
  
⏰ الاستخدام المُوصى به:
  - أثناء ساعات التداول: كل 5-10 دقائق
  - خارج ساعات التداول: مرة واحدة يومياً
  
📚 مثال:
  npm run update-market

⚠️  ملاحظة: يُفضل عدم تشغيل هذا السكريپت بشكل متكرر جداً لتجنب حدود الطلبات.
  `);
  process.exit(0);
}

// تشغيل السكريپت
main().catch(console.error);
