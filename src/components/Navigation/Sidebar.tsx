
import { useState } from 'react';
import { 
  BarChart3, 
  Search, 
  Briefcase, 
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar = ({ activeView, onViewChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t, isRTL } = useLanguage();

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: BarChart3 },
    { id: 'opportunities', label: t('opportunities'), icon: Search },
    { id: 'portfolio', label: t('portfolio'), icon: Briefcase },
    { id: 'analysis', label: t('analysis'), icon: TrendingUp },
  ];

  const ChevronIcon = isRTL 
    ? (isCollapsed ? ChevronLeft : ChevronRight)
    : (isCollapsed ? ChevronRight : ChevronLeft);

  return (
    <div className={cn(
      "bg-slate-800/50 backdrop-blur-sm border-slate-700/50 transition-all duration-300 flex flex-col",
      isRTL ? "border-l" : "border-r",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className={cn(
          "flex items-center",
          isRTL ? "justify-start" : "justify-between"
        )}>
          {!isCollapsed && (
            <div className={cn(isRTL && "order-2")}>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                EGXPILOT
              </h1>
              <p className={cn(
                "text-xs text-slate-400 mt-1",
                isRTL && "text-right"
              )}>
                {isRTL ? "مستشار مالي ذكي" : "Smart Financial Advisor"}
              </p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors",
              isRTL && !isCollapsed && "order-1 ml-auto"
            )}
          >
            <ChevronIcon size={16} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                  isRTL && "flex-row-reverse text-right",
                  isActive 
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30" 
                    : "hover:bg-slate-700/50 text-slate-300"
                )}
              >
                <Icon size={20} />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50">
        <button className={cn(
          "w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-300",
          isRTL && "flex-row-reverse text-right"
        )}>
          <Settings size={20} />
          {!isCollapsed && <span className="text-sm">{t('settings')}</span>}
        </button>
      </div>
    </div>
  );
};
