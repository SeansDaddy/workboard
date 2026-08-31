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
  Database,
  Repeat,
  Bell,
  Power,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Timer
} from 'lucide-react';
import { 
  ReportTemplate, 
  ReportGenerationTask, 
  OperationsMetrics, 
  TicketItem, 
  RiskItem, 
  RoutineTaskItem,
  OperationSkill,
  ReportScheduleConfig
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
  const [taskFilterType, setTaskFilterType] = useState<'all' | 'once' | 'periodic' | 'processing'>('all');

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

  // 执行任务创建与异步生成 (支持一次性即时任务与周期性调度任务)
  const handleExecuteCreateTask = (taskPayload: {
    taskType: 'once' | 'periodic';
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
    scheduleConfig?: ReportScheduleConfig;
    generateInitialImmediately?: boolean;
  }) => {
    const isPeriodic = taskPayload.taskType === 'periodic';
    const newTaskId = isPeriodic 
      ? `RPT-SCHED-${Date.now().toString().slice(-6)}`
      : `RPT-ONCE-${Date.now().toString().slice(-6)}`;
    
    // 生成报告 HTML (一次性任务或设置了立即生成首份报告的周期任务)
    const shouldGenerateImmediately = taskPayload.taskType === 'once' || taskPayload.generateInitialImmediately !== false;

    const generatedHtml = shouldGenerateImmediately ? generateReportHtml({
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
    }) : undefined;

    const newTask: ReportGenerationTask = {
      id: newTaskId,
      taskType: taskPayload.taskType,
      reportTitle: taskPayload.title,
      templateId: taskPayload.template.id,
      templateName: taskPayload.template.name,
      periodType: taskPayload.periodType,
      dateRange: taskPayload.dateRange,
      scope: taskPayload.scope,
      creator: taskPayload.creator,
      status: shouldGenerateImmediately ? 'processing' : 'completed',
      progress: shouldGenerateImmediately ? 25 : 100,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      fileFormat: 'HTML',
      stepLog: isPeriodic
        ? (shouldGenerateImmediately 
            ? `周期任务已保存并注册调度器，正在执行第 1 次首份样本报告排版...`
            : `周期任务已就绪，已注册至分布式调度引擎 (${taskPayload.scheduleConfig?.cronSummary || '定时巡检'})`)
        : (taskPayload.associatedSkill 
            ? `正在挂载 Skill [${taskPayload.associatedSkill.name}] 机理并拉取 484 座电站时序数据...`
            : '正在拉取 484 座电站全域时序遥测数据并排版...'),
      htmlContent: generatedHtml,
      associatedSkillId: taskPayload.associatedSkill?.id,
      associatedSkillName: taskPayload.associatedSkill?.name,
      scheduleConfig: taskPayload.scheduleConfig,
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

    if (isPeriodic) {
      showToast('周期巡检任务已创建并启动', `任务编号: ${newTaskId} · ${taskPayload.scheduleConfig?.cronSummary}`, 'success');
    } else {
      showToast('报告生成任务已创建', `任务编号: ${newTaskId}，正在后台流水线排版中`, 'info');
    }

    if (shouldGenerateImmediately) {
      // 模拟后台流水线状态流转
      setTimeout(() => {
        setReportTasks(prev =>
          prev.map(t => {
            if (t.id === newTaskId) {
              return {
                ...t,
                progress: 68,
                stepLog: isPeriodic
                  ? '已完成全域数据校验，正在向协同通道发送预览就绪通知...'
                  : (taskPayload.associatedSkill
                      ? '已匹配 3 项关键特征规则与 38 项指标，正在渲染矢量 HTML 报告...'
                      : '时序数据与指标研判已就绪，正在渲染 HTML 图表组件...')
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
                completedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
                fileSize: '1.65 MB',
                stepLog: isPeriodic
                  ? `首份样本报告已生成归档，调度状态为【运行中】(${taskPayload.scheduleConfig?.cronSummary})`
                  : '报告生成成功，已封装为独立 HTML 交付件'
              };
            }
            return t;
          })
        );
        showToast('报告生成完成！', `任务 ${newTaskId} 已就绪，可随时在线预览或执行下载`, 'success');
      }, 2200);
    }
  };

  // 切换周期性任务的启用/暂停调度状态
  const handleToggleTaskActive = (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReportTasks(prev =>
      prev.map(t => {
        if (t.id === taskId && t.scheduleConfig) {
          const newActive = !t.scheduleConfig.isActive;
          const nextTime = newActive ? '2026-08-31 08:00:00' : '已挂起 (暂停中)';
          showToast(
            newActive ? '已恢复周期调度' : '已暂停周期调度',
            `任务 ${taskId} 调度状态已切换为: ${newActive ? '启用中' : '暂停中'}`,
            newActive ? 'success' : 'info'
          );
          return {
            ...t,
            scheduleConfig: {
              ...t.scheduleConfig,
              isActive: newActive,
              nextExecutionTime: nextTime
            },
            stepLog: newActive 
              ? `调度已恢复运行 (${t.scheduleConfig.cronSummary})`
              : '调度已由操作人手动挂起暂停'
          };
        }
        return t;
      })
    );
  };

  // 手动即时触发一次周期性任务生成
  const handleTriggerPeriodicTaskRun = (task: ReportGenerationTask, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    showToast('正在立即执行生成...', `正在为周期任务「${task.reportTitle}」拉取最新时序数据`, 'info');
    
    // 更新为运算中
    setReportTasks(prev =>
      prev.map(t => {
        if (t.id === task.id) {
          return {
            ...t,
            status: 'processing',
            progress: 30,
            stepLog: '收到手动立即触发指令，正在实时回溯全域电站遥测数据...'
          };
        }
        return t;
      })
    );

    setTimeout(() => {
      setReportTasks(prev =>
        prev.map(t => {
          if (t.id === task.id) {
            return {
              ...t,
              progress: 75,
              stepLog: '时序分析与多维机理模型推演完成，正在重新渲染 HTML 报告...'
            };
          }
          return t;
        })
      );
    }, 1000);

    setTimeout(() => {
      const regeneratedHtml = generateReportHtml({
        reportTitle: task.reportTitle,
        templateCategory: task.templateName,
        templateCode: 'TPL-AUTO-RUN',
        scope: task.scope,
        dateRange: task.dateRange,
        creator: task.creator,
        metrics,
        tickets,
        risks,
        tasks,
        includeAiInsights: task.config?.includeAiInsights ?? true
      });

      setReportTasks(prev =>
        prev.map(t => {
          if (t.id === task.id) {
            const currentCount = t.scheduleConfig?.executionCount || 1;
            return {
              ...t,
              status: 'completed',
              progress: 100,
              completedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
              htmlContent: regeneratedHtml,
              stepLog: `手动触发生成完成 (累计触发 ${currentCount + 1} 次)，已更新最新 HTML 交付件`,
              scheduleConfig: t.scheduleConfig ? {
                ...t.scheduleConfig,
                executionCount: currentCount + 1,
                lastExecutionTime: new Date().toISOString().replace('T', ' ').slice(0, 19)
              } : undefined
            };
          }
          return t;
        })
      );
      showToast('手动触发生成成功！', `已刷新生成最新报告交付件，可预览或下载`, 'success');
    }, 2200);
  };

  // 删除任务
  const handleDeleteTask = (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReportTasks(prev => prev.filter(t => t.id !== taskId));
    showToast('任务已删除', `已移除任务记录 ${taskId}`, 'info');
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
    // 类型过滤
    if (taskFilterType === 'once' && t.taskType !== 'once') return false;
    if (taskFilterType === 'periodic' && t.taskType !== 'periodic') return false;
    if (taskFilterType === 'processing' && t.status !== 'processing') return false;

    // 关键词过滤
    return !taskSearchKeyword.trim() || 
      t.reportTitle.toLowerCase().includes(taskSearchKeyword.toLowerCase()) ||
      t.id.toLowerCase().includes(taskSearchKeyword.toLowerCase()) ||
      t.templateName.toLowerCase().includes(taskSearchKeyword.toLowerCase()) ||
      t.creator.toLowerCase().includes(taskSearchKeyword.toLowerCase());
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
          <div className="space-y-5 w-full">
            {/* 顶部任务统计指示卡 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">全部报告任务</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{reportTasks.length}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">覆盖 484 座储能电站资产</div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    一次性即时任务
                  </div>
                  <div className="text-2xl font-bold text-blue-900 mt-1 font-mono">
                    {reportTasks.filter(t => t.taskType === 'once').length}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">静态时间跨度 · 即时运算交付</div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider flex items-center gap-1">
                    <Repeat className="w-3.5 h-3.5" />
                    周期性调度巡检
                  </div>
                  <div className="text-2xl font-bold text-purple-900 mt-1 font-mono flex items-baseline gap-2">
                    {reportTasks.filter(t => t.taskType === 'periodic').length}
                    <span className="text-xs font-normal text-slate-400">
                      ({reportTasks.filter(t => t.taskType === 'periodic' && t.scheduleConfig?.isActive).length} 启用中)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">日/周/月/季定时巡检 · 自动分发</div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Repeat className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5" />
                    正在运算 / 排队
                  </div>
                  <div className="text-2xl font-bold text-amber-900 mt-1 font-mono">
                    {reportTasks.filter(t => t.status === 'processing').length}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">后台流水线排版中</div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <RefreshCw className={`w-5 h-5 ${reportTasks.filter(t => t.status === 'processing').length > 0 ? 'animate-spin' : ''}`} />
                </div>
              </div>
            </div>

            {/* 任务顶栏：过滤标签与搜索与新建 */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200/80">
                  <button
                    onClick={() => setTaskFilterType('all')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      taskFilterType === 'all'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    全部任务 ({reportTasks.length})
                  </button>
                  <button
                    onClick={() => setTaskFilterType('once')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      taskFilterType === 'once'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                    ⚡ 一次性任务 ({reportTasks.filter(t => t.taskType === 'once').length})
                  </button>
                  <button
                    onClick={() => setTaskFilterType('periodic')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      taskFilterType === 'periodic'
                        ? 'bg-white text-purple-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Repeat className="w-3.5 h-3.5 text-purple-600" />
                    🔄 周期调度 ({reportTasks.filter(t => t.taskType === 'periodic').length})
                  </button>
                  <button
                    onClick={() => setTaskFilterType('processing')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      taskFilterType === 'processing'
                        ? 'bg-white text-amber-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                    运算中 ({reportTasks.filter(t => t.status === 'processing').length})
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="relative w-full max-w-xs">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={taskSearchKeyword}
                    onChange={e => setTaskSearchKeyword(e.target.value)}
                    placeholder="搜索任务编号、标题、责任人..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <button
                  onClick={() => {
                    setSelectedTemplateForTask(templates[0]);
                    setSelectedSkillForTask(null);
                    setShowCreateTaskModal(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  创建报告生成任务
                </button>
              </div>
            </div>

            {/* 任务列表表格 */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-5 py-3.5">任务类型 / 报告交付件标题</th>
                      <th className="px-4 py-3.5">基础模板 / 驱动 Skill</th>
                      <th className="px-4 py-3.5">调度规则 / 周期范围</th>
                      <th className="px-4 py-3.5">责任人 / 接收群</th>
                      <th className="px-4 py-3.5">执行状态 / 进度</th>
                      <th className="px-4 py-3.5">格式 / 大小</th>
                      <th className="px-5 py-3.5 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTasks.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                          <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                          暂无符合条件的报告生成任务
                        </td>
                      </tr>
                    ) : (
                      filteredTasks.map(task => {
                        const isPeriodic = task.taskType === 'periodic';
                        const isTaskActive = task.scheduleConfig?.isActive ?? true;

                        return (
                          <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* 列 1: 任务类型与标题 */}
                            <td className="px-5 py-4">
                              <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                  isPeriodic 
                                    ? 'bg-purple-50 text-purple-600 border border-purple-200' 
                                    : 'bg-blue-50 text-blue-600 border border-blue-200'
                                }`}>
                                  {isPeriodic ? <Repeat className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                      isPeriodic 
                                        ? 'bg-purple-100 text-purple-700 border-purple-300' 
                                        : 'bg-blue-100 text-blue-700 border-blue-300'
                                    }`}>
                                      {isPeriodic ? '🔄 周期巡检' : '⚡ 一次性'}
                                    </span>

                                    {isPeriodic && (
                                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                                        isTaskActive 
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                                      }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${isTaskActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                        {isTaskActive ? '调度运行中' : '已暂停'}
                                      </span>
                                    )}

                                    <span className="text-[11px] text-slate-400 font-mono">
                                      {task.id}
                                    </span>
                                  </div>

                                  <div 
                                    onClick={() => task.status === 'completed' && setPreviewTask(task)}
                                    className={`font-bold text-slate-900 ${
                                      task.status === 'completed' 
                                        ? 'hover:text-blue-600 cursor-pointer' 
                                        : ''
                                    }`}
                                  >
                                    {task.reportTitle}
                                  </div>

                                  <div className="text-[11px] text-slate-400 font-mono">
                                    创建于 {task.createdAt}
                                    {isPeriodic && task.scheduleConfig?.lastExecutionTime && (
                                      <span className="ml-2">· 上次执行: {task.scheduleConfig.lastExecutionTime}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* 列 2: 基础模板与 Skill */}
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

                            {/* 列 3: 调度规则与周期范围 */}
                            <td className="px-4 py-4">
                              {isPeriodic && task.scheduleConfig ? (
                                <div className="space-y-1">
                                  <span className="text-xs font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-block font-mono">
                                    {task.scheduleConfig.cronSummary}
                                  </span>
                                  <div className="text-[11px] text-slate-500 font-mono">
                                    {task.scheduleConfig.nextExecutionTime ? `下次: ${task.scheduleConfig.nextExecutionTime}` : ''}
                                  </div>
                                  {task.scheduleConfig.notifyChannels && task.scheduleConfig.notifyChannels.length > 0 && (
                                    <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                                      {task.scheduleConfig.notifyChannels.map(ch => (
                                        <span key={ch} className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                          {ch === 'dingtalk' ? '钉钉' : ch === 'wecom' ? '企微' : ch === 'email' ? '邮件' : '站内'}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  <span className="text-[11px] text-slate-400 block truncate max-w-[160px]">{task.scope}</span>
                                </div>
                              ) : (
                                <div>
                                  <span className="text-slate-800 font-mono block">{task.dateRange}</span>
                                  <span className="text-[11px] text-slate-400 block mt-0.5">{task.scope}</span>
                                </div>
                              )}
                            </td>

                            {/* 列 4: 责任人与目标群 */}
                            <td className="px-4 py-4">
                              <span className="font-medium text-slate-800 block">{task.creator}</span>
                              {isPeriodic && task.scheduleConfig?.recipients && (
                                <span className="text-[11px] text-slate-400 block truncate max-w-[140px] mt-0.5" title={task.scheduleConfig.recipients}>
                                  接收: {task.scheduleConfig.recipients}
                                </span>
                              )}
                            </td>

                            {/* 列 5: 执行状态与进度 */}
                            <td className="px-4 py-4">
                              {task.status === 'completed' ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>就绪 (100%)</span>
                                  </div>
                                  {isPeriodic && (
                                    <span className="text-[10px] text-slate-400 font-mono block">
                                      累计触发: {task.scheduleConfig?.executionCount || 1} 次
                                    </span>
                                  )}
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
                                  <span className="text-[10px] text-slate-400 truncate block max-w-[180px]">
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

                            {/* 列 6: 交付件格式 */}
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

                            {/* 列 7: 操作按钮 */}
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {task.status === 'completed' && (
                                  <>
                                    <button
                                      onClick={() => setPreviewTask(task)}
                                      className="px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                                      title="在线预览 HTML 报告"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      预览
                                    </button>
                                    <button
                                      onClick={e => handleDownloadTaskReport(task, e)}
                                      className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                                      title="下载独立单文件 HTML"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      下载
                                    </button>
                                  </>
                                )}

                                {isPeriodic && (
                                  <>
                                    <button
                                      onClick={e => handleTriggerPeriodicTaskRun(task, e)}
                                      disabled={task.status === 'processing'}
                                      className="px-2.5 py-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 hover:bg-purple-50 disabled:opacity-50 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                                      title="立即触发一次手动生成"
                                    >
                                      <PlayCircle className="w-3.5 h-3.5" />
                                      即刻触发
                                    </button>

                                    <button
                                      onClick={e => handleToggleTaskActive(task.id, e)}
                                      className={`p-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                        isTaskActive 
                                          ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-800' 
                                          : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800'
                                      }`}
                                      title={isTaskActive ? '挂起暂停周期调度' : '恢复启用周期调度'}
                                    >
                                      {isTaskActive ? <PauseCircle className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                                    </button>
                                  </>
                                )}

                                <button
                                  onClick={e => handleDeleteTask(task.id, e)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="删除任务记录"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
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
