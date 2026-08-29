import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, RefreshCw, ArrowUpRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { TicketItem, RiskItem, RoutineTaskItem, OperationsMetrics, ActiveView } from '../../types';

interface AiWorkSummaryCardProps {
  userName?: string;
  userRole?: string;
  tickets: TicketItem[];
  risks: RiskItem[];
  tasks: RoutineTaskItem[];
  metrics: OperationsMetrics;
  onNavigate: (view: ActiveView) => void;
  onOpenTicketProcess?: (ticket: TicketItem) => void;
}

interface SummaryData {
  overview: string;
  actions: string[];
  tip?: string;
  generatedAt?: string;
}

export const AiWorkSummaryCard: React.FC<AiWorkSummaryCardProps> = ({
  userName = '张工',
  userRole = '华东区域运维负责人',
  tickets,
  risks,
  tasks,
  metrics,
  onNavigate
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [typingIndex, setTypingIndex] = useState<number>(0);

  // Filter current user's live data
  const myPendingTickets = tickets.filter(t => t.status !== '已完成');
  const myHighRiskTickets = myPendingTickets.filter(t => t.priority === '高' || t.riskScore >= 80);
  const unhandledRisks = risks.filter(r => r.status === '待处理');
  const dueOrOverdueTasks = tasks.filter(t => t.status === '已超期' || t.deadline.startsWith('2026-08-25'));

  const generateSummary = useCallback(async () => {
    setLoading(true);
    setDisplayedText('');
    setTypingIndex(0);

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    try {
      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: { name: userName, role: userRole },
          pendingTickets: myPendingTickets.map(t => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            stationName: t.stationName,
            slaRemainingHours: t.slaRemainingHours
          })),
          unhandledRisks: unhandledRisks.map(r => ({
            id: r.id,
            title: r.title,
            type: r.type,
            stationName: r.stationName
          })),
          todayTasks: dueOrOverdueTasks.map(t => ({
            id: t.id,
            name: t.name,
            status: t.status,
            stationName: t.stationName
          })),
          metrics: {
            cloudRate: metrics.cloudRate,
            totalStations: metrics.cloudRate.totalStations
          }
        })
      });

      if (response.ok) {
        const resJson = await response.json();
        if (resJson.summary) {
          setSummaryData({
            ...resJson.summary,
            generatedAt: timeStr
          });
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('AI Summary fetch error, using local generator:', e);
    }

    // Default intelligent local summary
    const highRiskCount = myHighRiskTickets.length;
    const pendingCount = myPendingTickets.length;
    const riskCount = unhandledRisks.length;
    const taskCount = dueOrOverdueTasks.length;

    let overview = `您好，${userName}。当前华东全域 484 座储能电站运行稳定。`;
    if (highRiskCount > 0) {
      const urgentTicket = myHighRiskTickets[0];
      overview = `您好，${userName}。您今日有名下 ${pendingCount} 单待处理工单，其中「${urgentTicket.stationName}」工单（SLA 剩余 ${urgentTicket.slaRemainingHours.toFixed(1)}h）需优先处置；同时有 ${riskCount} 项新增预警与 ${taskCount} 项重点作业需推进。`;
    } else {
      overview = `您好，${userName}。您今日名下共有 ${pendingCount} 单待办工单、${riskCount} 项待研判风险与 ${taskCount} 项例行作业，当前无紧急超期风险，整体工作节奏可控。`;
    }

    const actions = [
      highRiskCount > 0 
        ? `优先处置【${myHighRiskTickets[0]?.stationName || '苏州工业园站'}】高风险工单，避免 SLA 履约超时`
        : `排查并受理【${myPendingTickets[0]?.stationName || '待办工单'}】的日常消缺进度`,
      riskCount > 0
        ? `研判【${unhandledRisks[0]?.stationName || '常州金坛站'}】的${unhandledRisks[0]?.title || '电池簇特征预警'}，确认是否转消缺工单`
        : `监控全域电站 SOC/SOH 波动趋势，防范潜在隐患`,
      dueOrOverdueTasks.some(t => t.status === '已超期')
        ? `督办已超期的【${dueOrOverdueTasks.find(t => t.status === '已超期')?.stationName || '临港重载站'}】巡检消缺作业`
        : `核查今日计划执行的储能舱例行维保打卡记录`
    ];

    setSummaryData({
      overview,
      actions,
      tip: '今日华东区域储能资产综合可利用率 99.4%，放电计划执行率 100%。',
      generatedAt: timeStr
    });
    setLoading(false);
  }, [userName, userRole, myPendingTickets, myHighRiskTickets, unhandledRisks, dueOrOverdueTasks, metrics]);

  // Trigger on initial mount
  useEffect(() => {
    generateSummary();
  }, []);

  // Smooth typewriter effect for overview text
  useEffect(() => {
    if (!summaryData?.overview || loading) return;

    if (typingIndex < summaryData.overview.length) {
      const timer = setTimeout(() => {
        setDisplayedText(summaryData.overview.slice(0, typingIndex + 1));
        setTypingIndex(prev => prev + 1);
      }, 12);
      return () => clearTimeout(timer);
    } else {
      setDisplayedText(summaryData.overview);
    }
  }, [summaryData, typingIndex, loading]);

  return (
    <div className="bg-white rounded-lg p-3.5 border border-[#E8E8E8] shadow-none">
      {/* 头部标题与重新生成 */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#F0F0F0]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#E6F7FF] text-[#1890FF] border border-[#91D5FF]/60">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-semibold text-[#1F1F1F]">
            AI 运维简报
          </span>
          <span className="text-xs text-[#8C8C8C]">
            {userRole} · {userName}
          </span>
          {summaryData?.generatedAt && (
            <span className="hidden sm:inline text-xs text-[#BFBFBF]">
              ({summaryData.generatedAt} 更新)
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={generateSummary}
          disabled={loading}
          className="inline-flex items-center gap-1 text-xs text-[#595959] hover:text-[#1890FF] transition-colors cursor-pointer disabled:opacity-50"
          title="点击重新生成 AI 工作简报"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-[#1890FF]' : ''}`} />
          <span>{loading ? '分析中...' : '重新生成'}</span>
        </button>
      </div>

      {/* 简报正文内容 */}
      {loading && !summaryData ? (
        <div className="py-4 flex items-center gap-3 text-xs text-[#8C8C8C]">
          <RefreshCw className="w-4 h-4 animate-spin text-[#1890FF]" />
          <span>AI 正在聚合全域工单、风险预警与今日作业数据，生成您的工作总结...</span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* 1. 总结概览 */}
          <div className="text-sm text-[#262626] leading-relaxed">
            {displayedText}
            {typingIndex < (summaryData?.overview.length || 0) && (
              <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-[#1890FF] animate-pulse align-middle" />
            )}
          </div>

          {/* 2. 今日行动建议 */}
          {summaryData?.actions && summaryData.actions.length > 0 && (
            <div className="pt-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {summaryData.actions.map((act, idx) => {
                  let icon = <CheckCircle2 className="w-3.5 h-3.5 text-[#1890FF] shrink-0 mt-0.5" />;
                  let linkTarget: ActiveView = 'page_ticket_center';
                  let linkText = '工单';

                  if (idx === 0) {
                    icon = <AlertCircle className="w-3.5 h-3.5 text-[#F5222D] shrink-0 mt-0.5" />;
                    linkTarget = 'page_ticket_center';
                    linkText = '去工单';
                  } else if (idx === 1) {
                    icon = <Clock className="w-3.5 h-3.5 text-[#FA8C16] shrink-0 mt-0.5" />;
                    linkTarget = 'page_risk_center';
                    linkText = '查风险';
                  } else {
                    icon = <CheckCircle2 className="w-3.5 h-3.5 text-[#52C41A] shrink-0 mt-0.5" />;
                    linkTarget = 'page_task_center';
                    linkText = '看作业';
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => onNavigate(linkTarget)}
                      className="flex items-start justify-between gap-2 p-2 rounded bg-[#FAFAFA] border border-[#E8E8E8] hover:border-[#1890FF] hover:bg-white transition-all cursor-pointer group text-xs text-[#595959]"
                    >
                      <div className="flex items-start gap-1.5 min-w-0">
                        {icon}
                        <span className="text-[#262626] leading-snug line-clamp-2">{act}</span>
                      </div>
                      <span className="text-[#1890FF] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
