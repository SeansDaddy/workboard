import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Ticket, 
  CheckSquare, 
  BarChart3, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Radar,
  BellRing,
  AlertCircle,
  History,
  Send,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ListTodo,
  Stethoscope,
  BrainCircuit,
  AreaChart,
  Gauge,
  SlidersHorizontal,
  Server,
  Box,
  ArrowUpCircle,
  Building2,
  Settings2
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

interface MenuItemChild {
  id: ActiveView;
  label: string;
  badge?: string | null;
  badgeColor?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface MenuItem {
  id: ActiveView | string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | null;
  badgeColor?: string;
  children?: MenuItemChild[];
}

interface MenuCategory {
  title: string;
  items: MenuItem[];
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
  // 记录各个可展开父菜单的展开/收起状态（默认全展开）
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({
    alarm_center_group: true,
    warning_analysis_group: true,
    operation_analysis_group: true,
    device_group: true
  });

  const toggleExpand = (groupKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedKeys(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const menuCategories: MenuCategory[] = [
    {
      title: '总览',
      items: [
        {
          id: 'workbench' as ActiveView,
          label: '工作台',
          icon: LayoutDashboard,
          badge: null
        }
      ]
    },
    {
      title: '风险与告警',
      items: [
        {
          id: 'screen_posture' as ActiveView,
          label: '态势大屏',
          icon: Radar,
          badge: '实时'
        },
        {
          id: 'page_risk_center' as ActiveView,
          label: '风险中心',
          icon: ShieldAlert,
          badge: unreadRiskCount > 0 ? `${unreadRiskCount}` : null,
          badgeColor: 'bg-amber-500 text-white'
        },
        {
          id: 'alarm_center_group',
          label: '告警中心',
          icon: BellRing,
          badge: '5条',
          badgeColor: 'bg-red-500 text-white',
          children: [
            { id: 'alarm_current' as ActiveView, label: '当前告警', badge: '5', badgeColor: 'bg-red-500 text-white', icon: AlertCircle },
            { id: 'alarm_history' as ActiveView, label: '历史告警', icon: History },
            { id: 'alarm_push_config' as ActiveView, label: '推送配置', icon: Send }
          ]
        },
        {
          id: 'warning_analysis_group',
          label: '预警分析',
          icon: TrendingUp,
          badge: 'AI算法',
          badgeColor: 'bg-indigo-600 text-white',
          children: [
            { id: 'warning_current' as ActiveView, label: '当前预警', badge: unreadRiskCount > 0 ? `${unreadRiskCount}` : null, badgeColor: 'bg-amber-500 text-white', icon: AlertTriangle },
            { id: 'warning_push_config' as ActiveView, label: '推送配置', icon: Settings2 }
          ]
        },
        {
          id: 'risk_tasks' as ActiveView,
          label: '风险任务',
          icon: ListTodo,
          badge: null
        }
      ]
    },
    {
      title: '运维处置',
      items: [
        {
          id: 'page_ticket_center' as ActiveView,
          label: '工单中心',
          icon: Ticket,
          badge: pendingTicketCount > 0 ? `${pendingTicketCount}` : null,
          badgeColor: 'bg-blue-600 text-white'
        },
        {
          id: 'page_task_center' as ActiveView,
          label: '作业管理',
          icon: CheckSquare,
          badge: overdueTaskCount > 0 ? `超期${overdueTaskCount}` : null,
          badgeColor: 'bg-red-500 text-white font-bold'
        }
      ]
    },
    {
      title: '分析诊断',
      items: [
        {
          id: 'health_inspection' as ActiveView,
          label: '健康巡检',
          icon: Stethoscope,
          badge: null
        },
        {
          id: 'ai_diagnosis' as ActiveView,
          label: 'AI诊断',
          icon: BrainCircuit,
          badge: '专家模型',
          badgeColor: 'bg-purple-600 text-white'
        },
        {
          id: 'operation_analysis_group',
          label: '运行分析',
          icon: AreaChart,
          children: [
            { id: 'analysis_perf' as ActiveView, label: '性能', icon: Gauge },
            { id: 'analysis_config' as ActiveView, label: '配置', icon: SlidersHorizontal }
          ]
        },
        {
          id: 'page_dashboard' as ActiveView,
          label: '运营看板',
          icon: BarChart3,
          badge: null
        },
        {
          id: 'page_report_center' as ActiveView,
          label: '运维报告',
          icon: FileText,
          badge: null
        }
      ]
    },
    {
      title: '资产管理 assets',
      items: [
        {
          id: 'device_group',
          label: '设备',
          icon: Server,
          children: [
            { id: 'device_management' as ActiveView, label: '设备管理', icon: Box },
            { id: 'device_upgrade' as ActiveView, label: '设备升级管理', icon: ArrowUpCircle }
          ]
        },
        {
          id: 'station_management' as ActiveView,
          label: '站点管理',
          icon: Building2,
          badge: '484站'
        }
      ]
    }
  ];

  return (
    <aside
      className={`bg-[#001529] text-[#A6ADB4] border-r border-[#002140] flex flex-col justify-between transition-all duration-200 z-20 shrink-0 select-none ${
        collapsed ? 'w-14' : 'w-60'
      }`}
    >
      {/* Navigation Links List */}
      <div className="py-2 px-2 space-y-3 overflow-y-auto custom-scrollbar flex-1">
        {menuCategories.map((category) => (
          <div key={category.title} className="space-y-1">
            {/* Category Header */}
            {!collapsed && (
              <div className="px-3 pt-2 pb-1.5 text-xs font-bold tracking-wider text-[#657180] uppercase flex items-center justify-between border-b border-[#002140]/60 mb-1">
                <span>{category.title}</span>
              </div>
            )}

            {/* Category Menu Items */}
            <div className="space-y-1">
              {category.items.map((item) => {
                const Icon = item.icon;
                const hasChildren = Boolean(item.children && item.children.length > 0);
                const isGroupExpanded = expandedKeys[item.id] !== false;

                // 判断当前项或其子项是否处于选中态
                const isChildActive = hasChildren && item.children?.some(c => c.id === currentView);
                const isSelfActive = item.id === currentView || (item.id === 'workbench' && (currentView === 'ticket_process' || currentView === 'ticket_detail' || currentView === 'risk_detail' || currentView === 'task_process'));
                const isActive = isSelfActive || isChildActive;

                return (
                  <div key={item.id} className="relative group">
                    {/* Parent Menu Item Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        if (hasChildren) {
                           if (collapsed) {
                            // 折叠状态下点击默认跳第一个子项
                            onNavigate(item.children![0].id);
                          } else {
                            toggleExpand(item.id, e);
                          }
                        } else {
                          onNavigate(item.id as ActiveView);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all relative cursor-pointer ${
                        isActive
                          ? hasChildren && !collapsed
                            ? 'bg-white/10 text-white font-medium'
                            : 'bg-[#1890FF] text-white font-semibold shadow-xs'
                          : 'text-[#A6ADB4] hover:bg-white/5 hover:text-white'
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-[#8C9BA5] group-hover:text-white'}`} />
                        {!collapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>

                      {!collapsed && (
                        <div className="flex items-center gap-2 shrink-0">
                          {item.badge && !hasChildren && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold leading-none ${
                              isActive && !hasChildren ? 'bg-white text-[#1890FF]' : (item.badgeColor || 'bg-white/15 text-white')
                            }`}>
                              {item.badge}
                            </span>
                          )}
                          {hasChildren && (
                            <div 
                              onClick={(e) => toggleExpand(item.id, e)}
                              className="p-1 hover:bg-white/10 rounded transition-colors"
                            >
                              {isGroupExpanded ? (
                                <ChevronUp className="w-4 h-4 text-[#8C9BA5] group-hover:text-white" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-[#8C9BA5] group-hover:text-white" />
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </button>

                    {/* Submenu (Expanded in Full Sidebar) */}
                    {!collapsed && hasChildren && isGroupExpanded && (
                      <div className="pl-7 pr-1 py-1 space-y-1 relative before:content-[''] before:absolute before:left-4 before:top-1 before:bottom-2 before:w-px before:bg-[#00284D]">
                        {item.children!.map((child) => {
                          const isSubActive = currentView === child.id;
                          const ChildIcon = child.icon;

                          return (
                            <button
                              key={child.id}
                              type="button"
                              onClick={() => onNavigate(child.id)}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                                isSubActive
                                  ? 'bg-[#1890FF] text-white font-semibold shadow-xs'
                                  : 'text-[#8C9BA5] hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                {ChildIcon && <ChildIcon className="w-3.5 h-3.5 shrink-0 opacity-80" />}
                                <span className="truncate">{child.label}</span>
                              </div>
                              {child.badge && (
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold leading-none ${
                                  isSubActive ? 'bg-white text-[#1890FF]' : (child.badgeColor || 'bg-white/10 text-white')
                                }`}>
                                  {child.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Collapsed State Flyout Popup (Hover) */}
                    {collapsed && (
                      <div className="absolute left-full top-0 ml-2 px-3.5 py-2.5 bg-[#001529] text-white text-sm rounded-lg shadow-xl border border-[#002140] whitespace-nowrap hidden group-hover:block z-50 min-w-[160px]">
                        <div className="flex items-center justify-between gap-2.5 border-b border-[#002140] pb-2 mb-2">
                          <span className="font-semibold text-white flex items-center gap-2">
                            <Icon className="w-4 h-4 text-[#1890FF]" />
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className={`text-xs px-2 py-0.5 rounded font-bold ${item.badgeColor || 'bg-white/20 text-white'}`}>
                              {item.badge}
                            </span>
                          )}
                        </div>

                        {hasChildren ? (
                          <div className="space-y-1.5">
                            <div className="text-xs text-[#657180] font-medium mb-1">子菜单列表</div>
                            {item.children!.map((child) => {
                              const ChildIcon = child.icon;
                              const isSubActive = currentView === child.id;
                              return (
                                <button
                                  key={child.id}
                                  type="button"
                                  onClick={() => onNavigate(child.id)}
                                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                                    isSubActive ? 'bg-[#1890FF] text-white font-medium' : 'hover:bg-white/10 text-[#A6ADB4] hover:text-white'
                                  }`}
                                >
                                  <span className="flex items-center gap-2">
                                    {ChildIcon && <ChildIcon className="w-3.5 h-3.5" />}
                                    {child.label}
                                  </span>
                                  {child.badge && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${child.badgeColor || 'bg-white/20'}`}>
                                      {child.badge}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onNavigate(item.id as ActiveView)}
                            className="w-full text-left py-1 text-xs text-[#1890FF] hover:underline cursor-pointer"
                          >
                            点击进入页面 ➔
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Collapse Toggle */}
      <div className="p-2 border-t border-[#002140] space-y-1 bg-[#001529]/95">
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
