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
  Sliders,
  Clock,
  Repeat,
  Bell,
  Mail,
  MessageSquare,
  Radio,
  CheckCircle2,
  CalendarDays,
  Timer
} from 'lucide-react';
import { ReportTemplate, OperationSkill, ReportScheduleConfig } from '../../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: ReportTemplate[];
  skills: OperationSkill[];
  initialTemplate?: ReportTemplate | null;
  initialSkill?: OperationSkill | null;
  onSubmitTask: (taskData: {
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
  // 任务类型：'once' (一次性即时任务) | 'periodic' (周期性定时任务)
  const [taskType, setTaskType] = useState<'once' | 'periodic'>('once');

  // 生成驱动引擎模式：'template' (模板库) | 'skill' (AI 运维机理 Skill)
  const [mode, setMode] = useState<'template' | 'skill'>(initialSkill ? 'skill' : 'template');
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>(initialTemplate || templates[0]);
  const [selectedSkill, setSelectedSkill] = useState<OperationSkill | null>(initialSkill || (skills.length > 0 ? skills[0] : null));

  const [title, setTitle] = useState<string>('');
  const [scope, setScope] = useState<string>('华东一区 (全域484座电站)');
  const [creator, setCreator] = useState<string>('张工 (区域运维负责人)');
  const [fileFormat, setFileFormat] = useState<'HTML' | 'PDF' | 'EXCEL'>('HTML');

  // 一次性任务时间配置
  const [periodType, setPeriodType] = useState<'week' | 'month' | 'quarter' | 'custom'>('week');
  const [dateRange, setDateRange] = useState<string>('2026-08-18 ~ 2026-08-25');

  // 周期性任务调度配置
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom_cron'>('weekly');
  const [executionTime, setExecutionTime] = useState<string>('08:00');
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // 1 = 周一
  const [dayOfMonth, setDayOfMonth] = useState<number>(1); // 1 = 1日
  const [customCron, setCustomCron] = useState<string>('0 8 * * 1');
  const [dataWindow, setDataWindow] = useState<ReportScheduleConfig['dataWindow']>('previous_cycle');
  const [notifyChannels, setNotifyChannels] = useState<('email' | 'dingtalk' | 'wecom' | 'system')[]>(['dingtalk', 'wecom', 'system']);
  const [recipients, setRecipients] = useState<string>('华东运维班组群、区域技术专工');
  const [generateInitialImmediately, setGenerateInitialImmediately] = useState<boolean>(true);

  // 分析模块勾选
  const [includeAiInsights, setIncludeAiInsights] = useState<boolean>(true);
  const [includeDischargeDetails, setIncludeDischargeDetails] = useState<boolean>(true);
  const [includeSlaTickets, setIncludeSlaTickets] = useState<boolean>(true);
  const [includeRiskMatrix, setIncludeRiskMatrix] = useState<boolean>(true);
  const [includeRoutineTasks, setIncludeRoutineTasks] = useState<boolean>(true);

  // 初始化默认标题
  useEffect(() => {
    if (taskType === 'once') {
      if (initialSkill) {
        setMode('skill');
        setSelectedSkill(initialSkill);
        setTitle(`华东一区 2026年第34周「${initialSkill.name}」主动诊断专项报告`);
      } else if (initialTemplate) {
        setMode('template');
        setSelectedTemplate(initialTemplate);
        setTitle(initialTemplate.defaultTitleTemplate.replace('{WEEK}', '34').replace('{YEAR}', '2026').replace('{MONTH}', '8'));
      } else if (selectedTemplate) {
        setTitle(selectedTemplate.defaultTitleTemplate.replace('{WEEK}', '34').replace('{YEAR}', '2026').replace('{MONTH}', '8'));
      }
    } else {
      // 周期性任务默认标题
      if (mode === 'skill' && selectedSkill) {
        setTitle(`【周期巡检】华东一区「${selectedSkill.name}」主动诊断例行报告`);
      } else {
        const baseName = selectedTemplate?.name || '储能资产运营周报';
        setTitle(`【周期调度】华东一区 ${baseName}`);
      }
    }
  }, [initialTemplate, initialSkill, isOpen, taskType]);

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
    if (taskType === 'once') {
      setTitle(t.defaultTitleTemplate.replace('{WEEK}', '34').replace('{YEAR}', '2026').replace('{MONTH}', '8'));
    } else {
      setTitle(`【周期调度】华东一区 ${t.name}`);
    }
  };

  const handleSkillSelect = (s: OperationSkill) => {
    setSelectedSkill(s);
    if (taskType === 'once') {
      setTitle(`华东一区 2026年第34周「${s.name}」主动诊断专项报告`);
    } else {
      setTitle(`【周期巡检】华东一区「${s.name}」主动诊断例行报告`);
    }
  };

  const toggleNotifyChannel = (ch: 'email' | 'dingtalk' | 'wecom' | 'system') => {
    setNotifyChannels(prev => 
      prev.includes(ch) ? prev.filter(item => item !== ch) : [...prev, ch]
    );
  };

  // 生成 Cron 易读描述
  const getCronSummaryText = () => {
    if (frequency === 'daily') {
      return `每日 ${executionTime} 自动定时触发`;
    }
    if (frequency === 'weekly') {
      const dayMap: Record<number, string> = { 1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六', 7: '周日' };
      return `每${dayMap[dayOfWeek] || '周一'} ${executionTime} 自动定时触发`;
    }
    if (frequency === 'monthly') {
      return `每月 ${dayOfMonth} 日 ${executionTime} 自动定时触发`;
    }
    if (frequency === 'quarterly') {
      return `每季度首日 ${executionTime} 自动定时触发`;
    }
    return `自定义 Cron: ${customCron}`;
  };

  // 计算下次执行时间预估
  const getNextExecutionTimeText = () => {
    if (frequency === 'daily') return '2026-08-31 ' + executionTime + ':00';
    if (frequency === 'weekly') return '2026-08-31 (下周一) ' + executionTime + ':00';
    if (frequency === 'monthly') return '2026-09-01 (下月初) ' + executionTime + ':00';
    if (frequency === 'quarterly') return '2026-10-01 (下季初) ' + executionTime + ':00';
    return '2026-08-31 ' + executionTime + ':00';
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
          defaultTitleTemplate: `华东一区「${selectedSkill.name}」主动诊断专项报告`,
          coverColor: '#1890ff',
          isSkillTemplate: true,
          associatedSkillId: selectedSkill.id
        };
      }
    }

    const calculatedDateRange = taskType === 'once' 
      ? dateRange 
      : `动态周期: ${getCronSummaryText()} (${
          dataWindow === 'previous_cycle' ? '回溯上一完整周期' :
          dataWindow === 'recent_24h' ? '回溯近24小时数据' :
          dataWindow === 'recent_7d' ? '回溯近7天数据' : '回溯当月数据'
        })`;

    const scheduleConfig: ReportScheduleConfig | undefined = taskType === 'periodic' ? {
      frequency,
      executionTime,
      dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
      dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
      cronExpression: frequency === 'custom_cron' ? customCron : undefined,
      cronSummary: getCronSummaryText(),
      dataWindow,
      isActive: true,
      nextExecutionTime: getNextExecutionTimeText(),
      lastExecutionTime: generateInitialImmediately ? '2026-08-30 21:00:00' : undefined,
      executionCount: generateInitialImmediately ? 1 : 0,
      notifyChannels,
      recipients: recipients.trim() || '区域运维群组'
    } : undefined;

    onSubmitTask({
      taskType,
      title: title.trim(),
      template: targetTemplate,
      periodType: taskType === 'once' ? periodType : (frequency === 'monthly' ? 'month' : frequency === 'quarterly' ? 'quarter' : 'week'),
      dateRange: calculatedDateRange,
      scope,
      creator,
      fileFormat,
      includeAiInsights,
      includeDischargeDetails,
      includeSlaTickets,
      includeRiskMatrix,
      includeRoutineTasks,
      associatedSkill: mode === 'skill' && selectedSkill ? selectedSkill : undefined,
      scheduleConfig,
      generateInitialImmediately: taskType === 'periodic' ? generateInitialImmediately : true
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md ${
              taskType === 'once' ? 'bg-blue-600 shadow-blue-500/20' : 'bg-purple-600 shadow-purple-500/20'
            }`}>
              {taskType === 'once' ? <Play className="w-5 h-5 fill-current" /> : <Repeat className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                创建报告生成任务
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  taskType === 'once' 
                    ? 'bg-blue-100 text-blue-700 border-blue-200' 
                    : 'bg-purple-100 text-purple-700 border-purple-200'
                }`}>
                  {taskType === 'once' ? '⚡ 一次性即时生成' : '🔄 周期性定时巡检'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                支持即时单次运算交付，或配置每日/每周/每月定时自动巡检生成与多通道协同推送
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

        {/* 表单主体 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4.5">
          {/* 1. 任务模式选择 (一次性任务 vs 周期性任务) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>任务执行类型：</span>
              <span className="text-[11px] text-slate-400 font-normal">选择执行频次与自动化策略</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTaskType('once')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  taskType === 'once'
                    ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                    <Zap className={`w-4 h-4 ${taskType === 'once' ? 'text-blue-600' : 'text-slate-400'}`} />
                    一次性任务 (即时生成)
                  </div>
                  {taskType === 'once' && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  指定静态时间跨度，即刻拉取全域数据，几秒内计算并交付独立 HTML 报告
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTaskType('periodic')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  taskType === 'periodic'
                    ? 'border-purple-500 bg-purple-50/60 ring-2 ring-purple-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                    <Repeat className={`w-4 h-4 ${taskType === 'periodic' ? 'text-purple-600' : 'text-slate-400'}`} />
                    周期性任务 (定时调度)
                  </div>
                  {taskType === 'periodic' && (
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  按日/周/月/季度循环自动巡检，动态提取前序数据并自动推送至工作群组
                </p>
              </button>
            </div>
          </div>

          {/* 2. 报告驱动引擎选择 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">报告生成基准引擎：</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('template')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  mode === 'template'
                    ? 'border-blue-500 bg-blue-50/40 shadow-2xs font-semibold'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                  <FileCode className={`w-4 h-4 ${mode === 'template' ? 'text-blue-600' : 'text-slate-400'}`} />
                  选用报告模板库
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 font-normal">
                  标准运营模板、月度白皮书或 AI 编排模板
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode('skill')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  mode === 'skill'
                    ? 'border-purple-500 bg-purple-50/40 shadow-2xs font-semibold'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                  <Sparkles className={`w-4 h-4 ${mode === 'skill' ? 'text-purple-600' : 'text-slate-400'}`} />
                  挂载 AI 运维 Skill 机理
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 font-normal">
                  基于专家机理规则与电化学特征模型研判
                </p>
              </button>
            </div>
          </div>

          {/* 3. 模板或 Skill 下拉选择 */}
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

          {/* 4. 报告标题 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              报告任务标题 <span className="text-rose-500">*</span>
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

          {/* 5. 一次性任务：时间周期与范围配置 */}
          {taskType === 'once' ? (
            <div className="grid grid-cols-2 gap-3 bg-blue-50/30 p-3.5 rounded-xl border border-blue-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  统计周期类型
                </label>
                <select
                  value={periodType}
                  onChange={e => handlePeriodChange(e.target.value as any)}
                  className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="week">自然周 (Week)</option>
                  <option value="month">自然月 (Month)</option>
                  <option value="quarter">季度 (Quarter)</option>
                  <option value="custom">自定义时间范围</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">时间跨度</label>
                <input
                  type="text"
                  value={dateRange}
                  onChange={e => setDateRange(e.target.value)}
                  className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
              </div>
            </div>
          ) : (
            /* 5. 周期性任务：定时调度与自动回溯配置 */
            <div className="bg-purple-50/40 p-4 rounded-xl border border-purple-200/80 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-purple-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                  <Timer className="w-4 h-4 text-purple-600" />
                  周期调度规则与回溯窗口配置
                </div>
                <span className="text-[11px] font-mono text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded">
                  下次触发: {getNextExecutionTimeText()}
                </span>
              </div>

              {/* 调度频率与时刻 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">调度频率</label>
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value as any)}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="daily">📅 每日 (Daily)</option>
                    <option value="weekly">📆 每周 (Weekly)</option>
                    <option value="monthly">🗓️ 每月 (Monthly)</option>
                    <option value="quarterly">📈 每季度 (Quarterly)</option>
                    <option value="custom_cron">⚙️ 自定义 Cron</option>
                  </select>
                </div>

                {frequency === 'weekly' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">执行日</label>
                    <select
                      value={dayOfWeek}
                      onChange={e => setDayOfWeek(Number(e.target.value))}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    >
                      <option value={1}>每周一</option>
                      <option value={2}>每周二</option>
                      <option value={3}>每周三</option>
                      <option value={4}>每周四</option>
                      <option value={5}>每周五</option>
                      <option value={6}>每周六</option>
                      <option value={7}>每周日</option>
                    </select>
                  </div>
                )}

                {frequency === 'monthly' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">执行日 (号)</label>
                    <select
                      value={dayOfMonth}
                      onChange={e => setDayOfMonth(Number(e.target.value))}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    >
                      {[1, 2, 5, 10, 15, 20, 25, 28].map(d => (
                        <option key={d} value={d}>每月 {d} 日</option>
                      ))}
                    </select>
                  </div>
                )}

                {frequency === 'custom_cron' ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cron 表达式</label>
                    <input
                      type="text"
                      value={customCron}
                      onChange={e => setCustomCron(e.target.value)}
                      placeholder="0 8 * * 1"
                      className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">触发时刻</label>
                    <input
                      type="time"
                      value={executionTime}
                      onChange={e => setExecutionTime(e.target.value)}
                      className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">数据回溯窗口</label>
                  <select
                    value={dataWindow}
                    onChange={e => setDataWindow(e.target.value as any)}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="previous_cycle">上一完整自然周期 (推荐)</option>
                    <option value="recent_24h">动态前 24 小时数据</option>
                    <option value="recent_7d">动态前 7 天数据</option>
                    <option value="recent_30d">动态前 30 天数据</option>
                    <option value="current_month_to_date">当月累计至执行时刻</option>
                  </select>
                </div>
              </div>

              {/* 自动推送与通知通道 */}
              <div className="pt-2 border-t border-purple-100/60 space-y-2">
                <div className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Bell className="w-3 h-3 text-purple-600" />
                    自动化通知分发通道：
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <label className="flex items-center gap-1.5 p-1.5 bg-white rounded border border-slate-200 text-xs text-slate-700 cursor-pointer hover:border-purple-300">
                    <input
                      type="checkbox"
                      checked={notifyChannels.includes('dingtalk')}
                      onChange={() => toggleNotifyChannel('dingtalk')}
                      className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
                    />
                    <span>钉钉工作群</span>
                  </label>
                  <label className="flex items-center gap-1.5 p-1.5 bg-white rounded border border-slate-200 text-xs text-slate-700 cursor-pointer hover:border-purple-300">
                    <input
                      type="checkbox"
                      checked={notifyChannels.includes('wecom')}
                      onChange={() => toggleNotifyChannel('wecom')}
                      className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
                    />
                    <span>企业微信群</span>
                  </label>
                  <label className="flex items-center gap-1.5 p-1.5 bg-white rounded border border-slate-200 text-xs text-slate-700 cursor-pointer hover:border-purple-300">
                    <input
                      type="checkbox"
                      checked={notifyChannels.includes('email')}
                      onChange={() => toggleNotifyChannel('email')}
                      className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
                    />
                    <span>电子邮件</span>
                  </label>
                  <label className="flex items-center gap-1.5 p-1.5 bg-white rounded border border-slate-200 text-xs text-slate-700 cursor-pointer hover:border-purple-300">
                    <input
                      type="checkbox"
                      checked={notifyChannels.includes('system')}
                      onChange={() => toggleNotifyChannel('system')}
                      className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
                    />
                    <span>站内消息</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">推送目标接收群/人</label>
                    <input
                      type="text"
                      value={recipients}
                      onChange={e => setRecipients(e.target.value)}
                      placeholder="华东运维班组群、技术专工"
                      className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  <div className="flex items-end pb-0.5">
                    <label className="flex items-center gap-2 text-xs text-purple-900 font-semibold cursor-pointer bg-white p-2 rounded-lg border border-purple-200 w-full">
                      <input
                        type="checkbox"
                        checked={generateInitialImmediately}
                        onChange={e => setGenerateInitialImmediately(e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                      />
                      <span>创建同时立即触发首份报告生成</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. 监测范围与责任人 */}
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

          {/* 7. 选项配置 */}
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
              className={`px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-md flex items-center gap-1.5 transition-all cursor-pointer ${
                taskType === 'once'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/20'
              }`}
            >
              {taskType === 'once' ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  立即创建并生成报告
                </>
              ) : (
                <>
                  <Repeat className="w-3.5 h-3.5" />
                  保存并启动周期调度任务
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
