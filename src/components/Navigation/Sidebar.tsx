
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

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar = ({ activeView, onViewChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', labelEn: 'Dashboard', icon: BarChart3 },
    { id: 'opportunities', label: 'صائد الفرص', labelEn: 'Opportunities', icon: Search },
    { id: 'portfolio', label: 'المحفظة', labelEn: 'Portfolio', icon: Briefcase },
    { id: 'analysis', label: 'التحليل', labelEn: 'Analysis', icon: TrendingUp },
  ];

  return (
    <div className={cn(
      "bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                EGXPILOT
              </h1>
              <p className="text-xs text-slate-400 mt-1">Smart Financial Advisor</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
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
                  isActive 
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30" 
                    : "hover:bg-slate-700/50 text-slate-300"
                )}
              >
                <Icon size={20} />
                {!isCollapsed && (
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{item.labelEn}</div>
                    <div className="text-xs text-slate-400">{item.label}</div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50">
        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-300">
          <Settings size={20} />
          {!isCollapsed && <span className="text-sm">Settings</span>}
        </button>
      </div>
    </div>
  );
};
