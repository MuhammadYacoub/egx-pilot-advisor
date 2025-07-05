/**
 * Market utility functions
 */

import { config } from '../config';

export const isMarketOpen = (): boolean => {
  const now = new Date();
  const cairoTime = new Date(now.toLocaleString("en-US", {timeZone: "Africa/Cairo"}));
  
  const dayOfWeek = cairoTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const hour = cairoTime.getHours();
  const minute = cairoTime.getMinutes();
  
  // Check if it's a trading day (Sunday to Thursday)
  if (!config.market.tradingDays.includes(dayOfWeek)) {
    return false;
  }
  
  // Check if it's within trading hours (10:00 AM to 2:30 PM)
  const currentMinutes = hour * 60 + minute;
  const openMinutes = config.market.openHour * 60;
  const closeMinutes = config.market.closeHour * 60 + config.market.closeMinute;
  
  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
};

export const getNextMarketOpen = (): Date => {
  const now = new Date();
  const cairoTime = new Date(now.toLocaleString("en-US", {timeZone: "Africa/Cairo"}));
  
  let nextOpen = new Date(cairoTime);
  nextOpen.setHours(config.market.openHour, 0, 0, 0);
  
  // If market is closed today, find next trading day
  while (!config.market.tradingDays.includes(nextOpen.getDay()) || 
         (nextOpen.getDay() === cairoTime.getDay() && nextOpen <= cairoTime)) {
    nextOpen.setDate(nextOpen.getDate() + 1);
    nextOpen.setHours(config.market.openHour, 0, 0, 0);
  }
  
  return nextOpen;
};

export const getMarketStatus = () => {
  const isOpen = isMarketOpen();
  const nextOpen = getNextMarketOpen();
  
  return {
    isOpen,
    nextOpen,
    currentTime: new Date(),
  };
};

// Format EGX symbol for Yahoo Finance (add .CA suffix if not present)
export const formatEGXSymbol = (symbol: string): string => {
  // Don't modify index symbols that start with ^
  if (symbol.startsWith('^')) {
    return symbol;
  }
  
  if (symbol.endsWith('.CA')) {
    return symbol;
  }
  return `${symbol}.CA`;
};

// Clean EGX symbol (remove .CA suffix)
export const cleanEGXSymbol = (symbol: string): string => {
  // Don't modify index symbols that start with ^
  if (symbol.startsWith('^')) {
    return symbol;
  }
  return symbol.replace('.CA', '');
};

// Basic price change calculation
export const calculatePriceChange = (current: number, previous: number): {
  change: number;
  changePercent: number;
} => {
  const change = current - previous;
  const changePercent = previous !== 0 ? (change / previous) * 100 : 0;
  
  return {
    change,
    changePercent,
  };
};

// Simple Moving Average calculation
export const calculateSMA = (prices: number[], period: number): number[] => {
  const sma: number[] = [];
  
  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1);
    const average = slice.reduce((sum, price) => sum + price, 0) / period;
    sma.push(average);
  }
  
  return sma;
};

// Basic volume analysis
export const analyzeVolume = (volumes: number[]): {
  average: number;
  max: number;
  min: number;
  latest: number;
} => {
  if (volumes.length === 0) {
    return { average: 0, max: 0, min: 0, latest: 0 };
  }
  
  const average = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
  const max = Math.max(...volumes);
  const min = Math.min(...volumes);
  const latest = volumes[volumes.length - 1] || 0;
  
  return { average, max, min, latest };
};

// Technical analysis placeholder (will be expanded later)
export const calculateTechnicalIndicators = (historicalData: any[]): any => {
  // TODO: Implement full technical analysis
  // For now, return basic information
  if (!historicalData || historicalData.length === 0) {
    return null;
  }
  
  const prices = historicalData.map(item => item.close);
  const volumes = historicalData.map(item => item.volume);
  
  return {
    priceAnalysis: {
      current: prices[prices.length - 1],
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: prices.reduce((sum, price) => sum + price, 0) / prices.length,
    },
    volumeAnalysis: analyzeVolume(volumes),
    trend: prices[prices.length - 1] > prices[0] ? 'up' : 'down',
    dataPoints: historicalData.length,
  };
};
