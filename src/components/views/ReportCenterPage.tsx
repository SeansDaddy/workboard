import React, { useState } from 'react';
import { 
  FileText, 
  Layers, 
  Sparkles, 
  Upload, 
  Plus, 
  Download, 
  Eye, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowLeft, 
  Search, 
  Filter, 
  Tag, 
  ShieldCheck, 
  Zap, 
  HelpCircle, 
  Trash2, 
  Copy, 
  Code2, 
  ExternalLink,
  Info,
  Calendar,
  Check,
  ChevronRight,
  Database
} from 'lucide-react';
import { 
  ReportTemplate, 
  ReportGenerationTask, 
  OperationsMetrics, 
  TicketItem, 
  RiskItem, 
  RoutineTaskItem,
  OperationSkill
} from '../../types';
import { REPORT_TEMPLATES, INITIAL_REPORT_TASKS, DEFAULT_SAMPLE_HTML_TEMPLATE } from '../../mock/reportData';
import { INITIAL_OPERATION_SKILLS } from '../../mock/skillData';
import { generateReportHtml } from '../../utils/reportHtmlGenerator';
import { AiTemplateGeneratorModal } from '../report/AiTemplateGeneratorModal';
import { SkillUploadModal } from '../report/SkillUploadModal';
import { SkillDetailModal } from '../report/SkillDetailModal';
import { CreateTaskModal } from '../report/CreateTaskModal';
import { HtmlPreviewModal } from '../report/HtmlPreviewModal';
import { TemplateSampleModal } from '../report/TemplateSampleModal';

interface ReportCenterPageProps {
  metrics: OperationsMetrics;
  tickets: TicketItem[];
  risks: RiskItem[];
  tasks: RoutineTaskItem[];
  onReturnToWorkbench: () => void;
  onExportReport?: () => void;
}

