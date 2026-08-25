import React, { useState } from 'react';
import { TicketItem, CONFIG_THRESHOLDS } from '../../types';
import { PriorityBadge, RiskScoreBadge, SlaBadge, TicketStatusBadge } from '../common/Badges';
import { 
  ArrowLeft, 
  Ticket, 
  Building2, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  UserCheck, 
  History,
  ExternalLink,
  MessageSquare,
  Wrench
} from 'lucide-react';

interface TicketProcessViewProps {
  ticket: TicketItem;
  onBack: () => void;
  onUpdateStatus?: (ticketId: string, newStatus: TicketItem['status'], note: string) => void;
  onJumpToRisk?: (riskId: string) => void;
}

export const TicketProcessView: React.FC<TicketProcessViewProps> = ({
  ticket,
  onBack,
  onUpdateStatus,
  onJumpToRisk
}) => {
  const [handleNote, setHandleNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleAction = (status: TicketItem['status'], actionText: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      onUpdateStatus?.(ticket.id, status, handleNote || actionText);
      setIsProcessing(false);
      setStatusMessage(`已成功执行操作: 【${actionText}】，工单状态更新为「${status}」`);
      setHandleNote('');
    }, 400);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-12">
      {/* 顶部返回与占位提示栏 (5.1 规范) */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-[#D9D9D9] text-[#595959] hover:text-[#1890FF] hover:border-[#1890FF] text-xs font-medium cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#8C8C8C]" />
          <span>返回工作台</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-[#FFFBE6] border border-[#FFE58F] text-[#D48806] text-xs font-medium flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-[#FAAD14]" />
            演示占位 · 生产环境实际跳转 pcare 外部工单系统处理流程
          </span>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-[#F6FFED] border border-[#B7EB8F] rounded text-xs text-[#52C41A] flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#52C41A] shrink-0" />
            <span className="font-medium">{statusMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-[#52C41A] hover:underline text-xs cursor-pointer"
          >
            知道了
          </button>
        </div>
      )}

      {/* 工单主卡片 */}
      <div className="bg-white rounded border border-[#E8E8E8] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#FAFAFA] border-b border-[#E8E8E8] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-medium text-[#1F1F1F] text-sm bg-white px-2 py-0.5 rounded border border-[#D9D9D9]">
                {ticket.id}
              </span>
              <TicketStatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <RiskScoreBadge score={ticket.riskScore} />
              {ticket.linkedRiskId && (
                <span className="text-xs text-[#722ED1] bg-[#F9F0FF] px-2 py-0.5 rounded border border-[#D3ADF7] font-mono flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#722ED1]" />
                  由主动预测生成
                </span>
              )}
            </div>
            <h1 className="text-base font-semibold text-[#1F1F1F] leading-tight">
              {ticket.title}
            </h1>
          </div>

          <div className="flex items-center gap-3 bg-white p-2.5 rounded border border-[#E8E8E8] shrink-0">
            <Clock className="w-4 h-4 text-[#8C8C8C]" />
            <div className="text-right">
              <div className="text-[11px] text-[#8C8C8C]">SLA 倒计时</div>
              <SlaBadge remainingHours={ticket.slaRemainingHours} deadline={ticket.slaDeadline} />
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 左侧两列：详细信息 */}
          <div className="md:col-span-2 space-y-4">
            {/* 基础台账属性 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-[#FAFAFA] rounded border border-[#E8E8E8] text-xs">
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">关联电站</span>
                <span className="font-medium text-[#1F1F1F]">{ticket.stationName}</span>
              </div>
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">所属区域</span>
                <span className="text-[#595959]">{ticket.region}区域</span>
              </div>
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">设备/点位位号</span>
                <span className="font-mono text-[#1F1F1F] font-medium">{ticket.deviceCode ?? '全站通用'}</span>
              </div>
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">当前责任人</span>
                <span className="font-medium text-[#1890FF]">{ticket.assignee}</span>
              </div>
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">工单创建时间</span>
                <span className="text-[#595959]">{ticket.createdAt}</span>
              </div>
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">SLA 承诺截止</span>
                <span className="text-[#595959] font-medium">{ticket.slaDeadline}</span>
              </div>
            </div>

            {/* 故障现象描述 */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-medium text-[#1F1F1F] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#1890FF]" />
                故障现象与诊断特征
              </h3>
              <div className="p-3 rounded bg-[#FAFAFA] border border-[#E8E8E8] text-xs text-[#595959] leading-relaxed font-sans">
                {ticket.description}
              </div>
            </div>

            {/* 专家系统处置建议 */}
            <div className="space-y-1.5 bg-[#E6F7FF]/60 p-3.5 rounded border border-[#91D5FF]">
              <h3 className="text-xs font-medium text-[#0050B3] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#1890FF]" />
                主动运维专家库建议措施
              </h3>
              <p className="text-xs text-[#096DD9] leading-relaxed">
                {ticket.suggestedAction}
              </p>
            </div>

            {/* 关联风险双向溯源 */}
            {ticket.linkedRiskId && (
              <div className="p-3 rounded bg-[#F9F0FF] border border-[#D3ADF7] flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-medium text-[#531DAB]">关联主动运维平台预警源</span>
                  <p className="text-[11px] text-[#722ED1]">
                    该工单由预警单号 <span className="font-mono font-medium">{ticket.linkedRiskId}</span> 触发生成，支持双向追溯。
                  </p>
                </div>
                {onJumpToRisk && (
                  <button
                    type="button"
                    onClick={() => onJumpToRisk(ticket.linkedRiskId!)}
                    className="px-2.5 py-1 bg-white text-[#722ED1] hover:bg-[#F9F0FF] rounded border border-[#D3ADF7] font-medium text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>溯源预警详情</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* 处理流转历史日志 */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-medium text-[#1F1F1F] flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-[#8C8C8C]" />
                流转记录与操作日志
              </h3>
              <div className="space-y-2">
                {ticket.logs?.map((log, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-[#FAFAFA] border border-[#E8E8E8] text-xs flex items-start justify-between">
                    <div>
                      <div className="font-medium text-[#1F1F1F]">
                        {log.operator}: <span className="font-normal text-[#595959]">{log.action}</span>
                      </div>
                      {log.note && <p className="text-[11px] text-[#8C8C8C] mt-0.5">{log.note}</p>}
                    </div>
                    <span className="text-[11px] text-[#8C8C8C] tabular-nums shrink-0">{log.time}</span>
                  </div>
                )) ?? (
                  <div className="p-2.5 rounded bg-[#FAFAFA] border border-[#E8E8E8] text-xs text-[#8C8C8C]">
                    由主动运维平台自动派发至 pcare 流程引擎
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧一列：模拟 pcare 流程操作面板 */}
          <div className="space-y-4 bg-[#FAFAFA] p-4 rounded border border-[#E8E8E8] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="border-b border-[#E8E8E8] pb-2">
                <h3 className="text-xs font-medium text-[#1F1F1F] flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-[#1890FF]" />
                  pcare 工单处理面板
                </h3>
                <p className="text-[11px] text-[#8C8C8C]">模拟实际生产环境工单操作</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#595959] block">
                  处理意见 / 现场排查情况备注
                </label>
                <textarea
                  value={handleNote}
                  onChange={(e) => setHandleNote(e.target.value)}
                  placeholder="录入现场排查结论、更换备件型号或消缺说明..."
                  rows={4}
                  className="w-full p-2.5 text-xs rounded bg-white border border-[#D9D9D9] text-[#262626] focus:outline-hidden focus:border-[#1890FF] focus:ring-1 focus:ring-[#1890FF] resize-none placeholder:text-[#BFBFBF]"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {ticket.status === '待受理' && (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleAction('处理中', '接单受理并安排工程师到站')}
                    className="w-full py-2 px-3 bg-[#1890FF] hover:bg-[#40A9FF] text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>接单受理 (转为处理中)</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleAction('处理中', '派发现场抢修班组并更新进度')}
                  className="w-full py-2 px-3 bg-white hover:bg-[#F5F5F5] text-[#595959] border border-[#D9D9D9] rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[#8C8C8C]" />
                  <span>派发现场班组 / 记录进度</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleAction('挂起中', '等待厂家备件或调度停电窗口审批')}
                  className="w-full py-2 px-3 bg-[#FFFBE6] hover:bg-[#FFF1B8] text-[#D48806] border border-[#FFE58F] rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-[#FAAD14]" />
                  <span>申请挂起 (等备件/等停电)</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleAction('已完成', '消缺排查完毕，现场复测各项电气指标合格，闭环归档')}
                  className="w-full py-2 px-3 bg-[#52C41A] hover:bg-[#73D13D] text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>现场消缺完毕 · 验收归档</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E8E8]">
              <button
                type="button"
                onClick={onBack}
                className="w-full py-1.5 text-center text-xs text-[#8C8C8C] hover:text-[#1890FF] cursor-pointer transition-colors"
              >
                ← 取消并返回工作台
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
