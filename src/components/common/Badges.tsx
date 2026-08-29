import React from 'react';
import { 
  PriorityLevel, 
  TicketStatus, 
  RiskType, 
  RiskStatus, 
  TaskStatus,
  CONFIG_THRESHOLDS 
} from '../../types';
import { AlertCircle, Clock, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

// 优先级徽章
export const PriorityBadge: React.FC<{ priority: PriorityLevel }> = ({ priority }) => {
  if (priority === '高') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[11px] font-semibold bg-[#FFF1F0] text-[#F5222D] border border-[#FFA39E]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F5222D]" />
        高
      </span>
    );
  }
  if (priority === '中') {
    return (
      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[11px] font-medium bg-[#FFF7E6] text-[#FA8C16] border border-[#FFD591]">
        中
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[11px] font-medium bg-[#F5F5F5] text-[#8C8C8C] border border-[#E8E8E8]">
      低
    </span>
  );
};

// 风险分徽章 (0-100)
export const RiskScoreBadge: React.FC<{ score: number; showBar?: boolean }> = ({ score, showBar = true }) => {
  const isHigh = score >= CONFIG_THRESHOLDS.HIGH_RISK_SCORE_MIN;
  const isMedium = score >= 60 && score < CONFIG_THRESHOLDS.HIGH_RISK_SCORE_MIN;

  let colorClass = 'text-[#52C41A] bg-[#F6FFED] border-[#B7EB8F]';
  let barColor = 'bg-[#52C41A]';

  if (isHigh) {
    colorClass = 'text-[#F5222D] bg-[#FFF1F0] border-[#FFA39E] font-semibold';
    barColor = 'bg-[#F5222D]';
  } else if (isMedium) {
    colorClass = 'text-[#FA8C16] bg-[#FFF7E6] border-[#FFD591] font-medium';
    barColor = 'bg-[#FA8C16]';
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[11px] border tabular-nums ${colorClass}`}>
        {score}分
      </span>
      {showBar && (
        <div className="w-8 h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
          <div className={`h-full ${barColor}`} style={{ width: `${score}%` }} />
        </div>
      )}
    </div>
  );
};

// SLA 剩余时限徽章 (<4h 橙色，已超时深红)
export const SlaBadge: React.FC<{ remainingHours: number; deadline?: string }> = ({ remainingHours }) => {
  if (remainingHours <= CONFIG_THRESHOLDS.SLA_EXPIRED_HOURS) {
    const overdueHrs = Math.abs(remainingHours).toFixed(1);
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[11px] font-bold bg-[#F5222D] text-white">
        <AlertTriangle className="w-3 h-3" />
        已超时 {overdueHrs}h
      </span>
    );
  }

  if (remainingHours < CONFIG_THRESHOLDS.SLA_URGENT_HOURS) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-[#FFF7E6] text-[#D46B08] border border-[#FFD591]">
        <Clock className="w-3 h-3 text-[#FA8C16]" />
        余 {remainingHours.toFixed(1)}h
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-[#595959] bg-[#F5F5F5] border border-[#E8E8E8] tabular-nums">
      <Clock className="w-3 h-3 text-[#8C8C8C]" />
      余 {remainingHours.toFixed(1)}h
    </span>
  );
};

// 工单状态徽章
export const TicketStatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  switch (status) {
    case '待受理':
      return <span className="px-1.5 py-0.2 rounded text-[11px] font-medium bg-[#E6F7FF] text-[#1890FF] border border-[#91D5FF]">待受理</span>;
    case '处理中':
      return <span className="px-1.5 py-0.2 rounded text-[11px] font-medium bg-[#F0F5FF] text-[#2F54EB] border border-[#ADC6FF]">处理中</span>;
    case '挂起中':
      return <span className="px-1.5 py-0.2 rounded text-[11px] font-medium bg-[#FFFBE6] text-[#FAAD14] border border-[#FFE58F]">挂起中</span>;
    case '待验收':
      return <span className="px-1.5 py-0.2 rounded text-[11px] font-medium bg-[#E6FFFB] text-[#13C2C2] border border-[#87E8DE]">待验收</span>;
    case '已完成':
      return <span className="px-1.5 py-0.2 rounded text-[11px] font-medium bg-[#F6FFED] text-[#52C41A] border border-[#B7EB8F]">已完成</span>;
    default:
      return <span className="px-1.5 py-0.2 rounded text-[11px] bg-[#F5F5F5] text-[#595959]">{status}</span>;
  }
};

// 风险类型徽章
export const RiskTypeBadge: React.FC<{ type: RiskType }> = ({ type }) => {
  if (type === '预警') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-[#FFF7E6] text-[#D46B08] border border-[#FFD591]">
        <Sparkles className="w-3 h-3 text-[#FA8C16]" />
        预警
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-[#FFF1F0] text-[#CF1322] border border-[#FFA39E]">
      <AlertCircle className="w-3 h-3 text-[#F5222D]" />
      告警
    </span>
  );
};

// 风险状态徽章
export const RiskStatusBadge: React.FC<{ 
  status: RiskStatus; 
  linkedTicketId?: string;
  onJumpToTicket?: (ticketId: string) => void;
}> = ({ status, linkedTicketId, onJumpToTicket }) => {
  if (status === '已转工单') {
    return (
      <div className="inline-flex items-center gap-1">
        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[11px] font-medium bg-[#F6FFED] text-[#389E0D] border border-[#B7EB8F]">
          <CheckCircle2 className="w-3 h-3 text-[#52C41A]" />
          已生成工单
        </span>
        {linkedTicketId && onJumpToTicket && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onJumpToTicket(linkedTicketId);
            }}
            className="text-[11px] text-[#1890FF] hover:underline font-mono bg-[#E6F7FF] px-1 py-0.2 rounded border border-[#91D5FF] cursor-pointer"
            title="点击跳转查看关联工单"
          >
            {linkedTicketId} →
          </button>
        )}
      </div>
    );
  }
  if (status === '待处理') {
    return (
      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[11px] font-medium bg-[#FFF7E6] text-[#FA8C16] border border-[#FFD591]">
        待处理
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[11px] bg-[#F5F5F5] text-[#595959] border border-[#E8E8E8]">
      {status}
    </span>
  );
};

// 作业状态徽章
export const TaskStatusBadge: React.FC<{ status: TaskStatus; overdueHours?: number }> = ({ status, overdueHours }) => {
  if (status === '已超期') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded text-[11px] font-bold bg-[#F5222D] text-white">
        <ShieldAlert className="w-3 h-3" />
        已超期 {overdueHours ? `${overdueHours}h` : ''}
      </span>
    );
  }
  if (status === '执行中') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[11px] font-medium bg-[#E6F7FF] text-[#1890FF] border border-[#91D5FF]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1890FF]" />
        执行中
      </span>
    );
  }
  if (status === '已完成') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[11px] font-medium bg-[#F6FFED] text-[#52C41A] border border-[#B7EB8F]">
        <CheckCircle2 className="w-3 h-3 text-[#52C41A]" />
        已完成
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[11px] font-medium bg-[#F5F5F5] text-[#8C8C8C] border border-[#E8E8E8]">
      待执行
    </span>
  );
};
