
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ExternalLink } from 'lucide-react';

export const NewsPanel = () => {
  const newsItems = [
    {
      id: 1,
      title: 'EGX 30 Reaches New Monthly High',
      titleAr: 'مؤشر إيجي إكس 30 يصل لأعلى مستوى شهري',
      source: 'EGX Official',
      time: '2 hours ago',
      sentiment: 'positive',
      impact: 'high',
      excerpt: 'The Egyptian Exchange main index closes at 18,457 points, marking the highest level in the past month...'
    },
    {
      id: 2,
      title: 'CIB Reports Strong Q4 Results',
      titleAr: 'البنك التجاري الدولي يحقق نتائج قوية في الربع الرابع',
      source: 'Reuters',
      time: '4 hours ago',
      sentiment: 'positive',
      impact: 'medium',
      excerpt: 'Commercial International Bank announced better-than-expected quarterly earnings...'
    },
    {
      id: 3,
      title: 'New IPO Listings Expected This Quarter',
      titleAr: 'إدراجات جديدة متوقعة هذا الربع',
      source: 'Al Mal',
      time: '6 hours ago',
      sentiment: 'neutral',
      impact: 'medium',
      excerpt: 'Egyptian Financial Regulatory Authority expects several companies to go public...'
    },
    {
      id: 4,
      title: 'Real Estate Sector Shows Growth',
      titleAr: 'قطاع العقارات يظهر نمواً',
      source: 'Daily News Egypt',
      time: '8 hours ago',
      sentiment: 'positive',
      impact: 'low',
      excerpt: 'Real estate companies on EGX show strong performance in recent trading sessions...'
    }
  ];

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400 bg-green-500/20';
      case 'negative': return 'text-red-400 bg-red-500/20';
      default: return 'text-yellow-400 bg-yellow-500/20';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-blue-400 bg-blue-500/20';
    }
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Market News</h3>
        <Badge className="bg-cyan-500/20 text-cyan-400 border-0 text-xs">Live Feed</Badge>
      </div>

      <div className="space-y-4">
        {newsItems.map((news) => (
          <div key={news.id} className="group cursor-pointer">
            <div className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-200">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {news.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 arabic-text">{news.titleAr}</p>
                </div>
                <ExternalLink size={14} className="text-slate-400 group-hover:text-cyan-400 transition-colors flex-shrink-0 mt-1" />
              </div>

              <p className="text-sm text-slate-300 mb-3 line-clamp-2">{news.excerpt}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={`${getSentimentColor(news.sentiment)} border-0 text-xs`}>
                    {news.sentiment}
                  </Badge>
                  <Badge className={`${getImpactColor(news.impact)} border-0 text-xs`}>
                    {news.impact} impact
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock size={12} />
                  <span>{news.time}</span>
                  <span>•</span>
                  <span>{news.source}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <button className="w-full text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
          View All News →
        </button>
      </div>
    </Card>
  );
};
