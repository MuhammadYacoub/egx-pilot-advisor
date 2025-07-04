#!/usr/bin/env node

/**
 * Script لجلب البيانات التاريخية للأسهم المصرية
 * يمكن تشغيله من command line
 */

require('dotenv').config();

import { historicalDataService } from '../src/services/historical-data.service';
import { prisma } from '../src/config/database';

const args = process.argv.slice(2);
const period = args[0] || '1y';

async function main() {
  try {
    console.log('🚀 بدء سكريبت جلب البيانات التاريخية');
    console.log(`📅 الفترة الزمنية: ${period}`);
    console.log('⏰ بدء العملية...\n');

    // التحقق من اتصال قاعدة البيانات
    await prisma.$connect();
    console.log('✅ تم الاتصال بقاعدة البيانات\n');

    // جلب احصائيات قبل البدء
    const statsBefore = await historicalDataService.getDataStats();
    console.log('📊 احصائيات قبل البدء:');
    console.log(`- إجمالي السجلات: ${statsBefore?.totalHistoricalRecords || 0}`);
    console.log(`- الأسهم المختلفة: ${statsBefore?.uniqueSymbols || 0}`);
    console.log(`- Cache السوق: ${statsBefore?.marketCacheEntries || 0}\n`);

    // بدء جلب البيانات
    await historicalDataService.populateHistoricalData(period as any);

    // جلب احصائيات بعد الانتهاء
    const statsAfter = await historicalDataService.getDataStats();
    console.log('\n📊 احصائيات بعد الانتهاء:');
    console.log(`- إجمالي السجلات: ${statsAfter?.totalHistoricalRecords || 0}`);
    console.log(`- الأسهم المختلفة: ${statsAfter?.uniqueSymbols || 0}`);
    console.log(`- Cache السوق: ${statsAfter?.marketCacheEntries || 0}`);

    if (statsBefore && statsAfter) {
      const newRecords = (statsAfter.totalHistoricalRecords || 0) - (statsBefore.totalHistoricalRecords || 0);
      const newSymbols = (statsAfter.uniqueSymbols || 0) - (statsBefore.uniqueSymbols || 0);
      console.log(`\n📈 البيانات الجديدة المضافة:`);
      console.log(`- ${newRecords} سجل جديد`);
      console.log(`- ${newSymbols} سهم جديد`);
    }

    console.log('\n🎉 انتهت العملية بنجاح!');

  } catch (error) {
    console.error('\n❌ خطأ في تشغيل السكريبت:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 تم قطع الاتصال بقاعدة البيانات');
    process.exit(0);
  }
}

// معلومات الاستخدام
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
📖 كيفية الاستخدام:

  npm run populate-data [period]

📅 الفترات المتاحة:
  1y    - سنة واحدة (افتراضي)
  2y    - سنتان

📚 أمثلة:
  npm run populate-data        # جلب بيانات سنة واحدة
  npm run populate-data 1y     # جلب بيانات سنة واحدة
  npm run populate-data 2y     # جلب بيانات سنتين

⚠️  ملاحظة: يُفضل تشغيل هذا السكريبت خارج ساعات التداول لتجنب حدود الطلبات.
  `);
  process.exit(0);
}

// تشغيل السكريبت
main().catch(console.error);
