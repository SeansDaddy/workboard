import React from 'react';
import { 
  Inbox, 
  ShieldAlert, 
  CheckSquare, 
  CheckCircle2, 
  ArrowUpRight, 
  AlertTriangle, 
  Sparkles,
  Award
} from 'lucide-react';

interface TopSummaryBannerProps {
  myPendingTicketsCount: number;
  myHighRiskTicketsCount: number;
  unhandledRiskCount: number;
  unhandledWarningsCount: number;
  unhandledAlarmsCount: number;
  todayDueTasksCount: number;
  overdueTasksCount: number;
  myCompletedTicketsCount?: number;
  slaComplianceRate?: number;
  onFilterTickets?: (filter: string) => void;
  onFilterRisks?: (filter: string) => void;
  onFilterTasks?: (filter: string) => void;
}

export const TopSummaryBanner: React.FC<TopSummaryBannerProps> = ({
  myPendingTicketsCount,
  myHighRiskTicketsCount,
  unhandledRiskCount,
  unhandledWarningsCount,
  unhandledAlarmsCount,
  todayDueTasksCount,
  overdueTasksCount,
  myCompletedTicketsCount = 18,
  slaComplianceRate = 97.8,
  onFilterTickets,
  onFilterRisks,
  onFilterTasks
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. 待我处理 */}
      <div 
        onClick={() => onFilterTickets?.('mine_high_risk')}
        className="bg-white rounded-lg p-3.5 border border-[#E8E8E8] shadow-none hover:border-[#1890FF] transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-[#8C8C8C] flex items-center gap-1.5">
            <Inbox className="w-3.5 h-3.5 text-[#1890FF]" />
            待我处理工单
          </span>
          <span className="text-[11px] text-[#1890FF] font-medium group-hover:underline flex items-center">
            查看 <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-[#1F1F1F] tracking-tight">
            {myPendingTicketsCount}
          </span>
          <span className="text-xs text-[#8C8C8C]">件在办</span>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[11px] font-semibold bg-[#FFF1F0] text-[#F5222D] border border-[#FFA39E]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5222D]" />
            高风险 {myHighRiskTicketsCount} 件
          </span>
          <span className="text-[11px] text-[#8C8C8C]">优先处理</span>
        </div>
      </div>

      {/* 2. 未处理风险 */}
      <div 
        onClick={() => onFilterRisks?.('unhandled_warning')}
        className="bg-white rounded-lg p-3.5 border border-[#E8E8E8] shadow-none hover:border-[#FA8C16] transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-[#8C8C8C] flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-[#FA8C16]" />
            未处理风险
          </span>
          <span className="text-[11px] text-[#FA8C16] font-medium group-hover:underline flex items-center">
            溯源 <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-[#1F1F1F] tracking-tight">
            {unhandledRiskCount}
          </span>
          <span className="text-xs text-[#8C8C8C]">项待介入</span>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D46B08] bg-[#FFF7E6] px-1.5 py-0.2 rounded border border-[#FFD591]">
            <Sparkles className="w-3 h-3 text-[#FA8C16]" />
            预警 {unhandledWarningsCount}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#CF1322] bg-[#FFF1F0] px-1.5 py-0.2 rounded border border-[#FFA39E]">
            <AlertTriangle className="w-3 h-3 text-[#F5222D]" />
            告警 {unhandledAlarmsCount}
          </span>
        </div>
      </div>

      {/* 3. 今日到期作业 */}
      <div 
        onClick={() => onFilterTasks?.('overdue_or_today')}
        className="bg-white rounded-lg p-3.5 border border-[#E8E8E8] shadow-none hover:border-[#F5222D] transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-[#8C8C8C] flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-[#722ED1]" />
            今日到期例行作业
          </span>
          <span className="text-[11px] text-[#722ED1] font-medium group-hover:underline flex items-center">
            消缺 <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-[#1F1F1F] tracking-tight">
            {todayDueTasksCount}
          </span>
          <span className="text-xs text-[#8C8C8C]">项待执行</span>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5">
          {overdueTasksCount > 0 ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[11px] font-bold bg-[#F5222D] text-white">
              <AlertTriangle className="w-3 h-3" />
              已超期 {overdueTasksCount} 项
            </span>
          ) : (
            <span className="text-[11px] text-[#52C41A] font-medium">
              无超期作业，执行正常
            </span>
          )}
        </div>
      </div>

      {/* 4. 本月消缺闭环与SLA履约 (责任人工作绩效) */}
      <div 
        onClick={() => onFilterTickets?.('closed')}
        className="bg-white rounded-lg p-3.5 border border-[#E8E8E8] shadow-none hover:border-[#52C41A] transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-[#8C8C8C] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#52C41A]" />
            本月消缺闭环
          </span>
          <span className="text-[11px] text-[#52C41A] font-medium group-hover:underline flex items-center">
            详情 <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-[#1F1F1F] tracking-tight">
            {myCompletedTicketsCount}
          </span>
          <span className="text-xs text-[#8C8C8C]">件已归档</span>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-xs">
          <span className="text-[#8C8C8C] text-[11px]">SLA 履约率:</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#389E0D] bg-[#F6FFED] px-1.5 py-0.2 rounded border border-[#B7EB8F]">
            <Award className="w-3 h-3" />
            {slaComplianceRate}% 优良
          </span>
        </div>
      </div>
    </div>
  );
};
