import React, { useState } from 'react';
import { 
  TicketItem, 
  RiskItem, 
  RoutineTaskItem, 
  OperationsMetrics, 
  ActiveView, 
  CONFIG_THRESHOLDS 
} from '../../types';
import { TopSummaryBanner } from '../layout/TopSummaryBanner';
import { UserWorkflowBar, WorkflowStepId } from '../layout/UserWorkflowBar';
import { 
  PriorityBadge, 
  RiskScoreBadge, 
  SlaBadge, 
  RiskTypeBadge, 
  TaskStatusBadge, 
  TicketStatusBadge 
} from '../common/Badges';
import { 
  Ticket, 
  ShieldAlert, 
  CheckSquare, 
  BarChart3, 
  ArrowRight, 
  ArrowUpRight, 
  PlusCircle, 
  Flame, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Cloud, 
  Power, 
  Zap, 
  Activity, 
  ChevronRight,
  TrendingUp,
  FileCheck2,
  ExternalLink,
  FileText,
  Layers,
  Award,
  Filter,
  Wrench
} from 'lucide-react';

interface WorkbenchViewProps {
  tickets: TicketItem[];
  risks: RiskItem[];
  tasks: RoutineTaskItem[];
  metrics: OperationsMetrics;
  onNavigate: (view: ActiveView) => void;
  onOpenTicketProcess: (ticket: TicketItem) => void;
  onOpenTicketDetail: (ticket: TicketItem) => void;
  onOpenRiskDetail: (risk: RiskItem) => void;
  onConvertToTicket: (risk: RiskItem) => void;
  onOpenTaskProcess: (task: RoutineTaskItem) => void;
  onOpenTaskDetail: (task: RoutineTaskItem) => void;
  onCreateTicketFromTask: (task: RoutineTaskItem) => void;
}

