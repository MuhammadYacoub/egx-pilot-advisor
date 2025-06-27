
import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

declare global {
  interface Window {
    TradingView: any;
  }
}

export const TradingViewChart = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    // Load TradingView script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (containerRef.current && window.TradingView) {
        new window.TradingView.widget({
          autosize: true,
          symbol: "EGX:EGX30",
          interval: "D",
          timezone: "Africa/Cairo",
          theme: "dark",
          style: "1",
          locale: language,
          toolbar_bg: "#1e293b",
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: containerRef.current.id,
          height: 400,
          width: "100%",
          studies: [
            "RSI@tv-basicstudies",
            "MACD@tv-basicstudies"
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
            "mainSeriesProperties.candleStyle.wickDownColor": "#ef4444"
          }
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [language]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.id = `tradingview_${Date.now()}`;
    }
  }, []);

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">{t('egx30')}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-cyan-400">18,457.23</span>
            <span className="text-green-400 text-sm">+423.12 (+2.34%)</span>
          </div>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="h-96 w-full rounded-lg overflow-hidden"
        style={{ minHeight: '400px' }}
      />
    </Card>
  );
};
