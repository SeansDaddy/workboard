import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Calendar, 
  MapPin, 
  User, 
  CheckSquare, 
  Sparkles, 
  Zap, 
  Layers,
  FileCode,
  Sliders
} from 'lucide-react';
import { ReportTemplate, OperationSkill } from '../../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: ReportTemplate[];
  skills: OperationSkill[];
  initialTemplate?: ReportTemplate | null;
  initialSkill?: OperationSkill | null;
  onSubmitTask: (taskData: {
    title: string;
    template: ReportTemplate;
    periodType: 'week' | 'month' | 'quarter' | 'custom';
    dateRange: string;
    scope: string;
    creator: string;
    fileFormat: 'HTML' | 'PDF' | 'EXCEL';
    includeAiInsights: boolean;
    includeDischargeDetails: boolean;
    includeSlaTickets: boolean;
    includeRiskMatrix: boolean;
    includeRoutineTasks: boolean;
    associatedSkill?: OperationSkill;
  }) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  templates,
  skills,
  initialTemplate,
  initialSkill,
  onSubmitTask
}) => {
  const [mode, setMode] = useState<'template' | 'skill'>(initialSkill ? 'skill' : 'template');
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>(initialTemplate || templates[0]);
  const [selectedSkill, setSelectedSkill] = useState<OperationSkill | null>(initialSkill || (skills.length > 0 ? skills[0] : null));

  const [title, setTitle] = useState<string>('');
  const [periodType, setPeriodType] = useState<'week' | 'month' | 'quarter' | 'custom'>('week');
  const [dateRange, setDateRange] = useState<string>('2026-08-18 ~ 2026-08-25');
  const [scope, setScope] = useState<string>('华东一区 (全域484座电站)');
  const [creator, setCreator] = useState<string>('张工 (区域运维负责人)');
  const [fileFormat, setFileFormat] = useState<'HTML' | 'PDF' | 'EXCEL'>('HTML');

  const [includeAiInsights, setIncludeAiInsights] = useState<boolean>(true);
  const [includeDischargeDetails, setIncludeDischargeDetails] = useState<boolean>(true);
  const [includeSlaTickets, setIncludeSlaTickets] = useState<boolean>(true);
  const [includeRiskMatrix, setIncludeRiskMatrix] = useState<boolean>(true);
  const [includeRoutineTasks, setIncludeRoutineTasks] = useState<boolean>(true);

  useEffect(() => {
    if (initialSkill) {
      setMode('skill');
      setSelectedSkill(initialSkill);
      setTitle(`华东一区 2026年第34周「${initialSkill.name}」主动诊断专项报告`);
    } else if (initialTemplate) {
      setMode('template');
      setSelectedTemplate(initialTemplate);
      setTitle(initialTemplate.defaultTitleTemplate.replace('{WEEK}', '34').replace('{YEAR}', '2026').replace('{MONTH}', '8'));
    }
  }, [initialTemplate, initialSkill, isOpen]);

  if (!isOpen) return null;

  const handlePeriodChange = (val: 'week' | 'month' | 'quarter' | 'custom') => {
    setPeriodType(val);
    if (val === 'week') {
      setDateRange('2026-08-18 ~ 2026-08-25');
    } else if (val === 'month') {
      setDateRange('2026-08-01 ~ 2026-08-25');
    } else if (val === 'quarter') {
      setDateRange('2026-07-01 ~ 2026-08-25');
    }
  };

  const handleTemplateSelect = (t: ReportTemplate) => {
    setSelectedTemplate(t);
    setTitle(t.defaultTitleTemplate.replace('{WEEK}', '34').replace('{YEAR}', '2026').replace('{MONTH}', '8'));
  };

  const handleSkillSelect = (s: OperationSkill) => {
    setSelectedSkill(s);
    setTitle(`华东一区 2026年第34周「${s.name}」主动诊断专项报告`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let targetTemplate = selectedTemplate;

    // If in skill mode, construct or use the Skill-linked template
    if (mode === 'skill' && selectedSkill) {
      const existingSkillTpl = templates.find(t => t.associatedSkillId === selectedSkill.id);
      if (existingSkillTpl) {
        targetTemplate = existingSkillTpl;
      } else {
        targetTemplate = {
          id: `tpl-skill-${selectedSkill.id}`,
          name: `${selectedSkill.name}报告模板`,
          code: `TPL-${selectedSkill.code}`,
          category: 'AI生成模板',
          description: selectedSkill.description,
          tag: '机理Skill',
          estimatedTime: '3 秒',
          targetAudience: '区域技术专工、设备体检团队',
          sections: selectedSkill.outputSections,
          presetPeriod: periodType,
          defaultTitleTemplate: `华东一区 2026年「${selectedSkill.name}」主动诊断专项报告`,
          coverColor: '#1890ff',
          isSkillTemplate: true,
          associatedSkillId: selectedSkill.id
        };
      }
    }

    onSubmitTask({
      title: title.trim(),
      template: targetTemplate,
      periodType,
      dateRange,
      scope,
      creator,
      fileFormat,
      includeAiInsights,
      includeDischargeDetails,
      includeSlaTickets,
      includeRiskMatrix,
      includeRoutineTasks,
      associatedSkill: mode === 'skill' && selectedSkill ? selectedSkill : undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                创建报告生成任务
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                  即时运算 & 交付件排版
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                支持选用预设模板、AI生成模板或挂载专业 Skill 诊断机理一键生成独立 HTML 报告
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/80 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* 生成模式选择 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">报告生成基准引擎：</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('template')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  mode === 'template'
                    ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                  <FileCode className={`w-4 h-4 ${mode === 'template' ? 'text-blue-600' : 'text-slate-400'}`} />
                  选用报告模板库
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  采用标准 HTML 运营模板或 AI 自动编排的模板结构
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode('skill')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  mode === 'skill'
                    ? 'border-purple-500 bg-purple-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                  <Zap className={`w-4 h-4 ${mode === 'skill' ? 'text-purple-600' : 'text-slate-400'}`} />
                  挂载 AI 运维 Skill 机理
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  基于上传或内置的专家诊断规则矩阵与特征模型精准研判
                </p>
              </button>
            </div>
          </div>

          {/* 模板或 Skill 选择器 */}
          {mode === 'template' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">选择报告模板：</label>
              <select
                value={selectedTemplate.id}
                onChange={e => {
                  const t = templates.find(item => item.id === e.target.value);
                  if (t) handleTemplateSelect(t);
                }}
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {templates.map(t => (
                  <option key={t.id} value={t.id}>
                    [{t.category}] {t.name} ({t.code})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">选择诊断 Skill：</label>
              <select
                value={selectedSkill?.id || ''}
                onChange={e => {
                  const s = skills.find(item => item.id === e.target.value);
                  if (s) handleSkillSelect(s);
                }}
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                {skills.map(s => (
                  <option key={s.id} value={s.id}>
                    [{s.category}] {s.name} ({s.code} · {s.version})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 报告标题 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              报告生成标题 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="请输入报告标题"
              className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
              required
            />
          </div>

          {/* 周期与时间跨度 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">统计周期类型</label>
              <select
                value={periodType}
                onChange={e => handlePeriodChange(e.target.value as any)}
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="week">自然周 (Week)</option>
                <option value="month">自然月 (Month)</option>
                <option value="quarter">季度 (Quarter)</option>
                <option value="custom">自定义时间范围</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">时间范围</label>
              <input
                type="text"
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
              />
            </div>
          </div>

          {/* 监测范围与责任人 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">资产监测范围</label>
              <input
                type="text"
                value={scope}
                onChange={e => setScope(e.target.value)}
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">责任编制人</label>
              <input
                type="text"
                value={creator}
                onChange={e => setCreator(e.target.value)}
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* 选项配置 */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
            <div className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              数据注入与分析模块勾选：
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAiInsights}
                  onChange={e => setIncludeAiInsights(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>注入 AI 大模型专家研判结论</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDischargeDetails}
                  onChange={e => setIncludeDischargeDetails(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>包含充放电策略执行细则</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSlaTickets}
                  onChange={e => setIncludeSlaTickets(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>包含 SLA 缺陷工单闭环清单</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeRiskMatrix}
                  onChange={e => setIncludeRiskMatrix(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>包含隐患预警与规则命中矩阵</span>
              </label>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              立即创建并生成报告
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