export const WorkbenchView: React.FC<WorkbenchViewProps> = ({
  tickets,
  risks,
  tasks,
  metrics,
  onNavigate,
  onOpenTicketProcess,
  onOpenTicketDetail,
  onOpenRiskDetail,
  onConvertToTicket,
  onOpenTaskProcess,
  onOpenTaskDetail,
  onCreateTicketFromTask
}) => {
  // 当前工作流步骤筛选（默认 'all' 显示全部）
  const [workflowStep, setWorkflowStep] = useState<WorkflowStepId>('all');

  // 1. 待我处理的工单中，按优先级与 SLA 紧迫度排序，取前 4 条精选
  const topTickets = React.useMemo(() => {
    return [...tickets]
      .filter(t => t.status !== '已完成')
      .sort((a, b) => {
        const aHigh = a.priority === '高' || a.riskScore >= CONFIG_THRESHOLDS.HIGH_RISK_SCORE_MIN;
        const bHigh = b.priority === '高' || b.riskScore >= CONFIG_THRESHOLDS.HIGH_RISK_SCORE_MIN;
        if (aHigh && !bHigh) return -1;
        if (!aHigh && bHigh) return 1;
        return a.slaRemainingHours - b.slaRemainingHours;
      })
      .slice(0, 4);
  }, [tickets]);

  // 已闭环/已完成工单（用于复核验收）
  const closedTickets = React.useMemo(() => {
    return [...tickets]
      .filter(t => t.status === '已完成')
      .slice(0, 4);
  }, [tickets]);

  // 2. 待处理的高风险预警与告警，取前 4 条精选
  const topRisks = React.useMemo(() => {
    return [...risks]
      .filter(r => r.status !== '已消除')
      .sort((a, b) => {
        if (a.status === '待处理' && b.status !== '待处理') return -1;
        if (a.status !== '待处理' && b.status === '待处理') return 1;
        return b.riskScore - a.riskScore;
      })
      .slice(0, 4);
  }, [risks]);

  // 3. 超期作业与今日重点巡检，取前 4 项
  const topTasks = React.useMemo(() => {
    return [...tasks]
      .sort((a, b) => {
        if (a.status === '已超期' && b.status !== '已超期') return -1;
        if (a.status !== '已超期' && b.status === '已超期') return 1;
        return a.deadline.localeCompare(b.deadline);
      })
      .slice(0, 4);
  }, [tasks]);

  // 已完成的例行作业（用于复核验收）
  const completedTasks = React.useMemo(() => {
    return [...tasks]
      .filter(t => t.status === '已完成')
      .slice(0, 4);
  }, [tasks]);

  // 统计数值
  const myPendingTickets = tickets.filter(t => t.assignee === CONFIG_THRESHOLDS.CURRENT_USER_NAME && t.status !== '已完成');
  const myHighRiskTicketsCount = myPendingTickets.filter(t => t.priority === '高' || t.riskScore >= CONFIG_THRESHOLDS.HIGH_RISK_SCORE_MIN).length;
  const myCompletedTicketsCount = tickets.filter(t => t.assignee === CONFIG_THRESHOLDS.CURRENT_USER_NAME && t.status === '已完成').length || 18;
  const unhandledRisks = risks.filter(r => r.status !== '已转工单' && r.status !== '已忽略' && r.status !== '已消除');
  const unhandledWarningsCount = unhandledRisks.filter(r => r.type === '预警').length;
  const unhandledAlarmsCount = unhandledRisks.filter(r => r.type === '告警').length;
  const todayDueTasksCount = tasks.filter(t => (t.deadline.startsWith('2026-08-25') || t.status === '已超期') && t.status !== '已完成').length;
  const overdueTasksCount = tasks.filter(t => t.status === '已超期').length;

  // 各独立卡片组件定义
  // Card A: 待办工单精选
  const renderTicketCard = (customTitle = '待办工单精选', isReviewMode = false) => {
    const displayList = isReviewMode ? (closedTickets.length > 0 ? closedTickets : topTickets) : topTickets;

    return (
      <div className="bg-white rounded-lg border border-[#E8E8E8] flex flex-col justify-between h-full shadow-none">
        {/* 卡片头部 */}
        <div className="p-4 border-b border-[#E8E8E8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-blue-50 text-[#1890FF] border border-blue-100">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#1F1F1F]">{customTitle}</span>
                <span className="text-xs text-[#1890FF] bg-[#E6F7FF] px-2 py-0.5 rounded border border-[#91D5FF] font-semibold">
                  {isReviewMode ? `已完成 ${myCompletedTicketsCount}` : `待我处理 ${myPendingTickets.length}`}
                </span>
              </div>
              <p className="text-xs text-[#8C8C8C]">
                {isReviewMode ? '消缺验收确认与归档台账' : '按 SLA 紧迫度优先排列，支持快速处置'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('page_ticket_center')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold text-[#1890FF] hover:bg-[#E6F7FF] transition-colors cursor-pointer"
          >
            <span>进入工单中心 ({tickets.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 精简工单列表 */}
        <div className="divide-y divide-[#F0F0F0] text-sm flex-1">
          {displayList.map((t) => {
            const high = t.priority === '高' || t.riskScore >= CONFIG_THRESHOLDS.HIGH_RISK_SCORE_MIN;
            return (
              <div 
                key={t.id} 
                className="p-3.5 hover:bg-[#FAFAFA] transition-colors flex items-center justify-between gap-3 group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#1F1F1F]">{t.id}</span>
                    {high && (
                      <span className="text-xs font-bold text-[#F5222D] bg-[#FFF1F0] px-1.5 py-0.5 rounded border border-[#FFA39E] flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-current" />
                        高风险
                      </span>
                    )}
                    <PriorityBadge priority={t.priority} />
                    <TicketStatusBadge status={t.status} />
                    <span className="text-xs text-[#595959]">{t.stationName}</span>
                  </div>
                  <p className="font-semibold text-[#262626] truncate text-sm" title={t.title}>
                    {t.title}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[#8C8C8C]">
                    <span>责任人: {t.assignee}</span>
                    <SlaBadge remainingHours={t.slaRemainingHours} deadline={t.slaDeadline} />
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenTicketDetail(t)}
                    className="px-2.5 py-1 text-xs text-[#595959] hover:text-[#1890FF] hover:bg-[#F5F5F5] rounded transition-colors cursor-pointer"
                  >
                    详情
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenTicketProcess(t)}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#1890FF] text-white hover:bg-[#40A9FF] rounded-md transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <span>{t.status === '已完成' ? '复核' : '去处理'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部跳转条 */}
        <div className="p-2.5 px-4 bg-[#FAFAFA] border-t border-[#E8E8E8] flex items-center justify-between text-xs text-[#8C8C8C]">
          <span>显示 {displayList.length} 条代表工单</span>
          <button
            type="button"
            onClick={() => onNavigate('page_ticket_center')}
            className="text-[#1890FF] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
          >
            <span>查看工单中心完整台账与搜索</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  // Card B: 高风险预警速办
  const renderRiskCard = (customTitle = '高风险预警与告警') => {
    return (
      <div className="bg-white rounded-lg border border-[#E8E8E8] flex flex-col justify-between h-full shadow-none">
        {/* 卡片头部 */}
        <div className="p-4 border-b border-[#E8E8E8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-amber-50 text-[#FA8C16] border border-amber-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#1F1F1F]">{customTitle}</span>
                <span className="text-xs text-[#FA8C16] bg-[#FFF7E6] px-2 py-0.5 rounded border border-[#FFD591] font-semibold">
                  待处置 {unhandledRisks.length}
                </span>
              </div>
              <p className="text-xs text-[#8C8C8C]">算法预测特征异常，支持一键派发工单</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('page_risk_center')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold text-[#FA8C16] hover:bg-[#FFF7E6] transition-colors cursor-pointer"
          >
            <span>进入风险中心 ({risks.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 精简风险列表 */}
        <div className="divide-y divide-[#F0F0F0] text-sm flex-1">
          {topRisks.map((r) => {
            return (
              <div 
                key={r.id} 
                className="p-3.5 hover:bg-[#FAFAFA] transition-colors flex items-center justify-between gap-3 group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#1F1F1F]">{r.id}</span>
                    <RiskTypeBadge type={r.type} />
                    <span className="text-xs text-[#595959] bg-[#F5F5F5] px-1.5 py-0.5 rounded border border-[#E8E8E8]">
                      {r.category}
                    </span>
                    {r.confidence && (
                      <span className="text-xs text-[#2F54EB] bg-[#F0F5FF] px-1.5 py-0.5 rounded border border-[#ADC6FF] font-medium">
                        置信度 {r.confidence}%
                      </span>
                    )}
                    <span className="text-xs text-[#595959]">{r.stationName}</span>
                  </div>
                  <p className="font-semibold text-[#262626] truncate text-sm" title={r.title}>
                    {r.title}
                  </p>
                  <div className="text-xs text-[#8C8C8C] flex items-center gap-2.5">
                    <span>发现时间: {r.discoveredAt}</span>
                    <span className="text-[#FA8C16] font-semibold">风险分: {r.riskScore}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenRiskDetail(r)}
                    className="px-2.5 py-1 text-xs text-[#595959] hover:text-[#1890FF] hover:bg-[#F5F5F5] rounded transition-colors cursor-pointer"
                  >
                    分析
                  </button>

                  {r.status === '待处理' ? (
                    <button
                      type="button"
                      onClick={() => onConvertToTicket(r)}
                      className="px-3 py-1.5 text-xs font-semibold bg-[#FA8C16] hover:bg-[#FFA940] text-white rounded-md transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>转工单</span>
                    </button>
                  ) : (
                    <span className="text-xs text-[#52C41A] bg-[#F6FFED] px-2.5 py-1 rounded border border-[#B7EB8F] font-semibold">
                      已转工单
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部跳转条 */}
        <div className="p-2.5 px-4 bg-[#FAFAFA] border-t border-[#E8E8E8] flex items-center justify-between text-xs text-[#8C8C8C]">
          <span>显示高危前 {topRisks.length} 项预警</span>
          <button
            type="button"
            onClick={() => onNavigate('page_risk_center')}
            className="text-[#FA8C16] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
          >
            <span>查看风险中心量化证据链与大盘</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  // Card C: 例行作业督办摘要
  const renderTaskCard = (customTitle = '例行作业与超期督办', isReviewMode = false) => {
    const displayList = isReviewMode ? (completedTasks.length > 0 ? completedTasks : topTasks) : topTasks;

    return (
      <div className="bg-white rounded-lg border border-[#E8E8E8] flex flex-col justify-between h-full shadow-none">
        {/* 卡片头部 */}
        <div className="p-4 border-b border-[#E8E8E8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-rose-50 text-[#F5222D] border border-rose-100">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#1F1F1F]">{customTitle}</span>
                {overdueTasksCount > 0 && !isReviewMode ? (
                  <span className="text-xs text-[#F5222D] bg-[#FFF1F0] px-2 py-0.5 rounded border border-[#FFA39E] font-bold">
                    超期 {overdueTasksCount} 项
                  </span>
                ) : (
                  <span className="text-xs text-[#52C41A] bg-[#F6FFED] px-2 py-0.5 rounded border border-[#B7EB8F] font-semibold">
                    {isReviewMode ? '已验收' : '按期受控'}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8C8C8C]">
                {isReviewMode ? '例行巡检与专项整改完成核验' : '“该做没做”为首要警示信号，需按时闭环'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('page_task_center')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold text-[#1890FF] hover:bg-[#E6F7FF] transition-colors cursor-pointer"
          >
            <span>进入作业管理 ({tasks.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 精简作业列表 */}
        <div className="divide-y divide-[#F0F0F0] text-sm flex-1">
          {displayList.map((tk) => {
            const isOverdue = tk.status === '已超期';
            return (
              <div 
                key={tk.id}
                className={`p-3.5 hover:bg-[#FAFAFA] transition-colors flex items-center justify-between gap-3 ${
                  isOverdue ? 'bg-[#FFF1F0]/30 border-l-3 border-l-[#F5222D]' : ''
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#1F1F1F]">{tk.id}</span>
                    <span className="text-xs text-[#1890FF] bg-[#E6F7FF] px-1.5 py-0.5 rounded border border-[#91D5FF] font-medium">
                      {tk.taskType} ({tk.period})
                    </span>
                    <TaskStatusBadge status={tk.status} />
                    <span className="text-xs text-[#595959]">{tk.stationName}</span>
                    {isOverdue && (
                      <span className="text-xs font-bold text-[#F5222D] bg-[#FFF1F0] px-1.5 py-0.5 rounded border border-[#FFA39E] flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 fill-current" />
                        超期 {tk.overdueHours}h
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-[#262626] truncate text-sm" title={tk.name}>
                    {tk.name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[#8C8C8C]">
                    <span>责任人: {tk.assignee}</span>
                    <span>截止: {tk.deadline}</span>
                    <span className="font-semibold text-[#1890FF]">进度: {tk.progress}% ({tk.itemsCompleted}/{tk.itemsTotal}项)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenTaskDetail(tk)}
                    className="px-2.5 py-1 text-xs text-[#595959] hover:text-[#1890FF] hover:bg-[#F5F5F5] rounded transition-colors cursor-pointer"
                  >
                    详情
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenTaskProcess(tk)}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#1890FF] text-white hover:bg-[#40A9FF] rounded-md transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <span>{tk.status === '已完成' ? '复核' : '去执行'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部跳转条 */}
        <div className="p-2.5 px-4 bg-[#FAFAFA] border-t border-[#E8E8E8] flex items-center justify-between text-xs text-[#8C8C8C]">
          <span>显示重点 {displayList.length} 项周期作业</span>
          <button
            type="button"
            onClick={() => onNavigate('page_task_center')}
            className="text-[#1890FF] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
          >
            <span>查看完整作业台账与 SOP 清单</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  // Card D: 储能资产健康与运行态势简报
  const renderDashboardCard = (customTitle = '储能资产态势简报') => {
    return (
      <div className="bg-white rounded-lg border border-[#E8E8E8] flex flex-col justify-between h-full shadow-none">
        {/* 卡片头部 */}
        <div className="p-4 border-b border-[#E8E8E8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-emerald-50 text-[#52C41A] border border-emerald-200">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#1F1F1F]">{customTitle}</span>
                <span className="text-xs text-[#52C41A] bg-[#F6FFED] px-2 py-0.5 rounded border border-[#B7EB8F] font-semibold">
                  484 座电站全息
                </span>
              </div>
              <p className="text-xs text-[#8C8C8C]">接入、受控、出力与策略分布核心指标概览</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('page_dashboard')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold text-[#52C41A] hover:bg-[#F6FFED] transition-colors cursor-pointer"
          >
            <span>进入运营看板</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 精简 4 磁贴概览 */}
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm flex-1">
          {/* 上云率 */}
          <div className="bg-[#FAFAFA] p-3 rounded-md border border-[#E8E8E8] space-y-1">
            <div className="flex items-center justify-between text-[#8C8C8C] text-xs font-medium">
              <span className="flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5 text-[#1890FF]" /> 上云率
              </span>
            </div>
            <div className="text-lg font-bold text-[#1F1F1F]">
              {metrics.cloudRate.percentage}%
            </div>
            <div className="text-xs text-[#8C8C8C]">
              {metrics.cloudRate.connectedStations}/{metrics.cloudRate.totalStations} 座
            </div>
          </div>

          {/* 上电率 */}
          <div className="bg-[#FAFAFA] p-3 rounded-md border border-[#E8E8E8] space-y-1">
            <div className="flex items-center justify-between text-[#8C8C8C] text-xs font-medium">
              <span className="flex items-center gap-1">
                <Power className="w-3.5 h-3.5 text-[#52C41A]" /> 上电率
              </span>
            </div>
            <div className="text-lg font-bold text-[#1F1F1F]">
              {metrics.powerOnRate.percentage}%
            </div>
            <div className="text-xs text-[#8C8C8C]">
              {metrics.powerOnRate.monitoredStations} 座受控
            </div>
          </div>

          {/* 今日放电 */}
          <div className="bg-[#FAFAFA] p-3 rounded-md border border-[#E8E8E8] space-y-1">
            <div className="flex items-center justify-between text-[#8C8C8C] text-xs font-medium">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-[#FA8C16]" /> 今日放电
              </span>
            </div>
            <div className="text-lg font-bold text-[#1F1F1F]">
              {metrics.dischargeSummary.todayCount} 次
            </div>
            <div className="text-xs text-[#FA8C16] font-semibold">
              {metrics.dischargeSummary.todayEnergyMWh} MWh
            </div>
          </div>

          {/* 实时态势 */}
          <div className="bg-[#FAFAFA] p-3 rounded-md border border-[#E8E8E8] space-y-1">
            <div className="flex items-center justify-between text-[#8C8C8C] text-xs font-medium">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-[#722ED1]" /> 故障态势
              </span>
            </div>
            <div className="text-lg font-bold text-[#F5222D]">
              8 座
            </div>
            <div className="text-xs text-[#8C8C8C]">
              占比 1.7% 可控
            </div>
          </div>
        </div>

        {/* 策略精简条 */}
        <div className="px-4 pb-3.5">
          <div className="bg-[#E6F7FF]/50 p-2.5 rounded-md border border-[#91D5FF] text-xs flex items-center justify-between text-[#0050B3]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1890FF]" />
              <span className="font-medium">策略分布: 削峰填谷 (68%) / 自发自用 (18%) / 全额上网 (14%)</span>
            </div>
            <span className="text-[#1890FF] font-bold">配置健康</span>
          </div>
        </div>

        {/* 底部跳转条 */}
        <div className="p-2.5 px-4 bg-[#FAFAFA] border-t border-[#E8E8E8] flex items-center justify-between text-xs text-[#8C8C8C]">
          <span>资产大盘实时遥测聚合中</span>
          <button
            type="button"
            onClick={() => onNavigate('page_dashboard')}
            className="text-[#52C41A] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
          >
            <span>查看近14天双轴充放电出力曲线与策略环图</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  // Card E: 运维绩效与 SLA 履约复盘简报 (用于 05 报告复盘)
  const renderReportReviewCard = () => {
    return (
      <div className="bg-white rounded-lg border border-[#E8E8E8] flex flex-col justify-between h-full shadow-none">
        {/* 卡片头部 */}
        <div className="p-4 border-b border-[#E8E8E8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-purple-50 text-[#722ED1] border border-purple-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#1F1F1F]">运维质量与 SLA 履约复盘</span>
                <span className="text-xs text-[#722ED1] bg-[#F9F0FF] px-2 py-0.5 rounded border border-[#D3ADF7] font-semibold">
                  本期运维白皮书
                </span>
              </div>
              <p className="text-xs text-[#8C8C8C]">算法预警准确率、消缺履约与白皮书归档</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('page_report_center')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold text-[#722ED1] hover:bg-[#F9F0FF] transition-colors cursor-pointer"
          >
            <span>进入运维报告中心</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 复盘指标网格 */}
        <div className="p-4 grid grid-cols-2 gap-3.5 text-sm flex-1">
          <div className="bg-[#FAFAFA] p-3.5 rounded-md border border-[#E8E8E8] space-y-1.5">
            <div className="flex items-center justify-between text-[#8C8C8C] text-xs font-medium">
              <span>SLA 响应与闭环履约率</span>
              <Award className="w-4 h-4 text-[#52C41A]" />
            </div>
            <div className="text-2xl font-bold text-[#1F1F1F]">97.8%</div>
            <div className="text-xs text-[#52C41A] font-semibold">优于考核基准 (95.0%)</div>
          </div>

          <div className="bg-[#FAFAFA] p-3.5 rounded-md border border-[#E8E8E8] space-y-1.5">
            <div className="flex items-center justify-between text-[#8C8C8C] text-xs font-medium">
              <span>算法特征预警准确率</span>
              <Sparkles className="w-4 h-4 text-[#1890FF]" />
            </div>
            <div className="text-2xl font-bold text-[#1F1F1F]">94.2%</div>
            <div className="text-xs text-[#1890FF] font-semibold">误报率降至 5.8%</div>
          </div>

          <div className="bg-[#FAFAFA] p-3.5 rounded-md border border-[#E8E8E8] space-y-1.5">
            <div className="flex items-center justify-between text-[#8C8C8C] text-xs font-medium">
              <span>储能资产综合可利用率</span>
              <TrendingUp className="w-4 h-4 text-[#FA8C16]" />
            </div>
            <div className="text-2xl font-bold text-[#1F1F1F]">99.4%</div>
            <div className="text-xs text-[#8C8C8C]">全域 484 座电站综合评估</div>
          </div>

          <div className="bg-[#FAFAFA] p-3.5 rounded-md border border-[#E8E8E8] space-y-1.5">
            <div className="flex items-center justify-between text-[#8C8C8C] text-xs font-medium">
              <span>典型故障知识沉淀</span>
              <FileCheck2 className="w-4 h-4 text-[#722ED1]" />
            </div>
            <div className="text-2xl font-bold text-[#1F1F1F]">24 篇</div>
            <div className="text-xs text-[#722ED1] font-semibold">已沉淀至运维经验库</div>
          </div>
        </div>

        {/* 底部跳转条 */}
        <div className="p-2.5 px-4 bg-[#FAFAFA] border-t border-[#E8E8E8] flex items-center justify-between text-xs text-[#8C8C8C]">
          <span>支持导出 PDF / Excel 完整白皮书</span>
          <button
            type="button"
            onClick={() => onNavigate('page_report_center')}
            className="text-[#722ED1] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
          >
            <span>一键生成运维周报/月报</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 顶部汇总卡片 (专注责任人工作视角) */}
      <TopSummaryBanner
        myPendingTicketsCount={myPendingTickets.length}
        myHighRiskTicketsCount={myHighRiskTicketsCount}
        unhandledRiskCount={unhandledRisks.length}
        unhandledWarningsCount={unhandledWarningsCount}
        unhandledAlarmsCount={unhandledAlarmsCount}
        todayDueTasksCount={todayDueTasksCount}
        overdueTasksCount={overdueTasksCount}
        myCompletedTicketsCount={myCompletedTicketsCount}
        slaComplianceRate={97.8}
        onFilterTickets={() => onNavigate('page_ticket_center')}
        onFilterRisks={() => onNavigate('page_risk_center')}
        onFilterTasks={() => onNavigate('page_task_center')}
      />

      {/* 用户运维闭环工作流筛选栏 (01主动研判 -> 02工单派发 -> 03现场消缺 -> 04复核验收 -> 05报告复盘) */}
      <UserWorkflowBar
        selectedStep={workflowStep}
        onSelectStep={(step) => setWorkflowStep(step)}
        unhandledRisksCount={unhandledRisks.length}
        myPendingTicketsCount={myPendingTickets.length}
        inProgressTasksCount={tasks.filter(t => t.status === '执行中').length}
        myCompletedTicketsCount={myCompletedTicketsCount}
      />

      {/* 动态内容区：根据 workflowStep 进行模块归类展示 */}
      {workflowStep === 'all' && (
        /* 默认视图：全流程展示 */
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* 【要我处理的】· 今日核心待办与高风险 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-[#1890FF] ring-4 ring-[#E6F7FF]" />
                <h2 className="text-base font-bold text-[#1F1F1F] tracking-wide">
                  【要我处理的】· 今日核心行动
                </h2>
                <span className="text-xs text-[#8C8C8C]">
                  高优先级工单与待闭环算法预警
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {renderTicketCard('待办工单精选')}
              {renderRiskCard('高风险预警与告警')}
            </div>
          </div>

          {/* 【我要关注的】· 态势感知与作业督办 */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-[#52C41A] ring-4 ring-[#F6FFED]" />
                <h2 className="text-base font-bold text-[#1F1F1F] tracking-wide">
                  【我要关注的】· 态势感知与作业督办
                </h2>
                <span className="text-xs text-[#8C8C8C]">
                  周期性巡检 SOP 进展与全网资产健康度
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {renderTaskCard('例行作业与超期督办')}
              {renderDashboardCard('储能资产态势简报')}
            </div>
          </div>
        </div>
      )}

      {workflowStep === '01' && (
        /* 01 主动研判：仅展示高风险预警与告警 + 储能资产态势 */
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-[#FFF7E6] p-3 px-4 rounded-lg border border-[#FFD591]">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-[#FA8C16]" />
              <span className="text-sm font-bold text-[#D46B08]">
                【主动研判视图】已聚焦：高风险预警与告警 + 储能资产态势感知
              </span>
              <span className="text-xs text-[#8C8C8C]">
                通过多维时序特征识别电芯离群、热阻劣化并结合全网运行态势辅助研判
              </span>
            </div>
            <button
              type="button"
              onClick={() => setWorkflowStep('all')}
              className="text-xs text-[#1890FF] hover:underline font-semibold cursor-pointer"
            >
              恢复全览
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {renderRiskCard('高风险预警与告警 · 算法特征分析')}
            {renderDashboardCard('储能资产态势 · 全网运行健康度')}
          </div>
        </div>
      )}

      {workflowStep === '02' && (
        /* 02 工单派发：仅展示待办工单精选 + 例行作业计划 */
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-[#E6F7FF] p-3 px-4 rounded-lg border border-[#91D5FF]">
            <div className="flex items-center gap-2.5">
              <PlusCircle className="w-5 h-5 text-[#1890FF]" />
              <span className="text-sm font-bold text-[#0050B3]">
                【工单派发视图】已聚焦：待派发与流转工单 + 例行作业计划下发
              </span>
              <span className="text-xs text-[#8C8C8C]">
                承载异常转工单派发、现场责任人指定与 SOP 任务计划下发
              </span>
            </div>
            <button
              type="button"
              onClick={() => setWorkflowStep('all')}
              className="text-xs text-[#1890FF] hover:underline font-semibold cursor-pointer"
            >
              恢复全览
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {renderTicketCard('待办工单 · 待派发与流转台账')}
            {renderTaskCard('例行作业 · 任务计划与派发督办')}
          </div>
        </div>
      )}

      {workflowStep === '03' && (
        /* 03 现场消缺：仅展示在办工单（SLA优先） + 现场巡检与整改 */
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-[#FFF1F0] p-3 px-4 rounded-lg border border-[#FFA39E]">
            <div className="flex items-center gap-2.5">
              <Wrench className="w-5 h-5 text-[#F5222D]" />
              <span className="text-sm font-bold text-[#CF1322]">
                【现场消缺视图】已聚焦：在办消缺工单 (SLA优先管控) + 现场巡检与消缺整改
              </span>
              <span className="text-xs text-[#8C8C8C]">
                监控责任人在办工单、挂起申请、备件申领与 SLA 倒计时精准处置
              </span>
            </div>
            <button
              type="button"
              onClick={() => setWorkflowStep('all')}
              className="text-xs text-[#1890FF] hover:underline font-semibold cursor-pointer"
            >
              恢复全览
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {renderTicketCard('在办消缺工单 · SLA紧迫优先')}
            {renderTaskCard('现场巡检作业 · 打卡与消缺整改')}
          </div>
        </div>
      )}

      {workflowStep === '04' && (
        /* 04 复核验收：仅展示待复核/已闭环工单 + 例行作业验收台账 */
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-[#F6FFED] p-3 px-4 rounded-lg border border-[#B7EB8F]">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#52C41A]" />
              <span className="text-sm font-bold text-[#389E0D]">
                【复核验收视图】已聚焦：消缺验收确认与闭环归档台账
              </span>
              <span className="text-xs text-[#8C8C8C]">
                确认现场消缺报告、核对设备恢复状态与闭环归档，保障消缺质量
              </span>
            </div>
            <button
              type="button"
              onClick={() => setWorkflowStep('all')}
              className="text-xs text-[#1890FF] hover:underline font-semibold cursor-pointer"
            >
              恢复全览
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {renderTicketCard('消缺验收确认 · 已完工/已闭环工单', true)}
            {renderTaskCard('例行作业验收 · 完成项复核台账', true)}
          </div>
        </div>
      )}

      {workflowStep === '05' && (
        /* 05 报告复盘：仅展示储能资产态势简报 + 运维质量与SLA履约复盘 */
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-[#F9F0FF] p-3 px-4 rounded-lg border border-[#D3ADF7]">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-[#722ED1]" />
              <span className="text-sm font-bold text-[#531DAB]">
                【报告复盘视图】已聚焦：储能资产态势简报 + 运维质量与SLA履约复盘
              </span>
              <span className="text-xs text-[#8C8C8C]">
                沉淀资产可利用率、算法预警准确率与周期性白皮书知识库
              </span>
            </div>
            <button
              type="button"
              onClick={() => setWorkflowStep('all')}
              className="text-xs text-[#1890FF] hover:underline font-semibold cursor-pointer"
            >
              恢复全览
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {renderDashboardCard('储能资产态势 · 运行出力与策略')}
            {renderReportReviewCard()}
          </div>
        </div>
      )}
    </div>
  );
};
