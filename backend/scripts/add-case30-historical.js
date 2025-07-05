const { PrismaClient } = require('@prisma/client');
const yahooFinance = require('yahoo-finance2').default;

const prisma = new PrismaClient();

async function addCASE30HistoricalData() {
  try {
    console.log('📊 Adding historical data for ^CASE30...');
    
    const symbol = '^CASE30';
    
    // Get data for different periods
    const periods = [
      { name: '1 month', days: 30 },
      { name: '3 months', days: 90 },
      { name: '6 months', days: 180 },
      { name: '1 year', days: 365 }
    ];
    
    for (const period of periods) {
      try {
        console.log(`\n🔍 Fetching ${period.name} data...`);
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period.days);
        
        // Use chart API as it's more reliable
        const data = await yahooFinance.chart(symbol, {
          period1: startDate,
          period2: endDate,
          interval: '1d'
        });
        
        if (data && data.quotes && data.quotes.length > 0) {
          console.log(`📈 Retrieved ${data.quotes.length} data points for ${period.name}`);
          
          // Convert to our format
          const historicalRecords = data.quotes.map(quote => ({
            symbol: symbol,
            dateTime: quote.date,
            openPrice: quote.open || null,
            highPrice: quote.high || null,
            lowPrice: quote.low || null,
            closePrice: quote.close || null,
            volume: quote.volume ? BigInt(quote.volume) : null,
            adjustedClose: quote.adjclose || quote.close || null
          })).filter(record => record.closePrice !== null);
          
          if (historicalRecords.length > 0) {
            // Delete existing data for this period first
            const periodStart = new Date();
            periodStart.setDate(periodStart.getDate() - period.days);
            
            await prisma.historicalData.deleteMany({
              where: { 
                symbol: symbol,
                dateTime: {
                  gte: periodStart
                }
              }
            });
            
            // Insert new data
            await prisma.historicalData.createMany({
              data: historicalRecords
            });
            
            console.log(`✅ Stored ${historicalRecords.length} records for ${period.name}`);
            break; // Exit after successful insertion
          }
        }
      } catch (periodError) {
        console.log(`⚠️ Could not fetch ${period.name} data:`, periodError.message);
        continue;
      }
    }
    
    // Verify the data
    const totalRecords = await prisma.historicalData.count({
      where: { symbol: symbol }
    });
    
    console.log(`\n📊 Total historical records for ${symbol}: ${totalRecords}`);
    
    if (totalRecords > 0) {
      const latestRecord = await prisma.historicalData.findFirst({
        where: { symbol: symbol },
        orderBy: { dateTime: 'desc' }
      });
      
      console.log('📅 Latest record:', {
        date: latestRecord?.dateTime,
        close: latestRecord?.closePrice,
        volume: latestRecord?.volume?.toString()
      });
    }
    
    console.log('\n🎉 Historical data update completed!');
    
  } catch (error) {
    console.error('❌ Error adding historical data:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addCASE30HistoricalData();
