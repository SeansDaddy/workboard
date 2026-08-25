import React from 'react';
import { 
  TicketItem, 
  CONFIG_THRESHOLDS 
} from '../../types';
import { TicketModule } from '../modules/TicketModule';
import { 
  Ticket, 
  ArrowLeft, 
  Sparkles, 
  ExternalLink,
  Clock,
  Flame,
  ShieldCheck
} from 'lucide-react';

interface TicketCenterPageProps {
  tickets: TicketItem[];
  onReturnToWorkbench: () => void;
  onOpenTicketProcess: (ticket: TicketItem) => void;
  onOpenTicketDetail: (ticket: TicketItem) => void;
  onJumpToRisk?: (riskId: string) => void;
  initialFilter?: string;
}

export const TicketCenterPage: React.FC<TicketCenterPageProps> = ({
  tickets,
  onReturnToWorkbench,
  onOpenTicketProcess,
  onOpenTicketDetail,
  onJumpToRisk,
  initialFilter = 'all'
}) => {
  const pendingCount = tickets.filter(t => t.status !== '已完成').length;
  const highRiskCount = tickets.filter(t => t.priority === '高' || t.riskScore >= CONFIG_THRESHOLDS.HIGH_RISK_SCORE_MIN).length;
  const urgentCount = tickets.filter(t => t.slaRemainingHours < CONFIG_THRESHOLDS.SLA_URGENT_HOURS).length;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 顶部面包屑与标题栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded border border-[#E8E8E8]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReturnToWorkbench}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-[#D9D9D9] text-[#595959] hover:text-[#1890FF] hover:border-[#1890FF] text-xs font-medium cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#8C8C8C]" />
            <span>返回工作台</span>
          </button>
          <div className="h-4 w-px bg-[#E8E8E8]" />
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[#E6F7FF] text-[#1890FF] border border-[#91D5FF]">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-[#1F1F1F]">工单中心 · pcare 外部工单协同与全生命周期流转</h1>
                <span className="text-[10px] text-[#1890FF] bg-[#E6F7FF] px-1.5 py-0.2 rounded border border-[#91D5FF] font-medium">
                  数据源: pcare
                </span>
              </div>
              <p className="text-[11px] text-[#8C8C8C]">
                承载从工单派发、现场接单签到、挂起申请、备件申领到消缺验收的完整业务流程，支持 SLA 倒计时精准管控
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-[#595959]">
            <span className="w-2 h-2 rounded-full bg-[#1890FF]" />
            <span>待处理: <strong className="text-[#1F1F1F] font-semibold">{pendingCount}</strong> 单</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#595959]">
            <span className="w-2 h-2 rounded-full bg-[#F5222D]" />
            <span>高风险/超时: <strong className="text-[#F5222D] font-semibold">{urgentCount}</strong> 单</span>
          </div>
        </div>
      </div>

      {/* 完整工单中心模块 */}
      <div className="w-full">
        <TicketModule
          tickets={tickets}
          onOpenTicketProcess={onOpenTicketProcess}
          onOpenTicketDetail={onOpenTicketDetail}
          onJumpToRisk={onJumpToRisk}
          initialFilter={initialFilter}
        />
      </div>
    </div>
  );
};
