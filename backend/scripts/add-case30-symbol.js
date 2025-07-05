const { PrismaClient } = require('@prisma/client');
const yahooFinance = require('yahoo-finance2').default;

const prisma = new PrismaClient();

async function addCASE30Symbol() {
  try {
    console.log('📊 Adding CASE30 symbol to MarketDataCache...');
    
    // First, get the latest data from Yahoo Finance
    const symbol = '^CASE30';
    
    console.log(`🔍 Fetching data from Yahoo Finance for ${symbol}...`);
    
    // Get current quote
    const quote = await yahooFinance.quote(symbol);
    console.log('Quote data:', quote);
    
    const currentPrice = quote.regularMarketPrice;
    const previousClose = quote.regularMarketPreviousClose;
    const volume = quote.regularMarketVolume;
    
    const priceChange = currentPrice - previousClose;
    const priceChangePercent = (priceChange / previousClose) * 100;
    
    console.log(`📈 Current price: ${currentPrice}`);
    console.log(`📉 Previous close: ${previousClose}`);
    console.log(`📊 Price change: ${priceChange} (${priceChangePercent.toFixed(2)}%)`);
    
    // Upsert the symbol in MarketDataCache
    const symbolData = await prisma.marketDataCache.upsert({
      where: { symbol: symbol },
      update: {
        companyName: 'EGX 30 Price Return Index',
        companyNameAr: 'مؤشر العائد السعري EGX 30',
        currentPrice: currentPrice,
        previousClose: previousClose,
        priceChange: priceChange,
        priceChangePercent: priceChangePercent,
        volume: volume,
        sector: 'Index',
        sectorAr: 'مؤشر',
        lastUpdated: new Date(),
        isActive: true
      },
      create: {
        symbol: symbol,
        companyName: 'EGX 30 Price Return Index',
        companyNameAr: 'مؤشر العائد السعري EGX 30',
        currentPrice: currentPrice,
        previousClose: previousClose,
        priceChange: priceChange,
        priceChangePercent: priceChangePercent,
        volume: volume,
        sector: 'Index',
        sectorAr: 'مؤشر',
        lastUpdated: new Date(),
        isActive: true
      }
    });
    
    console.log('✅ Successfully added/updated CASE30 in MarketDataCache:');
    console.log(JSON.stringify(symbolData, null, 2));
    
    // Also get some historical data
    console.log('\n📊 Getting historical data...');
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days
    
    const historicalData = await yahooFinance.historical(symbol, {
      period1: startDate,
      period2: endDate,
      interval: '1d'
    });
    
    console.log(`📈 Retrieved ${historicalData.length} historical data points`);
    
    if (historicalData.length > 0) {
      // Delete existing historical data for this symbol first
      await prisma.historicalData.deleteMany({
        where: { symbol: symbol }
      });
      
      // Convert and insert new historical data
      const historicalRecords = historicalData.map(record => ({
        symbol: symbol,
        dateTime: record.date,
        openPrice: record.open,
        highPrice: record.high,
        lowPrice: record.low,
        closePrice: record.close,
        volume: record.volume ? BigInt(record.volume) : null,
        adjustedClose: record.adjClose
      }));
      
      await prisma.historicalData.createMany({
        data: historicalRecords,
        skipDuplicates: true
      });
      
      console.log(`✅ Added ${historicalRecords.length} historical data points`);
    }
    
    console.log('\n🎉 CASE30 symbol successfully added to the database!');
    
  } catch (error) {
    console.error('❌ Error adding CASE30 symbol:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  } finally {
    await prisma.$disconnect();
  }
}

addCASE30Symbol();