export const ReportCenterPage: React.FC<ReportCenterPageProps> = ({
  metrics,
  tickets = [],
  risks = [],
  tasks = [],
  onReturnToWorkbench
}) => {
  // 当前活动 Tab: 'templates' (模板库) | 'skills' (AI 运维机理 Skill 库) | 'tasks' (生成任务管理)
  const [activeTab, setActiveTab] = useState<'templates' | 'skills' | 'tasks'>('templates');

  // 模板列表状态
  const [templates, setTemplates] = useState<ReportTemplate[]>(REPORT_TEMPLATES);

  // Skill 列表状态
  const [skills, setSkills] = useState<OperationSkill[]>(INITIAL_OPERATION_SKILLS);

  // 搜索与过滤
  const [templateSearchKeyword, setTemplateSearchKeyword] = useState<string>('');
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<string>('all');
  const [skillSearchKeyword, setSkillSearchKeyword] = useState<string>('');
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string>('all');
  const [taskSearchKeyword, setTaskSearchKeyword] = useState<string>('');

  // 任务管理列表
  const [reportTasks, setReportTasks] = useState<ReportGenerationTask[]>(() => {
    return INITIAL_REPORT_TASKS.map(t => {
      const html = generateReportHtml({
        reportTitle: t.reportTitle,
        templateCategory: t.templateName,
        templateCode: 'TPL-AUTO-2026',
        scope: t.scope,
        dateRange: t.dateRange,
        creator: t.creator,
        metrics,
        tickets,
        risks,
        tasks,
        includeAiInsights: t.config?.includeAiInsights ?? true
      });
      return { ...t, htmlContent: html };
    });
  });

  // 弹窗状态管理
  const [showAiTemplateModal, setShowAiTemplateModal] = useState<boolean>(false);
  const [showSkillUploadModal, setShowSkillUploadModal] = useState<boolean>(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState<boolean>(false);
  const [showCreateHtmlTemplateModal, setShowCreateHtmlTemplateModal] = useState<boolean>(false);

  // 选中上下文
  const [selectedTemplateForTask, setSelectedTemplateForTask] = useState<ReportTemplate | null>(null);
  const [selectedSkillForTask, setSelectedSkillForTask] = useState<OperationSkill | null>(null);
  const [viewingSkill, setViewingSkill] = useState<OperationSkill | null>(null);
  const [viewingTemplateSample, setViewingTemplateSample] = useState<ReportTemplate | null>(null);
  const [previewTask, setPreviewTask] = useState<ReportGenerationTask | null>(null);

  // 手动上传/新建 HTML 模板表单
  const [customTemplateData, setCustomTemplateData] = useState({
    name: '',
    code: `TPL-CUSTOM-${Date.now().toString().slice(-4)}`,
    category: '自定义专属专项' as ReportTemplate['category'],
    description: '',
    tag: '自定义' as ReportTemplate['tag'],
    estimatedTime: '3 秒',
    targetAudience: '区域运维负责人、现场值守工程师',
    sectionsText: '总体运行态势, 时序风险预警, 工单闭环追溯, 专家消缺建议',
    presetPeriod: 'week' as 'week' | 'month' | 'quarter' | 'custom',
    defaultTitleTemplate: '【专属专项】华东一区 储能资产运维体检报告',
    coverColor: '#722ED1',
    htmlTemplate: DEFAULT_SAMPLE_HTML_TEMPLATE,
    uploadedFileName: ''
  });

  // 操作提示消息 Toast
  const [toastMessage, setToastMessage] = useState<{ title: string; desc?: string; type?: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (title: string, desc?: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 保存 AI 生成的模板
  const handleSaveAiTemplate = (newTemplate: ReportTemplate) => {
    setTemplates(prev => [newTemplate, ...prev]);
    setActiveTab('templates');
    showToast('AI 模板生成并入库成功！', `已将「${newTemplate.name}」添加至模板库，可直接选用`, 'success');
  };

  // 导入 Skill
  const handleSkillImported = (newSkill: OperationSkill) => {
    setSkills(prev => [newSkill, ...prev]);
    setActiveTab('skills');
    showToast('Skill 导入成功！', `已将「${newSkill.name}」添加至 AI 运维机理库`, 'success');
  };

  // 基于 Skill 发起报告生成任务
  const handleStartReportFromSkill = (skill: OperationSkill) => {
    setSelectedSkillForTask(skill);
    setSelectedTemplateForTask(null);
    setShowCreateTaskModal(true);
  };

  // 将 Skill 固化为报告模板
  const handleConvertSkillToTemplate = (skill: OperationSkill) => {
    const newTemplate: ReportTemplate = {
      id: `tpl-skill-${skill.id}`,
      name: `${skill.name}模板`,
      code: `TPL-${skill.code}`,
      category: 'AI生成模板',
      description: skill.description,
      tag: '机理Skill',
      estimatedTime: '3 秒',
      targetAudience: '区域技术专工、设备体检团队',
      sections: skill.outputSections,
      presetPeriod: 'week',
      defaultTitleTemplate: `华东一区 2026年第34周「${skill.name}」主动体检专报`,
      coverColor: '#1890ff',
      isSkillTemplate: true,
      associatedSkillId: skill.id
    };

    setTemplates(prev => [newTemplate, ...prev]);
    setActiveTab('templates');
    showToast('已固化为报告模板', `已在模板库新增「${newTemplate.name}」`, 'success');
  };

  // 处理 HTML 模板文件读取
  const handleHtmlFileUpload = (file: File) => {
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      showToast('格式不支持', '请上传扩展名为 .html 或 .htm 的文件', 'warn');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setCustomTemplateData(prev => ({
          ...prev,
          htmlTemplate: content,
          uploadedFileName: file.name,
          name: prev.name || file.name.replace(/\.[^/.]+$/, '')
        }));
        showToast('HTML 模板已载入', `成功读取 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`, 'success');
      }
    };
    reader.readAsText(file);
  };

  // 提交并创建自定义 HTML 模板
  const handleCreateHtmlTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTemplateData.name.trim()) return;

    const sections = customTemplateData.sectionsText
      .split(/[,，\n]/)
      .map(s => s.trim())
      .filter(Boolean);

    const newTemplate: ReportTemplate = {
      id: `tpl-user-${Date.now()}`,
      name: customTemplateData.name.trim(),
      code: customTemplateData.code.trim() || `TPL-CUSTOM-${Date.now().toString().slice(-4)}`,
      category: customTemplateData.category,
      description: customTemplateData.description.trim() || '用户自定义上传与配置的专业 HTML 运营报告模板',
      tag: customTemplateData.tag,
      estimatedTime: customTemplateData.estimatedTime || '3 秒',
      targetAudience: customTemplateData.targetAudience || '运维工程师、技术专家',
      sections: sections.length > 0 ? sections : ['总体运行指标', '时序风险预警', '消缺闭环跟踪'],
      presetPeriod: customTemplateData.presetPeriod,
      defaultTitleTemplate: customTemplateData.defaultTitleTemplate || `【专项报告】${customTemplateData.name}`,
      coverColor: customTemplateData.coverColor,
      htmlTemplate: customTemplateData.htmlTemplate,
      isCustom: true
    };

    setTemplates(prev => [newTemplate, ...prev]);
    setShowCreateHtmlTemplateModal(false);
    showToast('模板创建成功！', `已将「${newTemplate.name}」添加至模板库`, 'success');
  };

  // 执行任务创建与异步生成
  const handleExecuteCreateTask = (taskPayload: {
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
  }) => {
    const newTaskId = `TASK-${Date.now().toString().slice(-6)}`;
    
    // 生成报告 HTML
    const generatedHtml = generateReportHtml({
      reportTitle: taskPayload.title,
      templateCategory: taskPayload.template.name,
      templateCode: taskPayload.template.code,
      scope: taskPayload.scope,
      dateRange: taskPayload.dateRange,
      creator: taskPayload.creator,
      metrics,
      tickets,
      risks,
      tasks,
      includeAiInsights: taskPayload.includeAiInsights,
      customHtmlTemplate: taskPayload.template.htmlTemplate,
      skillData: taskPayload.associatedSkill
    });

    const newTask: ReportGenerationTask = {
      id: newTaskId,
      reportTitle: taskPayload.title,
      templateId: taskPayload.template.id,
      templateName: taskPayload.template.name,
      periodType: taskPayload.periodType,
      dateRange: taskPayload.dateRange,
      scope: taskPayload.scope,
      creator: taskPayload.creator,
      status: 'processing',
      progress: 25,
      createdAt: '2026-08-30 14:15:20',
      fileFormat: 'HTML',
      stepLog: taskPayload.associatedSkill 
        ? `正在挂载 Skill [${taskPayload.associatedSkill.name}] 机理并拉取 484 座电站时序数据...`
        : '正在拉取 484 座电站全域时序遥测数据并排版...',
      htmlContent: generatedHtml,
      associatedSkillId: taskPayload.associatedSkill?.id,
      associatedSkillName: taskPayload.associatedSkill?.name,
      config: {
        includeAiInsights: taskPayload.includeAiInsights,
        includeDischargeDetails: taskPayload.includeDischargeDetails,
        includeSlaTickets: taskPayload.includeSlaTickets,
        includeRiskMatrix: taskPayload.includeRiskMatrix,
        includeRoutineTasks: taskPayload.includeRoutineTasks
      }
    };

    setReportTasks(prev => [newTask, ...prev]);
    setActiveTab('tasks');
    showToast('报告生成任务已创建', `任务编号: ${newTaskId}，正在后台流水线排版中`, 'info');

    // 模拟后台流水线状态流转
    setTimeout(() => {
      setReportTasks(prev =>
        prev.map(t => {
          if (t.id === newTaskId) {
            return {
              ...t,
              progress: 65,
              stepLog: taskPayload.associatedSkill
                ? '已匹配 3 项关键特征规则与 38 项指标，正在渲染矢量 HTML 报告...'
                : '时序数据与指标研判已就绪，正在渲染 HTML 图表组件...'
            };
          }
          return t;
        })
      );
    }, 1000);

    setTimeout(() => {
      setReportTasks(prev =>
        prev.map(t => {
          if (t.id === newTaskId) {
            return {
              ...t,
              status: 'completed',
              progress: 100,
              completedAt: '2026-08-30 14:15:23',
              fileSize: '1.6 MB',
              stepLog: '报告生成成功，已封装为独立 HTML 交付件'
            };
          }
          return t;
        })
      );
      showToast('报告生成完成！', `任务 ${newTaskId} 已就绪，可随时在线预览或执行下载`, 'success');
    }, 2200);
  };

  // 下载任务报告
  const handleDownloadTaskReport = (task: ReportGenerationTask, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.htmlContent) return;
    const blob = new Blob([task.htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${task.reportTitle.replace(/\s+/g, '_')}_${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('下载已开始', `已保存 ${a.download}`, 'success');
  };

  // 过滤后的模板
  const filteredTemplates = templates.filter(t => {
    const matchCategory = selectedTemplateCategory === 'all' || t.category === selectedTemplateCategory;
    const matchKeyword = !templateSearchKeyword.trim() || 
      t.name.toLowerCase().includes(templateSearchKeyword.toLowerCase()) ||
      t.code.toLowerCase().includes(templateSearchKeyword.toLowerCase()) ||
      t.description.toLowerCase().includes(templateSearchKeyword.toLowerCase());
    return matchCategory && matchKeyword;
  });

  // 过滤后的 Skills
  const filteredSkills = skills.filter(s => {
    const matchCategory = selectedSkillCategory === 'all' || s.category === selectedSkillCategory;
    const matchKeyword = !skillSearchKeyword.trim() || 
      s.name.toLowerCase().includes(skillSearchKeyword.toLowerCase()) ||
      s.code.toLowerCase().includes(skillSearchKeyword.toLowerCase()) ||
      s.targetDomain.toLowerCase().includes(skillSearchKeyword.toLowerCase()) ||
      s.author.toLowerCase().includes(skillSearchKeyword.toLowerCase());
    return matchCategory && matchKeyword;
  });

  // 过滤后的任务
  const filteredTasks = reportTasks.filter(t => {
    return !taskSearchKeyword.trim() || 
      t.reportTitle.toLowerCase().includes(taskSearchKeyword.toLowerCase()) ||
      t.id.toLowerCase().includes(taskSearchKeyword.toLowerCase()) ||
      t.templateName.toLowerCase().includes(taskSearchKeyword.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden font-sans text-slate-800">
      {/* 顶部主导航栏 */}
      <header className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between shadow-md shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={onReturnToWorkbench}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-semibold cursor-pointer border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            返回主动运维工作台
          </button>
          
          <div className="h-4 w-px bg-slate-700" />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">华东一区 (484座电站)</span>
              <span className="text-slate-600">/</span>
              <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                运维报告中心
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  AI 智能与机理 Skill 报告生成
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* 顶部快捷操作 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAiTemplateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-purple-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI 辅助生成模板
          </button>

          <button
            onClick={() => setShowSkillUploadModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            上传 / 导入 Skill
          </button>

          <button
            onClick={() => {
              setSelectedTemplateForTask(templates[0]);
              setSelectedSkillForTask(null);
              setShowCreateTaskModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            创建报告生成任务
          </button>
        </div>
      </header>

      {/* 二级 Tab 导航与功能概述条 */}
      <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            运维运营报告模板库
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-semibold">
              {templates.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'skills'
                ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-600" />
            AI 运维机理 Skill 库 & 上传
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-semibold">
              {skills.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            报告生成任务管理
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              {reportTasks.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            全域 484 座电站时序就绪
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            Gemini & 机理大模型双引擎
          </span>
        </div>
      </div>

      {/* 主视图区域 */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* ===================== TAB 1: 模板库 ===================== */}
        {activeTab === 'templates' && (
          <div className="space-y-6 w-full">
            {/* 顶栏筛选与操作 */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={templateSearchKeyword}
                    onChange={e => setTemplateSearchKeyword(e.target.value)}
                    placeholder="按模板名称、编号或章节描述搜索..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  {['all', '运营周报', '月度白皮书', '单站深度体检', '安全合规专项', 'AI生成模板', '自定义专属专项'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedTemplateCategory(cat)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        selectedTemplateCategory === cat
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {cat === 'all' ? '全部分类' : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAiTemplateModal(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI 辅助生成新模板
                </button>
                <button
                  onClick={() => setShowCreateHtmlTemplateModal(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  上传 HTML 模板
                </button>
              </div>
            </div>

            {/* 模板网格卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
              {filteredTemplates.map(tpl => (
                <div
                  key={tpl.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col overflow-hidden group"
                >
                  {/* 卡片头部 */}
                  <div
                    className="p-4 border-b border-slate-100 flex items-start justify-between cursor-pointer"
                    style={{ borderTop: `4px solid ${tpl.coverColor || '#1890ff'}` }}
                    onClick={() => setViewingTemplateSample(tpl)}
                    title="点击查看模板说明与高保真报告样例"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                          {tpl.code}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          tpl.tag === 'AI生成' 
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : tpl.tag === '机理Skill'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                          {tpl.tag}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {tpl.name}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-slate-400 block">生成耗时</span>
                      <span className="text-xs font-semibold text-emerald-600">{tpl.estimatedTime}</span>
                    </div>
                  </div>

                  {/* 卡片主体 */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {tpl.description}
                    </p>

                    {/* 核心章节列表 */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500 block">报告标准章节编排：</span>
                      <div className="space-y-1">
                        {tpl.sections.slice(0, 3).map((sec, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                            <span className="truncate">{sec}</span>
                          </div>
                        ))}
                        {tpl.sections.length > 3 && (
                          <span className="text-[11px] text-slate-400 pl-3">
                            ...等共 {tpl.sections.length} 个核心章节
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 适用受众 */}
                    <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-1">
                      <span className="font-semibold text-slate-600">适用受众:</span>
                      <span className="truncate">{tpl.targetAudience}</span>
                    </div>
                  </div>

                  {/* 卡片底栏操作 */}
                  <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500 font-medium truncate">
                      周期: {tpl.presetPeriod === 'week' ? '周报' : tpl.presetPeriod === 'month' ? '月报' : '自定义'}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setViewingTemplateSample(tpl)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 hover:border-blue-400 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                        title="查看此模板的规格说明与生成效果样例"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        样例说明
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTemplateForTask(tpl);
                          setSelectedSkillForTask(null);
                          setShowCreateTaskModal(true);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        生成任务
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB 2: AI 运维机理 Skill 库 ===================== */}
        {activeTab === 'skills' && (
          <div className="space-y-6 w-full">
            {/* 顶栏说明与操作 */}
            <div className="bg-gradient-to-r from-amber-50 via-purple-50 to-blue-50 border border-amber-200/80 rounded-xl p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    AI 运维机理 Skill (技能) 知识引擎
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                      支持 Markdown/YAML/JSON 规格一键上传
                    </span>
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                    Skill 是储能电站专家级主动运维诊断单元。每个 Skill 封装了专属特征规则、异常判定机理与闭环处置链。
                    上传或选取任意 Skill，系统将自动挂载 484 座电站全域时序数据，生成专业诊断 HTML 报告。
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSkillUploadModal(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  上传新 Skill 规格文件
                </button>
              </div>
            </div>

            {/* 过滤条 */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={skillSearchKeyword}
                    onChange={e => setSkillSearchKeyword(e.target.value)}
                    placeholder="按 Skill 名称、编号、业务领域或专家搜索..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="flex items-center gap-1 text-xs">
                  {['all', '安全防护', 'SLA履约', '电池诊断', '设备体检', '能效与调度'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedSkillCategory(cat)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        selectedSkillCategory === cat
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {cat === 'all' ? '全部领域' : cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Skill 网格卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredSkills.map(s => (
                <div
                  key={s.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-400 transition-all flex flex-col overflow-hidden"
                >
                  {/* 头部 */}
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                          {s.code}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          {s.version}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                          {s.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {s.name}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">规则数</span>
                      <span className="text-xs font-bold text-amber-700">{s.rulesCount} 项条件</span>
                    </div>
                  </div>

                  {/* 主体 */}
                  <div className="p-4 flex-1 space-y-3">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {s.description}
                    </p>

                    <div className="bg-amber-50/40 border border-amber-100 rounded-lg p-3 space-y-1.5">
                      <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                        主要触发诊断阈值：
                      </div>
                      <div className="space-y-1">
                        {s.triggerConditions.slice(0, 2).map((rule, idx) => (
                          <div key={idx} className="text-xs text-slate-700 flex items-start gap-1.5 font-mono">
                            <span className="text-amber-500 font-bold">▪</span>
                            <span className="truncate">{rule}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>领域: <strong className="text-slate-700">{s.targetDomain}</strong></span>
                      <span>专家: <strong className="text-slate-700">{s.author}</strong></span>
                    </div>
                  </div>

                  {/* 底部按钮 */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setViewingSkill(s)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      查看机理与规则
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleConvertSkillToTemplate(s)}
                        className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors cursor-pointer"
                      >
                        固化为模板
                      </button>
                      <button
                        onClick={() => handleStartReportFromSkill(s)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-700 hover:to-purple-700 rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        基于此 Skill 生成报告
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB 3: 报告生成任务管理 ===================== */}
        {activeTab === 'tasks' && (
          <div className="space-y-6 w-full">
            {/* 任务顶栏 */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={taskSearchKeyword}
                  onChange={e => setTaskSearchKeyword(e.target.value)}
                  placeholder="搜索任务编号、报告标题、模板名称..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                onClick={() => {
                  setSelectedTemplateForTask(templates[0]);
                  setSelectedSkillForTask(null);
                  setShowCreateTaskModal(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                创建报告生成任务
              </button>
            </div>

            {/* 任务列表 */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-5 py-3.5">报告任务 / 交付件标题</th>
                      <th className="px-4 py-3.5">基础模板 / 驱动 Skill</th>
                      <th className="px-4 py-3.5">周期 & 范围</th>
                      <th className="px-4 py-3.5">责任人</th>
                      <th className="px-4 py-3.5">生成状态 / 运算进度</th>
                      <th className="px-4 py-3.5">交付件格式</th>
                      <th className="px-5 py-3.5 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTasks.map(task => (
                      <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 hover:text-blue-600 transition-colors">
                                {task.reportTitle}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                任务ID: {task.id} · 创建于 {task.createdAt}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="font-medium text-slate-800 block">
                            {task.templateName}
                          </span>
                          {task.associatedSkillName && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 mt-1 inline-flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5" />
                              {task.associatedSkillName}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-slate-800 font-mono">{task.dateRange}</span>
                          <span className="text-[11px] text-slate-400 block">{task.scope}</span>
                        </td>

                        <td className="px-4 py-4 text-slate-700">
                          {task.creator}
                        </td>

                        <td className="px-4 py-4">
                          {task.status === 'completed' ? (
                            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>生成完毕 (100%)</span>
                            </div>
                          ) : task.status === 'processing' ? (
                            <div className="space-y-1.5 min-w-[140px]">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-blue-600 font-semibold flex items-center gap-1">
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                  正在运算
                                </span>
                                <span className="font-mono text-slate-600">{task.progress}%</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-slate-400 truncate block">
                                {task.stepLog}
                              </span>
                            </div>
                          ) : (
                            <span className="text-rose-600 font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4" />
                              生成失败
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {task.fileFormat}
                          </span>
                          {task.fileSize && (
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {task.fileSize}
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {task.status === 'completed' && (
                              <>
                                <button
                                  onClick={() => setPreviewTask(task)}
                                  className="px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  预览报告
                                </button>
                                <button
                                  onClick={e => handleDownloadTaskReport(task, e)}
                                  className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  下载 HTML
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===================== 弹窗组件挂载 ===================== */}

      {/* 1. AI 辅助生成模板弹窗 */}
      <AiTemplateGeneratorModal
        isOpen={showAiTemplateModal}
        onClose={() => setShowAiTemplateModal(false)}
        onSaveTemplate={handleSaveAiTemplate}
      />

      {/* 2. Skill 上传导入弹窗 */}
      <SkillUploadModal
        isOpen={showSkillUploadModal}
        onClose={() => setShowSkillUploadModal(false)}
        onSkillImported={handleSkillImported}
      />

      {/* 3. Skill 详情抽屉/弹窗 */}
      <SkillDetailModal
        skill={viewingSkill}
        isOpen={!!viewingSkill}
        onClose={() => setViewingSkill(null)}
        onGenerateReportFromSkill={handleStartReportFromSkill}
        onConvertToTemplate={handleConvertSkillToTemplate}
      />

      {/* 4. 创建报告任务统一弹窗 */}
      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={() => {
          setShowCreateTaskModal(false);
          setSelectedSkillForTask(null);
        }}
        templates={templates}
        skills={skills}
        initialTemplate={selectedTemplateForTask}
        initialSkill={selectedSkillForTask}
        onSubmitTask={handleExecuteCreateTask}
      />

      {/* 5. 渲染报告 HTML 独立预览/下载弹窗 */}
      <HtmlPreviewModal
        task={previewTask}
        isOpen={!!previewTask}
        onClose={() => setPreviewTask(null)}
      />

      {/* 5.5 模板说明与高保真样例展示弹窗 */}
      {viewingTemplateSample && (
        <TemplateSampleModal
          template={viewingTemplateSample}
          isOpen={!!viewingTemplateSample}
          onClose={() => setViewingTemplateSample(null)}
          onSelectForTask={tpl => {
            setSelectedTemplateForTask(tpl);
            setSelectedSkillForTask(null);
            setShowCreateTaskModal(true);
          }}
          metrics={metrics}
          tickets={tickets}
          risks={risks}
          tasks={tasks}
          skills={skills}
        />
      )}

      {/* 6. 自定义上传 HTML 模板弹窗 */}
      {showCreateHtmlTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">上传并注册自定义 HTML 报告模板</h3>
              </div>
              <button
                onClick={() => setShowCreateHtmlTemplateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHtmlTemplateSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-4 text-center bg-slate-50/60">
                <input
                  type="file"
                  id="html-tpl-file"
                  accept=".html,.htm"
                  onChange={e => e.target.files?.[0] && handleHtmlFileUpload(e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="html-tpl-file" className="cursor-pointer flex flex-col items-center justify-center gap-1.5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    {customTemplateData.uploadedFileName || '点击选择或拖拽上传 .html 模板文件'}
                  </span>
                  <span className="text-[11px] text-slate-400">支持内联 CSS 与占位符插值</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">模板名称</label>
                <input
                  type="text"
                  value={customTemplateData.name}
                  onChange={e => setCustomTemplateData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例如：储能电站绝缘阻抗与温升周报模板"
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">HTML 模板源码</label>
                <textarea
                  value={customTemplateData.htmlTemplate}
                  onChange={e => setCustomTemplateData(prev => ({ ...prev, htmlTemplate: e.target.value }))}
                  rows={6}
                  className="w-full text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateHtmlTemplateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
                >
                  确认保存模板
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 操作 Toast 提示 */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-xl p-4 shadow-xl border animate-in slide-in-from-bottom-5 duration-300 ${
          toastMessage.type === 'success'
            ? 'bg-emerald-950 text-emerald-50 border-emerald-800'
            : toastMessage.type === 'warn'
            ? 'bg-amber-950 text-amber-50 border-amber-800'
            : 'bg-slate-900 text-white border-slate-800'
        }`}>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold">{toastMessage.title}</h4>
              {toastMessage.desc && (
                <p className="text-[11px] opacity-80 mt-0.5">{toastMessage.desc}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
