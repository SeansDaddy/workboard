import React, { useState } from 'react';
import { QuickActionType } from '../layout/QuickAccessBar';
import { 
  X, 
  Stethoscope, 
  FileSpreadsheet, 
  Send, 
  Target, 
  CheckCircle, 
  Sparkles, 
  Download, 
  Check, 
  Search, 
  AlertTriangle,
  Zap,
  Bell
} from 'lucide-react';

interface QuickActionModalProps {
  actionType: QuickActionType | null;
  onClose: () => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  actionType,
  onClose
}) => {
  const [reportRange, setReportRange] = useState('week');
  const [isExporting, setIsExporting] = useState(false);
  const [pushChannel, setPushChannel] = useState<'sms' | 'dingtalk' | 'wechat'>('sms');
  const [pushSuccess, setPushSuccess] = useState(false);

  if (!actionType) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-lg shadow-xl border border-[#E8E8E8] w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-[#FAFAFA] border-b border-[#E8E8E8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {actionType === 'diagnose' && <Stethoscope className="w-5 h-5 text-[#1890FF]" />}
            {actionType === 'report' && <FileSpreadsheet className="w-5 h-5 text-[#52C41A]" />}
            {actionType === 'push' && <Send className="w-5 h-5 text-[#FA8C16]" />}
            {actionType === 'track' && <Target className="w-5 h-5 text-[#722ED1]" />}
            {actionType === 'closeout' && <CheckCircle className="w-5 h-5 text-[#13C2C2]" />}

            <div>
              <h2 className="text-sm font-semibold text-[#1F1F1F]">
                {actionType === 'diagnose' && '主动运维 · 电池与PCS故障微观智能诊断'}
                {actionType === 'report' && '区域运维运营报告一键生成与导出'}
                {actionType === 'push' && '高风险预警多通道精准推送策略'}
                {actionType === 'track' && '风险预警模型命中率与闭环时效复盘'}
                {actionType === 'closeout' && '现场工单闭环验收与消缺归档'}
              </h2>
              <p className="text-[11px] text-[#8C8C8C]">演示直达下钻功能交互面板</p>
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

        {/* Modal Body */}
        <div className="p-5 text-xs text-[#595959] space-y-4">
          {/* 1. 故障诊断 */}
          {actionType === 'diagnose' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#E6F7FF]/60 border border-[#91D5FF] rounded space-y-1">
                <span className="font-medium text-[#0050B3] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#1890FF]" />
                  已载入华东一区 484 座电站时序特征图谱
                </span>
                <p className="text-[11px] text-[#096DD9]">
                  当前重点推荐诊断：宿迁经开区 3#储能舱-12号电芯温差异动，建议开展内阻阻抗谱测试。
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-medium text-[#1F1F1F] block">选择诊断分析算法模型：</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded border border-[#1890FF] bg-[#E6F7FF]/40 cursor-pointer">
                    <div className="font-medium text-[#1F1F1F]">电芯热失控微短路早期预测</div>
                    <div className="text-[10px] text-[#8C8C8C] mt-0.5">置信度 94% · 基于电压温度多维散度</div>
                  </div>
                  <div className="p-2.5 rounded border border-[#E8E8E8] bg-[#FAFAFA] hover:bg-white cursor-pointer">
                    <div className="font-medium text-[#1F1F1F]">PCS IGBT 结温热阻劣化评估</div>
                    <div className="text-[10px] text-[#8C8C8C] mt-0.5">置信度 91% · 结温探针与载流拟合</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. 报告生成 */}
          {actionType === 'report' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-medium text-[#1F1F1F] block">报告统计周期</label>
                <div className="flex gap-2">
                  {[
                    { id: 'week', label: '本周运维简报 (2026-W34)' },
                    { id: 'month', label: '8月资产运营月度白皮书' },
                    { id: 'custom', label: '自定义时段' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setReportRange(tab.id)}
                      className={`px-3 py-1.5 rounded border text-xs cursor-pointer transition-colors ${
                        reportRange === tab.id
                          ? 'bg-[#F6FFED] border-[#52C41A] text-[#52C41A] font-medium'
                          : 'bg-[#FAFAFA] border-[#E8E8E8] text-[#595959]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#FAFAFA] rounded border border-[#E8E8E8] space-y-1">
                <div className="font-medium text-[#1F1F1F]">包含核心模块数据：</div>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-[#595959]">
                  <div>✓ 上云率 96.8% 与上电率 98.1%</div>
                  <div>✓ 近14天充放电双指标统计趋势</div>
                  <div>✓ 18项工单 SLA 履约与响应时效</div>
                  <div>✓ 12项高风险预警分析与复盘</div>
                </div>
              </div>
            </div>
          )}

          {/* 3. 风险推送 */}
          {actionType === 'push' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-medium text-[#1F1F1F] block">推送通道选择</label>
                <div className="flex gap-2">
                  {[
                    { id: 'sms', label: '现场应急短信' },
                    { id: 'dingtalk', label: '钉钉运维群机器人' },
                    { id: 'wechat', label: '企业微信工作通知' }
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setPushChannel(ch.id as any)}
                      className={`px-3 py-1.5 rounded border text-xs cursor-pointer transition-colors ${
                        pushChannel === ch.id
                          ? 'bg-[#FFF7E6] border-[#FA8C16] text-[#D46B08] font-medium'
                          : 'bg-[#FAFAFA] border-[#E8E8E8] text-[#595959]'
                      }`}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#FFF7E6]/60 rounded border border-[#FFD591] text-[11px] text-[#D46B08]">
                <span className="font-medium block mb-1">推送模板内容预览：</span>
                <p className="font-mono bg-white p-2 rounded border border-[#FFD591] text-[#262626]">
                  【主动运维预警】华东一区宿迁沭阳电站 3#簇12号电芯温差达 8.5℃，已触及高风险预警阈值。请值班工程师张伟尽快安排现场红外检测。（单号：R-20260825-101）
                </p>
              </div>

              {pushSuccess && (
                <div className="p-2 bg-[#F6FFED] text-[#52C41A] rounded border border-[#B7EB8F] text-xs font-medium flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#52C41A]" />
                  已成功向苏北驻点运维班组推送告警信息！
                </div>
              )}
            </div>
          )}

          {/* 4. 风险跟踪 */}
          {actionType === 'track' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-[#F9F0FF] rounded border border-[#D3ADF7]">
                  <span className="text-[10px] text-[#722ED1] block">本月预警命中率</span>
                  <span className="text-base font-bold text-[#531DAB]">92.4%</span>
                </div>
                <div className="p-2 bg-[#E6F7FF] rounded border border-[#91D5FF]">
                  <span className="text-[10px] text-[#1890FF] block">平均闭环时效</span>
                  <span className="text-base font-bold text-[#0050B3]">4.8h</span>
                </div>
                <div className="p-2 bg-[#F6FFED] rounded border border-[#B7EB8F]">
                  <span className="text-[10px] text-[#52C41A] block">避免非停次数</span>
                  <span className="text-base font-bold text-[#237804]">6 次</span>
                </div>
              </div>
              <p className="text-[11px] text-[#8C8C8C]">
                通过双向工单联动，平台自动比对现场消缺日志与时序预警记录，持续微调算法权重。
              </p>
            </div>
          )}

          {/* 5. 工单闭环 */}
          {actionType === 'closeout' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#E6FFFB]/70 border border-[#87E8DE] rounded text-[11px] text-[#006D75]">
                <span className="font-medium block mb-1">今日待闭环验收工单：3 件</span>
                <p>现场已提交消缺报告，等待区域运维负责人张伟复核电气指标并录入专家知识库。</p>
              </div>
              <div className="space-y-1 text-[#595959]">
                <div className="p-2 bg-[#FAFAFA] rounded border border-[#E8E8E8] flex items-center justify-between">
                  <span>PC-20260823-009 (南通如东避雷器复核)</span>
                  <span className="text-[#52C41A] font-medium">待负责人签认</span>
                </div>
                <div className="p-2 bg-[#FAFAFA] rounded border border-[#E8E8E8] flex items-center justify-between">
                  <span>PC-20260822-017 (徐州邳州自投逻辑校验)</span>
                  <span className="text-[#52C41A] font-medium">待负责人签认</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#FAFAFA] border-t border-[#E8E8E8] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded border border-[#D9D9D9] text-[#595959] hover:bg-[#F5F5F5] text-xs font-medium cursor-pointer transition-colors"
          >
            关闭
          </button>

          {actionType === 'report' && (
            <button
              type="button"
              onClick={() => {
                setIsExporting(true);
                setTimeout(() => {
                  setIsExporting(false);
                  onClose();
                }, 600);
              }}
              className="px-4 py-1.5 rounded bg-[#52C41A] hover:bg-[#73D13D] text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? '正在生成 PDF/Excel...' : '下载完整运营简报'}</span>
            </button>
          )}

          {actionType === 'push' && (
            <button
              type="button"
              onClick={() => setPushSuccess(true)}
              className="px-4 py-1.5 rounded bg-[#FA8C16] hover:bg-[#FFA940] text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>立即执行告警下发</span>
            </button>
          )}

          {(actionType === 'diagnose' || actionType === 'track' || actionType === 'closeout') && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-[#1890FF] hover:bg-[#40A9FF] text-white text-xs font-medium cursor-pointer transition-colors"
            >
              确认并完成
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
