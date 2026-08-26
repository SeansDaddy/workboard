import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  BrainCircuit, 
  UploadCloud, 
  FileCode, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Play, 
  RotateCcw, 
  FileText, 
  ExternalLink, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  Plus, 
  Check, 
  X, 
  Activity, 
  Layers, 
  ShieldAlert, 
  Gauge, 
  Zap, 
  Building2, 
  Cpu, 
  Wrench, 
  ChevronRight, 
  BarChart2, 
  TrendingUp,
  SlidersHorizontal,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { ActiveView } from '../../types';

interface AiDiagnosisPageProps {
  onReturnToWorkbench: () => void;
  onNavigate?: (view: ActiveView) => void;
  onConvertToTicket?: (ticketData: any) => void;
}

export interface DiagnosisTask {
  id: string;
  name: string;
  stationName: string;
  targetDevice: string;
  scenario: string;
  model: string;
  status: '分析中' | '已完成' | '已失败';
  progress: number;
  stageText: string;
  confidence: number;
  riskScore: number;
  rootCause: string;
  createdAt: string;
  duration: string;
  logFileName: string;
  logFileSize: string;
  hasReport: boolean;
}

export const AiDiagnosisPage: React.FC<AiDiagnosisPageProps> = ({
  onReturnToWorkbench,
  onNavigate,
  onConvertToTicket
}) => {
  // 选项卡：诊断任务列表 / 新建诊断任务
  const [activeTab, setActiveTab] = useState<'taskList' | 'createTask'>('taskList');
  
  // 选中的报告模态框
  const [activeReportTask, setActiveReportTask] = useState<DiagnosisTask | null>(null);

  // 搜索与过滤
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | '分析中' | '已完成'>('all');

  // 新建任务表单状态
  const [taskForm, setTaskForm] = useState({
    name: '南通如东站 02#舱-03模组 温升异常与接触内阻机理诊断',
    station: '南通如东 50MW/100MWh 储能电站',
    device: '02#电池集装箱舱 - Rack 04 - 03#模组',
    scenario: '极柱过热与接触内阻劣变分析',
    model: '电化学机理与多物理场大模型混合分析引擎 V4.2',
    priority: '紧急 (P1)',
    autoCreateTicket: true,
    uploadedFile: {
      name: '南通如东站_02舱Rack04_单体温差与极化阻抗异常.bms_log',
      size: '14.8 MB',
      samplingRate: '100 Hz',
      frames: '128,000 帧时序数据',
      timeRange: '2026-08-25 08:00:00 ~ 10:30:00'
    }
  });

  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 初始模拟任务列表
  const [tasks, setTasks] = useState<DiagnosisTask[]>([
    {
      id: 'DIAG-2026-0825-01',
      name: '南通如东站 02#舱-03模组 温升异常与接触内阻机理诊断',
      stationName: '南通如东 50MW/100MWh 储能电站',
      targetDevice: '02#舱 - Rack 04 - 03#电池插箱',
      scenario: '极柱过热与接触内阻劣变分析',
      model: '电化学机理与多物理场大模型混合分析引擎 V4.2',
      status: '已完成',
      progress: 100,
      stageText: '根因溯源完成，已生成标准化消缺SOP',
      confidence: 97.8,
      riskScore: 92,
      rootCause: '03#模组正极端子螺栓力矩松动（实测 4.2N·m），大电流放电接触电阻剧增导致局部焦耳热（ΔT=9.4℃）',
      createdAt: '2026-08-25 10:15:20',
      duration: '1.4 秒',
      logFileName: '南通如东站_02舱Rack04_单体温差与极化阻抗异常.bms_log',
      logFileSize: '14.8 MB',
      hasReport: true
    },
    {
      id: 'DIAG-2026-0825-02',
      name: '盐城大丰共享储能站 05#簇微短路自放电前驱特征识别',
      stationName: '盐城大丰 30MW/60MWh 共享储能电站',
      targetDevice: '02#舱 - 05#电池簇 - Cell#16',
      scenario: '电芯微短路与绝缘劣变分析',
      model: '伏安特性与自放电时序时相大模型 V3.8',
      status: '已完成',
      progress: 100,
      stageText: '微短路演化特征识别完毕',
      confidence: 95.4,
      riskScore: 88,
      rootCause: '16#单体电芯静置自放电速率达 2.8mV/h (正常<0.3mV/h)，判定存在微观内短路低阻通路',
      createdAt: '2026-08-25 09:30:11',
      duration: '2.1 秒',
      logFileName: '盐城大丰共享储能站_05簇_电芯微短路低压自放电时序.csv',
      logFileSize: '8.6 MB',
      hasReport: true
    },
    {
      id: 'DIAG-2026-0824-03',
      name: '无锡高新用户侧站 PCS-01 网侧谐波超标与IGBT热阻分析',
      stationName: '无锡高新 20MW/40MWh 用户侧电站',
      targetDevice: 'PCS-01 储能变流器机柜',
      scenario: '变流器电气谐波与热阻分析',
      model: '电力电子高频开关动态仿真模型 V2.5',
      status: '已完成',
      progress: 100,
      stageText: '滤波电容容量衰减定性分析完毕',
      confidence: 94.2,
      riskScore: 76,
      rootCause: 'C3/C4 滤波电容组容量损耗约 28%，导致 THDu 畸变突增至 4.8% 并抬升 IGBT 损耗',
      createdAt: '2026-08-24 16:30:00',
      duration: '3.2 秒',
      logFileName: '无锡高新用户侧站_PCS01_网侧谐波与IGBT温升波动.zip',
      logFileSize: '22.4 MB',
      hasReport: true
    },
    {
      id: 'DIAG-2026-0824-04',
      name: '常州金坛站 01#簇 SOC 一致性离散衰减与可用容量评估',
      stationName: '常州金坛 100MW/200MWh 储能电站',
      targetDevice: '01#储能舱 - 全簇一致性',
      scenario: 'SOC容量跳水与SOH评估',
      model: '容量增量分析(ICA)与差分电压(DVA)模型 V4.0',
      status: '已完成',
      progress: 100,
      stageText: '可用容量保持率计算完成',
      confidence: 98.1,
      riskScore: 65,
      rootCause: '末端电芯容量分散度达 6.2%，主要系长期浅充浅放引起累积极化偏差，建议执行满充满放主动均衡标定',
      createdAt: '2026-08-24 14:10:45',
      duration: '1.8 秒',
      logFileName: '常州金坛_01簇_充放电ICA完整循环数据.log',
      logFileSize: '31.2 MB',
      hasReport: true
    }
  ]);

  // 预设典型故障日志包
  const sampleLogs = [
    {
      name: '南通如东站_02舱Rack04_单体温差与极化阻抗异常.bms_log',
      size: '14.8 MB',
      station: '南通如东 50MW/100MWh 储能电站',
      device: '02#电池集装箱舱 - Rack 04 - 03#模组',
      scenario: '极柱过热与接触内阻劣变分析',
      samplingRate: '100 Hz',
      frames: '128,000 帧时序数据',
      timeRange: '2026-08-25 08:00:00 ~ 10:30:00'
    },
    {
      name: '盐城大丰共享储能站_05簇_电芯微短路低压自放电时序.csv',
      size: '8.6 MB',
      station: '盐城大丰 30MW/60MWh 共享储能电站',
      device: '02#舱 - 05#电池簇 - Cell#16',
      scenario: '电芯微短路与绝缘劣变分析',
      samplingRate: '10 Hz',
      frames: '24,000 帧时序数据',
      timeRange: '2026-08-25 00:00:00 ~ 09:00:00 (静置期)'
    },
    {
      name: '无锡高新用户侧站_PCS01_网侧谐波与IGBT温升波动.zip',
      size: '22.4 MB',
      station: '无锡高新 20MW/40MWh 用户侧电站',
      device: 'PCS-01 储能变流器机柜',
      scenario: '变流器电气谐波与热阻分析',
      samplingRate: '1 kHz',
      frames: '520,000 帧高频波形',
      timeRange: '2026-08-24 15:30:00 ~ 16:30:00'
    }
  ];

  const handleSelectSampleLog = (sample: typeof sampleLogs[0]) => {
    setTaskForm(prev => ({
      ...prev,
      name: `${sample.station.split(' ')[0]} ${sample.device.split('-')[0]} ${sample.scenario}`,
      station: sample.station,
      device: sample.device,
      scenario: sample.scenario,
      uploadedFile: {
        name: sample.name,
        size: sample.size,
        samplingRate: sample.samplingRate,
        frames: sample.frames,
        timeRange: sample.timeRange
      }
    }));
    setToastMessage(`已一键加载典型故障日志: ${sample.name}`);
  };

  // 处理文件上传选择
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const f = files[0];
      setIsUploading(true);
      setTimeout(() => {
        setTaskForm(prev => ({
          ...prev,
          uploadedFile: {
            name: f.name,
            size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
            samplingRate: '50 Hz (自适应解析)',
            frames: '约 65,000 帧',
            timeRange: '2026-08-25 08:00:00 ~ 10:00:00'
          }
        }));
        setIsUploading(false);
        setToastMessage(`文件【${f.name}】已成功解析并提取时序特征！`);
      }, 500);
    }
  };

  // 提交并创建诊断任务
  const handleCreateTask = () => {
    const newId = `DIAG-2026-0825-${String(tasks.length + 1).padStart(2, '0')}`;
    const newTask: DiagnosisTask = {
      id: newId,
      name: taskForm.name || '储能电芯时序数据机理AI诊断任务',
      stationName: taskForm.station,
      targetDevice: taskForm.device,
      scenario: taskForm.scenario,
      model: taskForm.model,
      status: '分析中',
      progress: 15,
      stageText: '时序降噪与特征工程解析中...',
      confidence: 0,
      riskScore: 0,
      rootCause: '模型正在反演电化学阻抗与热动力学微分方程...',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      duration: '计算中',
      logFileName: taskForm.uploadedFile.name,
      logFileSize: taskForm.uploadedFile.size,
      hasReport: false
    };

    setTasks(prev => [newTask, ...prev]);
    setActiveTab('taskList');
    setToastMessage(`诊断任务【${newId}】已创建，AI 诊断引擎正在并行计算...`);

    // 仿真任务异步推进过程
    setTimeout(() => {
      setTasks(current => current.map(t => t.id === newId ? {
        ...t,
        progress: 45,
        stageText: '电化学机理模型匹配中 (极柱接触电阻异常识别 88%)...'
      } : t));
    }, 1200);

    setTimeout(() => {
      setTasks(current => current.map(t => t.id === newId ? {
        ...t,
        progress: 80,
        stageText: '多物理场焦耳热耦合仿真计算中...'
      } : t));
    }, 2400);

    setTimeout(() => {
      setTasks(current => current.map(t => t.id === newId ? {
        ...t,
        status: '已完成',
        progress: 100,
        stageText: '根因溯源完成，已生成诊断报告与标准化消缺SOP',
        confidence: 97.8,
        riskScore: 92,
        duration: '1.6 秒',
        rootCause: '03#模组正极端子螺栓力矩松动（实测 4.2N·m），大电流放电接触电阻剧增导致局部焦耳热（ΔT=9.4℃）',
        hasReport: true
      } : t));
      setToastMessage(`🎉 诊断任务【${newId}】已完成！点击即可查看详细诊断报告与排故证据链。`);
    }, 3600);
  };

  // 过滤后的任务列表
  const filteredTasks = tasks.filter(t => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchKeyword = !searchKeyword || 
      t.id.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      t.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      t.stationName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      t.rootCause.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchStatus && matchKeyword;
  });

  return (
    <div className="space-y-4 max-w-[1920px] mx-auto animate-in fade-in duration-200">
      
      {/* 顶部面包屑与标题栏 */}
      <div className="bg-white rounded-lg p-3.5 border border-[#E8E8E8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-none">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReturnToWorkbench}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#FAFAFA] border border-[#D9D9D9] text-[#595959] hover:text-[#1890FF] hover:border-[#1890FF] text-xs font-medium cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>返回工作台</span>
          </button>

          <div className="h-4 w-px bg-[#E8E8E8]" />

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8C8C8C]">分析诊断</span>
            <span className="text-xs text-[#BFBFBF]">/</span>
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded bg-purple-50 text-[#722ED1]">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-[#1F1F1F]">AI诊断 (AI Diagnostic Engine)</span>
            </div>
            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-purple-50 text-[#722ED1] border border-purple-200">
              电化学机理与大模型
            </span>
          </div>
        </div>

        {/* 顶部操作入口 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('createTask')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium cursor-pointer transition-all shadow-xs ${
              activeTab === 'createTask' 
                ? 'bg-[#722ED1] text-white' 
                : 'bg-[#1890FF] hover:bg-[#40A9FF] text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>创建诊断任务 / 上传日志</span>
          </button>
        </div>
      </div>

      {/* 提示条通知 */}
      {toastMessage && (
        <div className="p-3 bg-[#F6FFED] border border-[#B7EB8F] rounded-lg text-xs text-[#52C41A] flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#52C41A] shrink-0" />
            <span className="font-medium text-[#262626]">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-[#8C8C8C] hover:text-[#262626] cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 统计指标卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg p-3.5 border border-[#E8E8E8] shadow-none flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#8C8C8C]">
            <span>累计诊断任务</span>
            <BrainCircuit className="w-4 h-4 text-[#722ED1]" />
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-[#1F1F1F]">{tasks.length + 138}</span>
            <span className="text-xs text-[#8C8C8C]">次</span>
          </div>
          <span className="text-[11px] font-medium text-[#52C41A]">
            今日已完成 {tasks.length} 项诊断
          </span>
        </div>

        <div className="bg-white rounded-lg p-3.5 border border-[#E8E8E8] shadow-none flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#8C8C8C]">
            <span>算法模型诊断准确率</span>
            <ShieldAlert className="w-4 h-4 text-[#1890FF]" />
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-[#1F1F1F]">97.8%</span>
            <span className="text-xs text-[#8C8C8C]">置信度</span>
          </div>
          <span className="text-[11px] font-medium text-[#1890FF]">
            基于 10万+ 储能真实故障库
          </span>
        </div>

        <div className="bg-white rounded-lg p-3.5 border border-[#E8E8E8] shadow-none flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#8C8C8C]">
            <span>平均单任务计算耗时</span>
            <Clock className="w-4 h-4 text-[#FA8C16]" />
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-[#1F1F1F]">1.4</span>
            <span className="text-xs text-[#8C8C8C]">秒</span>
          </div>
          <span className="text-[11px] font-medium text-[#52C41A]">
            GPU 时序并行加速计算
          </span>
        </div>

        <div className="bg-white rounded-lg p-3.5 border border-[#E8E8E8] shadow-none flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#8C8C8C]">
            <span>推荐消缺 SOP 采纳率</span>
            <Wrench className="w-4 h-4 text-[#52C41A]" />
          </div>
          <div className="my-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-[#1F1F1F]">99.1%</span>
            <span className="text-xs text-[#8C8C8C]">有效闭环</span>
          </div>
          <span className="text-[11px] font-medium text-[#722ED1]">
            无缝带参派发 pcare 工单
          </span>
        </div>
      </div>

      {/* 主工作区：选项卡切换 */}
      <div className="bg-white rounded-lg border border-[#E8E8E8] shadow-none overflow-hidden">
        
        {/* 顶部二级 Tab */}
        <div className="flex items-center justify-between px-4 pt-3 border-b border-[#E8E8E8] bg-[#FAFAFA]">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('taskList')}
              className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'taskList'
                  ? 'border-[#722ED1] text-[#722ED1]'
                  : 'border-transparent text-[#595959] hover:text-[#1F1F1F]'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>诊断任务台账与报告库 ({tasks.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('createTask')}
              className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'createTask'
                  ? 'border-[#722ED1] text-[#722ED1]'
                  : 'border-transparent text-[#595959] hover:text-[#1F1F1F]'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>上传数据日志 & 发起新诊断</span>
            </button>
          </div>

          <div className="text-[11px] text-[#8C8C8C] pb-2">
            支持 BMS CAN报文、PCS高频波形与动环温湿度日志格式
          </div>
        </div>

        {/* TAB 1: 任务列表 */}
        {activeTab === 'taskList' && (
          <div className="p-4 space-y-4">
            
            {/* 搜索与状态过滤器 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0F0F0]">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-[#8C8C8C] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="按任务编号、电站、诊断对象或根因结论检索..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#D9D9D9] rounded-md focus:border-[#722ED1] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-[#F5F5F5] p-0.5 rounded border border-[#E8E8E8] text-xs">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      statusFilter === 'all' ? 'bg-white font-medium text-[#1F1F1F] shadow-xs' : 'text-[#595959]'
                    }`}
                  >
                    全部 ({tasks.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('已完成')}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      statusFilter === '已完成' ? 'bg-white font-medium text-[#52C41A] shadow-xs' : 'text-[#595959]'
                    }`}
                  >
                    已完成 ({tasks.filter(t => t.status === '已完成').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('分析中')}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      statusFilter === '分析中' ? 'bg-white font-medium text-[#1890FF] shadow-xs' : 'text-[#595959]'
                    }`}
                  >
                    分析中 ({tasks.filter(t => t.status === '分析中').length})
                  </button>
                </div>
              </div>
            </div>

            {/* 任务列表表格 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#E8E8E8] text-[#595959] font-medium">
                    <th className="p-3 pl-3">任务编号 / 任务名称</th>
                    <th className="p-3">诊断对象 & 电站</th>
                    <th className="p-3">诊断场景与模型</th>
                    <th className="p-3">状态 / 计算进度</th>
                    <th className="p-3">根因定性结论</th>
                    <th className="p-3">置信度</th>
                    <th className="p-3 pr-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0]">
                  {filteredTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-[#F9F0FF]/30 transition-colors">
                      
                      {/* 任务编号与名称 */}
                      <td className="p-3 pl-3">
                        <div className="space-y-0.5">
                          <span className="font-mono text-[11px] font-bold text-[#722ED1] bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200 inline-block">
                            {t.id}
                          </span>
                          <div className="font-medium text-[#1F1F1F] max-w-xs truncate" title={t.name}>
                            {t.name}
                          </div>
                          <div className="text-[10px] text-[#8C8C8C] flex items-center gap-1">
                            <span>日志: {t.logFileName}</span>
                            <span>({t.logFileSize})</span>
                          </div>
                        </div>
                      </td>

                      {/* 诊断对象与所属电站 */}
                      <td className="p-3">
                        <div className="space-y-0.5 max-w-[200px]">
                          <div className="font-semibold text-[#262626] truncate" title={t.targetDevice}>
                            {t.targetDevice}
                          </div>
                          <div className="text-[11px] text-[#8C8C8C] truncate" title={t.stationName}>
                            {t.stationName}
                          </div>
                        </div>
                      </td>

                      {/* 场景与模型 */}
                      <td className="p-3">
                        <div className="space-y-0.5 max-w-[180px]">
                          <span className="text-[11px] font-medium text-[#1890FF] bg-[#E6F7FF] px-1.5 py-0.2 rounded border border-[#91D5FF] inline-block">
                            {t.scenario}
                          </span>
                          <div className="text-[10px] text-[#8C8C8C] truncate" title={t.model}>
                            {t.model}
                          </div>
                        </div>
                      </td>

                      {/* 状态与进度 */}
                      <td className="p-3 min-w-[140px]">
                        {t.status === '已完成' ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#52C41A] bg-[#F6FFED] px-2 py-0.5 rounded border border-[#B7EB8F]">
                              <CheckCircle2 className="w-3 h-3" />
                              已完成 ({t.duration})
                            </span>
                            <div className="text-[10px] text-[#8C8C8C] truncate max-w-[140px]">
                              {t.createdAt}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-[#722ED1] font-semibold flex items-center gap-1">
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                {t.status}
                              </span>
                              <span className="font-mono text-[#722ED1]">{t.progress}%</span>
                            </div>
                            <div className="w-full bg-[#E8E8E8] rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-[#722ED1] h-full rounded-full transition-all duration-300"
                                style={{ width: `${t.progress}%` }}
                              />
                            </div>
                            <div className="text-[10px] text-[#8C8C8C] truncate max-w-[140px]" title={t.stageText}>
                              {t.stageText}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 根因结论 */}
                      <td className="p-3 max-w-xs">
                        <div className="text-[11px] text-[#262626] line-clamp-2 leading-relaxed bg-[#FAFAFA] p-1.5 rounded border border-[#E8E8E8]" title={t.rootCause}>
                          {t.rootCause}
                        </div>
                      </td>

                      {/* 置信度 */}
                      <td className="p-3 whitespace-nowrap">
                        {t.status === '已完成' ? (
                          <div className="space-y-0.5">
                            <span className="font-mono font-bold text-xs text-[#52C41A]">
                              {t.confidence}%
                            </span>
                            <div className="text-[10px] text-[#FA8C16] font-medium">
                              风险分: {t.riskScore}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#8C8C8C] text-[11px]">计算中...</span>
                        )}
                      </td>

                      {/* 操作入口 */}
                      <td className="p-3 pr-3 text-right whitespace-nowrap">
                        {t.hasReport ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveReportTask(t)}
                              className="px-2.5 py-1 bg-[#722ED1] hover:bg-[#531DAB] text-white rounded text-xs font-medium cursor-pointer transition-colors shadow-xs flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" />
                              <span>查看诊断报告</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[#8C8C8C] text-[11px]">分析中...</span>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 2: 上传日志与创建诊断任务 */}
        {activeTab === 'createTask' && (
          <div className="p-5 max-w-4xl mx-auto space-y-6">
            
            {/* 顶栏指引与一键加载典型故障日志 */}
            <div className="bg-[#F9F0FF] p-4 rounded-lg border border-[#D3ADF7] space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#531DAB]">
                <Sparkles className="w-4 h-4 text-[#722ED1]" />
                <span>快速体验：选择预置的储能典型故障日志包（一键填充真实时序特征）</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {sampleLogs.map((log, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSampleLog(log)}
                    className="p-2.5 bg-white border border-[#D3ADF7] hover:border-[#722ED1] hover:shadow-xs rounded-md text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-[#722ED1] bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                        样例 {idx + 1}
                      </span>
                      <span className="text-[10px] text-[#8C8C8C]">{log.size}</span>
                    </div>
                    <div className="text-xs font-semibold text-[#1F1F1F] group-hover:text-[#722ED1] truncate">
                      {log.scenario}
                    </div>
                    <div className="text-[10px] text-[#8C8C8C] truncate mt-0.5">
                      {log.station.split(' ')[0]} · {log.samplingRate}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 日志文件上传拖拽区 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#1F1F1F] flex items-center justify-between">
                <span>1. 上传储能现场日志文件 (BMS / PCS / 动环)</span>
                <span className="text-[11px] font-normal text-[#8C8C8C]">支持 .bms_log, .csv, .json, .log, .zip, .can (最大 500MB)</span>
              </label>

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const f = e.dataTransfer.files[0];
                    setTaskForm(prev => ({
                      ...prev,
                      uploadedFile: {
                        name: f.name,
                        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
                        samplingRate: '100 Hz',
                        frames: '约 100,000 帧',
                        timeRange: '2026-08-25 08:00:00 ~ 10:00:00'
                      }
                    }));
                    setToastMessage(`文件【${f.name}】已成功载入！`);
                  }
                }}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer relative ${
                  isDragOver ? 'border-[#722ED1] bg-[#F9F0FF]' : 'border-[#D9D9D9] hover:border-[#722ED1] bg-[#FAFAFA]'
                }`}
              >
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".log,.csv,.json,.zip,.bms_log,.can,.txt"
                />

                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 bg-purple-50 text-[#722ED1] rounded-full border border-purple-200">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#1F1F1F]">
                      点击浏览文件 或 将日志文件拖拽至此处
                    </span>
                    <p className="text-[11px] text-[#8C8C8C] mt-0.5">
                      系统将自动进行时序数据对齐、去噪、丢包插值与电化学特征提取
                    </p>
                  </div>
                </div>
              </div>

              {/* 已选中的日志文件信息展示卡 */}
              {taskForm.uploadedFile && (
                <div className="p-3 bg-[#FAFAFA] border border-[#E8E8E8] rounded-md flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-purple-100 text-[#722ED1]">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <div className="text-xs">
                      <div className="font-semibold text-[#1F1F1F] flex items-center gap-2">
                        <span>{taskForm.uploadedFile.name}</span>
                        <span className="text-[10px] text-[#52C41A] bg-[#F6FFED] px-1.5 py-0.2 rounded border border-[#B7EB8F] font-bold">
                          ✓ 已解析完成
                        </span>
                      </div>
                      <div className="text-[11px] text-[#8C8C8C] flex items-center gap-3 mt-0.5">
                        <span>大小: {taskForm.uploadedFile.size}</span>
                        <span>采样率: {taskForm.uploadedFile.samplingRate}</span>
                        <span>帧数: {taskForm.uploadedFile.frames}</span>
                        <span>时段: {taskForm.uploadedFile.timeRange}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setTaskForm(prev => ({
                      ...prev,
                      uploadedFile: sampleLogs[0]
                    }))}
                    className="text-xs text-[#722ED1] hover:underline cursor-pointer"
                  >
                    重置
                  </button>
                </div>
              )}
            </div>

            {/* 诊断参数与场景配置 */}
            <div className="space-y-4 pt-2 border-t border-[#F0F0F0]">
              <label className="text-xs font-semibold text-[#1F1F1F] block">
                2. 设定诊断任务参数与机理分析引擎
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[#595959] block mb-1 font-medium">任务名称:</label>
                  <input
                    type="text"
                    value={taskForm.name}
                    onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                    className="w-full p-2 border border-[#D9D9D9] rounded-md focus:border-[#722ED1] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[#595959] block mb-1 font-medium">所属储能电站:</label>
                  <select
                    value={taskForm.station}
                    onChange={(e) => setTaskForm({ ...taskForm, station: e.target.value })}
                    className="w-full p-2 border border-[#D9D9D9] rounded-md focus:border-[#722ED1] focus:outline-hidden bg-white"
                  >
                    <option value="南通如东 50MW/100MWh 储能电站">南通如东 50MW/100MWh 储能电站</option>
                    <option value="盐城大丰 30MW/60MWh 共享储能电站">盐城大丰 30MW/60MWh 共享储能电站</option>
                    <option value="无锡高新 20MW/40MWh 用户侧电站">无锡高新 20MW/40MWh 用户侧电站</option>
                    <option value="常州金坛 100MW/200MWh 储能电站">常州金坛 100MW/200MWh 储能电站</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#595959] block mb-1 font-medium">目标排查设备 / 舱位:</label>
                  <input
                    type="text"
                    value={taskForm.device}
                    onChange={(e) => setTaskForm({ ...taskForm, device: e.target.value })}
                    placeholder="如 02#舱-Rack04-03#模组"
                    className="w-full p-2 border border-[#D9D9D9] rounded-md focus:border-[#722ED1] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[#595959] block mb-1 font-medium">诊断场景目标:</label>
                  <select
                    value={taskForm.scenario}
                    onChange={(e) => setTaskForm({ ...taskForm, scenario: e.target.value })}
                    className="w-full p-2 border border-[#D9D9D9] rounded-md focus:border-[#722ED1] focus:outline-hidden bg-white"
                  >
                    <option value="极柱过热与接触内阻劣变分析">极柱过热与接触内阻劣变分析</option>
                    <option value="电芯微短路与绝缘劣变分析">电芯微短路与绝缘劣变分析</option>
                    <option value="变流器电气谐波与热阻分析">变流器电气谐波与热阻分析</option>
                    <option value="SOC容量跳水与SOH评估">SOC容量跳水与SOH评估</option>
                    <option value="主动均衡失效与压差离散性排查">主动均衡失效与压差离散性排查</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[#595959] block mb-1 font-medium">选择机理分析大模型引擎:</label>
                  <select
                    value={taskForm.model}
                    onChange={(e) => setTaskForm({ ...taskForm, model: e.target.value })}
                    className="w-full p-2 border border-[#D9D9D9] rounded-md focus:border-[#722ED1] focus:outline-hidden bg-white"
                  >
                    <option value="电化学机理与多物理场大模型混合分析引擎 V4.2">电化学机理与多物理场大模型混合分析引擎 V4.2 (推荐·支持焦耳热与阻抗解耦)</option>
                    <option value="伏安特性与自放电时序时相大模型 V3.8">伏安特性与自放电时序时相大模型 V3.8 (专用于微短路与低压自放电)</option>
                    <option value="容量增量分析(ICA)与差分电压(DVA)模型 V4.0">容量增量分析(ICA)与差分电压(DVA)模型 V4.0 (专用于容量衰减与SOH评估)</option>
                    <option value="电力电子高频开关动态仿真模型 V2.5">电力电子高频开关动态仿真模型 V2.5 (专用于PCS与变流器电磁热分析)</option>
                  </select>
                </div>
              </div>

              {/* 联动配置勾选 */}
              <div className="p-3 bg-[#FAFAFA] rounded-md border border-[#E8E8E8] flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={taskForm.autoCreateTicket}
                    onChange={(e) => setTaskForm({ ...taskForm, autoCreateTicket: e.target.checked })}
                    className="rounded text-[#722ED1] focus:ring-[#722ED1] cursor-pointer"
                  />
                  <span className="text-[#262626] font-medium">
                    诊断结论生成后，若风险分 ≥85 自动带参派发 pcare 现场消缺工单
                  </span>
                </label>
                <span className="text-[11px] text-[#722ED1] font-semibold">
                  全流程闭环
                </span>
              </div>
            </div>

            {/* 提交按钮栏 */}
            <div className="pt-3 border-t border-[#F0F0F0] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('taskList')}
                className="px-4 py-2 border border-[#D9D9D9] hover:bg-[#FAFAFA] text-[#595959] rounded-md text-xs font-medium cursor-pointer"
              >
                取消返回列表
              </button>

              <button
                type="button"
                disabled={isUploading}
                onClick={handleCreateTask}
                className="px-6 py-2 bg-[#722ED1] hover:bg-[#531DAB] text-white rounded-md text-xs font-bold transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>立即启动 AI 深度诊断 (Run AI Diagnosis)</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* 诊断报告样例展示模态框 (AI Diagnostic Report Modal) */}
      {activeReportTask && (
        <AiDiagnosisReportModal
          task={activeReportTask}
          onClose={() => setActiveReportTask(null)}
          onConvertToTicket={(ticket) => {
            onConvertToTicket?.(ticket);
            setToastMessage(`已由诊断报告一键派发工单【WO-DIAG-20260825-01】！`);
          }}
        />
      )}

    </div>
  );
};

// =========================================================================
// 诊断报告详情与样例展示模态组件 (AI Diagnosis Sample Report Modal)
// =========================================================================

interface AiDiagnosisReportModalProps {
  task: DiagnosisTask;
  onClose: () => void;
  onConvertToTicket?: (ticket: any) => void;
}

export const AiDiagnosisReportModal: React.FC<AiDiagnosisReportModalProps> = ({
  task,
  onClose,
  onConvertToTicket
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'temp' | 'volt' | 'dqdv'>('temp');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      
      {/* 报告主卡片容器 */}
      <div className="bg-white rounded-xl shadow-2xl border border-[#D9D9D9] w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* 报告顶部操作栏 */}
        <div className="px-6 py-4 bg-[#FAFAFA] border-b border-[#E8E8E8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#722ED1] text-white shadow-xs">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#722ED1] bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  报告编号: RPT-{task.id}
                </span>
                <span className="text-xs font-bold text-[#52C41A] bg-[#F6FFED] px-2 py-0.5 rounded border border-[#B7EB8F] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  AI机理诊断已闭环
                </span>
                <span className="text-xs font-bold text-[#F5222D] bg-[#FFF1F0] px-2 py-0.5 rounded border border-[#FFA39E]">
                  高风险评级 (92分)
                </span>
              </div>
              <h2 className="text-base font-bold text-[#1F1F1F] mt-1">
                储能电站电芯时序数据与电化学机理 AI 诊断专家报告
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert(`已生成并下载 PDF 格式诊断报告 (RPT-${task.id}.pdf)`)}
              className="px-3 py-1.5 border border-[#D9D9D9] hover:bg-white text-[#595959] rounded-md text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#722ED1]" />
              <span>导出 PDF</span>
            </button>
            <button
              type="button"
              onClick={() => alert('已调用系统打印机')}
              className="px-3 py-1.5 border border-[#D9D9D9] hover:bg-white text-[#595959] rounded-md text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-[#595959]" />
              <span>打印报告</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#8C8C8C] hover:text-[#262626] hover:bg-[#E8E8E8] rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 报告滚动阅读区 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-[#262626]">
          
          {/* 一、电站与诊断对象基础信息档案卡 */}
          <div className="bg-[#FAFAFA] rounded-lg border border-[#E8E8E8] p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-[11px] text-[#8C8C8C] block">所属电站名称</span>
              <span className="font-semibold text-sm text-[#1F1F1F] block mt-0.5">{task.stationName}</span>
            </div>
            <div>
              <span className="text-[11px] text-[#8C8C8C] block">目标分析对象</span>
              <span className="font-semibold text-sm text-[#722ED1] block mt-0.5">{task.targetDevice}</span>
            </div>
            <div>
              <span className="text-[11px] text-[#8C8C8C] block">生成时间 / 分析耗时</span>
              <span className="font-semibold text-xs text-[#262626] block mt-0.5">{task.createdAt} ({task.duration})</span>
            </div>
            <div>
              <span className="text-[11px] text-[#8C8C8C] block">AI 引擎置信度</span>
              <div className="mt-0.5 flex items-baseline gap-1">
                <span className="font-mono text-base font-bold text-[#52C41A]">{task.confidence}%</span>
                <span className="text-[10px] text-[#8C8C8C]">(高度确信)</span>
              </div>
            </div>
          </div>

          {/* 二、核心诊断结论与根因溯源 */}
          <div className="bg-white rounded-lg border-2 border-[#722ED1]/30 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-purple-50 text-[#722ED1]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-[#1F1F1F]">
                  1. 核心诊断结论与根因溯源 (Root Cause Identification)
                </h3>
              </div>
              <span className="text-xs font-semibold text-[#722ED1] bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                机理模型识别: 物理接触电阻热效应
              </span>
            </div>

            <div className="p-3.5 bg-[#F9F0FF] rounded-md border border-[#D3ADF7] space-y-2 text-xs leading-relaxed text-[#262626]">
              <p className="font-semibold text-[#531DAB]">
                【根因定性结论】:
              </p>
              <p className="text-[#1F1F1F]">
                经电化学机理与多物理场仿真模型对时序CAN报文解耦反演，定位 <strong>03# 电池模块正极端子螺栓紧固力矩衰减</strong>（实测力矩估计仅 4.2 N·m，远低于标准值 8.0±0.5 N·m）。
              </p>
              <p className="text-[#1F1F1F]">
                在 0.5C（150A）持续放电工况下，端子接触电阻突增至 <strong>0.85 mΩ</strong>（正常标准 ≤ 0.12 mΩ，劣变幅度达 608%），产生剧烈额外焦耳热（$Q=I^2Rt$），导致单体电芯极柱温度在 25 分钟内快速攀升至 <strong>43.6 ℃</strong>（同模组邻近电芯平均仅 34.2 ℃，温差高达 <strong>ΔT = 9.4 ℃</strong>），并诱发单体电芯放电末端电压截断跌落。
              </p>
            </div>
          </div>

          {/* 三、关键遥测特征提取与对比表 */}
          <div className="bg-white rounded-lg border border-[#E8E8E8] p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F0F0F0]">
              <Gauge className="w-4 h-4 text-[#1890FF]" />
              <h3 className="font-bold text-xs text-[#1F1F1F]">
                2. 关键时序特征参数提取与基线对标 (Telemetry Feature Extraction)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#E8E8E8] text-[#595959]">
                    <th className="p-2.5 pl-3">特征指标名称</th>
                    <th className="p-2.5">本次诊断实测值</th>
                    <th className="p-2.5">设计基准参考值</th>
                    <th className="p-2.5">偏离劣变幅度</th>
                    <th className="p-2.5 pr-3">风险等级与判定</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F0]">
                  <tr className="hover:bg-[#FFF1F0]/40">
                    <td className="p-2.5 pl-3 font-semibold text-[#1F1F1F]">极柱最高接触温升 (T_max)</td>
                    <td className="p-2.5 font-mono font-bold text-[#F5222D]">43.6 ℃</td>
                    <td className="p-2.5 font-mono text-[#595959]">≤ 36.0 ℃</td>
                    <td className="p-2.5 font-mono font-bold text-[#F5222D]">+21.1% (超温)</td>
                    <td className="p-2.5 pr-3 text-[#F5222D] font-medium">● 严重超标 (焦耳热集中)</td>
                  </tr>
                  <tr className="hover:bg-[#FFF1F0]/40">
                    <td className="p-2.5 pl-3 font-semibold text-[#1F1F1F]">模组内单体温差散度 (ΔT)</td>
                    <td className="p-2.5 font-mono font-bold text-[#F5222D]">9.4 ℃</td>
                    <td className="p-2.5 font-mono text-[#595959]">≤ 3.0 ℃</td>
                    <td className="p-2.5 font-mono font-bold text-[#F5222D]">+213% (失衡)</td>
                    <td className="p-2.5 pr-3 text-[#F5222D] font-medium">● 一级过温预警阈值</td>
                  </tr>
                  <tr className="hover:bg-[#FFF7E6]/40">
                    <td className="p-2.5 pl-3 font-semibold text-[#1F1F1F]">0.5C 直流内阻 (DCR)</td>
                    <td className="p-2.5 font-mono font-bold text-[#FA8C16]">0.85 mΩ</td>
                    <td className="p-2.5 font-mono text-[#595959]">≤ 0.12 mΩ</td>
                    <td className="p-2.5 font-mono font-bold text-[#FA8C16]">+608% (阻抗突增)</td>
                    <td className="p-2.5 pr-3 text-[#FA8C16] font-medium">▲ 接触电阻主导</td>
                  </tr>
                  <tr className="hover:bg-[#F6FFED]/40">
                    <td className="p-2.5 pl-3 font-semibold text-[#1F1F1F]">静置自放电速率 (K-value)</td>
                    <td className="p-2.5 font-mono text-[#52C41A]">0.18 mV/h</td>
                    <td className="p-2.5 font-mono text-[#595959]">≤ 0.30 mV/h</td>
                    <td className="p-2.5 font-mono text-[#52C41A]">-40.0% (正常)</td>
                    <td className="p-2.5 pr-3 text-[#52C41A] font-medium">✓ 排除内部微短路</td>
                  </tr>
                  <tr className="hover:bg-[#F6FFED]/40">
                    <td className="p-2.5 pl-3 font-semibold text-[#1F1F1F]">电芯健康度评估 (SOH)</td>
                    <td className="p-2.5 font-mono text-[#52C41A]">96.8%</td>
                    <td className="p-2.5 font-mono text-[#595959]">≥ 80.0%</td>
                    <td className="p-2.5 font-mono text-[#52C41A]">正常衰减</td>
                    <td className="p-2.5 pr-3 text-[#52C41A] font-medium">✓ 活性物质无不可逆析锂</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 四、多维数据曲线与机理图谱证据链 */}
          <div className="bg-white rounded-lg border border-[#E8E8E8] p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#F0F0F0]">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#722ED1]" />
                <h3 className="font-bold text-xs text-[#1F1F1F]">
                  3. 诊断证据链与多维时序特征可视化 (Evidence Curves)
                </h3>
              </div>

              {/* 图表切换 */}
              <div className="flex items-center gap-1 bg-[#F5F5F5] p-0.5 rounded border border-[#E8E8E8] text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveChartTab('temp')}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    activeChartTab === 'temp' ? 'bg-white font-bold text-[#F5222D] shadow-xs' : 'text-[#595959]'
                  }`}
                >
                  放电过程温升梯度曲线 (ΔT)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChartTab('volt')}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    activeChartTab === 'volt' ? 'bg-white font-bold text-[#1890FF] shadow-xs' : 'text-[#595959]'
                  }`}
                >
                  单体电压散度曲线 (ΔV)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChartTab('dqdv')}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    activeChartTab === 'dqdv' ? 'bg-white font-bold text-[#722ED1] shadow-xs' : 'text-[#595959]'
                  }`}
                >
                  差分容量 dQ/dV 特征图谱
                </button>
              </div>
            </div>

            {/* 图表展示区 (SVG精细渲染) */}
            <div className="bg-[#FAFAFA] rounded-lg p-4 border border-[#E8E8E8]">
              {activeChartTab === 'temp' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#595959]">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-[#F5222D] font-bold">
                        <span className="w-3 h-0.5 bg-[#F5222D]" />
                        03#模组异常极柱实测温度 (最高 43.6℃)
                      </span>
                      <span className="flex items-center gap-1.5 text-[#1890FF]">
                        <span className="w-3 h-0.5 bg-[#1890FF]" />
                        同簇其他模组平均温度 (稳定在 34.2℃)
                      </span>
                      <span className="flex items-center gap-1.5 text-[#8C8C8C] border-b border-dashed border-[#8C8C8C]">
                        放电电流 (150A 恒流)
                      </span>
                    </div>
                    <span className="text-[#8C8C8C]">采样时长: 30 分钟连续放电</span>
                  </div>

                  {/* SVG 曲线示意 */}
                  <div className="h-44 w-full bg-white rounded border border-[#E8E8E8] relative flex items-end px-6 pb-6 pt-4">
                    {/* Y轴刻度 */}
                    <div className="absolute left-2 top-2 bottom-6 flex flex-col justify-between text-[9px] text-[#8C8C8C] font-mono">
                      <span>45℃</span>
                      <span>40℃</span>
                      <span>35℃</span>
                      <span>30℃</span>
                      <span>25℃</span>
                    </div>

                    {/* 网格参考虚线 */}
                    <div className="absolute left-8 right-4 top-2 bottom-6 flex flex-col justify-between pointer-events-none">
                      <div className="border-b border-[#F0F0F0] w-full" />
                      <div className="border-b border-[#F0F0F0] w-full" />
                      <div className="border-b border-[#F0F0F0] w-full" />
                      <div className="border-b border-[#F0F0F0] w-full" />
                      <div className="border-b border-[#F0F0F0] w-full" />
                    </div>

                    {/* SVG 线条 */}
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                      {/* 正常参考曲线 */}
                      <path
                        d="M 0 100 Q 150 90, 300 78 T 500 68"
                        fill="none"
                        stroke="#1890FF"
                        strokeWidth="2.5"
                      />
                      {/* 异常极柱温升曲线 */}
                      <path
                        d="M 0 100 Q 120 70, 250 35 T 500 10"
                        fill="none"
                        stroke="#F5222D"
                        strokeWidth="3"
                      />
                      {/* 焦耳热超温标记点 */}
                      <circle cx="500" cy="10" r="4" fill="#F5222D" />
                    </svg>

                    {/* 标注提示框 */}
                    <div className="absolute right-8 top-4 bg-[#FFF1F0] border border-[#FFA39E] p-1.5 rounded text-[10px] text-[#CF1322] font-semibold">
                      焦耳热集聚区: ΔT 持续扩大至 9.4℃ (力矩松动典型特征)
                    </div>
                  </div>
                </div>
              )}

              {activeChartTab === 'volt' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#595959]">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-[#FA8C16] font-bold">
                        <span className="w-3 h-0.5 bg-[#FA8C16]" />
                        03#模组端电压曲线 (IR 降加剧)
                      </span>
                      <span className="flex items-center gap-1.5 text-[#52C41A]">
                        <span className="w-3 h-0.5 bg-[#52C41A]" />
                        基准模组端电压曲线
                      </span>
                    </div>
                    <span className="text-[#8C8C8C]">放电截止前单体压差散度达 68mV</span>
                  </div>

                  <div className="h-44 w-full bg-white rounded border border-[#E8E8E8] relative flex items-end px-6 pb-6 pt-4">
                    <div className="absolute left-2 top-2 bottom-6 flex flex-col justify-between text-[9px] text-[#8C8C8C] font-mono">
                      <span>3.4V</span>
                      <span>3.2V</span>
                      <span>3.0V</span>
                      <span>2.8V</span>
                    </div>
                    <div className="absolute left-8 right-4 top-2 bottom-6 flex flex-col justify-between pointer-events-none">
                      <div className="border-b border-[#F0F0F0] w-full" />
                      <div className="border-b border-[#F0F0F0] w-full" />
                      <div className="border-b border-[#F0F0F0] w-full" />
                      <div className="border-b border-[#F0F0F0] w-full" />
                    </div>
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                      <path d="M 0 10 Q 200 25, 380 50 T 500 90" fill="none" stroke="#52C41A" strokeWidth="2.5" />
                      <path d="M 0 10 Q 200 40, 350 75 T 500 115" fill="none" stroke="#FA8C16" strokeWidth="3" />
                      <circle cx="500" cy="115" r="4" fill="#FA8C16" />
                    </svg>
                    <div className="absolute right-8 bottom-8 bg-[#FFF7E6] border border-[#FFD591] p-1.5 rounded text-[10px] text-[#D46B08] font-semibold">
                      大电流放电产生额外 IR 压降 (ΔV=68mV)
                    </div>
                  </div>
                </div>
              )}

              {activeChartTab === 'dqdv' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#595959]">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-[#722ED1] font-bold">
                        <span className="w-3 h-0.5 bg-[#722ED1]" />
                        差分容量 dQ/dV 峰位吻合 (主特征峰未发生不可逆相变迁移)
                      </span>
                    </div>
                    <span className="text-[#52C41A] font-semibold">判定结论: 电芯本体活性材料完好</span>
                  </div>

                  <div className="h-44 w-full bg-white rounded border border-[#E8E8E8] relative flex items-end px-6 pb-6 pt-4">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                      <path d="M 0 110 Q 120 100, 180 30 T 260 90 T 360 20 T 500 110" fill="none" stroke="#722ED1" strokeWidth="2.5" />
                    </svg>
                    <div className="absolute left-1/3 top-6 bg-[#F9F0FF] border border-[#D3ADF7] p-1.5 rounded text-[10px] text-[#722ED1] font-semibold">
                      特征主峰完整，排除内部微短路或材料相变损耗，直接锁定外部接触电阻
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 五、推荐现场标准化排查与消缺 SOP */}
          <div className="bg-white rounded-lg border border-[#E8E8E8] p-4 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F0F0F0]">
              <Wrench className="w-4 h-4 text-[#52C41A]" />
              <h3 className="font-bold text-xs text-[#1F1F1F]">
                4. 推荐现场消缺方案与作业 SOP 指引 (Actionable Remediation Plan)
              </h3>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 bg-[#FAFAFA] rounded-md border border-[#E8E8E8] flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#1890FF] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </div>
                <div className="space-y-0.5">
                  <div className="font-semibold text-xs text-[#1F1F1F]">安全隔离与停电验电</div>
                  <p className="text-[11px] text-[#595959]">
                    断开 02# 电池舱直流分总断路器，并在该簇双向断路器处挂设「禁止合闸·有人工作」警示牌，使用高压验电器及万用表确认直流侧无残余电压。
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#FAFAFA] rounded-md border border-[#E8E8E8] flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#1890FF] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  2
                </div>
                <div className="space-y-0.5">
                  <div className="font-semibold text-xs text-[#1F1F1F]">极柱螺栓力矩重新紧固与红外复核</div>
                  <p className="text-[11px] text-[#595959]">
                    使用经校准的数显绝缘力矩扳手，对 03# 电池模块所有正负极连接端子螺栓按照 <strong>8.0 ± 0.5 N·m</strong> 标准力矩进行对角紧固；使用红外热像仪检查铜排连接面有无氧化发黑，必要时涂抹导电膏。
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#FAFAFA] rounded-md border border-[#E8E8E8] flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#1890FF] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  3
                </div>
                <div className="space-y-0.5">
                  <div className="font-semibold text-xs text-[#1F1F1F]">带载试运行与遥测闭环验收</div>
                  <p className="text-[11px] text-[#595959]">
                    紧固完毕恢复送电，执行 0.2C 试放电 15 分钟，遥测复核 03# 模组温升与同簇温差稳定在 <strong>ΔT ≤ 2.5 ℃</strong> 以内，确认压差散度恢复正常后方可销号归档。
                  </p>
                </div>
              </div>
            </div>

            {/* 推荐备件 */}
            <div className="p-2.5 bg-[#FFFBE6] rounded border border-[#FFE58F] text-[11px] text-[#D48806] flex items-center justify-between">
              <span>推荐随身备件: M6 绝缘镀银螺栓 (SP-BOLT-M6) x 4、绝缘阻燃保护盖 (SP-CAP-03) x 2</span>
              <span className="font-semibold">已同步备件库</span>
            </div>
          </div>

        </div>

        {/* 报告底部操作栏 */}
        <div className="px-6 py-3.5 bg-[#FAFAFA] border-t border-[#E8E8E8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#8C8C8C] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#722ED1]" />
            <span>AI 诊断报告已通过机理仿真校核，支持直接派发执行消缺</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#D9D9D9] hover:bg-white text-[#595959] rounded-md text-xs font-medium cursor-pointer transition-colors"
            >
              关闭报告
            </button>

            <button
              type="button"
              onClick={() => {
                onConvertToTicket?.({
                  title: `【AI诊断派工】${task.stationName} ${task.targetDevice} ${task.scenario}`,
                  stationName: task.stationName,
                  priority: '高',
                  riskScore: task.riskScore,
                  description: task.rootCause,
                  suggestedAction: '1. 现场断开直流侧断路器验电；2. 使用数显扭矩扳手将03#模组端子螺栓复紧至8.0N·m；3. 0.2C带载试放电复测温差ΔT<2.5℃。'
                });
                onClose();
              }}
              className="px-5 py-2 bg-[#1890FF] hover:bg-[#40A9FF] text-white rounded-md text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>一键带参派发 pcare 现场消缺工单</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
