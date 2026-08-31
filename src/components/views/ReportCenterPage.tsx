import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  CheckCircle2, 
  TrendingUp, 
  ShieldAlert, 
  ArrowLeft,
  Filter,
  Sparkles,
  Award,
  Plus,
  Clock,
  Check,
  Eye,
  RefreshCw,
  Trash2,
  Layers,
  BarChart3,
  Search,
  ChevronRight,
  X,
  ExternalLink,
  BookOpen,
  Share2
} from 'lucide-react';
import { 
  OperationsMetrics, 
  TicketItem, 
  RiskItem, 
  RoutineTaskItem, 
  ReportTemplate, 
  ReportGenerationTask,
  CONFIG_THRESHOLDS 
} from '../../types';
import { REPORT_TEMPLATES, INITIAL_REPORT_TASKS } from '../../mock/reportData';
import { generateReportHtml } from '../../utils/reportHtmlGenerator';

interface ReportCenterPageProps {
  metrics: OperationsMetrics;
  tickets?: TicketItem[];
  risks?: RiskItem[];
  tasks?: RoutineTaskItem[];
  onReturnToWorkbench: () => void;
  onExportReport?: (type: string) => void;
}

export const ReportCenterPage: React.FC<ReportCenterPageProps> = ({
  metrics,
  tickets = [],
  risks = [],
  tasks = [],
  onReturnToWorkbench,
  onExportReport
}) => {
  // 当前活动 Tab: 'templates' (模板库) | 'tasks' (生成任务管理) | 'preview' (报告预览)
  const [activeTab, setActiveTab] = useState<'templates' | 'tasks' | 'preview'>('templates');
  
  // 模板分类过滤
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [templateSearchKeyword, setTemplateSearchKeyword] = useState<string>('');

  // 任务管理列表
  const [reportTasks, setReportTasks] = useState<ReportGenerationTask[]>(() => {
    // 为初始任务注入 HTML 源码
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

  // 创建任务弹窗状态
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>(REPORT_TEMPLATES[0]);
  
  // 任务表单字段
  const [formData, setFormData] = useState({
    title: '',
    periodType: 'week' as 'week' | 'month' | 'quarter' | 'custom',
    dateRange: '2026-08-18 ~ 2026-08-25',
    scope: '华东一区 (全域484座电站)',
    creator: CONFIG_THRESHOLDS.CURRENT_USER_NAME + ' (' + CONFIG_THRESHOLDS.CURRENT_USER_ROLE + ')',
    includeAiInsights: true,
    includeDischargeDetails: true,
    includeSlaTickets: true,
    includeRiskMatrix: true,
    includeRoutineTasks: true,
    fileFormat: 'HTML' as 'HTML' | 'PDF' | 'EXCEL'
  });

  // 预览 HTML 报告弹窗状态
  const [previewTask, setPreviewTask] = useState<ReportGenerationTask | null>(null);

  // 模板详情抽屉/弹窗
  const [viewingTemplate, setViewingTemplate] = useState<ReportTemplate | null>(null);

  // 操作提示消息
  const [toastMessage, setToastMessage] = useState<{ title: string; desc?: string; type?: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (title: string, desc?: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 根据选定模板自动更新推荐标题
  const handleSelectTemplateForCreate = (tpl: ReportTemplate) => {
    setSelectedTemplate(tpl);
    let defaultTitle = tpl.defaultTitleTemplate;
    if (tpl.presetPeriod === 'week') {
      defaultTitle = defaultTitle.replace('{WEEK}', '34');
      setFormData(prev => ({
        ...prev,
        title: defaultTitle,
        periodType: 'week',
        dateRange: '2026-08-18 ~ 2026-08-25'
      }));
    } else if (tpl.presetPeriod === 'month') {
      setFormData(prev => ({
        ...prev,
        title: defaultTitle,
        periodType: 'month',
        dateRange: '2026-08-01 ~ 2026-08-25'
      }));
    } else if (tpl.presetPeriod === 'quarter') {
      setFormData(prev => ({
        ...prev,
        title: defaultTitle,
        periodType: 'quarter',
        dateRange: '2026-07-01 ~ 2026-08-25'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        title: defaultTitle,
        periodType: 'custom',
        dateRange: '2026-08-20 ~ 2026-08-25'
      }));
    }
    setShowCreateModal(true);
  };

  // 提交并创建生成任务
  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('请输入报告标题', '标题不能为空', 'warn');
      return;
    }

    const newTaskId = `RPT-TASK-${Date.now().toString().slice(-8)}`;
    const initialHtml = generateReportHtml({
      reportTitle: formData.title,
      templateCategory: selectedTemplate.category,
      templateCode: selectedTemplate.code,
      scope: formData.scope,
      dateRange: formData.dateRange,
      creator: formData.creator,
      metrics,
      tickets,
      risks,
      tasks,
      includeAiInsights: formData.includeAiInsights
    });

    const newTask: ReportGenerationTask = {
      id: newTaskId,
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      reportTitle: formData.title,
      periodType: formData.periodType,
      dateRange: formData.dateRange,
      scope: formData.scope,
      creator: formData.creator,
      createdAt: '2026-08-25 ' + new Date().toTimeString().slice(0, 5),
      status: 'processing',
      progress: 15,
      stepLog: '正在建立时序数据库连接，拉取全域电站遥测数据...',
      fileFormat: formData.fileFormat,
      fileSize: '1.56 MB',
      htmlContent: initialHtml,
      config: {
        includeAiInsights: formData.includeAiInsights,
        includeDischargeDetails: formData.includeDischargeDetails,
        includeSlaTickets: formData.includeSlaTickets,
        includeRiskMatrix: formData.includeRiskMatrix,
        includeRoutineTasks: formData.includeRoutineTasks
      }
    };

    setReportTasks(prev => [newTask, ...prev]);
    setShowCreateModal(false);
    setActiveTab('tasks');
    showToast(`报告任务 ${newTaskId} 创建成功！`, '系统已启动生成流水线，正在并行处理数据与机理分析', 'info');

    // 模拟生成进度流水线
    let currentProgress = 15;
    const progressTimer = setInterval(() => {
      currentProgress += 28;
      if (currentProgress < 95) {
        setReportTasks(prev =>
          prev.map(t => {
            if (t.id === newTaskId) {
              const stepLog = currentProgress < 50 
                ? '正在调用 AI 专家模型提取电芯温差与接触内阻机理特征...'
                : '正在排版结构化章节并渲染 HTML 矢量图表...';
              return { ...t, progress: currentProgress, stepLog };
            }
            return t;
          })
        );
      } else {
        clearInterval(progressTimer);
        setReportTasks(prev =>
          prev.map(t => {
            if (t.id === newTaskId) {
              return {
                ...t,
                status: 'completed',
                progress: 100,
                completedAt: '2026-08-25 ' + new Date().toTimeString().slice(0, 8),
                stepLog: '报告生成完毕，已固化 HTML 单文件，支持随时预览与下载'
              };
            }
            return t;
          })
        );
        showToast(`🎉 报告《${formData.title}》已生成完毕！`, '可直接点击「在线预览」或「下载 HTML」', 'success');
      }
    }, 900);
  };

  // 下载 HTML 格式报告核心函数
  const handleDownloadHtml = (task: ReportGenerationTask) => {
    try {
      const content = task.htmlContent || generateReportHtml({
        reportTitle: task.reportTitle,
        templateCategory: task.templateName,
        templateCode: 'TPL-DOWNLOAD',
        scope: task.scope,
        dateRange: task.dateRange,
        creator: task.creator,
        metrics,
        tickets,
        risks,
        tasks,
        includeAiInsights: task.config?.includeAiInsights ?? true
      });

      const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `${task.reportTitle.replace(/[\\/:*?"<>|]/g, '_')}.html`;
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`已成功下载 HTML 报告文件`, `文件名为: ${filename}，可在任意浏览器双击离线打开`, 'success');
    } catch (err) {
      showToast('下载失败', '生成下载链接时发生异常，请重试', 'warn');
    }
  };

  // 重新生成任务
  const handleRerunTask = (taskId: string) => {
    setReportTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'processing',
            progress: 20,
            stepLog: '重新提取最新时序遥测数据并刷新 HTML 内容...'
          };
        }
        return t;
      })
    );
    showToast(`正在重新生成任务 ${taskId}`, '将在数秒内完成数据更新与排版渲染', 'info');

    setTimeout(() => {
      setReportTasks(prev =>
        prev.map(t => {
          if (t.id === taskId) {
            return {
              ...t,
              status: 'completed',
              progress: 100,
              stepLog: '已重新生成最新 HTML 报告'
            };
          }
          return t;
        })
      );
      showToast(`任务 ${taskId} 重新生成成功！`, '报告内容已同步至最新数据', 'success');
    }, 2000);
  };

  // 删除任务
  const handleDeleteTask = (taskId: string) => {
    setReportTasks(prev => prev.filter(t => t.id !== taskId));
    showToast('任务已删除', `已移除生成任务 ${taskId}`, 'info');
  };

  // 过滤模板
  const filteredTemplates = REPORT_TEMPLATES.filter(tpl => {
    const matchCategory = selectedCategory === 'all' || tpl.category === selectedCategory;
    const matchKeyword = !templateSearchKeyword.trim() || 
      tpl.name.toLowerCase().includes(templateSearchKeyword.toLowerCase()) ||
      tpl.description.toLowerCase().includes(templateSearchKeyword.toLowerCase());
    return matchCategory && matchKeyword;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-200 pb-12">
      {/* 顶部面包屑与标题栏 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded border border-[#E8E8E8] shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={onReturnToWorkbench}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-[#D9D9D9] text-[#595959] hover:text-[#1890FF] hover:border-[#1890FF] text-xs font-medium cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#8C8C8C]" />
            <span>返回工作台</span>
          </button>
          <div className="h-4 w-px bg-[#E8E8E8] hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-[#F9F0FF] text-[#722ED1] border border-[#D3ADF7]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-[#1F1F1F]">运维报告中心</h1>
                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[#1890FF] text-[11px] font-medium border border-blue-200">
                  支持 5 套专业运营模板
                </span>
                <span className="px-1.5 py-0.5 rounded bg-green-50 text-[#52C41A] text-[11px] font-medium border border-green-200">
                  HTML 格式独立离线下载
                </span>
              </div>
              <p className="text-[11px] text-[#8C8C8C]">
                提供运营周报、月度白皮书、季度资产评估及专题体检模板，支持异步创建生成任务、HTML 格式离线下载与在线深度预览
              </p>
            </div>
          </div>
        </div>

        {/* 快捷操作区 */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleSelectTemplateForCreate(REPORT_TEMPLATES[0])}
            className="px-3.5 py-1.5 bg-[#1890FF] hover:bg-[#40A9FF] text-white rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>创建报告生成任务</span>
          </button>
        </div>
      </div>

      {/* 提示消息 Toast */}
      {toastMessage && (
        <div className={`p-3 rounded border text-xs flex items-center justify-between animate-in fade-in ${
          toastMessage.type === 'warn' ? 'bg-[#FFFBE6] border-[#FFE58F] text-[#D48806]' :
          toastMessage.type === 'info' ? 'bg-[#E6F7FF] border-[#91D5FF] text-[#096DD9]' :
          'bg-[#F6FFED] border-[#B7EB8F] text-[#52C41A]'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <div>
              <span className="font-semibold">{toastMessage.title}</span>
              {toastMessage.desc && <span className="ml-2 opacity-90">{toastMessage.desc}</span>}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="hover:underline text-xs cursor-pointer ml-4 font-medium"
          >
            关闭
          </button>
        </div>
      )}

      {/* 主 Tab 切换导航 */}
      <div className="bg-white rounded border border-[#E8E8E8] px-3 pt-2.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 border-b-2 border-transparent">
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`px-3.5 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'templates'
                ? 'border-[#1890FF] text-[#1890FF] font-semibold'
                : 'border-transparent text-[#595959] hover:text-[#262626]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>运维运营报告模板库</span>
            <span className="px-1.5 py-0.2 rounded-full bg-gray-100 text-[#595959] text-[10px]">
              {REPORT_TEMPLATES.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'border-[#1890FF] text-[#1890FF] font-semibold'
                : 'border-transparent text-[#595959] hover:text-[#262626]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>报告生成任务管理</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-[#1890FF] text-[10px] font-bold">
              {reportTasks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3.5 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'border-[#1890FF] text-[#1890FF] font-semibold'
                : 'border-transparent text-[#595959] hover:text-[#262626]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>最新白皮书概览</span>
          </button>
        </div>

        <div className="text-[11px] text-[#8C8C8C] pb-2">
          当前统计范围: <strong>华东一区 (江苏/苏北/苏南 484座储能站)</strong>
        </div>
      </div>

      {/* Tab 1: 模板库视图 */}
      {activeTab === 'templates' && (
        <div className="space-y-4 animate-in fade-in">
          {/* 模板过滤与搜索 */}
          <div className="bg-white p-3 rounded border border-[#E8E8E8] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {['all', '运营周报', '月度白皮书', '季度评估', '单站深度体检', '安全合规专项'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded text-xs transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#1890FF] text-white font-medium shadow-2xs'
                      : 'bg-[#F5F5F5] text-[#595959] hover:text-[#1890FF]'
                  }`}
                >
                  {cat === 'all' ? '全部模板 (5)' : cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#8C8C8C] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索模板名称或内容..."
                value={templateSearchKeyword}
                onChange={(e) => setTemplateSearchKeyword(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-[#FAFAFA] border border-[#D9D9D9] rounded text-xs text-[#262626] focus:bg-white focus:border-[#1890FF] outline-none"
              />
            </div>
          </div>

          {/* 模板卡片列表 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((tpl) => (
              <div 
                key={tpl.id}
                className="bg-white rounded-lg border border-[#E8E8E8] hover:border-[#1890FF] hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* 卡片头部色条与徽章 */}
                  <div 
                    className="h-2 w-full"
                    style={{ backgroundColor: tpl.coverColor }}
                  />
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-[#8C8C8C] font-mono block">{tpl.code}</span>
                        <h3 className="text-sm font-bold text-[#1F1F1F] group-hover:text-[#1890FF] transition-colors">
                          {tpl.name}
                        </h3>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        tpl.tag === '推荐' ? 'bg-purple-100 text-[#722ED1] border border-purple-200' :
                        tpl.tag === '高频' ? 'bg-blue-100 text-[#1890FF] border border-blue-200' :
                        tpl.tag === '管理层专报' ? 'bg-amber-100 text-[#D48806] border border-amber-200' :
                        'bg-green-100 text-[#389E0D] border border-green-200'
                      }`}>
                        {tpl.tag}
                      </span>
                    </div>

                    <p className="text-xs text-[#595959] leading-relaxed line-clamp-2 min-h-[36px]">
                      {tpl.description}
                    </p>

                    {/* 预估耗时与适用受众 */}
                    <div className="pt-2 border-t border-[#F0F0F0] space-y-1 text-[11px] text-[#8C8C8C]">
                      <div className="flex items-center justify-between">
                        <span>预估生成耗时:</span>
                        <span className="font-semibold text-[#1F1F1F] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#1890FF]" />
                          {tpl.estimatedTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>适用对象:</span>
                        <span className="text-[#595959] truncate max-w-[170px]" title={tpl.targetAudience}>
                          {tpl.targetAudience}
                        </span>
                      </div>
                    </div>

                    {/* 包含章节 */}
                    <div className="p-2.5 bg-[#FAFAFA] rounded border border-[#F0F0F0] space-y-1">
                      <span className="text-[11px] font-semibold text-[#1F1F1F] block">核心预设章节:</span>
                      <ul className="text-[10px] text-[#595959] space-y-0.5">
                        {tpl.sections.slice(0, 3).map((sec, idx) => (
                          <li key={idx} className="truncate">• {sec}</li>
                        ))}
                        {tpl.sections.length > 3 && (
                          <li className="text-[#8C8C8C] italic">+ 另外 {tpl.sections.length - 3} 个专业章节...</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 卡片底部操作按钮 */}
                <div className="px-4 py-3 bg-[#FAFAFA] border-t border-[#F0F0F0] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingTemplate(tpl)}
                    className="px-2.5 py-1 text-xs text-[#595959] hover:text-[#1890FF] rounded transition-colors cursor-pointer"
                  >
                    查看结构
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTemplateForCreate(tpl)}
                    className="px-3.5 py-1.5 bg-[#1890FF] hover:bg-[#40A9FF] text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>选用此模板创建任务</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: 报告生成任务管理与流水线 */}
      {activeTab === 'tasks' && (
        <div className="space-y-4 animate-in fade-in">
          {/* 任务列表操作与统计 */}
          <div className="bg-white p-3 rounded border border-[#E8E8E8] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#595959]">
                任务总数: <strong>{reportTasks.length}</strong> | 
                已完成: <strong className="text-[#52C41A]">{reportTasks.filter(t => t.status === 'completed').length}</strong> | 
                生成中: <strong className="text-[#1890FF]">{reportTasks.filter(t => t.status === 'processing').length}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectTemplateForCreate(REPORT_TEMPLATES[0])}
                className="px-3 py-1 bg-[#1890FF] hover:bg-[#40A9FF] text-white rounded text-xs font-medium flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新建报告生成任务</span>
              </button>
            </div>
          </div>

          {/* 任务表格 Table */}
          <div className="bg-white rounded border border-[#E8E8E8] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAFAFA] text-[#595959] border-b border-[#E8E8E8]">
                    <th className="py-2.5 px-3 font-semibold">任务编号</th>
                    <th className="py-2.5 px-3 font-semibold">报告标题 / 所用模板</th>
                    <th className="py-2.5 px-3 font-semibold">统计周期与范围</th>
                    <th className="py-2.5 px-3 font-semibold">生成状态与进度</th>
                    <th className="py-2.5 px-3 font-semibold">格式 / 大小</th>
                    <th className="py-2.5 px-3 font-semibold">创建人 / 时间</th>
                    <th className="py-2.5 px-3 font-semibold text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0]">
                  {reportTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-blue-50/40 transition-colors">
                      {/* 任务编号 */}
                      <td className="py-3 px-3 font-mono font-bold text-[#1890FF]">
                        {task.id}
                      </td>

                      {/* 报告标题与模板 */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#1F1F1F] line-clamp-1 max-w-[260px]" title={task.reportTitle}>
                          {task.reportTitle}
                        </div>
                        <span className="text-[10px] text-[#8C8C8C] bg-[#F5F5F5] px-1.5 py-0.2 rounded border border-[#E8E8E8] inline-block mt-0.5">
                          {task.templateName}
                        </span>
                      </td>

                      {/* 周期与范围 */}
                      <td className="py-3 px-3 text-[#595959]">
                        <div>{task.dateRange}</div>
                        <div className="text-[11px] text-[#8C8C8C]">{task.scope}</div>
                      </td>

                      {/* 状态与进度条 */}
                      <td className="py-3 px-3 min-w-[180px]">
                        {task.status === 'completed' ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 text-[#52C41A] font-semibold text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              已完成 (100%)
                            </span>
                            <p className="text-[10px] text-[#8C8C8C] truncate max-w-[200px]" title={task.stepLog}>
                              {task.stepLog}
                            </p>
                          </div>
                        ) : task.status === 'processing' ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-[#1890FF] font-semibold flex items-center gap-1">
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                生成中...
                              </span>
                              <span className="font-mono text-[#1890FF]">{task.progress}%</span>
                            </div>
                            <div className="w-full bg-[#E8E8E8] rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-[#1890FF] h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-[#8C8C8C] truncate max-w-[200px]" title={task.stepLog}>
                              {task.stepLog}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[#8C8C8C]">排队待处理</span>
                        )}
                      </td>

                      {/* 格式与文件大小 */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[#1890FF] font-bold text-[10px] border border-blue-200">
                            {task.fileFormat}
                          </span>
                          <span className="text-[11px] text-[#8C8C8C]">{task.fileSize || '1.4 MB'}</span>
                        </div>
                      </td>

                      {/* 创建人与时间 */}
                      <td className="py-3 px-3 text-[#595959]">
                        <div>{task.creator.split(' ')[0]}</div>
                        <div className="text-[10px] text-[#8C8C8C]">{task.createdAt}</div>
                      </td>

                      {/* 操作列 */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {task.status === 'completed' ? (
                            <>
                              {/* 在线预览 */}
                              <button
                                type="button"
                                title="在线全屏预览 HTML 报告"
                                onClick={() => setPreviewTask(task)}
                                className="px-2 py-1 text-xs text-[#1890FF] hover:bg-blue-50 rounded flex items-center gap-0.5 cursor-pointer font-medium"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>预览</span>
                              </button>

                              {/* 下载 HTML */}
                              <button
                                type="button"
                                title="下载独立 HTML 格式文件"
                                onClick={() => handleDownloadHtml(task)}
                                className="px-2.5 py-1 text-xs bg-[#52C41A] hover:bg-[#73D13D] text-white rounded flex items-center gap-1 cursor-pointer font-semibold shadow-2xs transition-colors"
                              >
                                <Download className="w-3 h-3" />
                                <span>下载 HTML</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-[#8C8C8C] italic">生成中...</span>
                          )}

                          {/* 更多操作 (重新生成 / 删除) */}
                          <button
                            type="button"
                            title="重新生成"
                            onClick={() => handleRerunTask(task.id)}
                            className="p-1 text-[#8C8C8C] hover:text-[#1890FF] rounded cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            title="删除任务"
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-[#8C8C8C] hover:text-[#F5222D] rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Tab 3: 最新白皮书概览视图 */}
      {activeTab === 'preview' && (
        <div className="space-y-4 animate-in fade-in">
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

          {/* 报告正文卡片 */}
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
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const task = reportTasks[0];
                    if (task) setPreviewTask(task);
                  }}
                  className="px-3 py-1.5 text-xs bg-white border border-[#D9D9D9] text-[#1890FF] hover:border-[#1890FF] rounded flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>在线全屏预览</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const task = reportTasks[0];
                    if (task) handleDownloadHtml(task);
                  }}
                  className="px-3.5 py-1.5 bg-[#52C41A] hover:bg-[#73D13D] text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>下载 HTML 格式报告</span>
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
      )}

      {/* 创建报告生成任务模态框 (Create Task Modal) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-[#D9D9D9] shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E8]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded bg-blue-50 text-[#1890FF]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1F1F1F]">创建报告生成任务</h3>
                  <span className="text-xs text-[#8C8C8C]">
                    选择运维运营模板与统计范围，系统将自动拉取时序遥测数据并排版生成 HTML 格式报告
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-[#8C8C8C] hover:text-[#262626] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-4 text-xs">
              {/* 模板选择与快速切换 */}
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1F1F1F] block">
                  1. 选择报告模板 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {REPORT_TEMPLATES.map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => {
                        setSelectedTemplate(tpl);
                        let title = tpl.defaultTitleTemplate.replace('{WEEK}', '34');
                        setFormData(prev => ({ ...prev, title }));
                      }}
                      className={`p-2.5 rounded border cursor-pointer transition-all flex items-start justify-between gap-2 ${
                        selectedTemplate.id === tpl.id
                          ? 'border-[#1890FF] bg-blue-50/50 shadow-2xs'
                          : 'border-[#E8E8E8] hover:border-gray-300 bg-[#FAFAFA]'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-[#1F1F1F] block">{tpl.name}</span>
                        <span className="text-[10px] text-[#8C8C8C] block mt-0.5">{tpl.category} · 耗时 {tpl.estimatedTime}</span>
                      </div>
                      {selectedTemplate.id === tpl.id && (
                        <Check className="w-4 h-4 text-[#1890FF] shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 报告标题 */}
              <div className="space-y-1">
                <label className="font-semibold text-[#1F1F1F] block">
                  2. 报告标题 (自动推荐) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="请输入报告标题..."
                  className="w-full p-2.5 bg-[#FAFAFA] border border-[#D9D9D9] rounded text-xs text-[#262626] focus:bg-white focus:border-[#1890FF] outline-none font-medium"
                />
              </div>

              {/* 统计周期与范围 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F1F1F] block">3. 统计周期与时间</label>
                  <select
                    value={formData.periodType}
                    onChange={(e) => {
                      const p = e.target.value as any;
                      let range = '2026-08-18 ~ 2026-08-25';
                      if (p === 'month') range = '2026-08-01 ~ 2026-08-25';
                      if (p === 'quarter') range = '2026-07-01 ~ 2026-08-25';
                      setFormData({ ...formData, periodType: p, dateRange: range });
                    }}
                    className="w-full p-2 bg-[#FAFAFA] border border-[#D9D9D9] rounded text-xs text-[#262626] focus:bg-white focus:border-[#1890FF] outline-none"
                  >
                    <option value="week">本周周度数据 (2026-08-18 ~ 2026-08-25)</option>
                    <option value="month">本月月度数据 (2026-08-01 ~ 2026-08-25)</option>
                    <option value="quarter">第三季度数据 (2026-07-01 ~ 2026-08-25)</option>
                    <option value="custom">特定专项时间段 (近 7 日)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1F1F1F] block">4. 统计电站范围</label>
                  <select
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    className="w-full p-2 bg-[#FAFAFA] border border-[#D9D9D9] rounded text-xs text-[#262626] focus:bg-white focus:border-[#1890FF] outline-none"
                  >
                    <option value="华东一区 (全域484座电站)">华东一区 (全域484座电站)</option>
                    <option value="苏北运维片区 (186座电站)">苏北运维片区 (186座电站)</option>
                    <option value="苏南运维片区 (210座电站)">苏南运维片区 (210座电站)</option>
                    <option value="浙北运维片区 (88座电站)">浙北运维片区 (88座电站)</option>
                    <option value="宿迁泗洪50MW储能电站 (ST-SQ-001)">宿迁泗洪50MW储能电站 (ST-SQ-001)</option>
                    <option value="盐城滨海30MW储能电站 (ST-YC-002)">盐城滨海30MW储能电站 (ST-YC-002)</option>
                  </select>
                </div>
              </div>

              {/* 数据维度选项 */}
              <div className="space-y-1.5 p-3 bg-[#FAFAFA] rounded border border-[#E8E8E8]">
                <span className="font-semibold text-[#1F1F1F] block text-xs">5. 包含的核心分析模块与数据源:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#262626]">
                    <input
                      type="checkbox"
                      checked={formData.includeDischargeDetails}
                      onChange={(e) => setFormData({ ...formData, includeDischargeDetails: e.target.checked })}
                      className="rounded text-[#1890FF]"
                    />
                    <span>削峰填谷充放电量效益</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#262626]">
                    <input
                      type="checkbox"
                      checked={formData.includeSlaTickets}
                      onChange={(e) => setFormData({ ...formData, includeSlaTickets: e.target.checked })}
                      className="rounded text-[#1890FF]"
                    />
                    <span>pcare 工单与 SLA 履约</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#262626]">
                    <input
                      type="checkbox"
                      checked={formData.includeRiskMatrix}
                      onChange={(e) => setFormData({ ...formData, includeRiskMatrix: e.target.checked })}
                      className="rounded text-[#1890FF]"
                    />
                    <span>AI 故障机理预警矩阵</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#262626]">
                    <input
                      type="checkbox"
                      checked={formData.includeRoutineTasks}
                      onChange={(e) => setFormData({ ...formData, includeRoutineTasks: e.target.checked })}
                      className="rounded text-[#1890FF]"
                    />
                    <span>例行作业巡检与整改</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#722ED1] font-semibold col-span-2">
                    <input
                      type="checkbox"
                      checked={formData.includeAiInsights}
                      onChange={(e) => setFormData({ ...formData, includeAiInsights: e.target.checked })}
                      className="rounded text-[#722ED1]"
                    />
                    <span>开启 Gemini / AI 专家模型深度研判与改善建议</span>
                  </label>
                </div>
              </div>

              {/* 编制人与生成格式 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F1F1F] block">6. 编制人 / 责任部门</label>
                  <input
                    type="text"
                    value={formData.creator}
                    onChange={(e) => setFormData({ ...formData, creator: e.target.value })}
                    className="w-full p-2 bg-[#FAFAFA] border border-[#D9D9D9] rounded text-xs text-[#262626] focus:bg-white focus:border-[#1890FF] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1F1F1F] block">7. 目标生成格式</label>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="px-3 py-1 bg-blue-50 border border-[#1890FF] text-[#1890FF] rounded font-bold text-xs flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      HTML (自包含格式，支持离线打开与下载)
                    </span>
                  </div>
                </div>
              </div>

              {/* 弹窗底部操作 */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E8E8E8]">
                <span className="text-[11px] text-[#8C8C8C]">
                  提交后将自动进入异步任务队列，生成完成后可一键下载 .html 格式报告
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3.5 py-1.5 bg-white border border-[#D9D9D9] text-[#595959] hover:text-[#262626] rounded text-xs cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#1890FF] hover:bg-[#40A9FF] text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>立即创建并生成</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HTML 报告全屏在线预览模态框 (HTML Report Viewer Modal) */}
      {previewTask && (
        <div className="fixed inset-0 z-60 overflow-hidden flex flex-col bg-black/75 animate-in fade-in duration-150">
          {/* 顶部预览工具栏 */}
          <div className="bg-[#001529] text-white px-5 py-3 flex items-center justify-between gap-3 border-b border-gray-700 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded bg-blue-600 text-white">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{previewTask.reportTitle}</span>
                  <span className="px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-300 text-[10px] border border-blue-400/40">
                    HTML 5 格式
                  </span>
                </h3>
                <p className="text-[11px] text-gray-400">
                  任务编号: {previewTask.id} | 统计范围: {previewTask.scope} | 生成时间: {previewTask.completedAt || previewTask.createdAt}
                </p>
              </div>
            </div>

            {/* 预览右侧操作 */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownloadHtml(previewTask)}
                className="px-3.5 py-1.5 bg-[#52C41A] hover:bg-[#73D13D] text-white rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>下载 HTML 文件</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const iframe = document.getElementById('report-preview-iframe') as HTMLIFrameElement;
                  if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.print();
                  } else {
                    window.print();
                  }
                }}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>打印 / PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewTask(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded cursor-pointer"
                title="关闭预览"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 预览主视口 (Iframe 隔离渲染 HTML 报告) */}
          <div className="flex-1 bg-gray-200 overflow-hidden p-2 sm:p-4">
            <iframe
              id="report-preview-iframe"
              title="HTML Report Preview"
              srcDoc={previewTask.htmlContent || generateReportHtml({
                reportTitle: previewTask.reportTitle,
                templateCategory: previewTask.templateName,
                templateCode: 'TPL-VIEW',
                scope: previewTask.scope,
                dateRange: previewTask.dateRange,
                creator: previewTask.creator,
                metrics,
                tickets,
                risks,
                tasks,
                includeAiInsights: previewTask.config?.includeAiInsights ?? true
              })}
              className="w-full h-full bg-white rounded-lg border border-gray-300 shadow-xl"
              sandbox="allow-scripts allow-same-origin allow-modals allow-popups"
            />
          </div>
        </div>
      )}

      {/* 模板详情结构查看弹窗 */}
      {viewingTemplate && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-lg w-full border border-[#D9D9D9] shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E8E8]">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: viewingTemplate.coverColor }}
                />
                <h3 className="text-sm font-bold text-[#1F1F1F]">{viewingTemplate.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingTemplate(null)}
                className="text-[#8C8C8C] hover:text-[#262626] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#262626]">
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">模板类别与编号:</span>
                <span className="font-mono font-medium">{viewingTemplate.code} · {viewingTemplate.category}</span>
              </div>

              <div>
                <span className="text-[#8C8C8C] block text-[11px]">适用场景与受众:</span>
                <p className="text-[#595959] mt-0.5">{viewingTemplate.targetAudience}</p>
              </div>

              <div>
                <span className="text-[#8C8C8C] block text-[11px]">详细预设章节规范:</span>
                <div className="p-2.5 bg-[#FAFAFA] rounded border border-[#E8E8E8] space-y-1 mt-1">
                  {viewingTemplate.sections.map((sec, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-[#1890FF] font-bold">✓</span>
                      <span>{sec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E8E8]">
              <button
                type="button"
                onClick={() => setViewingTemplate(null)}
                className="px-3.5 py-1.5 bg-white border border-[#D9D9D9] text-[#595959] rounded text-xs cursor-pointer"
              >
                关闭
              </button>
              <button
                type="button"
                onClick={() => {
                  const tpl = viewingTemplate;
                  setViewingTemplate(null);
                  handleSelectTemplateForCreate(tpl);
                }}
                className="px-4 py-1.5 bg-[#1890FF] hover:bg-[#40A9FF] text-white rounded text-xs font-semibold cursor-pointer shadow-xs"
              >
                选用此模板
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
