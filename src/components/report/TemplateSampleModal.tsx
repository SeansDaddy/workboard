import React, { useState, useMemo } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Eye, 
  FileText, 
  Code2, 
  BookOpen, 
  Play, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Users, 
  Layers,
  Database,
  ExternalLink
} from 'lucide-react';
import { ReportTemplate, OperationsMetrics, TicketItem, RiskItem, RoutineTaskItem, OperationSkill } from '../../types';
import { generateReportHtml } from '../../utils/reportHtmlGenerator';

interface TemplateSampleModalProps {
  template: ReportTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectForTask: (template: ReportTemplate) => void;
  metrics: OperationsMetrics;
  tickets: TicketItem[];
  risks: RiskItem[];
  tasks: RoutineTaskItem[];
  skills: OperationSkill[];
}

export const TemplateSampleModal: React.FC<TemplateSampleModalProps> = ({
  template,
  isOpen,
  onClose,
  onSelectForTask,
  metrics,
  tickets,
  risks,
  tasks,
  skills
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'spec' | 'code'>('visual');
  const [copied, setCopied] = useState<boolean>(false);

  // 关联的 Skill (如果是 Skill 衍生模板)
  const associatedSkill = useMemo(() => {
    if (!template) return undefined;
    if (template.associatedSkillId) {
      return skills.find(s => s.id === template.associatedSkillId);
    }
    return undefined;
  }, [template, skills]);

  // 动态根据当前模板及电站数据生成高保真样例 HTML
  const sampleHtml = useMemo(() => {
    if (!template) return '';

    const dateRangeStr = template.presetPeriod === 'week' 
      ? '2026-08-18 ~ 2026-08-25' 
      : template.presetPeriod === 'month'
      ? '2026-08-01 ~ 2026-08-25'
      : template.presetPeriod === 'quarter'
      ? '2026-07-01 ~ 2026-08-25'
      : '2026-08-01 ~ 2026-08-25 (专项体检)';

    const sampleTitle = template.defaultTitleTemplate
      ? template.defaultTitleTemplate.replace('{WEEK}', '34').replace('{YEAR}', '2026').replace('{MONTH}', '8')
      : `【样例示范】${template.name}`;

    return generateReportHtml({
      reportTitle: sampleTitle,
      templateCategory: template.category,
      templateCode: template.code,
      scope: '华东一区 (484座电站全域)',
      dateRange: dateRangeStr,
      creator: 'AI 运维智能引擎 · 样例示范',
      metrics: metrics,
      tickets: tickets,
      risks: risks,
      tasks: tasks,
      includeAiInsights: true,
      customHtmlTemplate: template.htmlTemplate,
      skillData: associatedSkill
    });
  }, [template, metrics, tickets, risks, tasks, associatedSkill]);

  if (!isOpen || !template) return null;

  const handleDownload = () => {
    const blob = new Blob([sampleHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `[样例]_${template.name}_${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sampleHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenNewWindow = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(sampleHtml);
      newWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden">
        
        {/* 头部标题与控制区 */}
        <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-xs font-bold text-xs"
              style={{ backgroundColor: template.coverColor || '#1890ff' }}
            >
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                  {template.code}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {template.category}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {template.tag}
                </span>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  {template.name} · 说明与报告样例
                </h2>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-3">
                <span>⏱️ 生成耗时: <strong className="text-emerald-400">{template.estimatedTime}</strong></span>
                <span>👥 适用受众: {template.targetAudience}</span>
                <span>📊 数据源: 484座电站全域时序+工单+告警</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab 切换 */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs mr-2">
              <button
                type="button"
                onClick={() => setActiveTab('visual')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
                  activeTab === 'visual'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                样例效果排版
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('spec')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
                  activeTab === 'spec'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                模板说明与章节编排
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
                  activeTab === 'code'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                HTML 源码规范
              </button>
            </div>

            {/* 操作按钮 */}
            <button
              onClick={handleOpenNewWindow}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="新窗口全屏查看样例"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              下载样例
            </button>

            <button
              onClick={() => {
                onSelectForTask(template);
                onClose();
              }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              以此模板生成正式报告
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="flex-1 bg-slate-100 overflow-hidden relative flex flex-col">
          
          {/* TAB 1: 样例可视化排版渲染 */}
          {activeTab === 'visual' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-200">
              <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center justify-between text-xs text-slate-600 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-slate-800">
                    样例实时生成演示（已挂载当前华东一区 484 座电站时序遥测、工单与风险库真实统计数据）
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">
                    支持在独立沙箱中滚动查看完整图表、数据穿透与专家建议
                  </span>
                </div>
              </div>

              <div className="flex-1 p-3 overflow-hidden">
                <iframe
                  title="Report Template Sample Preview"
                  srcDoc={sampleHtml}
                  className="w-full h-full bg-white rounded-lg shadow-md border border-slate-300"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                />
              </div>
            </div>
          )}

          {/* TAB 2: 模板说明与章节编排 */}
          {activeTab === 'spec' && (
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
              {/* 概览卡片 */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      {template.name} · 模板规格说明
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-4xl leading-relaxed">
                      {template.description}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200">
                    {template.category}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="text-slate-400 flex items-center gap-1 mb-1">
                      <Clock className="w-3.5 h-3.5" /> 预设统计周期
                    </div>
                    <div className="font-bold text-slate-800">
                      {template.presetPeriod === 'week' ? '周度运营 (默认7天)' : template.presetPeriod === 'month' ? '月度全景 (30天)' : template.presetPeriod === 'quarter' ? '季度评估 (90天)' : '自定义专项时间范围'}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="text-slate-400 flex items-center gap-1 mb-1">
                      <Users className="w-3.5 h-3.5" /> 适用对象与阅读受众
                    </div>
                    <div className="font-bold text-slate-800 truncate" title={template.targetAudience}>
                      {template.targetAudience}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="text-slate-400 flex items-center gap-1 mb-1">
                      <Database className="w-3.5 h-3.5" /> 核心数据输入源
                    </div>
                    <div className="font-bold text-slate-800">
                      BMS遥测 / PCS / 工单 / 巡检
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="text-slate-400 flex items-center gap-1 mb-1">
                      <Sparkles className="w-3.5 h-3.5" /> 生成引擎
                    </div>
                    <div className="font-bold text-purple-700">
                      Gemini 2.5 + 机理诊断流
                    </div>
                  </div>
                </div>
              </div>

              {/* 核心章节编排与机理规则 */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  标准章节体系与数据分析机理
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {template.sections.map((section, idx) => (
                    <div key={idx} className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2 hover:border-blue-300 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900 truncate">
                          {section}
                        </h5>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed pl-8">
                        {idx === 0 && '提取全域电站可利用率、实时上电率、上云率等运营北极星指标，生成态势评估雷达图。'}
                        {idx === 1 && '聚合削峰填谷充放电电量、转换效率损耗模型，并自动对比上一统计周期的环比升降。'}
                        {idx === 2 && '下钻分析 SLA 响应超时工单、高频故障设备归因，并以甘特/进度链呈现工单闭环全貌。'}
                        {idx === 3 && '运用电芯一致性离散度、内阻温升算法对潜在故障进行提前告警与风险定级。'}
                        {idx === 4 && '汇总各电站现场例行作业履约清单，标记超期作业并指派整改督办专员。'}
                        {idx >= 5 && '基于大模型结合储能运维专家库，自动生成定制化消缺方案与下阶段预防性维护建议。'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 如果是关联 Skill 的模板 */}
              {associatedSkill && (
                <div className="bg-gradient-to-r from-amber-50 to-purple-50 p-5 rounded-xl border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    驱动此模板的专家 Skill 机理模型: {associatedSkill.name} ({associatedSkill.code})
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {associatedSkill.description}
                  </p>
                  <div className="text-[11px] text-slate-600 flex items-center gap-4">
                    <span>领域: <strong>{associatedSkill.targetDomain}</strong></span>
                    <span>规则数: <strong>{associatedSkill.rulesCount} 项条件</strong></span>
                    <span>编制专家: <strong>{associatedSkill.author}</strong></span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HTML 源码与占位符规范 */}
          {activeTab === 'code' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900 text-slate-100">
              <div className="bg-slate-950 px-6 py-2.5 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-purple-400 font-bold">HTML / CSS 标准模板源码</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-400">支持独立浏览器离线渲染，内嵌样式表与向量图表</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? '已复制源码' : '复制 HTML 源码'}
                  </button>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-300 leading-relaxed">
                <pre className="whitespace-pre-wrap">{sampleHtml}</pre>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
