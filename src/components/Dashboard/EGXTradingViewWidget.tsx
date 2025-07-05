import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

// Declare TradingView for TypeScript
declare global {
  interface Window {
    TradingView: any;
  }
}

interface EGXTradingViewWidgetProps {
  symbol?: string;
  height?: number;
}

export const EGXTradingViewWidget = ({ 
  symbol = '^CASE30', 
  height = 500 
}: EGXTradingViewWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { language, t, isRTL } = useLanguage();

  useEffect(() => {
    // Remove existing script if any
    const existingScript = document.querySelector('script[src*="tradingview"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Load TradingView script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (containerRef.current && window.TradingView) {
        // Clear container first
        containerRef.current.innerHTML = '';
        
        // Create unique container ID
        const containerId = `tradingview_${Date.now()}`;
        containerRef.current.id = containerId;

        try {
          new window.TradingView.widget({
            autosize: true,
            symbol: getSymbolForTradingView(symbol),
            interval: "D",
            timezone: "Africa/Cairo",
            theme: "dark",
            style: "1",
            locale: language === 'ar' ? 'ar' : 'en',
            toolbar_bg: "#1e293b",
            enable_publishing: false,
            hide_top_toolbar: false,
            hide_legend: false,
            save_image: false,
            container_id: containerId,
            height: height,
            width: "100%",
            studies: [
              "RSI@tv-basicstudies",
              "MACD@tv-basicstudies",
              "MASimple@tv-basicstudies"
            ],
            overrides: {
              "paneProperties.background": "#0f172a",
              "paneProperties.vertGridProperties.color": "#334155",
              "paneProperties.horzGridProperties.color": "#334155",
              "symbolWatermarkProperties.transparency": 90,
              "scalesProperties.textColor": "#94a3b8",
              "mainSeriesProperties.candleStyle.upColor": "#10b981",
              "mainSeriesProperties.candleStyle.downColor": "#ef4444",
              "mainSeriesProperties.candleStyle.borderUpColor": "#10b981",
              "mainSeriesProperties.candleStyle.borderDownColor": "#ef4444",
              "mainSeriesProperties.candleStyle.wickUpColor": "#10b981",
              "mainSeriesProperties.candleStyle.wickDownColor": "#ef4444",
              "mainSeriesProperties.lineStyle.color": "#06b6d4",
              "mainSeriesProperties.lineStyle.linewidth": 2,
              "mainSeriesProperties.areaStyle.color1": "#06b6d4",
              "mainSeriesProperties.areaStyle.color2": "#0f172a",
              "mainSeriesProperties.areaStyle.linecolor": "#06b6d4"
            },
            studies_overrides: {
              "volume.volume.color.0": "#ef4444",
              "volume.volume.color.1": "#10b981",
              "RSI.RSI.color": "#f59e0b",
              "MACD.macd.color": "#06b6d4",
              "MACD.signal.color": "#8b5cf6"
            },
            loading_screen: {
              backgroundColor: "#0f172a",
              foregroundColor: "#94a3b8"
            },
            favorites: {
              intervals: ["1", "5", "15", "30", "60", "240", "1D", "1W", "1M"],
              chartTypes: ["Area", "Candles", "Line"]
            }
          });
        } catch (error) {
          console.error('Error creating TradingView widget:', error);
          if (containerRef.current) {
            containerRef.current.innerHTML = `
              <div class="flex items-center justify-center h-full bg-slate-800/50 rounded-lg">
                <div class="text-center">
                  <p class="text-red-400 font-medium">${isRTL ? 'خطأ في تحميل الرسم البياني' : 'Error loading chart'}</p>
                  <p class="text-slate-400 text-sm mt-1">${isRTL ? 'يرجى المحاولة مرة أخرى' : 'Please try again'}</p>
                </div>
              </div>
            `;
          }
        }
      }
    };

    script.onerror = () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div class="flex items-center justify-center h-full bg-slate-800/50 rounded-lg">
            <div class="text-center">
              <p class="text-red-400 font-medium">${isRTL ? 'فشل في تحميل TradingView' : 'Failed to load TradingView'}</p>
              <p class="text-slate-400 text-sm mt-1">${isRTL ? 'تحقق من الاتصال بالإنترنت' : 'Check internet connection'}</p>
            </div>
          </div>
        `;
      }
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [symbol, language, height, isRTL]);

  // Map our symbols to TradingView symbols
  const getSymbolForTradingView = (symbol: string): string => {
    const symbolMap: { [key: string]: string } = {
      '^CASE30': 'EGX:EGX30',
      '^EGX30CAPPED.CA': 'EGX:EGX30',
      'COMI.CA': 'EGX:COMI',
      'ETEL.CA': 'EGX:ETEL', 
      'HRHO.CA': 'EGX:HRHO',
      'EKHO.CA': 'EGX:EKHO',
      'EGAS.CA': 'EGX:EGAS'
    };

    return symbolMap[symbol] || 'EGX:EGX30';
  };

  const getDisplayName = (symbol: string): string => {
    const names: { [key: string]: string } = {
      '^CASE30': isRTL ? 'مؤشر العائد السعري EGX 30' : 'EGX 30 Price Return Index',
      '^EGX30CAPPED.CA': isRTL ? 'مؤشر EGX30 المحدود' : 'EGX30 Capped Index',
      'COMI.CA': isRTL ? 'البنك التجاري الدولي' : 'Commercial International Bank',
      'ETEL.CA': isRTL ? 'المصرية للاتصالات' : 'Egyptian Company for Mobile Services',
      'HRHO.CA': isRTL ? 'حسن علام هولدنج' : 'Hassan Allam Holding',
      'EKHO.CA': isRTL ? 'القاهرة للإسكان والتعمير' : 'El Kahera Housing',
      'EGAS.CA': isRTL ? 'الغاز المصرية' : 'Egyptian Gas'
    };

    return names[symbol] || symbol;
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <div>
            <h3 className={cn("text-lg font-semibold text-white", isRTL && "text-right")}>
              {isRTL ? 'الرسم البياني المتقدم' : 'Advanced Chart'}
            </h3>
            <p className={cn("text-sm text-slate-400 mt-1", isRTL && "text-right")}>
              {getDisplayName(symbol)}
            </p>
          </div>
          <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
            <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border-0">
              TradingView
            </Badge>
            <Badge className="bg-green-500/20 text-green-400 border-0">
              {isRTL ? 'مباشر' : 'Live'}
            </Badge>
          </div>
        </div>
      </div>

      {/* TradingView Container */}
      <div 
        ref={containerRef}
        style={{ height: `${height}px` }}
        className="w-full relative"
      >
        {/* Loading State */}
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-300 text-sm">
              {isRTL ? 'جاري تحميل الرسم البياني...' : 'Loading chart...'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-700/50 bg-slate-800/30">
        <div className={cn("flex items-center justify-between text-xs text-slate-400", isRTL && "flex-row-reverse")}>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>
              {isRTL ? 'البيانات من TradingView - مقدمة من البورصة المصرية' : 'Data by TradingView - Powered by Egyptian Exchange'}
            </span>
          </div>
          <span>
            {isRTL ? 'منطقة زمنية: القاهرة' : 'Timezone: Cairo'}
          </span>
        </div>
      </div>
    </Card>
  );
};
