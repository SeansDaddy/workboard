import React, { useMemo } from 'react';
import { 
  TicketItem, 
  RiskItem, 
  RoutineTaskItem, 
  OperationsMetrics, 
  ActiveView, 
  CONFIG_THRESHOLDS 
} from '../../types';
import { TopSummaryBanner } from '../layout/TopSummaryBanner';
import { AiWorkSummaryCard } from '../layout/AiWorkSummaryCard';
import { 
  PriorityBadge, 
  SlaBadge, 
  RiskTypeBadge, 
  TaskStatusBadge, 
  TicketStatusBadge 
} from '../common/Badges';
import { 
  Ticket, 
  ShieldAlert, 
  CheckSquare, 
  ArrowRight, 
  ArrowUpRight, 
  PlusCircle, 
  Flame, 
  ChevronRight
} from 'lucide-react';

interface WorkbenchViewProps {
  tickets: TicketItem[];
  risks: RiskItem[];
  tasks: RoutineTaskItem[];
  metrics: OperationsMetrics;
  onNavigate: (view: ActiveView) => void;
  onOpenTicketProcess: (ticket: TicketItem) => void;
  onOpenTicketDetail: (ticket: TicketItem) => void;
  onOpenRiskAnalysis: (risk: RiskItem) => void;
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
  onOpenRiskAnalysis,
  onOpenRiskDetail,
  onConvertToTicket,
  onOpenTaskProcess,
  onOpenTaskDetail
}) => {
  // 1. 待我处理工单：高优先级与临期 SLA 优先排前，支持内部滚动
  const displayTickets = useMemo(() => {
    return [...tickets]
      .filter(t => t.status !== '已完成')
      .sort((a, b) => {
        const aHigh = a.priority === '高' || a.riskScore >= CONFIG_THRESHOLDS.HIGH_RISK_SCORE_MIN;
        const bHigh = b.priority === '高' || b.riskScore >= CONFIG_THRESHOLDS.HIGH_RISK_SCORE_MIN;
        if (aHigh && !bHigh) return -1;
        if (!aHigh && bHigh) return 1;
        return a.slaRemainingHours - b.slaRemainingHours;
      });
  }, [tickets]);

  // 2. 待处理风险：待处理与高风险分优先排前，支持内部滚动
  const displayRisks = useMemo(() => {
    return [...risks]
      .filter(r => r.status !== '已消除')
      .sort((a, b) => {
        if (a.status === '待处理' && b.status !== '待处理') return -1;
        if (a.status !== '待处理' && b.status === '待处理') return 1;
        return b.riskScore - a.riskScore;
      });
  }, [risks]);

  // 3. 例行作业：超期与今日截止排前
  const displayTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => {
        if (a.status === '已超期' && b.status !== '已超期') return -1;
        if (a.status !== '已超期' && b.status === '已超期') return 1;
        return a.deadline.localeCompare(b.deadline);
      });
  }, [tasks]);

  // 统计数据
  const myPendingTickets = tickets.filter(t => t.status !== '已完成');
  const myHighRiskTicketsCount = myPendingTickets.filter(t => t.priority === '高' || t.riskScore >= CONFIG_THRESHOLDS.HIGH_RISK_SCORE_MIN).length;
  const myCompletedTicketsCount = tickets.filter(t => t.status === '已完成').length || 18;
  const unhandledRisks = risks.filter(r => r.status === '待处理');
  const unhandledWarningsCount = unhandledRisks.filter(r => r.type === '预警').length;
  const unhandledAlarmsCount = unhandledRisks.filter(r => r.type === '告警').length;
  const todayDueTasksCount = tasks.filter(t => (t.deadline.startsWith('2026-08-25') || t.status === '已超期') && t.status !== '已完成').length;
  const overdueTasksCount = tasks.filter(t => t.status === '已超期').length;

  return (
    <div className="space-y-3.5">
      {/* 1. 顶部数据指标条 */}
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

      {/* 2. 登录自动生成的 AI 工作简报 */}
      <AiWorkSummaryCard
        userName="张工"
        userRole="华东区域运维负责人"
        tickets={tickets}
        risks={risks}
        tasks={tasks}
        metrics={metrics}
        onNavigate={onNavigate}
        onOpenTicketProcess={onOpenTicketProcess}
      />

      {/* 3. 核心业务工作区：待办工单 与 风险预警 并排展示，尺寸固定且多条时支持内部滚动 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5 items-stretch">
        {/* 卡片 1: 待办工单 */}
        <div className="bg-white rounded-lg border border-[#E8E8E8] flex flex-col h-[460px] shadow-none">
          <div className="p-3.5 px-4 border-b border-[#F0F0F0] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#1890FF]" />
              <span className="text-sm font-semibold text-[#1F1F1F]">待办工单</span>
              <span className="text-xs text-[#595959] bg-[#F5F5F5] px-1.5 py-0.5 rounded border border-[#E8E8E8] font-mono">
                {myPendingTickets.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('page_ticket_center')}
              className="inline-flex items-center gap-1 text-xs text-[#595959] hover:text-[#1890FF] transition-colors cursor-pointer"
            >
              <span>工单中心</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 滚动列表区域 */}
          <div className="divide-y divide-[#F0F0F0] text-sm flex-1 overflow-y-auto overscroll-contain">
            {displayTickets.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#8C8C8C]">
                暂无待办工单
              </div>
            ) : (
              displayTickets.map((t) => {
                const high = t.priority === '高' || t.riskScore >= CONFIG_THRESHOLDS.HIGH_RISK_SCORE_MIN;
                return (
                  <div 
                    key={t.id} 
                    className="p-3 px-4 hover:bg-[#FAFAFA] transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold text-[#1F1F1F]">{t.id}</span>
                        {high && (
                          <span className="text-xs font-medium text-[#F5222D] bg-[#FFF1F0] px-1.5 py-0.5 rounded border border-[#FFA39E] flex items-center gap-1">
                            <Flame className="w-3 h-3 fill-current" />
                            高风险
                          </span>
                        )}
                        <PriorityBadge priority={t.priority} />
                        <TicketStatusBadge status={t.status} />
                        <span className="text-xs text-[#8C8C8C]">{t.stationName}</span>
                      </div>
                      <p className="font-medium text-[#262626] truncate text-sm" title={t.title}>
                        {t.title}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-[#8C8C8C]">
                        <span>{t.assignee}</span>
                        <SlaBadge remainingHours={t.slaRemainingHours} deadline={t.slaDeadline} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onOpenTicketDetail(t)}
                        className="px-2 py-1 text-xs text-[#595959] hover:text-[#1890FF] rounded transition-colors cursor-pointer"
                      >
                        详情
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenTicketProcess(t)}
                        className="px-2.5 py-1 text-xs font-medium bg-[#1890FF] text-white hover:bg-[#40A9FF] rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>去处理</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-2.5 px-4 bg-[#FAFAFA] border-t border-[#F0F0F0] flex items-center justify-between text-xs text-[#8C8C8C] shrink-0">
            <span>共 {myPendingTickets.length} 条待处理</span>
            <button
              type="button"
              onClick={() => onNavigate('page_ticket_center')}
              className="text-[#1890FF] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>查看全部工单</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 卡片 2: 风险预警 */}
        <div className="bg-white rounded-lg border border-[#E8E8E8] flex flex-col h-[460px] shadow-none">
          <div className="p-3.5 px-4 border-b border-[#F0F0F0] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#FA8C16]" />
              <span className="text-sm font-semibold text-[#1F1F1F]">风险预警</span>
              <span className="text-xs text-[#595959] bg-[#F5F5F5] px-1.5 py-0.5 rounded border border-[#E8E8E8] font-mono">
                {unhandledRisks.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('page_risk_center')}
              className="inline-flex items-center gap-1 text-xs text-[#595959] hover:text-[#1890FF] transition-colors cursor-pointer"
            >
              <span>风险中心</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 滚动列表区域 */}
          <div className="divide-y divide-[#F0F0F0] text-sm flex-1 overflow-y-auto overscroll-contain">
            {displayRisks.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#8C8C8C]">
                暂无待处置风险
              </div>
            ) : (
              displayRisks.map((r) => {
                return (
                  <div 
                    key={r.id} 
                    className="p-3 px-4 hover:bg-[#FAFAFA] transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold text-[#1F1F1F]">{r.id}</span>
                        <RiskTypeBadge type={r.type} />
                        <span className="text-xs text-[#595959] bg-[#F5F5F5] px-1.5 py-0.5 rounded">
                          {r.category}
                        </span>
                        {r.confidence && (
                          <span className="text-xs text-[#595959] font-mono">
                            置信度 {r.confidence}%
                          </span>
                        )}
                        <span className="text-xs text-[#8C8C8C]">{r.stationName}</span>
                      </div>
                      <p className="font-medium text-[#262626] truncate text-sm" title={r.title}>
                        {r.title}
                      </p>
                      <div className="text-xs text-[#8C8C8C] flex items-center gap-2.5">
                        <span>{r.discoveredAt}</span>
                        <span className="text-[#595959]">风险分: {r.riskScore}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onOpenRiskDetail(r)}
                        className="px-2 py-1 text-xs text-[#595959] hover:text-[#1890FF] rounded transition-colors cursor-pointer"
                      >
                        详情
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenRiskAnalysis(r)}
                        className="px-2.5 py-1 text-xs font-medium bg-[#FA8C16] text-white hover:bg-[#FFA940] rounded transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <span>去分析</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-2.5 px-4 bg-[#FAFAFA] border-t border-[#F0F0F0] flex items-center justify-between text-xs text-[#8C8C8C] shrink-0">
            <span>共 {unhandledRisks.length} 项待研判</span>
            <button
              type="button"
              onClick={() => onNavigate('page_risk_center')}
              className="text-[#1890FF] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>查看全部风险</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. 例行作业：底部全宽卡片，同样支持内部滚动 */}
      <div className="bg-white rounded-lg border border-[#E8E8E8] flex flex-col shadow-none">
        <div className="p-3.5 px-4 border-b border-[#F0F0F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#595959]" />
            <span className="text-sm font-semibold text-[#1F1F1F]">例行作业</span>
            {overdueTasksCount > 0 ? (
              <span className="text-xs text-[#F5222D] bg-[#FFF1F0] px-1.5 py-0.5 rounded border border-[#FFA39E] font-medium">
                超期 {overdueTasksCount}
              </span>
            ) : (
              <span className="text-xs text-[#595959] bg-[#F5F5F5] px-1.5 py-0.5 rounded border border-[#E8E8E8] font-mono">
                {tasks.length}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onNavigate('page_task_center')}
            className="inline-flex items-center gap-1 text-xs text-[#595959] hover:text-[#1890FF] transition-colors cursor-pointer"
          >
            <span>作业管理</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-[#F0F0F0] text-sm max-h-[300px] overflow-y-auto overscroll-contain">
          {displayTasks.map((tk) => {
            const isOverdue = tk.status === '已超期';
            return (
              <div 
                key={tk.id}
                className={`p-3 px-4 hover:bg-[#FAFAFA] transition-colors flex items-center justify-between gap-3 ${
                  isOverdue ? 'bg-[#FFF1F0]/20' : ''
                }`}
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-[#1F1F1F]">{tk.id}</span>
                    <span className="text-xs text-[#595959] bg-[#F5F5F5] px-1.5 py-0.5 rounded">
                      {tk.taskType}
                    </span>
                    <TaskStatusBadge status={tk.status} />
                    <span className="text-xs text-[#8C8C8C]">{tk.stationName}</span>
                  </div>
                  <p className="font-medium text-[#262626] truncate text-sm" title={tk.name}>
                    {tk.name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[#8C8C8C]">
                    <span>{tk.assignee}</span>
                    <span>截止: {tk.deadline}</span>
                    <span>进度: {tk.progress}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenTaskDetail(tk)}
                    className="px-2 py-1 text-xs text-[#595959] hover:text-[#1890FF] rounded transition-colors cursor-pointer"
                  >
                    详情
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenTaskProcess(tk)}
                    className="px-2.5 py-1 text-xs font-medium bg-[#1890FF] text-white hover:bg-[#40A9FF] rounded transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>去执行</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-2.5 px-4 bg-[#FAFAFA] border-t border-[#F0F0F0] flex items-center justify-between text-xs text-[#8C8C8C]">
          <span>共 {tasks.length} 项作业</span>
          <button
            type="button"
            onClick={() => onNavigate('page_task_center')}
            className="text-[#1890FF] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>查看全部作业</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
