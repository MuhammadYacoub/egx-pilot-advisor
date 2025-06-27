
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations = {
  ar: {
    // Navigation
    dashboard: 'لوحة التحكم',
    opportunities: 'صائد الفرص',
    portfolio: 'المحفظة',
    analysis: 'التحليل',
    settings: 'الإعدادات',
    
    // Header
    searchPlaceholder: 'البحث في أسهم البورصة المصرية...',
    live: 'مباشر',
    offline: 'غير متصل',
    
    // Market Overview
    egx30: 'مؤشر EGX 30',
    egx70: 'مؤشر EGX 70',
    tradingVolume: 'حجم التداول',
    marketCap: 'القيمة السوقية',
    
    // Common
    open: 'مفتوح',
    closed: 'مغلق',
    buy: 'شراء',
    sell: 'بيع',
    hold: 'احتفاظ',
    strongBuy: 'شراء قوي',
    price: 'السعر',
    change: 'التغيير',
    volume: 'الحجم',
    
    // Time frames
    '1D': '1 يوم',
    '5D': '5 أيام',
    '1M': '1 شهر',
    '3M': '3 شهور',
    '6M': '6 شهور',
    '1Y': '1 سنة',
    
    // Chart types
    line: 'خط',
    area: 'منطقة'
  },
  en: {
    // Navigation
    dashboard: 'Dashboard',
    opportunities: 'Opportunities',
    portfolio: 'Portfolio',
    analysis: 'Analysis',
    settings: 'Settings',
    
    // Header
    searchPlaceholder: 'Search EGX stocks...',
    live: 'Live',
    offline: 'Offline',
    
    // Market Overview
    egx30: 'EGX 30',
    egx70: 'EGX 70',
    tradingVolume: 'Trading Volume',
    marketCap: 'Market Cap',
    
    // Common
    open: 'OPEN',
    closed: 'CLOSED',
    buy: 'BUY',
    sell: 'SELL',
    hold: 'HOLD',
    strongBuy: 'STRONG BUY',
    price: 'Price',
    change: 'Change',
    volume: 'Volume',
    
    // Time frames
    '1D': '1D',
    '5D': '5D',
    '1M': '1M',
    '3M': '3M',
    '6M': '6M',
    '1Y': '1Y',
    
    // Chart types
    line: 'Line',
    area: 'Area'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['ar']] || key;
  };

  const isRTL = language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
