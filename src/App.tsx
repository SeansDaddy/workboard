import React, { useState, useMemo } from 'react';
import { 
  TicketItem, 
  RiskItem, 
  RoutineTaskItem, 
  OperationsMetrics, 
  ActiveView, 
  CONFIG_THRESHOLDS
} from './types';
import { 
  INITIAL_TICKETS, 
  INITIAL_RISKS, 
  INITIAL_TASKS, 
  INITIAL_OPERATIONS_METRICS 
} from './mock/data';

// Layout
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { TopSummaryBanner } from './components/layout/TopSummaryBanner';

// Views & Pages
import { WorkbenchView } from './components/views/WorkbenchView';
import { RiskCenterPage } from './components/views/RiskCenterPage';
import { TicketCenterPage } from './components/views/TicketCenterPage';
import { TaskCenterPage } from './components/views/TaskCenterPage';
import { DashboardPage } from './components/views/DashboardPage';
import { ReportCenterPage } from './components/views/ReportCenterPage';
import { TicketProcessView } from './components/views/TicketProcessView';
import { TicketDetailModal } from './components/views/TicketDetailModal';
import { RiskDetailView } from './components/views/RiskDetailView';
import { TaskProcessView } from './components/views/TaskProcessView';
import { TicketProcessDrawer } from './components/views/TicketProcessDrawer';
import { TaskProcessDrawer } from './components/views/TaskProcessDrawer';
import { SubPagePlaceholder } from './components/views/SubPagePlaceholder';
import { AiDiagnosisPage } from './components/views/AiDiagnosisPage';

import { CheckCircle2, AlertCircle, Sparkles, X } from 'lucide-react';

