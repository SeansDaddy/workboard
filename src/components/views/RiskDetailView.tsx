import React, { useState } from 'react';
import { RiskItem, CONFIG_THRESHOLDS } from '../../types';
import { RiskTypeBadge, RiskStatusBadge, PriorityBadge, RiskScoreBadge } from '../common/Badges';
import { 
  ArrowLeft, 
  ShieldAlert, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  PlusCircle, 
  FileText, 
  ExternalLink,
  Cpu,
  Activity,
  Layers,
  SearchCheck
} from 'lucide-react';

interface RiskDetailViewProps {
  risk: RiskItem;
  onBack: () => void;
  onConvertToTicket: (risk: RiskItem) => void;
  onJumpToTicket?: (ticketId: string) => void;
}

export const RiskDetailView: React.FC<RiskDetailViewProps> = ({
  risk,
  onBack,
  onConvertToTicket,
  onJumpToTicket
}) => {
  const isWarning = risk.type === '预警';
  const isConverted = risk.status === '已转工单';

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-12">
      {/* 顶部导航 */}
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
            <Sparkles className="w-3.5 h-3.5 text-[#FAAD14]" />
            主动运维平台 · 算法预测分析引擎详报
          </span>
        </div>
      </div>

      {/* 风险详报主卡 */}
      <div className="bg-white rounded border border-[#E8E8E8] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#FAFAFA] border-b border-[#E8E8E8] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-medium text-[#1F1F1F] text-sm bg-white px-2 py-0.5 rounded border border-[#D9D9D9]">
                {risk.id}
              </span>
              <RiskTypeBadge type={risk.type} />
              <PriorityBadge priority={risk.priority} />
              <RiskScoreBadge score={risk.riskScore} />
              <RiskStatusBadge status={risk.status} linkedTicketId={risk.linkedTicketId} />
            </div>
            <h1 className="text-base font-semibold text-[#1F1F1F] leading-tight">
              {risk.title}
            </h1>
          </div>

          {/* Action button */}
          <div className="shrink-0">
            {risk.status === '待处理' ? (
              <button
                type="button"
                onClick={() => onConvertToTicket(risk)}
                className="px-4 py-2 bg-[#FA8C16] hover:bg-[#FFA940] text-white rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>转为 pcare 工单派发</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => risk.linkedTicketId && onJumpToTicket?.(risk.linkedTicketId)}
                className="px-4 py-2 bg-[#F6FFED] hover:bg-[#D9F7BE] text-[#52C41A] border border-[#B7EB8F] rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#52C41A]" />
                <span>查看关联工单 ({risk.linkedTicketId})</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 左侧两列 */}
          <div className="md:col-span-2 space-y-4">
            {/* 基础信息 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-[#FAFAFA] rounded border border-[#E8E8E8] text-xs">
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">关联电站</span>
                <span className="font-medium text-[#1F1F1F]">{risk.stationName}</span>
              </div>
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">所属区域</span>
                <span className="text-[#595959]">{risk.region}区域</span>
              </div>
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">风险类别</span>
                <span className="font-medium text-[#1F1F1F]">{risk.category}</span>
              </div>
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">算法置信度</span>
                <span className="font-medium text-[#722ED1]">{risk.confidence ?? 90}%</span>
              </div>
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">算法发现时间</span>
                <span className="text-[#595959]">{risk.discoveredAt}</span>
              </div>
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">区域责任人</span>
                <span className="font-medium text-[#1890FF]">{risk.assignee}</span>
              </div>
            </div>

            {/* 诊断详述 */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-medium text-[#1F1F1F] flex items-center gap-1.5">
                <SearchCheck className="w-3.5 h-3.5 text-[#FA8C16]" />
                预测诊断详述与物理成因分析
              </h3>
              <div className="p-3 rounded bg-[#FAFAFA] border border-[#E8E8E8] text-xs text-[#595959] leading-relaxed">
                {risk.symptomDetail}
              </div>
            </div>

            {/* 量化证据链卡片 */}
            {risk.evidence && (
              <div className="space-y-2 bg-[#FFFBE6]/50 p-3.5 rounded border border-[#FFE58F]">
                <h3 className="text-xs font-medium text-[#D48806] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#FAAD14]" />
                  时序量化证据链 (AI Model Telemetry)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
                  <div className="bg-white p-2.5 rounded border border-[#FFE58F]/80">
                    <span className="text-[#8C8C8C] block text-[11px]">监测特征指标</span>
                    <span className="font-medium text-[#1F1F1F]">{risk.evidence.metric}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-[#FFE58F]/80">
                    <span className="text-[#8C8C8C] block text-[11px]">实测极值</span>
                    <span className="font-bold text-[#F5222D] text-sm">{risk.evidence.value}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-[#FFE58F]/80">
                    <span className="text-[#8C8C8C] block text-[11px]">安全临界阈值</span>
                    <span className="font-medium text-[#595959]">{risk.evidence.threshold}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-[#FFE58F]/80">
                    <span className="text-[#8C8C8C] block text-[11px]">时序劣化趋势</span>
                    <span className="font-medium text-[#D46B08]">{risk.evidence.trend}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 预测价值验证机制说明 */}
            <div className="p-3 rounded bg-[#E6F7FF]/60 border border-[#91D5FF] text-xs text-[#0050B3] space-y-1">
              <span className="font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#1890FF]" />
                主动预警可追溯性与闭环验证
              </span>
              <p className="text-[11px] text-[#096DD9] leading-relaxed">
                主动运维平台通过时序模型提前捕获潜伏隐患。生成工单后，风险单将与现场工单维持双向互通，并在现场消缺复测后闭环验证模型预测准确率。
              </p>
            </div>
          </div>

          {/* 右侧：专家处置建议与模型参数 */}
          <div className="space-y-4 bg-[#FAFAFA] p-4 rounded border border-[#E8E8E8] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="border-b border-[#E8E8E8] pb-2">
                <h3 className="text-xs font-medium text-[#1F1F1F] flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#FA8C16]" />
                  智能处置推荐策略
                </h3>
                <p className="text-[11px] text-[#8C8C8C]">基于近 500 座储能站运维专家库</p>
              </div>

              <div className="space-y-2 text-xs text-[#595959]">
                <div className="p-2.5 bg-white rounded border border-[#E8E8E8]">
                  <span className="font-medium text-[#1F1F1F] block mb-1">推荐处置步骤 1:</span>
                  <span>指派现场具备电工特种作业资质的工程师前往该站排查。</span>
                </div>
                <div className="p-2.5 bg-white rounded border border-[#E8E8E8]">
                  <span className="font-medium text-[#1F1F1F] block mb-1">推荐处置步骤 2:</span>
                  <span>使用热成像或绝缘摇表进行现场二次复核，定位异常单体或接头。</span>
                </div>
                <div className="p-2.5 bg-white rounded border border-[#E8E8E8]">
                  <span className="font-medium text-[#1F1F1F] block mb-1">推荐处置步骤 3:</span>
                  <span>在 pcare 工单中录入更换备件编号并提交验收归档。</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E8E8] space-y-2">
              {risk.status === '待处理' ? (
                <button
                  type="button"
                  onClick={() => onConvertToTicket(risk)}
                  className="w-full py-2.5 px-3 bg-[#FA8C16] hover:bg-[#FFA940] text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>一键转为 pcare 工单派发</span>
                </button>
              ) : (
                <div className="text-center p-2 rounded bg-[#F6FFED] text-[#52C41A] border border-[#B7EB8F] text-xs font-medium">
                  ✓ 已与工单 {risk.linkedTicketId} 建立双向互通
                </div>
              )}

              <button
                type="button"
                onClick={onBack}
                className="w-full py-1.5 text-center text-xs text-[#8C8C8C] hover:text-[#1890FF] cursor-pointer transition-colors"
              >
                ← 返回工作台
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
