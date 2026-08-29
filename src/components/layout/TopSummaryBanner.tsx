import React from 'react';
import { 
  Inbox, 
  ShieldAlert, 
  CheckSquare, 
  CheckCircle2, 
  ArrowUpRight
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
      {/* 1. 待处理工单 */}
      <div 
        onClick={() => onFilterTickets?.('mine_high_risk')}
        className="bg-white rounded-lg p-3.5 border border-[#E8E8E8] shadow-none hover:border-[#1890FF] transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-xs text-[#8C8C8C] mb-1">
          <span className="flex items-center gap-1.5 font-medium text-[#595959]">
            <Inbox className="w-3.5 h-3.5 text-[#1890FF]" />
            待我处理工单
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#1890FF]" />
        </div>

        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-bold text-[#1F1F1F] font-mono">
            {myPendingTicketsCount}
          </span>
          <span className="text-xs text-[#8C8C8C]">单</span>
        </div>

        <div className="mt-2.5 flex items-center gap-2">
          {myHighRiskTicketsCount > 0 ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-[#F5222D] bg-[#FFF1F0] font-medium border border-[#FFA39E]/60">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5222D]" />
              高风险 {myHighRiskTicketsCount}
            </span>
          ) : (
            <span className="text-xs text-[#8C8C8C]">暂无高风险</span>
          )}
        </div>
      </div>

      {/* 2. 待处理风险 */}
      <div 
        onClick={() => onFilterRisks?.('unhandled_warning')}
        className="bg-white rounded-lg p-3.5 border border-[#E8E8E8] shadow-none hover:border-[#1890FF] transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-xs text-[#8C8C8C] mb-1">
          <span className="flex items-center gap-1.5 font-medium text-[#595959]">
            <ShieldAlert className="w-3.5 h-3.5 text-[#FA8C16]" />
            未处置风险
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#1890FF]" />
        </div>

        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-bold text-[#1F1F1F] font-mono">
            {unhandledRiskCount}
          </span>
          <span className="text-xs text-[#8C8C8C]">项</span>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#595959]">
          <span className="px-1.5 py-0.5 rounded bg-[#F5F5F5] border border-[#E8E8E8]">
            预警 {unhandledWarningsCount}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[#F5F5F5] border border-[#E8E8E8]">
            告警 {unhandledAlarmsCount}
          </span>
        </div>
      </div>

      {/* 3. 今日到期作业 */}
      <div 
        onClick={() => onFilterTasks?.('overdue_or_today')}
        className="bg-white rounded-lg p-3.5 border border-[#E8E8E8] shadow-none hover:border-[#1890FF] transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-xs text-[#8C8C8C] mb-1">
          <span className="flex items-center gap-1.5 font-medium text-[#595959]">
            <CheckSquare className="w-3.5 h-3.5 text-[#595959]" />
            今日到期作业
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#1890FF]" />
        </div>

        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-bold text-[#1F1F1F] font-mono">
            {todayDueTasksCount}
          </span>
          <span className="text-xs text-[#8C8C8C]">项</span>
        </div>

        <div className="mt-2.5 flex items-center gap-2">
          {overdueTasksCount > 0 ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-[#F5222D] bg-[#FFF1F0] font-medium border border-[#FFA39E]/60">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5222D]" />
              超期 {overdueTasksCount}
            </span>
          ) : (
            <span className="text-xs text-[#52C41A] font-medium">按期进行中</span>
          )}
        </div>
      </div>

      {/* 4. 本月已闭环 */}
      <div 
        onClick={() => onFilterTickets?.('closed')}
        className="bg-white rounded-lg p-3.5 border border-[#E8E8E8] shadow-none hover:border-[#1890FF] transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-xs text-[#8C8C8C] mb-1">
          <span className="flex items-center gap-1.5 font-medium text-[#595959]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#52C41A]" />
            本月已闭环
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#1890FF]" />
        </div>

        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-bold text-[#1F1F1F] font-mono">
            {myCompletedTicketsCount}
          </span>
          <span className="text-xs text-[#8C8C8C]">单</span>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#595959]">
          <span className="text-[#8C8C8C]">履约率</span>
          <span className="font-semibold text-[#52C41A]">{slaComplianceRate}%</span>
        </div>
      </div>
    </div>
  );
};
