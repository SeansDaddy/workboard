import React from 'react';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Ticket, 
  CheckSquare, 
  BarChart3, 
  FileText, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { ActiveView } from '../../types';

interface SidebarProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  unreadRiskCount?: number;
  pendingTicketCount?: number;
  overdueTaskCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  collapsed,
  onToggleCollapse,
  unreadRiskCount = 8,
  pendingTicketCount = 12,
  overdueTaskCount = 2
}) => {
  const menuItems = [
    {
      id: 'workbench' as ActiveView,
      label: '工作台',
      sublabel: '首页控制台',
      icon: LayoutDashboard,
      badge: null,
      isCore: true
    },
    {
      id: 'page_risk_center' as ActiveView,
      label: '风险中心',
      sublabel: '预警/告警分析',
      icon: ShieldAlert,
      badge: unreadRiskCount > 0 ? `${unreadRiskCount}` : null,
      badgeColor: 'bg-amber-500 text-white',
      isCore: false
    },
    {
      id: 'page_ticket_center' as ActiveView,
      label: '工单中心',
      sublabel: 'pcare工单协同',
      icon: Ticket,
      badge: pendingTicketCount > 0 ? `${pendingTicketCount}` : null,
      badgeColor: 'bg-blue-600 text-white',
      isCore: false
    },
    {
      id: 'page_task_center' as ActiveView,
      label: '作业管理',
      sublabel: '巡检与整改',
      icon: CheckSquare,
      badge: overdueTaskCount > 0 ? `超期${overdueTaskCount}` : null,
      badgeColor: 'bg-red-500 text-white font-bold',
      isCore: false
    },
    {
      id: 'page_dashboard' as ActiveView,
      label: '运营看板',
      sublabel: '储能资产指标',
      icon: BarChart3,
      badge: null,
      isCore: false
    },
    {
      id: 'page_report_center' as ActiveView,
      label: '运维报告',
      sublabel: '周报与分析月报',
      icon: FileText,
      badge: null,
      isCore: false
    }
  ];

  return (
    <aside
      className={`bg-[#001529] text-[#A6ADB4] border-r border-[#002140] flex flex-col justify-between transition-all duration-200 z-20 shrink-0 select-none ${
        collapsed ? 'w-14' : 'w-56'
      }`}
    >
      {/* Navigation Links */}
      <div className="py-2.5 px-2 space-y-1 overflow-y-auto">
        {!collapsed && (
          <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-[#657180] uppercase flex items-center justify-between">
            <span>核心运维导航</span>
            <span className="text-[9px] text-[#8C9BA5] lowercase font-normal">一体化贯通</span>
          </div>
        )}

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (item.id === 'workbench' && (currentView === 'ticket_process' || currentView === 'ticket_detail' || currentView === 'risk_detail' || currentView === 'task_process'));

          return (
            <div key={item.id}>
              <button
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-xs transition-all relative group cursor-pointer ${
                  isActive
                    ? 'bg-[#1890FF] text-white font-semibold shadow-xs'
                    : 'text-[#A6ADB4] hover:bg-white/5 hover:text-white'
                }`}
                title={collapsed ? `${item.label} (${item.sublabel})` : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#8C9BA5] group-hover:text-white'}`} />
                
                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between text-left truncate">
                    <div className="truncate">
                      <span className="font-semibold text-xs">{item.label}</span>
                      {item.isCore && (
                        <span className="ml-1.5 text-[9px] px-1 py-0.2 bg-white/20 text-white rounded">当前</span>
                      )}
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-none ${
                        isActive ? 'bg-white text-[#1890FF]' : item.badgeColor
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-[#001529] text-white text-xs rounded shadow-xl border border-[#002140] whitespace-nowrap hidden group-hover:block z-50">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">{item.label}</span>
                      {item.badge && (
                        <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#8C9BA5]">{item.sublabel}</div>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer / Collapse Toggle */}
      <div className="p-2 border-t border-[#002140] space-y-1">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded text-xs text-[#8C9BA5] hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
          title={collapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : (
            <div className="flex items-center gap-1.5 text-[11px]">
              <ChevronLeft className="w-4 h-4" />
              <span>收起侧边栏</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
