import React, { useState } from 'react';
import { TicketItem, CONFIG_THRESHOLDS } from '../../types';
import { PriorityBadge, RiskScoreBadge, SlaBadge, TicketStatusBadge } from '../common/Badges';
import { 
  X, 
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
  Wrench,
  ChevronRight,
  Maximize2
} from 'lucide-react';

interface TicketProcessDrawerProps {
  ticket: TicketItem | null;
  onClose: () => void;
  onUpdateStatus?: (ticketId: string, newStatus: TicketItem['status'], note: string) => void;
  onJumpToRisk?: (riskId: string) => void;
}

export const TicketProcessDrawer: React.FC<TicketProcessDrawerProps> = ({
  ticket,
  onClose,
  onUpdateStatus,
  onJumpToRisk
}) => {
  const [handleNote, setHandleNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!ticket) return null;

  const handleAction = (status: TicketItem['status'], actionText: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      onUpdateStatus?.(ticket.id, status, handleNote || actionText);
      setIsProcessing(false);
      setStatusMessage(`已成功执行操作: 【${actionText}】，工单状态已更新为「${status}」`);
      setHandleNote('');
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none animate-in fade-in duration-200">
      {/* 遮罩背景 */}
      <div 
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px] transition-opacity" 
        onClick={onClose} 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col border-l border-[#D9D9D9] animate-in slide-in-from-right duration-300">
          
          {/* 抽屉头部 */}
          <div className="px-5 py-4 border-b border-[#E8E8E8] bg-[#FAFAFA] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-blue-50 text-[#1890FF] border border-blue-100">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#1F1F1F]">{ticket.id}</span>
                  <TicketStatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                </div>
                <h3 className="text-sm font-semibold text-[#262626] truncate max-w-md mt-0.5" title={ticket.title}>
                  {ticket.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-[#8C8C8C] hover:text-[#262626] hover:bg-[#E8E8E8] rounded-md transition-colors cursor-pointer"
                title="收起抽屉"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 状态操作成功提醒 */}
          {statusMessage && (
            <div className="p-3 bg-[#F6FFED] border-b border-[#B7EB8F] text-xs text-[#52C41A] flex items-center justify-between animate-in fade-in duration-200 shrink-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#52C41A] shrink-0" />
                <span className="font-medium">{statusMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                className="text-[#52C41A] hover:underline text-xs cursor-pointer"
              >
                关闭提示
              </button>
            </div>
          )}

          {/* 抽屉滚动内容主体 */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            
            {/* 顶栏 SLA 预警与责任人信息 */}
            <div className="bg-[#FAFAFA] p-3.5 rounded-lg border border-[#E8E8E8] grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">电站站点</span>
                <span className="font-semibold text-[#1F1F1F] truncate block mt-0.5">{ticket.stationName}</span>
              </div>
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">当前责任人</span>
                <span className="font-semibold text-[#1890FF] block mt-0.5">{ticket.assignee}</span>
              </div>
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">SLA 剩余时效</span>
                <div className="mt-0.5">
                  <SlaBadge remainingHours={ticket.slaRemainingHours} deadline={ticket.slaDeadline} />
                </div>
              </div>
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">风险评分</span>
                <div className="mt-0.5">
                  <RiskScoreBadge score={ticket.riskScore} />
                </div>
              </div>
            </div>

            {/* 关联风险预警穿透 (双向联动) */}
            {ticket.linkedRiskId && (
              <div className="p-3 bg-[#FFF7E6] border border-[#FFD591] rounded-lg flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#FA8C16] shrink-0" />
                  <div>
                    <span className="font-semibold text-[#D46B08]">本工单由主动预警算法模型驱动生成</span>
                    <span className="text-[11px] text-[#8C8C8C] block">关联风险编号: {ticket.linkedRiskId}</span>
                  </div>
                </div>
                {onJumpToRisk && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onJumpToRisk(ticket.linkedRiskId!);
                    }}
                    className="px-2.5 py-1 bg-white border border-[#FA8C16] text-[#D46B08] hover:bg-[#FA8C16] hover:text-white rounded text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>查看诊断证据链</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* 异常现象与排查 SOP 指引 */}
            <div className="bg-white rounded-lg border border-[#E8E8E8] p-4 space-y-3">
              <div className="flex items-center gap-1.5 pb-2 border-b border-[#F0F0F0]">
                <FileText className="w-4 h-4 text-[#1890FF]" />
                <span className="font-semibold text-xs text-[#1F1F1F]">工单异常描述与现场 SOP 指引</span>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-[#8C8C8C] block text-[11px] mb-0.5">异常现象与时序特征</span>
                  <p className="text-[#262626] bg-[#F5F5F5] p-2.5 rounded border border-[#E8E8E8] leading-relaxed">
                    {ticket.description || '电池舱单体电芯压差持续扩大，且在倍率放电过程中温升梯度异常（ΔT > 4.2℃），触发一级过温预警与阻抗一致性劣变告警。'}
                  </p>
                </div>
                <div>
                  <span className="text-[#8C8C8C] block text-[11px] mb-0.5">AI 专家建议消缺动作</span>
                  <p className="text-[#0050B3] bg-[#E6F7FF] p-2.5 rounded border border-[#91D5FF] leading-relaxed">
                    {ticket.suggestedAction || '1. 现场断开该簇直流开关并进行绝缘耐压复测；2. 针对 03# 电池模块单体端子进行扭矩校验与红外点温复核；3. 更换采集线束并重新校准均衡状态。'}
                  </p>
                </div>
              </div>
            </div>

            {/* 处理操作交互区 */}
            <div className="bg-white rounded-lg border border-[#E8E8E8] p-4 space-y-3">
              <div className="flex items-center gap-1.5 pb-2 border-b border-[#F0F0F0]">
                <Wrench className="w-4 h-4 text-[#52C41A]" />
                <span className="font-semibold text-xs text-[#1F1F1F]">责任人处置操作与流程推进</span>
              </div>

              <div>
                <label className="text-[11px] text-[#595959] block mb-1 font-medium">
                  处置备注 / 排故进展记录:
                </label>
                <textarea
                  value={handleNote}
                  onChange={(e) => setHandleNote(e.target.value)}
                  placeholder="请输入现场消缺措施、更换备件编号或排故核验说明..."
                  className="w-full h-20 p-2.5 text-xs border border-[#D9D9D9] rounded-md focus:border-[#1890FF] focus:outline-hidden focus:ring-1 focus:ring-[#1890FF] resize-none"
                />
              </div>

              {/* 动作按钮网格 */}
              <div className="flex flex-wrap gap-2 pt-1">
                {ticket.status === '待受理' && (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleAction('处理中', '接单受理')}
                    className="flex-1 py-2 px-3 bg-[#1890FF] hover:bg-[#40A9FF] text-white rounded font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>接单受理 (进入处理中)</span>
                  </button>
                )}

                {ticket.status === '处理中' && (
                  <>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleAction('处理中', '追加现场排查记录')}
                      className="py-2 px-3 bg-[#FAFAFA] border border-[#D9D9D9] hover:border-[#1890FF] text-[#262626] rounded font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#1890FF]" />
                      <span>追加排故记录</span>
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleAction('已完成', '完成现场消缺并提交验收')}
                      className="flex-1 py-2 px-3 bg-[#52C41A] hover:bg-[#73D13D] text-white rounded font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>消缺完成 (提交闭环归档)</span>
                    </button>
                  </>
                )}

                {ticket.status === '已完成' && (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleAction('已完成', '复核遥测指标正常')}
                    className="flex-1 py-2 px-3 bg-[#52C41A] text-white rounded font-medium text-xs flex items-center justify-center gap-1.5 opacity-90 cursor-default"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>该工单已完成消缺闭环并复核归档</span>
                  </button>
                )}
              </div>
            </div>

            {/* 流转日志历史 */}
            <div className="bg-white rounded-lg border border-[#E8E8E8] p-4 space-y-3">
              <div className="flex items-center gap-1.5 pb-2 border-b border-[#F0F0F0]">
                <History className="w-4 h-4 text-[#8C8C8C]" />
                <span className="font-semibold text-xs text-[#1F1F1F]">工单生命周期流转记录</span>
              </div>
              <div className="space-y-3 relative pl-4 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8E8E8]">
                {ticket.logs && ticket.logs.length > 0 ? (
                  ticket.logs.map((log, index) => (
                    <div key={index} className="relative space-y-0.5">
                      <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-[#1890FF] ring-2 ring-white" />
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-[#262626]">{log.action}</span>
                        <span className="text-[#8C8C8C]">{log.time}</span>
                      </div>
                      <div className="text-[11px] text-[#595959] flex items-center gap-2">
                        <span>操作人: {log.operator}</span>
                        {log.note && <span className="text-[#8C8C8C]">（{log.note}）</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-[11px] text-[#8C8C8C]">
                    <span>创建于: {ticket.createdAt} 由系统算法主动下发</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* 抽屉底部操作栏 */}
          <div className="px-5 py-3 border-t border-[#E8E8E8] bg-[#FAFAFA] flex items-center justify-between shrink-0">
            <span className="text-[11px] text-[#8C8C8C]">
              pcare 协同工单 · 处理完成可一键收回抽屉
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 border border-[#D9D9D9] hover:bg-white text-[#595959] rounded text-xs font-medium cursor-pointer transition-colors"
              >
                收回抽屉
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
