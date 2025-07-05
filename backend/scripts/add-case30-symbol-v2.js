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
    console.log('Quote data received successfully');
    
    const currentPrice = quote.regularMarketPrice;
    const previousClose = quote.regularMarketPreviousClose;
    const volume = quote.regularMarketVolume;
    
    const priceChange = currentPrice - previousClose;
    const priceChangePercent = (priceChange / previousClose) * 100;
    
    console.log(`📈 Current price: ${currentPrice}`);
    console.log(`📉 Previous close: ${previousClose}`);
    console.log(`📊 Price change: ${priceChange} (${priceChangePercent.toFixed(2)}%)`);
    console.log(`📊 Volume: ${volume}`);
    
    // Prepare data for upsert
    const symbolDataPayload = {
      companyName: 'EGX 30 Price Return Index',
      companyNameAr: 'مؤشر العائد السعري EGX 30',
      currentPrice: currentPrice,
      previousClose: previousClose,
      priceChange: priceChange,
      priceChangePercent: priceChangePercent,
      volume: volume ? BigInt(volume) : null,
      sector: 'Index',
      sectorAr: 'مؤشر',
      lastUpdated: new Date(),
      isActive: true
    };
    
    // Upsert the symbol in MarketDataCache
    const symbolData = await prisma.marketDataCache.upsert({
      where: { symbol: symbol },
      update: symbolDataPayload,
      create: {
        symbol: symbol,
        ...symbolDataPayload
      }
    });
    
    console.log('✅ Successfully added/updated CASE30 in MarketDataCache');
    console.log(`Symbol: ${symbolData.symbol}`);
    console.log(`Name: ${symbolData.companyName}`);
    console.log(`Price: ${symbolData.currentPrice}`);
    console.log(`Change: ${symbolData.priceChange} (${symbolData.priceChangePercent}%)`);
    
    // Also get some historical data
    console.log('\n📊 Getting historical data...');
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days
    
    try {
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
          openPrice: record.open || null,
          highPrice: record.high || null,
          lowPrice: record.low || null,
          closePrice: record.close || null,
          volume: record.volume ? BigInt(record.volume) : null,
          adjustedClose: record.adjClose || record.close || null
        })).filter(record => record.closePrice !== null); // Only keep records with valid close price
        
        if (historicalRecords.length > 0) {
          await prisma.historicalData.createMany({
            data: historicalRecords,
            skipDuplicates: true
          });
          
          console.log(`✅ Added ${historicalRecords.length} historical data points`);
        }
      }
    } catch (histError) {
      console.log('⚠️ Could not fetch historical data:', histError.message);
    }
    
    console.log('\n🎉 CASE30 symbol successfully added to the database!');
    
    // Test the API endpoint
    console.log('\n🧪 Testing API endpoint...');
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(`http://localhost:3001/api/market/quote/${symbol}`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API endpoint test successful:', data);
      } else {
        console.log('⚠️ API endpoint test failed:', response.status);
      }
    } catch (apiError) {
      console.log('⚠️ Could not test API endpoint (server might be offline):', apiError.message);
    }
    
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
