const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Egyptian stock symbols to try
const egyptianSymbols = [
  '^CASE30',     // EGX 30 Price Return Index (الرمز الرسمي)
  'CASE30',      // نفس الرمز بدون ^
  '^EGX30',      // EGX 30 (محاولة أخرى)
  'EGX30',       // بدون ^
  'ISPN',        // رمز مقترح
  'ISPN.CA',     // مع extension المصري
  'EGX30.CA',    // EGX 30 مع extension
  'CASE30.CA',   // CASE30 مع extension
  'EGPT',        // VanEck Vectors Egypt Index ETF
  'EEM',         // iShares MSCI Emerging Markets ETF
];

async function testSymbolWithAPI(symbol) {
  try {
    const fetch = (await import('node-fetch')).default;
    
    // اختبار مع Yahoo Finance API مباشرة
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    
    console.log(`📊 اختبار ${symbol}...`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.chart && data.chart.result && data.chart.result.length > 0) {
      const result = data.chart.result[0];
      const meta = result.meta;
      
      if (meta && meta.regularMarketPrice) {
        const stockData = {
          symbol: symbol,
          name: meta.longName || meta.shortName || symbol,
          price: meta.regularMarketPrice || 0,
          exchange: meta.exchangeName || 'Unknown',
          currency: meta.currency || 'USD'
        };
        
        console.log(`✅ ${symbol} متاح: ${stockData.name} - ${stockData.price} ${stockData.currency}`);
        console.log(`   البورصة: ${stockData.exchange}`);
        
        return stockData;
      }
    }
    
    console.log(`❌ ${symbol} غير متاح`);
    return null;
    
  } catch (error) {
    console.log(`❌ ${symbol} خطأ: ${error.message}`);
    return null;
  }
}

async function testEgyptianSymbols() {
  console.log('🔍 اختبار رموز البورصة المصرية...\n');
  
  const availableSymbols = [];
  
  for (const symbol of egyptianSymbols) {
    const stockData = await testSymbolWithAPI(symbol);
    
    if (stockData) {
      availableSymbols.push(stockData);
      
      // إضافة إلى قاعدة البيانات
      try {
        await prisma.stock.upsert({
          where: { symbol: symbol },
          update: {
            name: stockData.name,
            exchange: stockData.exchange,
            currency: stockData.currency,
            lastUpdated: new Date()
          },
          create: {
            symbol: symbol,
            name: stockData.name,
            exchange: stockData.exchange,
            sector: 'Index',
            currency: stockData.currency,
            isActive: true,
            lastUpdated: new Date()
          }
        });
        console.log(`💾 تم حفظ ${symbol} في قاعدة البيانات`);
      } catch (dbError) {
        console.log(`❌ خطأ في حفظ ${symbol}:`, dbError.message);
      }
    }
    
    // تأخير لتجنب Rate Limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log('\n📋 ملخص الرموز المتاحة:');
  console.log('=' .repeat(50));
  
  if (availableSymbols.length === 0) {
    console.log('❌ لم يتم العثور على أي رموز متاحة للبورصة المصرية');
    console.log('💡 سيتم استخدام ^EGX30CAPPED.CA كرمز افتراضي');
  } else {
    availableSymbols.forEach((stock, index) => {
      console.log(`${index + 1}. ${stock.symbol} - ${stock.name}`);
      console.log(`   السعر: ${stock.price} ${stock.currency} | البورصة: ${stock.exchange}`);
      console.log('');
    });
    
    // اقتراح أفضل رمز للاستخدام
    const bestSymbol = availableSymbols.find(s => 
      s.symbol.includes('CASE30') || s.symbol.includes('EGX30')
    ) || availableSymbols[0];
    
    console.log(`🎯 الرمز المقترح للاستخدام: ${bestSymbol.symbol}`);
    console.log(`📊 ${bestSymbol.name} - ${bestSymbol.price} ${bestSymbol.currency}`);
  }
  
  return availableSymbols;
}

async function main() {
  try {
    console.log('🚀 بدء اختبار رموز البورصة المصرية...\n');
    await testEgyptianSymbols();
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n✅ انتهاء الاختبار');
  }
}

main().catch(console.error);
