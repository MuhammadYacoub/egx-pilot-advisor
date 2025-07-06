
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
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

export const Sidebar = ({ 
  activeView, 
  onViewChange, 
  isMobileMenuOpen = false,
  onMobileMenuClose 
}: SidebarProps) => {
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

  const handleViewChange = (viewId: string) => {
    onViewChange(viewId);
    if (onMobileMenuClose) {
      onMobileMenuClose();
    }
  };

  return (
    <div className={cn(
      "bg-slate-800/50 backdrop-blur-sm border-slate-700/50 transition-all duration-300 flex flex-col",
      // Desktop sidebar
      "hidden md:flex",
      isRTL ? "border-l" : "border-r",
      isCollapsed ? "w-16" : "w-64",
      // Mobile sidebar - overlay
      "md:relative",
      isMobileMenuOpen && cn(
        "fixed inset-y-0 z-40 w-64 md:hidden flex",
        isRTL ? "right-0" : "left-0"
      )
    )}>
      {/* Header - مبسط بدون لوجو */}
      <div className="p-4 border-b border-slate-700/50">
        <div className={cn(
          "flex items-center justify-between",
          isRTL && "flex-row-reverse"
        )}>
          {!isCollapsed && (
            <div className={cn("flex-1", isRTL && "text-right")}>
              <h2 className="text-sm font-semibold text-slate-300">
                {isRTL ? "التنقل" : "Navigation"}
              </h2>
            </div>
          )}
          {/* Desktop collapse button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "hidden md:block p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors",
              isRTL && !isCollapsed && "order-first"
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
                onClick={() => handleViewChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                  isRTL && "flex-row-reverse text-right",
                  isActive 
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30" 
                    : "hover:bg-slate-700/50 text-slate-300"
                )}
              >
                <Icon size={20} />
                {(!isCollapsed || isMobileMenuOpen) && (
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
          {(!isCollapsed || isMobileMenuOpen) && <span className="text-sm">{t('settings')}</span>}
        </button>
      </div>
    </div>
  );
};