export default function App() {
  // State
  const [tickets, setTickets] = useState<TicketItem[]>(INITIAL_TICKETS);
  const [risks, setRisks] = useState<RiskItem[]>(INITIAL_RISKS);
  const [tasks, setTasks] = useState<RoutineTaskItem[]>(INITIAL_TASKS);
  const [metrics, setMetrics] = useState<OperationsMetrics>(INITIAL_OPERATIONS_METRICS);

  // Navigation & View State
  const [currentView, setCurrentView] = useState<ActiveView>('workbench');
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(null);
  const [selectedTask, setSelectedTask] = useState<RoutineTaskItem | null>(null);
  
  // Modals & Drawers
  const [detailModalTicket, setDetailModalTicket] = useState<TicketItem | null>(null);
  const [drawerTicket, setDrawerTicket] = useState<TicketItem | null>(null);
  const [drawerTask, setDrawerTask] = useState<RoutineTaskItem | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Filter keys (support direct filtering from top summary clicks)
  const [ticketFilterKey, setTicketFilterKey] = useState<string>('all');
  const [riskFilterKey, setRiskFilterKey] = useState<string>('all');
  const [taskFilterKey, setTaskFilterKey] = useState<string>('all');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ title: string; desc?: string; type?: 'success' | 'info' | 'warn' } | null>({
    title: '已加载华东一区运行工作台',
    desc: '系统已完成 484 座电站时序风险预测与工单数据聚合',
    type: 'info'
  });

  // Calculate Top Summary metrics accurately
  // 1. 待我处理工单数 & 其中高风险数
  const myPendingTickets = useMemo(() => {
    return tickets.filter((t) => t.assignee === CONFIG_THRESHOLDS.CURRENT_USER_NAME && t.status !== '已完成');
  }, [tickets]);

  const myHighRiskTicketsCount = useMemo(() => {
    return myPendingTickets.filter((t) => t.priority === '高' || t.riskScore >= CONFIG_THRESHOLDS.HIGH_RISK_SCORE_MIN).length;
  }, [myPendingTickets]);

  // 2. 未处理风险数 (不包含已转工单)
  const unhandledRisks = useMemo(() => {
    return risks.filter((r) => r.status !== '已转工单' && r.status !== '已忽略' && r.status !== '已消除');
  }, [risks]);

  const unhandledWarningsCount = useMemo(() => {
    return unhandledRisks.filter((r) => r.type === '预警').length;
  }, [unhandledRisks]);

  const unhandledAlarmsCount = useMemo(() => {
    return unhandledRisks.filter((r) => r.type === '告警').length;
  }, [unhandledRisks]);

  // 3. 今日到期作业数 & 超期作业数
  const todayDueTasksCount = useMemo(() => {
    return tasks.filter((t) => (t.deadline.startsWith('2026-08-25') || t.status === '已超期') && t.status !== '已完成').length;
  }, [tasks]);

  const overdueTasksCount = useMemo(() => {
    return tasks.filter((t) => t.status === '已超期').length;
  }, [tasks]);

  // Handlers for Ticket Actions
  const handleOpenTicketProcess = (ticket: TicketItem) => {
    setSelectedTicket(ticket);
    setDrawerTicket(ticket);
  };

  const handleOpenTicketDetail = (ticket: TicketItem) => {
    setDetailModalTicket(ticket);
  };

  const handleUpdateTicketStatus = (ticketId: string, newStatus: TicketItem['status'], note: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const newLogs = [
            ...(t.logs ?? []),
            {
              time: '2026-08-25 ' + new Date().toTimeString().slice(0, 5),
              operator: CONFIG_THRESHOLDS.CURRENT_USER_NAME,
              action: `工单状态变更为【${newStatus}】`,
              note
            }
          ];
          return { ...t, status: newStatus, logs: newLogs };
        }
        return t;
      })
    );
    setToastMessage({
      title: `工单 ${ticketId} 状态已更新为「${newStatus}」`,
      desc: '相关进度已同步回写 pcare 系统及主动运维平台',
      type: 'success'
    });
  };

  // Handlers for Risk Actions
  const handleOpenRiskDetail = (risk: RiskItem) => {
    setSelectedRisk(risk);
    setCurrentView('risk_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 风险转工单的核心双向联动机制 (4.2 & 附录11)
  const handleConvertToTicket = (risk: RiskItem) => {
    const newTicketId = `PC-20260825-0${tickets.length + 1}`;
    
    // 1. 创建新工单
    const newTicket: TicketItem = {
      id: newTicketId,
      title: `【预警闭环】${risk.stationName} - ${risk.title.replace(/【.*?】/, '')}`,
      priority: risk.priority,
      riskScore: risk.riskScore,
      stationId: risk.stationId,
      stationName: risk.stationName,
      region: risk.region,
      assignee: CONFIG_THRESHOLDS.CURRENT_USER_NAME,
      createdAt: '2026-08-25 ' + new Date().toTimeString().slice(0, 5),
      slaRemainingHours: risk.priority === '高' ? 4.0 : 12.0,
      slaDeadline: '2026-08-25 18:00',
      status: '待受理',
      deviceCode: risk.stationId + '-Rack-01',
      description: `由主动运维平台风险分析算法检测生成：${risk.symptomDetail ?? risk.title}`,
      suggestedAction: `针对${risk.category}特征，请携带检修工具前往现场排查测试。`,
      linkedRiskId: risk.id,
      logs: [
        {
          time: '2026-08-25 ' + new Date().toTimeString().slice(0, 5),
          operator: `${CONFIG_THRESHOLDS.CURRENT_USER_NAME} (主动运维)`,
          action: `从预测风险 ${risk.id} 生成工单派发`
        }
      ]
    };

    // 2. 更新风险状态为"已转工单"，建立双向链接，保留在风险列表中
    setRisks((prev) =>
      prev.map((r) => {
        if (r.id === risk.id) {
          return {
            ...r,
            status: '已转工单',
            linkedTicketId: newTicketId
          };
        }
        return r;
      })
    );

    // 3. 插入新工单
    setTickets((prev) => [newTicket, ...prev]);

    setToastMessage({
      title: `已成功将风险 ${risk.id} 转为 pcare 工单！`,
      desc: `新工单号 ${newTicketId}，已自动建立双向链接并置顶。`,
      type: 'success'
    });

    // If currently in risk detail, update view
    if (selectedRisk && selectedRisk.id === risk.id) {
      setSelectedRisk({
        ...selectedRisk,
        status: '已转工单',
        linkedTicketId: newTicketId
      });
    }
  };

  // Handlers for Task Actions
  const handleOpenTaskProcess = (task: RoutineTaskItem) => {
    setSelectedTask(task);
    setCurrentView('task_process');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTaskDetail = (task: RoutineTaskItem) => {
    setSelectedTask(task);
    setCurrentView('task_process');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateTask = (updatedTask: RoutineTaskItem) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  const handleCreateTicketFromTask = (task: RoutineTaskItem) => {
    const newTicketId = `PC-20260825-0${tickets.length + 1}`;
    const newTicket: TicketItem = {
      id: newTicketId,
      title: `【例行作业消缺】${task.stationName} - ${task.name} 隐患整改`,
      priority: task.status === '已超期' ? '高' : '中',
      riskScore: task.status === '已超期' ? 84 : 65,
      stationId: task.stationId,
      stationName: task.stationName,
      region: task.region,
      assignee: task.assignee,
      createdAt: '2026-08-25 ' + new Date().toTimeString().slice(0, 5),
      slaRemainingHours: 8.0,
      slaDeadline: '2026-08-26 12:00',
      status: '待受理',
      description: `例行巡检作业 ${task.id} 现场发现隐患缺陷，需安排专业人员进站消缺。`,
      suggestedAction: '请结合巡检清单异常项开展针对性更换与试验。'
    };

    setTickets((prev) => [newTicket, ...prev]);
    setToastMessage({
      title: `已从作业 ${task.id} 创建整改工单 ${newTicketId}`,
      desc: '工单已进入待受理列表并推送现场消缺人员',
      type: 'success'
    });
  };

  const handleCreateTicketFromAI = (aiData: {
    title: string;
    stationName: string;
    priority: '高' | '中' | '低';
    riskScore: number;
    description: string;
    suggestedAction: string;
  }) => {
    const newTicketId = `PC-20260825-0${tickets.length + 1}`;
    const newTicket: TicketItem = {
      id: newTicketId,
      title: aiData.title,
      priority: aiData.priority,
      riskScore: aiData.riskScore,
      stationId: 'ST-NT-001',
      stationName: aiData.stationName,
      region: '江苏·南通',
      assignee: '张海波 (特种作业电气工程师)',
      createdAt: '2026-08-25 ' + new Date().toTimeString().slice(0, 5),
      slaRemainingHours: 4.0,
      slaDeadline: '2026-08-25 18:00',
      status: '待受理',
      description: aiData.description,
      suggestedAction: aiData.suggestedAction
    };

    setTickets((prev) => [newTicket, ...prev]);
    setToastMessage({
      title: `已生成 AI 诊断闭环消缺工单 ${newTicketId}`,
      desc: `已推送现场特种电气作业组，SLA 响应倒计时已启动`,
      type: 'success'
    });
  };

  // Bidirectional Jump Handlers
  const handleJumpToTicket = (ticketId: string) => {
    const target = tickets.find((t) => t.id === ticketId);
    if (target) {
      setSelectedTicket(target);
      setDrawerTicket(target);
    } else {
      setToastMessage({
        title: `正在定位关联工单 ${ticketId}...`,
        type: 'info'
      });
    }
  };

  const handleJumpToRisk = (riskId: string) => {
    const target = risks.find((r) => r.id === riskId);
    if (target) {
      setSelectedRisk(target);
      setCurrentView('risk_detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#1F1F1F] flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Header
        onSearch={(query) => {
          if (query.trim()) {
            setToastMessage({
              title: `已定位匹配「${query}」的相关业务记录`,
              type: 'info'
            });
          }
        }}
        onOpenNotifications={() => {
          setToastMessage({
            title: '系统消息中心',
            desc: '当前华东一区 12 条高风险预警已全部完成算法特征聚类',
            type: 'info'
          });
        }}
      />

      {/* Global Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#1F1F1F] text-white px-4 py-3 rounded shadow-lg border border-[#333333] flex items-center justify-between gap-3 text-xs animate-in slide-in-from-bottom-3 duration-200 max-w-md">
          <div className="flex items-center gap-2.5">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#52C41A] shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-[#1890FF] shrink-0" />
            )}
            <div>
              <p className="font-medium text-white">{toastMessage.title}</p>
              {toastMessage.desc && <p className="text-[11px] text-[#8C8C8C] mt-0.5">{toastMessage.desc}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-[#8C8C8C] hover:text-white p-1 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Body with Left Slim Sidebar + Right Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          unreadRiskCount={unhandledRisks.length}
          pendingTicketCount={myPendingTickets.length}
          overdueTaskCount={overdueTasksCount}
        />

        {/* Right Main Content Scrollable View */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-6 space-y-4 max-w-[1920px] mx-auto w-full">
          {/* Subpage or Detailed Views */}
          {currentView === 'ticket_process' && selectedTicket && (
            <TicketProcessView
              ticket={selectedTicket}
              onBack={() => setCurrentView('workbench')}
              onUpdateStatus={handleUpdateTicketStatus}
              onJumpToRisk={handleJumpToRisk}
            />
          )}

          {currentView === 'risk_detail' && selectedRisk && (
            <RiskDetailView
              risk={selectedRisk}
              onBack={() => setCurrentView('workbench')}
              onConvertToTicket={handleConvertToTicket}
              onJumpToTicket={handleJumpToTicket}
            />
          )}

          {currentView === 'task_process' && selectedTask && (
            <TaskProcessView
              task={selectedTask}
              onBack={() => setCurrentView('workbench')}
              onUpdateTask={handleUpdateTask}
              onCreateTicketFromTask={handleCreateTicketFromTask}
            />
          )}

          {/* Dedicated Left Menu Full Pages */}
          {currentView === 'page_risk_center' && (
            <RiskCenterPage
              risks={risks}
              regionalTop5={metrics.regionalRiskTop5}
              onReturnToWorkbench={() => setCurrentView('workbench')}
              onOpenRiskDetail={handleOpenRiskDetail}
              onConvertToTicket={handleConvertToTicket}
              onJumpToTicket={handleJumpToTicket}
              initialFilter={riskFilterKey}
            />
          )}

          {currentView === 'page_ticket_center' && (
            <TicketCenterPage
              tickets={tickets}
              onReturnToWorkbench={() => setCurrentView('workbench')}
              onOpenTicketProcess={handleOpenTicketProcess}
              onOpenTicketDetail={handleOpenTicketDetail}
              onJumpToRisk={handleJumpToRisk}
              initialFilter={ticketFilterKey}
            />
          )}

          {currentView === 'page_task_center' && (
            <TaskCenterPage
              tasks={tasks}
              onReturnToWorkbench={() => setCurrentView('workbench')}
              onOpenTaskProcess={handleOpenTaskProcess}
              onOpenTaskDetail={handleOpenTaskDetail}
              onCreateTicketFromTask={handleCreateTicketFromTask}
              initialFilter={taskFilterKey}
            />
          )}

          {currentView === 'page_dashboard' && (
            <DashboardPage
              metrics={metrics}
              onReturnToWorkbench={() => setCurrentView('workbench')}
            />
          )}

          {currentView === 'page_report_center' && (
            <ReportCenterPage
              metrics={metrics}
              onReturnToWorkbench={() => setCurrentView('workbench')}
              onExportReport={(format) => {
                setToastMessage({
                  title: `已导出运维分析报告 (${format.toUpperCase()})`,
                  type: 'success'
                });
              }}
            />
          )}

          {currentView === 'ai_diagnosis' && (
            <AiDiagnosisPage
              onReturnToWorkbench={() => setCurrentView('workbench')}
              onNavigate={(view) => {
                setCurrentView(view);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onConvertToTicket={handleCreateTicketFromAI}
            />
          )}

          {/* Subpages for New Menu Routes (Screen, Alarms, Warnings, Diagnostics, Assets, etc.) */}
          {(currentView === 'screen_posture' ||
            currentView === 'alarm_current' ||
            currentView === 'alarm_history' ||
            currentView === 'alarm_push_config' ||
            currentView === 'warning_current' ||
            currentView === 'warning_push_config' ||
            currentView === 'risk_tasks' ||
            currentView === 'health_inspection' ||
            currentView === 'analysis_perf' ||
            currentView === 'analysis_config' ||
            currentView === 'device_management' ||
            currentView === 'device_upgrade' ||
            currentView === 'station_management') && (
            <SubPagePlaceholder
              view={currentView}
              onReturnToWorkbench={() => setCurrentView('workbench')}
              onNavigate={(view) => {
                setCurrentView(view);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {/* Streamlined Workbench Cockpit View */}
          {currentView === 'workbench' && (
            <WorkbenchView
              tickets={tickets}
              risks={risks}
              tasks={tasks}
              metrics={metrics}
              onNavigate={(view) => {
                setCurrentView(view);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenTicketProcess={(ticket) => setDrawerTicket(ticket)}
              onOpenTicketDetail={handleOpenTicketDetail}
              onOpenRiskDetail={handleOpenRiskDetail}
              onConvertToTicket={handleConvertToTicket}
              onOpenTaskProcess={(task) => setDrawerTask(task)}
              onOpenTaskDetail={handleOpenTaskDetail}
              onCreateTicketFromTask={handleCreateTicketFromTask}
            />
          )}
        </main>
      </div>

      {/* Ticket Process Right Drawer (for Workbench quick action) */}
      <TicketProcessDrawer
        ticket={drawerTicket}
        onClose={() => setDrawerTicket(null)}
        onUpdateStatus={handleUpdateTicketStatus}
        onJumpToRisk={handleJumpToRisk}
      />

      {/* Task Process Right Drawer (for Workbench quick action) */}
      <TaskProcessDrawer
        task={drawerTask}
        onClose={() => setDrawerTask(null)}
        onUpdateTask={handleUpdateTask}
        onCreateTicketFromTask={handleCreateTicketFromTask}
      />

      {/* Ticket Detail Inspection Modal */}
      <TicketDetailModal
        ticket={detailModalTicket}
        onClose={() => setDetailModalTicket(null)}
        onGoToProcess={(ticket) => {
          setDetailModalTicket(null);
          setDrawerTicket(ticket);
        }}
        onJumpToRisk={handleJumpToRisk}
      />
    </div>
  );
}
