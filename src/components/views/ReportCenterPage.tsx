import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  CheckCircle2, 
  TrendingUp, 
  ShieldAlert, 
  Ticket, 
  ArrowLeft,
  Filter,
  Sparkles,
  BarChart3,
  Award
} from 'lucide-react';
import { OperationsMetrics } from '../../types';

interface ReportCenterPageProps {
  metrics: OperationsMetrics;
  onReturnToWorkbench: () => void;
  onExportReport?: (type: string) => void;
}

export const ReportCenterPage: React.FC<ReportCenterPageProps> = ({
  metrics,
  onReturnToWorkbench,
  onExportReport
}) => {
  const [reportPeriod, setReportPeriod] = useState<'week' | 'month' | 'quarter'>('week');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const handleExport = (format: 'pdf' | 'excel' | 'print') => {
    setExportSuccess(`已成功导出「华东一区 2026年第34周储能资产运营与主动运维白皮书」(${format.toUpperCase()})`);
    setTimeout(() => setExportSuccess(null), 4000);
    onExportReport?.(format);
  };

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
            <div className="p-1 rounded bg-[#F9F0FF] text-[#722ED1] border border-[#D3ADF7]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-[#1F1F1F]">运维报告中心 · 周期性资产健康与消缺白皮书</h1>
              <p className="text-[11px] text-[#8C8C8C]">自动汇总资产可利用率、SLA履约率、算法预警命中率与现场故障归因分析</p>
            </div>
          </div>
        </div>

        {/* 报告周期切换与导出按钮 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#F5F5F5] p-0.5 rounded border border-[#E8E8E8] text-xs">
            <button
              type="button"
              onClick={() => setReportPeriod('week')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                reportPeriod === 'week' ? 'bg-white text-[#1890FF] font-medium shadow-xs' : 'text-[#595959] hover:text-[#262626]'
              }`}
            >
              本周周报
            </button>
            <button
              type="button"
              onClick={() => setReportPeriod('month')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                reportPeriod === 'month' ? 'bg-white text-[#1890FF] font-medium shadow-xs' : 'text-[#595959] hover:text-[#262626]'
              }`}
            >
              月度白皮书
            </button>
            <button
              type="button"
              onClick={() => setReportPeriod('quarter')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                reportPeriod === 'quarter' ? 'bg-white text-[#1890FF] font-medium shadow-xs' : 'text-[#595959] hover:text-[#262626]'
              }`}
            >
              季度评估
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleExport('pdf')}
            className="px-3 py-1.5 bg-[#1890FF] hover:bg-[#40A9FF] text-white rounded text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出 PDF</span>
          </button>
        </div>
      </div>

      {/* 导出成功提示 */}
      {exportSuccess && (
        <div className="p-3 bg-[#F6FFED] border border-[#B7EB8F] rounded text-xs text-[#52C41A] flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#52C41A] shrink-0" />
            <span className="font-medium">{exportSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportSuccess(null)}
            className="text-[#52C41A] hover:underline text-xs cursor-pointer"
          >
            关闭
          </button>
        </div>
      )}

      {/* 报告核心指标卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-3.5 rounded border border-[#E8E8E8] space-y-1">
          <div className="flex items-center justify-between text-[#8C8C8C] text-xs">
            <span>资产综合可利用率</span>
            <span className="text-[10px] text-[#52C41A] bg-[#F6FFED] px-1.5 py-0.2 rounded border border-[#B7EB8F]">达标</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#1F1F1F]">99.42%</span>
            <span className="text-[11px] text-[#52C41A] font-medium flex items-center">
              <TrendingUp className="w-3 h-3" /> +0.18%
            </span>
          </div>
          <p className="text-[11px] text-[#8C8C8C]">考核基准 98.50%，全域持续高可用</p>
        </div>

        <div className="bg-white p-3.5 rounded border border-[#E8E8E8] space-y-1">
          <div className="flex items-center justify-between text-[#8C8C8C] text-xs">
            <span>SLA 工单达标率</span>
            <span className="text-[10px] text-[#1890FF] bg-[#E6F7FF] px-1.5 py-0.2 rounded border border-[#91D5FF]">优良</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#1F1F1F]">97.8%</span>
            <span className="text-[11px] text-[#595959]">已消缺 68 单</span>
          </div>
          <p className="text-[11px] text-[#8C8C8C]">平均响应 18min / 平均闭环 3.4h</p>
        </div>

        <div className="bg-white p-3.5 rounded border border-[#E8E8E8] space-y-1">
          <div className="flex items-center justify-between text-[#8C8C8C] text-xs">
            <span>主动预警算法准确率</span>
            <span className="text-[10px] text-[#722ED1] bg-[#F9F0FF] px-1.5 py-0.2 rounded border border-[#D3ADF7]">模型验证</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#1F1F1F]">94.6%</span>
            <span className="text-[11px] text-[#722ED1] font-medium">提前72h潜伏预警</span>
          </div>
          <p className="text-[11px] text-[#8C8C8C]">本期提前捕获 18 起单体压差/热阻异常</p>
        </div>

        <div className="bg-white p-3.5 rounded border border-[#E8E8E8] space-y-1">
          <div className="flex items-center justify-between text-[#8C8C8C] text-xs">
            <span>例行作业 SOP 履约率</span>
            <span className="text-[10px] text-[#FA8C16] bg-[#FFF7E6] px-1.5 py-0.2 rounded border border-[#FFD591]">督办中</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#1F1F1F]">92.3%</span>
            <span className="text-[11px] text-[#F5222D] font-medium">超期 2 项</span>
          </div>
          <p className="text-[11px] text-[#8C8C8C]">已督办宿迁高压绝缘及盐城液冷整改</p>
        </div>
      </div>

      {/* 报告正文预览卡片 */}
      <div className="bg-white rounded border border-[#E8E8E8] p-5 space-y-5">
        <div className="border-b border-[#E8E8E8] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-[#1F1F1F]">
              华东一区 2026年第34周储能资产运营与主动运维分析简报
            </h2>
            <p className="text-xs text-[#8C8C8C] mt-0.5">
              编制周期: 2026-08-18 至 2026-08-25 | 编制人: 张伟 (区域运维负责人) | 统计范围: 全域 484 座储能电站
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleExport('excel')}
              className="px-2.5 py-1 text-xs border border-[#D9D9D9] text-[#595959] hover:text-[#1890FF] hover:border-[#1890FF] rounded flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>导出 Excel 数据源</span>
            </button>
            <button
              type="button"
              onClick={() => handleExport('print')}
              className="px-2.5 py-1 text-xs border border-[#D9D9D9] text-[#595959] hover:text-[#1890FF] hover:border-[#1890FF] rounded flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>打印</span>
            </button>
          </div>
        </div>

        {/* 报告重点提要 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#FAFAFA] p-3.5 rounded border border-[#E8E8E8] space-y-2">
            <span className="text-xs font-semibold text-[#1F1F1F] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#1890FF]" />
              一、运行总体态势与电量效益
            </span>
            <ul className="text-xs text-[#595959] space-y-1.5 list-disc list-inside leading-relaxed">
              <li>全区域 484 座电站累计接入上云率达 <strong>96.7%</strong>，正常上电监控率 <strong>94.2%</strong>。</li>
              <li>本周累计完成削峰填谷充放电 <strong>138 次</strong>，放电总电量 <strong>10,374 MWh</strong>，综合充放电效率 <strong>87.8%</strong>。</li>
              <li>当前全域运行策略中，TOU削峰填谷占比 68.2%，最大自发自用占比 18.2%，策略健康度良好。</li>
            </ul>
          </div>

          <div className="bg-[#FAFAFA] p-3.5 rounded border border-[#E8E8E8] space-y-2">
            <span className="text-xs font-semibold text-[#1F1F1F] flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#FA8C16]" />
              二、主动风险预测与现场工单闭环
            </span>
            <ul className="text-xs text-[#595959] space-y-1.5 list-disc list-inside leading-relaxed">
              <li>主动运维平台时序算法共发现 <strong>8 项重点预警/告警</strong>，其中苏北区域集中度最高 (5项)。</li>
              <li>已将 3 项高风险隐患一键下发至 pcare 生成维修工单，并建立端到端闭环双向追溯机制。</li>
              <li>重点风险点位：宿迁泗洪站单体温差散度持续增大、盐城滨海站PCS桥臂热阻异常已指派专人现场二次复核。</li>
            </ul>
          </div>
        </div>

        {/* 改进建议与下周计划 */}
        <div className="p-3.5 bg-[#E6F7FF]/50 border border-[#91D5FF] rounded text-xs space-y-1.5">
          <span className="font-semibold text-[#0050B3] flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#1890FF]" />
            三、下周重点督办与消缺建议
          </span>
          <p className="text-[#096DD9] leading-relaxed">
            1. 针对超期的宿迁 110kV 升压站预防性试验与盐城液冷管路渗漏整改，要求责任班组于 8 月 26 日 12:00 前完成现场打卡验收归档。<br />
            2. 结合下周高温天气预测，对全域容量大于 10MWh 的电站启动电池舱空调及液冷机组专项巡检。<br />
            3. 持续优化模型阈值，降低微小温差波动带来的冗余提醒，提升消缺精准度。
          </p>
        </div>
      </div>
    </div>
  );
};
