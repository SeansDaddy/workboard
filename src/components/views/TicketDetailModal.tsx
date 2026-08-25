import React from 'react';
import { TicketItem } from '../../types';
import { PriorityBadge, RiskScoreBadge, SlaBadge, TicketStatusBadge } from '../common/Badges';
import { 
  X, 
  Ticket, 
  Building2, 
  Clock, 
  Sparkles, 
  ArrowUpRight, 
  History,
  FileText,
  ExternalLink
} from 'lucide-react';

interface TicketDetailModalProps {
  ticket: TicketItem | null;
  onClose: () => void;
  onGoToProcess: (ticket: TicketItem) => void;
  onJumpToRisk?: (riskId: string) => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  onClose,
  onGoToProcess,
  onJumpToRisk
}) => {
  if (!ticket) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-lg shadow-xl border border-[#E8E8E8] w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#FAFAFA] border-b border-[#E8E8E8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#1890FF]" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[#1F1F1F]">工单详情查看</h2>
                <span className="font-mono text-xs text-[#1890FF] bg-[#E6F7FF] px-1.5 py-0.2 rounded border border-[#91D5FF] font-medium">
                  {ticket.id}
                </span>
              </div>
              <p className="text-[11px] text-[#8C8C8C]">数据源: pcare 外部工单系统</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#8C8C8C] hover:text-[#262626] hover:bg-[#F0F0F0] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#595959]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <TicketStatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <RiskScoreBadge score={ticket.riskScore} />
              <SlaBadge remainingHours={ticket.slaRemainingHours} deadline={ticket.slaDeadline} />
            </div>
            <h1 className="text-sm font-semibold text-[#1F1F1F] mt-1">
              {ticket.title}
            </h1>
          </div>

          {/* Key metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 bg-[#FAFAFA] rounded border border-[#E8E8E8]">
            <div>
              <span className="text-[#8C8C8C] block text-[11px]">关联电站</span>
              <span className="font-medium text-[#1F1F1F]">{ticket.stationName}</span>
            </div>
            <div>
              <span className="text-[#8C8C8C] block text-[11px]">所属区域</span>
              <span className="text-[#595959]">{ticket.region}区域</span>
            </div>
            <div>
              <span className="text-[#8C8C8C] block text-[11px]">设备点位</span>
              <span className="font-mono text-[#262626]">{ticket.deviceCode ?? '未指定具体回路'}</span>
            </div>
            <div>
              <span className="text-[#8C8C8C] block text-[11px]">责任人</span>
              <span className="font-medium text-[#1890FF]">{ticket.assignee}</span>
            </div>
            <div>
              <span className="text-[#8C8C8C] block text-[11px]">创建时间</span>
              <span className="text-[#595959]">{ticket.createdAt}</span>
            </div>
            <div>
              <span className="text-[#8C8C8C] block text-[11px]">SLA承诺截止</span>
              <span className="text-[#262626] font-medium">{ticket.slaDeadline}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <span className="font-medium text-[#1F1F1F] flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#1890FF]" />
              故障现象详述
            </span>
            <p className="p-2.5 bg-[#FAFAFA] rounded border border-[#E8E8E8] leading-relaxed text-[#595959]">
              {ticket.description}
            </p>
          </div>

          {/* Suggested Action */}
          <div className="space-y-1 bg-[#E6F7FF]/50 p-3 rounded border border-[#91D5FF]">
            <span className="font-medium text-[#0050B3] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#1890FF]" />
              专家诊断处置建议
            </span>
            <p className="text-[#096DD9] leading-relaxed">
              {ticket.suggestedAction}
            </p>
          </div>

          {/* Linked Risk */}
          {ticket.linkedRiskId && (
            <div className="p-2.5 bg-[#F9F0FF] rounded border border-[#D3ADF7] flex items-center justify-between">
              <div>
                <span className="font-medium text-[#531DAB] block">关联主动预测风险</span>
                <span className="text-[11px] text-[#722ED1] font-mono">单号: {ticket.linkedRiskId}</span>
              </div>
              {onJumpToRisk && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onJumpToRisk(ticket.linkedRiskId!);
                  }}
                  className="px-2.5 py-1 bg-white text-[#722ED1] hover:bg-[#F9F0FF] rounded border border-[#D3ADF7] font-medium text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>溯源风险</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#FAFAFA] border-t border-[#E8E8E8] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded border border-[#D9D9D9] text-[#595959] hover:bg-[#F5F5F5] text-xs font-medium cursor-pointer transition-colors"
          >
            关闭
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onGoToProcess(ticket);
            }}
            className="px-4 py-1.5 rounded bg-[#1890FF] hover:bg-[#40A9FF] text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>去处理流程页面</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
