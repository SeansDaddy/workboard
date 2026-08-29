import React, { useState, useEffect } from 'react';
import { TicketItem, CONFIG_THRESHOLDS } from '../../types';
import { PriorityBadge, RiskScoreBadge, SlaBadge, TicketStatusBadge } from '../common/Badges';
import { 
  X, 
  Ticket, 
  Building2, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  UserCheck, 
  History,
  ExternalLink,
  MessageSquare,
  Wrench,
  ChevronRight,
  Maximize2,
  Minimize2,
  BrainCircuit,
  UploadCloud,
  FileCode,
  Play,
  RotateCcw,
  Activity,
  Layers,
  Check,
  AlertTriangle,
  Download,
  Printer,
  TrendingUp,
  Cpu,
  Zap,
  Info,
  SlidersHorizontal,
  Flame,
  BookOpen,
  FolderGit2,
  Copy,
  ChevronDown,
  ShieldCheck,
  HelpCircle,
  Search,
  CheckSquare
} from 'lucide-react';

interface TicketProcessDrawerProps {
  ticket: TicketItem | null;
  onClose: () => void;
  onUpdateStatus?: (ticketId: string, newStatus: TicketItem['status'], note: string) => void;
  onJumpToRisk?: (riskId: string) => void;
}

// 智能 SOP 定义
interface TroubleshootingSOP {
  category: string;
  matchReason: string;
  safetyNotice: string;
  toolsRequired: string[];
  steps: Array<{
    step: number;
    title: string;
    detail: string;
    keyCheck: string;
  }>;
  acceptanceCriteria: string;
}

// 历史相似案例定义
interface SimilarHistoricalCase {
  id: string;
  title: string;
  stationName: string;
  deviceType: string;
  similarity: number; // 0 - 100
  reportedSymptom: string;
  actualRootCause: string;
  resolutionAction: string;
  resolutionTime: string;
  resolvedBy: string;
  preventionTip: string;
}

// 根据工单特征自动生成匹配的排查 SOP 与 相似案例
function getRecommendedSopAndCases(ticket: TicketItem): {
  sop: TroubleshootingSOP;
  cases: SimilarHistoricalCase[];
} {
  const text = `${ticket.title} ${ticket.description || ''} ${ticket.deviceCode || ''}`.toLowerCase();

  // 1. PCS / 变流器 / IGBT / 散热风机类型
  if (text.includes('pcs') || text.includes('igbt') || text.includes('变流器') || text.includes('超温') || text.includes('风机')) {
    return {
      sop: {
        category: '储能变流器 (PCS) 功率器件热阻与散热异常排查',
        matchReason: '根据工单中【PCS逆变桥臂/IGBT超温】特征，系统自动匹配电力电子热管理标准排查规程。',
        safetyNotice: '变流器交直流侧断路器必须完全断开，严防电网反送电；停机后须等待 ≥5 分钟确认母线电容残压 < 36V 挂牌加锁后方可触碰内部部件。',
        toolsRequired: ['数字风速仪 (0-30m/s)', '便携式高压防静电吹风机', '导热硅脂与刮刀', '万用表与毫伏信号发生器', '红外测温枪'],
        steps: [
          {
            step: 1,
            title: '停机安全闭锁与进出风道负压复核',
            detail: '断开网侧交流隔离开关与直流进线断路器，确认电容充分放电后，使用风速仪测试滤网前后风阻压差。',
            keyCheck: '进风过滤棉表面压降 ≤ 25Pa，风道无絮状物或粉尘堵塞。'
          },
          {
            step: 2,
            title: '强制启闭散热风机并测量转速与供电电压',
            detail: '通过本地面板手动启停主散热风机组，检查接触器触点接触电阻及 24V/220V 驱动回路电压。',
            keyCheck: '各风机三相转速平衡度 ≥ 95%，无异响、卡滞与轴承抖动。'
          },
          {
            step: 3,
            title: '过温桥臂 IGBT 导热基板与硅脂附着状态拆检',
            detail: '拆卸异常相 IGBT 散热压板，清除固化老化的导热硅脂，以标准 0.2mm 厚度重新均匀涂布高导热纳米硅脂。',
            keyCheck: '螺栓紧固力矩严格按厂家工艺执行（6.0±0.2 N·m 对角分次紧固）。'
          },
          {
            step: 4,
            title: '阶梯带载升温验证与结温传感器校验',
            detail: '分步施加 25% ➔ 50% ➔ 100% 额定充放电负荷，观察 IGBT 结温爬升速率及与同相温差。',
            keyCheck: '额定满载 1 小时后，IGBT 探针结温 ≤ 72℃，三相桥臂温差 ≤ 3.5℃。'
          }
        ],
        acceptanceCriteria: '满载工况连续运行 2 小时，变流器无超温降额与告警触发，进出风道风温差在 8~14℃ 正常区间。'
      },
      cases: [
        {
          id: 'CASE-2026-0342',
          title: '徐州大庙站 01#PCS 风冷滤网负压堵塞导致满载 IGBT 超温跳闸',
          stationName: '徐州大庙 20MW/40MWh 储能电站',
          deviceType: 'PCS-01-B相逆变桥臂',
          similarity: 95,
          reportedSymptom: '放电阶段 IGBT 探针结温达 94℃，触发二级超温降额报警。',
          actualRootCause: '周边春季柳絮及粉尘粘附于进风防尘棉，导致风道有效通量降低 42%，散热热阻陡升。',
          resolutionAction: '高压吹扫风道，更换阻燃初效过滤网，重新涂覆导热硅脂。消缺后满载结温回落至 67℃。',
          resolutionTime: '1.8 小时闭环',
          resolvedBy: '刘工 (电气班长)',
          preventionTip: '建议将迎峰度夏期间的滤网清灰频次由每月 1 次缩短为每两周 1 次。'
        },
        {
          id: 'CASE-2026-0188',
          title: '盐城大丰港配储 PCS 驱动板 NTC 温度传感器引脚虚焊误告警',
          stationName: '盐城大丰港配储电站',
          deviceType: 'PCS-02 驱动控制单元',
          similarity: 86,
          reportedSymptom: '待机状态下 IGBT 结温瞬时跳变至 105℃ 并频繁报保护。',
          actualRootCause: '驱动板 NTC 测温探头插座引脚因振动导致虚接，采样电阻产生开路跳变。',
          resolutionAction: '补焊加固采样端子并涂布三防胶绝缘固定，信号恢复稳定。',
          resolutionTime: '1.2 小时闭环',
          resolvedBy: '王工',
          preventionTip: '季度巡检中增设控制板插件紧固与振动应力核查项。'
        }
      ]
    };
  }

  // 2. 绝缘阻抗 / 漏电 / 母线对地异常类型
  if (text.includes('绝缘') || text.includes('接地') || text.includes('漏电') || text.includes('阻抗骤降') || text.includes('对地')) {
    return {
      sop: {
        category: '高压直流母线与电池簇对地绝缘阻抗劣化排查',
        matchReason: '根据工单中【绝缘阻抗骤降/接地阻抗低】特征，系统自动匹配高压绝缘安全与漏电排查 SOP。',
        safetyNotice: '绝缘排查涉及千伏级高压直流回路，操作人员须穿戴绝缘鞋、护目镜及 1000V 防护手套；雨雪高湿天气严禁开启外部接线盒。',
        toolsRequired: ['1000V/2500V 绝缘兆欧表', '工业级除湿热风枪', '绝缘清洗剂与无尘擦拭布', '高分子绝缘自粘胶带'],
        steps: [
          {
            step: 1,
            title: '总开关分断与正负极对地逐级分段解耦',
            detail: '断开电池集装箱直流总断路器，逐一拉开各个电池簇支路断路器，使故障簇与系统母线完全物理隔离。',
            keyCheck: '总母线正负极对地残存感应电压 < 10V。'
          },
          {
            step: 2,
            title: '兆欧表分簇摇测锁定劣化电池簇',
            detail: '使用 1000V 兆欧表分别对各簇正极对地、负极对地进行绝缘摇测（测试时间 ≥ 60 秒读取 R60 值）。',
            keyCheck: '定位阻抗 < 0.5 MΩ 的异常电池簇及极性。'
          },
          {
            step: 3,
            title: '簇内模块间高压接插件与底部凝露排查',
            detail: '沿电缆桥架排查模组穿舱套管、高压插头密封圈破损、底部积尘受潮或冷凝水聚集情况。',
            keyCheck: '重点排查底部靠近空调出风口的冷凝露点位置。'
          },
          {
            step: 4,
            title: '清洗烘干防潮密封与合闸复测',
            detail: '使用电气绝缘清洗剂清洁积灰油污，热风枪均匀烘干潮气，重新涂抹绝缘密封胶泥并包裹防护套。',
            keyCheck: '复测对地绝缘阻抗 ≥ 20 MΩ，BMS 绝缘检测模块读数恢复正常。'
          }
        ],
        acceptanceCriteria: '恢复直流并网运行后，BMS 绝缘阻抗实测值持续稳定在 10 MΩ 以上，无跳水告警。'
      },
      cases: [
        {
          id: 'CASE-2026-0291',
          title: '盐城大丰港储能梅雨季集装箱穿隔套管积水导致负极绝缘骤降至 0.08MΩ',
          stationName: '盐城大丰港配储电站',
          deviceType: '02#集装箱-直流进线穿隔套管',
          similarity: 94,
          reportedSymptom: '连续降雨后 BMS 报二级绝缘阻抗过低 (80kΩ)，触发保护闭锁。',
          actualRootCause: '舱壁防水胶圈老化收缩，雨水沿电缆外皮渗入底部穿隔密封泥并形成导电水膜。',
          resolutionAction: '抽排积水，使用耐候防火发泡胶重新灌封套管，启动舱内工业除湿机。绝缘恢复至 45MΩ。',
          resolutionTime: '2.5 小时闭环',
          resolvedBy: '陈工',
          preventionTip: '雨季前必须开展全站舱体密封性与排水管道专项整改。'
        },
        {
          id: 'CASE-2026-0155',
          title: '徐州贾汪独立储能 04#簇 BAF采样线被金属毛刺刮破对箱体轻微接地',
          stationName: '徐州贾汪 50MW/100MWh 储能站',
          deviceType: '04#电池簇-08号箱体',
          similarity: 87,
          reportedSymptom: '充电阶段负极对地绝缘波动下降至 0.35MΩ。',
          actualRootCause: '电池箱内部线束固定绑带松动，电缆与钣金锐边长期摩擦导致外皮磨损。',
          resolutionAction: '包扎绝缘套管，加装钣金护线胶条，重新规范绑扎走向。',
          resolutionTime: '1.5 小时闭环',
          resolvedBy: '张伟',
          preventionTip: '例行巡检中增加箱内线束固定点及绝缘套管磨损检查。'
        }
      ]
    };
  }

  // 3. 默认/电池单体温差大 / 接触内阻增大 / 极化压差异常 (如 PC-20260825-001)
  return {
    sop: {
      category: '电芯单体温差偏高与极柱接触内阻劣化标准排查规程',
      matchReason: '根据工单中【单体电芯温差持续偏高 / 接触内阻估算偏大】特征，系统自动匹配电化学连接可靠性排查 SOP。',
      safetyNotice: '严禁在充放电运行中带电拧动极柱螺栓；现场操作前必须将该簇直流隔离开关断开，挂上【禁止合闸】标示牌并进行安全验电与放电。',
      toolsRequired: ['数显绝缘扭矩扳手 (标准量程 5~25 N·m)', '高精度红外热像仪 (带点温追踪功能)', '便携式毫欧计/接触电阻测试仪', '导电膏与防氧化紫铜除锈砂布'],
      steps: [
        {
          step: 1,
          title: '安全停运验电与作业防护就绪',
          detail: '切断故障电池簇直流开关，确认高压接触器已可靠分断；佩戴 1000V 耐压手套，使用验电器确认母线电压 < 10V。',
          keyCheck: '双重验电确认零电位，相邻带电部位加装绝缘隔板隔离防护。'
        },
        {
          step: 2,
          title: '预警电芯极柱连接铜排力矩校准与除氧化',
          detail: '拆卸 12 号电芯连接铜排，检查极柱及压接面是否有电弧灼痕或氧化膜；清理后使用数显扭矩扳手重新紧固至 10.0±0.5 N·m，并涂布极薄层导电硅脂。',
          keyCheck: '紧固力矩实测 10.0 N·m，连接铜排与极柱贴合面平整无倾斜。'
        },
        {
          step: 3,
          title: '接触内阻测量与采样线束阻抗一致性复核',
          detail: '使用直流微电阻计测量极柱端子接触内阻（标准要求 < 0.25 mΩ）；排查 BAF 模块电压/温度采样线束接插件插拔力及针脚氧化。',
          keyCheck: '两端接触电阻实测值与同簇平均偏差 ≤ 5%，采样阻抗正常。'
        },
        {
          step: 4,
          title: '送电 0.5C 带载 30 分钟红外点温监测与主动均衡标定',
          detail: '恢复电池簇并网，在 0.5C 充放电工况下使用红外热像仪对 12 号电芯与相邻电芯进行连续点温跟踪，平台下发 BMS 主动均衡指令。',
          keyCheck: '极柱温升温差 ΔT 由 8.5℃ 回落至 < 2.0℃，单体压差收敛至 15mV 以内。'
        }
      ],
      acceptanceCriteria: '经历一次完整充放电循环后，异常电芯最高温度与同簇平均温差 ≤ 2.5℃，接触内阻一致性合格，BMS 无任何越限预警。'
    },
    cases: [
      {
        id: 'CASE-2026-0102',
        title: '宿迁沭阳站 02#舱 Rack08 单体铜排力矩松动引发 8.9℃ 局部极化温升',
        stationName: '宿迁沭阳经开区储能电站',
        deviceType: '2#储能舱-Rack08-Cell14',
        similarity: 96,
        reportedSymptom: '放电阶段电芯温差达 8.9℃，估算内阻增加 +22%，触发一级温差告警。',
        actualRootCause: '铜排固定螺栓出厂预紧力在冷热膨胀应力作用下松脱至 4.2 N·m，导致放电大电流时接触内阻骤增，产生剧烈焦耳热。',
        resolutionAction: '全簇排查螺栓力矩，使用校准数显扳手统一按 10.0 N·m 复紧，涂抹导电防氧化硅脂。消缺后温差降至 1.5℃。',
        resolutionTime: '2.0 小时闭环',
        resolvedBy: '郭工 (现场运维主管)',
        preventionTip: '建议纳入每季度例行检修巡检中的红外巡温与抽检力矩标准项。'
      },
      {
        id: 'CASE-2026-0089',
        title: '南通如东站 01#舱 Rack04 温度采集线束贴片虚贴产生虚假高温差',
        stationName: '南通如东 50MW/100MWh 电站',
        deviceType: '1#储能舱-Rack04-03#模组',
        similarity: 89,
        reportedSymptom: 'BMS 上报单体温度较均值高 7.8℃，但红外热像仪实测表面温度正常。',
        actualRootCause: '电芯表面 NTC 测温贴片背胶老化脱落，搭接在旁边大功率均衡发热电阻旁造成虚假高温。',
        resolutionAction: '清理表面绝缘胶，重新使用耐高温导热结构胶固定 NTC 传感器并校准阻值。',
        resolutionTime: '1.2 小时闭环',
        resolvedBy: '李工',
        preventionTip: '采购耐温等级更高的固化贴片胶，防止高温老化脆化脱胶。'
      },
      {
        id: 'CASE-2026-0045',
        title: '无锡高新区用户侧储能单体电芯微短路自放电与温升劣变案例',
        stationName: '无锡高新用户侧站',
        deviceType: '01#储能柜-03#电池箱',
        similarity: 78,
        reportedSymptom: '静置阶段单体电压持续以 3.2mV/h 下降，放电时温升较同组高 5.2℃。',
        actualRootCause: '电芯内部极片毛刺微短路引发自放电与局部产热。',
        resolutionAction: '现场隔离该电芯模块，申请厂家售后备件进行整包更换并完成容量重标定。',
        resolutionTime: '4.5 小时闭环',
        resolvedBy: '张伟',
        preventionTip: '定期导出静置阶段 OCV 压降曲线进行平台侧早期微短路诊断。'
      }
    ]
  };
}

export const TicketProcessDrawer: React.FC<TicketProcessDrawerProps> = ({
  ticket,
  onClose,
  onUpdateStatus,
  onJumpToRisk
}) => {
  // 抽屉宽度展开状态
  const [isExpandedWidth, setIsExpandedWidth] = useState(true);

  // 主选项卡：
  // 'troubleshoot' (排查SOP与案例推荐 - 默认首选！)
  // 'diagnosis' (AI 故障机理诊断 - 任务创建/日志上传/推演/结果)
  // 'process' (现场消缺流转 - 记录与流转)
  // 'info' (工单与设备台账)
  const [mainTab, setMainTab] = useState<'troubleshoot' | 'diagnosis' | 'process' | 'info'>('troubleshoot');

  // AI 诊断是否有结果状态：默认不会有诊断结果 (hasDiagnosed = false)
  const [hasDiagnosed, setHasDiagnosed] = useState<boolean>(false);

  // 诊断子选项卡：
  // 按照自然闭环流转顺序：'create' (创建任务) ➔ 'upload' (上传日志) ➔ 'pipeline' (推演流水线) ➔ 'result' (诊断结论详情)
  const [diagSubTab, setDiagSubTab] = useState<'create' | 'upload' | 'pipeline' | 'result'>('create');

  // 查看历史案例详情弹窗
  const [activeCaseModal, setActiveCaseModal] = useState<SimilarHistoricalCase | null>(null);

  // 工单处置状态
  const [handleNote, setHandleNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // 诊断报告全屏模态框
  const [showFullReportModal, setShowFullReportModal] = useState(false);

  // 诊断任务与日志状态
  const [diagTask, setDiagTask] = useState({
    id: 'DIAG-20260825-TK01',
    name: '',
    station: '',
    device: '',
    scenario: '极柱过热与接触内阻劣变分析',
    model: '电化学机理与多物理场大模型混合分析引擎 V4.2',
    samplingRate: '100 Hz',
    status: '就绪' as '就绪' | '分析中' | '已完成' | '已失败',
    progress: 0,
    stageIndex: 0,
    stageText: '准备就绪，待启动 AI 诊断流水线',
    confidence: 97.8,
    riskScore: 92,
    duration: '1.4 秒',
    rootCause: '',
    symptomDesc: ''
  });

  // 日志文件信息
  const [uploadedLog, setUploadedLog] = useState<{
    name: string;
    size: string;
    frames: string;
    samplingRate: string;
    timeRange: string;
    isUploaded: boolean;
  }>({
    name: '现场BMS高频采样录波时序.bms_log',
    size: '14.8 MB',
    frames: '128,000 帧高频时序数据',
    samplingRate: '100 Hz (微秒级对齐)',
    timeRange: '2026-08-25 08:00:00 ~ 10:30:00',
    isUploaded: true
  });

  // 上传拖拽状态与上传中动画
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 诊断进度仿真推演控制
  const [isSimulating, setIsSimulating] = useState(false);

  // 计算当前工单的 SOP 与推荐案例
  const { sop: recommendedSop, cases: recommendedCases } = ticket 
    ? getRecommendedSopAndCases(ticket)
    : { sop: {} as TroubleshootingSOP, cases: [] };

  // 初始化或切换工单时，重置状态为【未诊断】，并匹配设备和默认描述
  useEffect(() => {
    if (ticket) {
      setHasDiagnosed(false);
      setMainTab('troubleshoot'); // 默认打开排查SOP与案例推荐
      setDiagSubTab('create');    // 诊断内部默认从创建任务开始
      setDiagTask({
        id: `DIAG-20260825-${ticket.id.slice(-4)}`,
        name: `【${ticket.id}】${ticket.stationName} - ${ticket.title.replace(/【.*?】/, '')} 深度诊断`,
        station: ticket.stationName,
        device: ticket.deviceCode || `${ticket.stationName.slice(0, 4)}-Rack-03`,
        scenario: ticket.title.includes('PCS') || ticket.title.includes('IGBT')
          ? '储能变流器(PCS)开关动态与IGBT热阻畸变'
          : ticket.title.includes('绝缘')
          ? '直流母线绝缘阻抗骤降与微漏电排查'
          : '极柱过热与接触内阻劣变分析',
        model: '电化学机理与多物理场大模型混合分析引擎 V4.2',
        samplingRate: '100 Hz',
        status: '就绪',
        progress: 0,
        stageIndex: 0,
        stageText: '任务已配置，待载入录波日志启动推演',
        confidence: 97.8,
        riskScore: ticket.riskScore || 90,
        duration: '1.4 秒',
        rootCause: `${ticket.deviceCode || '预警目标设备'}端子螺栓紧固力矩衰减至 4.2N·m（标准 10N·m），大电流充放电时接触内阻突增 +32.4%，引发局部焦耳热温升超标（ΔT=9.4℃）`,
        symptomDesc: ticket.description || '充放电期间电芯温度持续超温，内阻离散度升高。'
      });
      setUploadedLog({
        name: `${ticket.stationName.slice(0, 4)}_${ticket.deviceCode || '01舱'}_故障录波.bms_log`,
        size: '14.8 MB',
        frames: '128,000 帧高频时序数据',
        samplingRate: '100 Hz (微秒级对齐)',
        timeRange: '2026-08-25 08:00:00 ~ 10:30:00',
        isUploaded: true
      });
    }
  }, [ticket?.id]);

  if (!ticket) return null;

  // 预设典型故障日志
  const presetLogs = [
    {
      name: `${ticket.stationName.slice(0, 4)}_02舱Rack04_单体温差与极化阻抗异常.bms_log`,
      size: '14.8 MB',
      frames: '128,000 帧',
      samplingRate: '100 Hz',
      timeRange: '2026-08-25 08:00:00 ~ 10:30:00',
      scenario: '极柱过热与接触内阻劣变分析'
    },
    {
      name: `${ticket.stationName.slice(0, 4)}_05簇_电芯微短路低压自放电时序.csv`,
      size: '8.6 MB',
      frames: '24,000 帧',
      samplingRate: '10 Hz',
      timeRange: '2026-08-25 00:00:00 ~ 09:00:00 (静置期)',
      scenario: '电芯微短路与绝缘劣变演化'
    },
    {
      name: `${ticket.stationName.slice(0, 4)}_PCS01_网侧谐波与IGBT温升波动.dat`,
      size: '22.4 MB',
      frames: '520,000 帧',
      samplingRate: '1 kHz',
      timeRange: '2026-08-24 15:30:00 ~ 16:30:00',
      scenario: '储能变流器(PCS)开关动态与IGBT热阻畸变'
    }
  ];

  // 1. 触发运行 AI 深度诊断仿真推演
  const handleRunDiagnosisSimulation = () => {
    setIsSimulating(true);
    setMainTab('diagnosis');
    setDiagSubTab('pipeline');
    setDiagTask(prev => ({
      ...prev,
      status: '分析中',
      progress: 18,
      stageIndex: 0,
      stageText: '时序数据完整性校验与毫秒级时钟对齐中...'
    }));

    setTimeout(() => {
      setDiagTask(prev => ({
        ...prev,
        progress: 48,
        stageIndex: 1,
        stageText: '电化学机理模型逆变求解，极化阻抗谱与接触内阻计算中...'
      }));
    }, 800);

    setTimeout(() => {
      setDiagTask(prev => ({
        ...prev,
        progress: 78,
        stageIndex: 2,
        stageText: '多物理场焦耳热仿真与时序大模型知识图谱关联推理中...'
      }));
    }, 1600);

    setTimeout(() => {
      setDiagTask(prev => ({
        ...prev,
        status: '已完成',
        progress: 100,
        stageIndex: 3,
        stageText: '根因溯源完成，置信度 97.8%，已生成消缺 SOP 闭环策略',
        duration: '1.4 秒'
      }));
      setIsSimulating(false);
      setHasDiagnosed(true);
      setDiagSubTab('result'); // 自动跳转至诊断结论详情！
      setStatusMessage('🎉 AI 深度机理诊断已成功完成！已更新故障根因与机理证据链。');
    }, 2500);
  };

  // 2. 处理日志上传选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const f = files[0];
      setIsUploading(true);
      setTimeout(() => {
        setUploadedLog({
          name: f.name,
          size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
          frames: '约 85,000 帧时序数据',
          samplingRate: '100 Hz (自适应解析)',
          timeRange: '2026-08-25 08:00:00 ~ 10:00:00',
          isUploaded: true
        });
        setIsUploading(false);
        setStatusMessage(`日志文件【${f.name}】已成功解析并提取时序特征！`);
      }, 500);
    }
  };

  // 3. 一键采纳【标准排查 SOP】至工单消缺备注
  const handleAdoptSopToNote = () => {
    const text = `【采纳推荐排查 SOP：${recommendedSop.category}】\n一、安全防护要求：${recommendedSop.safetyNotice}\n二、现场排查执行步骤：\n${recommendedSop.steps.map(s => `${s.step}. ${s.title}：${s.detail}（核验判据：${s.keyCheck}）`).join('\n')}\n三、消缺验收合格判据：${recommendedSop.acceptanceCriteria}`;
    setHandleNote(text);
    setMainTab('process');
    setStatusMessage('已将标准排查 SOP 自动填充至现场处置记录中！');
  };

  // 4. 一键引用【相似案例解决方案】至工单消缺备注
  const handleAdoptCaseToNote = (c: SimilarHistoricalCase) => {
    const text = `【借鉴历史相似案例消缺方案（匹配度 ${c.similarity}%）】\n参考案例：${c.title}（${c.stationName}）\n历史根因：${c.actualRootCause}\n消缺措施：${c.resolutionAction}\n长效预防：${c.preventionTip}`;
    setHandleNote(text);
    setMainTab('process');
    setActiveCaseModal(null);
    setStatusMessage(`已成功引用【${c.title.slice(0, 16)}...】消缺经验至现场记录！`);
  };

  // 5. 一键采纳【AI 深度诊断结论与 SOP】至工单消缺备注
  const handleAdoptAiDiagToNote = () => {
    const text = `【采纳 AI 故障机理诊断结论 (置信度 97.8%)】\n根因定位：${diagTask.rootCause}\n消缺处置策略：\n1. 现场断开直流隔离开关，执行验电与安全放电；\n2. 使用数显扭矩扳手重新校准端子紧固力矩至 10.0 N·m；\n3. 启动红外热像仪在 0.5C 充放电工况下复测极柱温升（目标 ΔT < 2.5℃）；\n4. 下发 BMS 在线主动均衡标定指令。`;
    setHandleNote(text);
    setMainTab('process');
    setShowFullReportModal(false);
    setStatusMessage('已将 AI 深度机理诊断结论及消缺指令填入现场处置记录！');
  };

  // 6. 工单流转操作
  const handleAction = (status: TicketItem['status'], actionText: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      onUpdateStatus?.(ticket.id, status, handleNote || actionText);
      setIsProcessing(false);
      setStatusMessage(`已成功执行操作: 【${actionText}】，工单状态已更新为「${status}」`);
      setHandleNote('');
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none animate-in fade-in duration-200">
      {/* 遮罩背景 */}
      <div 
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px] transition-opacity" 
        onClick={onClose} 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className={`w-screen ${
          isExpandedWidth ? 'max-w-4xl' : 'max-w-2xl'
        } bg-white shadow-2xl flex flex-col border-l border-[#D9D9D9] transition-all duration-300`}>
          
          {/* 抽屉头部 */}
          <div className="px-5 py-3.5 border-b border-[#E8E8E8] bg-[#FAFAFA] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-lg bg-blue-50 text-[#1890FF] border border-blue-100 shrink-0">
                <Ticket className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-bold text-[#1F1F1F]">{ticket.id}</span>
                  <TicketStatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                  <span className="text-xs text-[#8C8C8C] flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#595959]" />
                    {ticket.stationName}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[#262626] truncate max-w-xl mt-0.5" title={ticket.title}>
                  {ticket.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* 展开/收缩抽屉宽度 */}
              <button
                type="button"
                onClick={() => setIsExpandedWidth(!isExpandedWidth)}
                className="p-1.5 text-[#595959] hover:text-[#1890FF] hover:bg-[#E8E8E8] rounded-md transition-colors cursor-pointer"
                title={isExpandedWidth ? "标准宽度" : "宽屏模式"}
              >
                {isExpandedWidth ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-[#8C8C8C] hover:text-[#262626] hover:bg-[#E8E8E8] rounded-md transition-colors cursor-pointer"
                title="关闭抽屉"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 选项卡导航栏 (按照正确工作流顺序排列) */}
          <div className="px-5 border-b border-[#E8E8E8] bg-white flex items-center justify-between shrink-0 overflow-x-auto">
            <div className="flex items-center gap-1">
              
              {/* TAB 1: 问题排查与案例推荐 (默认首选) */}
              <button
                type="button"
                onClick={() => setMainTab('troubleshoot')}
                className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  mainTab === 'troubleshoot'
                    ? 'border-[#1890FF] text-[#1890FF] bg-blue-50/40'
                    : 'border-transparent text-[#595959] hover:text-[#262626]'
                }`}
              >
                <BookOpen className="w-4 h-4 text-[#1890FF]" />
                <span>排查 SOP 与相似案例</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-[#1890FF] font-medium">
                  {recommendedCases.length} 案例
                </span>
              </button>

              {/* TAB 2: AI 故障机理诊断 */}
              <button
                type="button"
                onClick={() => {
                  setMainTab('diagnosis');
                  if (!hasDiagnosed) {
                    setDiagSubTab('create');
                  } else {
                    setDiagSubTab('result');
                  }
                }}
                className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  mainTab === 'diagnosis'
                    ? 'border-[#722ED1] text-[#722ED1] bg-purple-50/40'
                    : 'border-transparent text-[#595959] hover:text-[#262626]'
                }`}
              >
                <BrainCircuit className="w-4 h-4 text-[#722ED1]" />
                <span>AI 故障机理诊断</span>
                {hasDiagnosed ? (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#722ED1] text-white font-mono">
                    已诊断 97.8%
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-100 text-gray-500 font-normal">
                    待推演
                  </span>
                )}
              </button>

              {/* TAB 3: 现场消缺流转 */}
              <button
                type="button"
                onClick={() => setMainTab('process')}
                className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  mainTab === 'process'
                    ? 'border-[#1890FF] text-[#1890FF] bg-blue-50/40'
                    : 'border-transparent text-[#595959] hover:text-[#262626]'
                }`}
              >
                <Wrench className="w-4 h-4 text-[#1890FF]" />
                <span>现场消缺流转</span>
                {ticket.status !== '已完成' && (
                  <span className="w-2 h-2 rounded-full bg-[#FA8C16]" />
                )}
              </button>

              {/* TAB 4: 工单基础信息 */}
              <button
                type="button"
                onClick={() => setMainTab('info')}
                className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  mainTab === 'info'
                    ? 'border-[#1890FF] text-[#1890FF] bg-blue-50/40'
                    : 'border-transparent text-[#595959] hover:text-[#262626]'
                }`}
              >
                <Info className="w-4 h-4 text-[#595959]" />
                <span>工单与资产台账</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs shrink-0">
              <SlaBadge remainingHours={ticket.slaRemainingHours} deadline={ticket.slaDeadline} />
            </div>
          </div>

          {/* 状态操作成功提醒 */}
          {statusMessage && (
            <div className="p-3 px-5 bg-[#F6FFED] border-b border-[#B7EB8F] text-xs text-[#52C41A] flex items-center justify-between animate-in fade-in duration-200 shrink-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#52C41A] shrink-0" />
                <span className="font-medium">{statusMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                className="text-[#52C41A] hover:underline text-xs cursor-pointer"
              >
                关闭提示
              </button>
            </div>
          )}

          {/* 抽屉滚动内容主体 */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs bg-[#F8F9FA]">
            
            {/* ============================================================== */}
            {/* TAB 1: 问题排查 SOP 与历史相似案例推荐 (DEFAULT VIEW) */}
            {/* ============================================================== */}
            {mainTab === 'troubleshoot' && (
              <div className="space-y-4">
                
                {/* 工单故障现象与快速研判卡片 */}
                <div className="bg-white rounded-lg border border-[#E8E8E8] p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#FA8C16]" />
                      <span className="font-bold text-xs text-[#1F1F1F]">故障现象研判与设备定位</span>
                    </div>
                    <span className="font-mono text-xs text-[#8C8C8C]">
                      设备位号: {ticket.deviceCode || 'ST-JS-SQ-03-Rack12'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 bg-[#FAFAFA] p-3 rounded-md border border-[#E8E8E8] space-y-1">
                      <span className="text-[11px] text-[#8C8C8C] block font-medium">BMS 遥测与异常描述:</span>
                      <p className="text-xs text-[#262626] leading-relaxed">
                        {ticket.description || '近 3 次充放电循环中，电芯温度明显高于同簇均值，接触内阻估算偏高，存在极柱氧化或螺栓松动隐患。'}
                      </p>
                    </div>
                    <div className="bg-orange-50/60 p-3 rounded-md border border-[#FFD591] space-y-1.5">
                      <span className="text-[11px] text-[#D46B08] font-semibold block">风险研判级别</span>
                      <div className="flex items-center gap-2">
                        <RiskScoreBadge score={ticket.riskScore} />
                        <span className="text-xs text-[#8C8C8C]">高风险优先消缺</span>
                      </div>
                      <span className="text-[10px] text-[#8C8C8C] block">
                        建议于 SLA 截止时间前完成现场紧固与复测
                      </span>
                    </div>
                  </div>
                </div>

                {/* 模块 1: 根据问题描述智能推荐的标准排查 SOP */}
                <div className="bg-white rounded-lg border border-[#91D5FF] p-4.5 space-y-3.5 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-28 h-28 bg-blue-50/80 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none" />

                  <div className="flex items-start justify-between gap-3 relative">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#1890FF] text-white flex items-center gap-1">
                          <CheckSquare className="w-3.5 h-3.5" />
                          推荐现场排查 SOP
                        </span>
                        <span className="text-xs font-semibold text-[#0050B3]">
                          {recommendedSop.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#595959] mt-1">
                        {recommendedSop.matchReason}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAdoptSopToNote}
                      className="px-3 py-1.5 bg-[#1890FF] hover:bg-[#40A9FF] text-white rounded text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>采纳此 SOP 并填入备注</span>
                    </button>
                  </div>

                  {/* 安全规程提示 */}
                  <div className="p-2.5 bg-[#FFFBE6] border border-[#FFE58F] rounded-md text-xs text-[#D46B08] flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#FA8C16] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">前置安全防护要点：</span>
                      <span className="leading-relaxed">{recommendedSop.safetyNotice}</span>
                    </div>
                  </div>

                  {/* 工器具要求 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold text-[#595959]">推荐核验工器具:</span>
                    {recommendedSop.toolsRequired.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 bg-[#F5F5F5] text-[#595959] rounded border border-[#E8E8E8] text-[11px]">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* 步骤化 SOP 流程 */}
                  <div className="space-y-2 pt-1">
                    <span className="font-bold text-xs text-[#1F1F1F] block">标准处置步骤拆解:</span>
                    <div className="space-y-2">
                      {recommendedSop.steps.map((st) => (
                        <div key={st.step} className="p-3 bg-[#FAFAFA] rounded-md border border-[#E8E8E8] flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-[#1890FF] text-white text-xs font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                            {st.step}
                          </span>
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <div className="font-semibold text-xs text-[#262626]">
                              {st.title}
                            </div>
                            <p className="text-[11px] text-[#595959] leading-relaxed">
                              {st.detail}
                            </p>
                            <div className="text-[11px] text-[#0050B3] bg-blue-50/60 px-2 py-0.5 rounded inline-block mt-1 font-medium">
                              🔍 关键核验判据: {st.keyCheck}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 验收合格判据 */}
                  <div className="p-2.5 bg-[#F6FFED] border border-[#B7EB8F] rounded-md text-xs text-[#389E0D] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#52C41A] shrink-0" />
                      <span><strong>消缺验收判据：</strong>{recommendedSop.acceptanceCriteria}</span>
                    </div>
                  </div>
                </div>

                {/* 模块 2: 历史相似故障案例推荐与借鉴 */}
                <div className="bg-white rounded-lg border border-[#E8E8E8] p-4.5 space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
                    <div className="flex items-center gap-2">
                      <FolderGit2 className="w-4 h-4 text-[#722ED1]" />
                      <span className="font-bold text-xs text-[#1F1F1F]">历史相似故障案例推荐与经验借鉴</span>
                    </div>
                    <span className="text-[11px] text-[#8C8C8C]">
                      已根据问题时序特征自动检索知识库匹配
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {recommendedCases.map((c) => (
                      <div 
                        key={c.id}
                        className="p-3.5 rounded-lg border border-[#E8E8E8] hover:border-[#D3ADF7] bg-[#FAFAFA] hover:bg-white transition-all space-y-2 relative"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F9F0FF] text-[#722ED1] border border-[#D3ADF7]">
                                相似度 {c.similarity}%
                              </span>
                              <span className="text-xs font-bold text-[#1F1F1F]">
                                {c.title}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#8C8C8C] flex items-center gap-2">
                              <span>电站: {c.stationName}</span>
                              <span>·</span>
                              <span>设备: {c.deviceType}</span>
                              <span>·</span>
                              <span>解决耗时: {c.resolutionTime}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setActiveCaseModal(c)}
                              className="px-2.5 py-1 bg-white border border-[#D9D9D9] hover:border-[#722ED1] text-[#595959] hover:text-[#722ED1] rounded text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              查看详情
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdoptCaseToNote(c)}
                              className="px-2.5 py-1 bg-[#F9F0FF] border border-[#D3ADF7] text-[#722ED1] hover:bg-[#722ED1] hover:text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              借鉴方案
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                          <div className="bg-white p-2 rounded border border-[#F0F0F0]">
                            <span className="text-[#8C8C8C] block mb-0.5">历史查明根因:</span>
                            <span className="text-[#262626]">{c.actualRootCause}</span>
                          </div>
                          <div className="bg-white p-2 rounded border border-[#F0F0F0]">
                            <span className="text-[#8C8C8C] block mb-0.5">现场消缺措施:</span>
                            <span className="text-[#0050B3]">{c.resolutionAction}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 模块 3: AI 深度机理诊断快速发起引导条 */}
                <div className="p-4 bg-gradient-to-r from-purple-50 via-white to-blue-50 rounded-lg border border-[#D3ADF7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-full bg-[#722ED1] text-white shrink-0 shadow-xs">
                      <BrainCircuit className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1F1F1F] flex items-center gap-1.5">
                        <span>需要进一步深度多物理场机理分析？</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-[#722ED1] font-semibold">
                          高频录波时序对齐
                        </span>
                      </h4>
                      <p className="text-[11px] text-[#595959] mt-0.5">
                        若现场基础排查无法定性，可启动 AI 故障机理诊断，计算微短路极化阻抗谱与焦耳热多维演化。
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMainTab('diagnosis');
                      setDiagSubTab('create');
                    }}
                    className="px-4 py-2 bg-[#722ED1] hover:bg-[#531DAB] text-white rounded text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>前往创建 AI 诊断任务</span>
                  </button>
                </div>

              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: AI 故障机理诊断 (生命周期：创建任务 ➔ 上传日志 ➔ 推演流水线 ➔ 诊断结论) */}
            {/* ============================================================== */}
            {mainTab === 'diagnosis' && (
              <div className="space-y-4">
                
                {/* 诊断子选项卡导航条 */}
                <div className="bg-white p-2 rounded-lg border border-[#E8E8E8] flex flex-wrap items-center justify-between gap-2 shadow-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    
                    {/* 子 TAB 1: 创建/配置诊断任务 */}
                    <button
                      type="button"
                      onClick={() => setDiagSubTab('create')}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                        diagSubTab === 'create'
                          ? 'bg-[#722ED1] text-white shadow-xs'
                          : 'bg-[#FAFAFA] text-[#595959] hover:bg-[#F0F0F0] border border-[#E8E8E8]'
                      }`}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>① 配置诊断任务</span>
                    </button>

                    {/* 子 TAB 2: 上传故障录波与日志 */}
                    <button
                      type="button"
                      onClick={() => setDiagSubTab('upload')}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                        diagSubTab === 'upload'
                          ? 'bg-[#722ED1] text-white shadow-xs'
                          : 'bg-[#FAFAFA] text-[#595959] hover:bg-[#F0F0F0] border border-[#E8E8E8]'
                      }`}
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>② 上传录波日志</span>
                      {uploadedLog.isUploaded && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </button>

                    {/* 子 TAB 3: 诊断推演流水线 */}
                    <button
                      type="button"
                      onClick={() => setDiagSubTab('pipeline')}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                        diagSubTab === 'pipeline'
                          ? 'bg-[#722ED1] text-white shadow-xs'
                          : 'bg-[#FAFAFA] text-[#595959] hover:bg-[#F0F0F0] border border-[#E8E8E8]'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>③ 推演计算进度</span>
                      {isSimulating && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      )}
                    </button>

                    {/* 子 TAB 4: 诊断结论与机理详情 (仅诊断完成后显示或激活) */}
                    <button
                      type="button"
                      onClick={() => setDiagSubTab('result')}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                        diagSubTab === 'result'
                          ? 'bg-[#722ED1] text-white shadow-xs'
                          : 'bg-[#FAFAFA] text-[#595959] hover:bg-[#F0F0F0] border border-[#E8E8E8]'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>④ 诊断结论与证据链</span>
                      {hasDiagnosed ? (
                        <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-500 text-white font-mono">
                          97.8%
                        </span>
                      ) : (
                        <span className="text-[10px] px-1 py-0.2 rounded bg-gray-200 text-gray-500 font-normal">
                          待推演
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isSimulating}
                      onClick={handleRunDiagnosisSimulation}
                      className="px-3.5 py-1.5 bg-[#722ED1] hover:bg-[#531DAB] text-white rounded text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Play className={`w-3.5 h-3.5 fill-current ${isSimulating ? 'animate-spin' : ''}`} />
                      <span>{isSimulating ? '推演计算中...' : hasDiagnosed ? '重新运行推演' : '启动 AI 诊断'}</span>
                    </button>
                  </div>
                </div>

                {/* ---------------------------------------------------------- */}
                {/* 子面板 1: 配置诊断任务 (STEP 1) */}
                {/* ---------------------------------------------------------- */}
                {diagSubTab === 'create' && (
                  <div className="bg-white rounded-lg border border-[#E8E8E8] p-4.5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-[#722ED1]" />
                        <span className="font-bold text-xs text-[#1F1F1F]">步骤 1：配置当前工单的 AI 诊断任务</span>
                      </div>
                      <span className="text-[11px] text-[#8C8C8C]">关联工单: {ticket.id}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                      <div className="sm:col-span-2">
                        <label className="text-[#595959] block mb-1 font-medium">诊断任务名称:</label>
                        <input
                          type="text"
                          value={diagTask.name}
                          onChange={(e) => setDiagTask({ ...diagTask, name: e.target.value })}
                          className="w-full p-2 border border-[#D9D9D9] rounded-md focus:border-[#722ED1] focus:outline-hidden text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[#595959] block mb-1 font-medium">储能电站站点:</label>
                        <input
                          type="text"
                          disabled
                          value={diagTask.station}
                          className="w-full p-2 bg-[#F5F5F5] border border-[#D9D9D9] rounded-md text-xs text-[#595959]"
                        />
                      </div>

                      <div>
                        <label className="text-[#595959] block mb-1 font-medium">排查设备/舱位:</label>
                        <input
                          type="text"
                          value={diagTask.device}
                          onChange={(e) => setDiagTask({ ...diagTask, device: e.target.value })}
                          className="w-full p-2 border border-[#D9D9D9] rounded-md focus:border-[#722ED1] focus:outline-hidden text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[#595959] block mb-1 font-medium">故障机理诊断场景:</label>
                        <select
                          value={diagTask.scenario}
                          onChange={(e) => setDiagTask({ ...diagTask, scenario: e.target.value })}
                          className="w-full p-2 border border-[#D9D9D9] rounded-md focus:border-[#722ED1] focus:outline-hidden bg-white text-xs"
                        >
                          <option value="极柱过热与接触内阻劣变分析">极柱过热与接触内阻劣变分析 (推荐)</option>
                          <option value="电芯微短路与绝缘劣变演化">电芯微短路与绝缘劣变演化</option>
                          <option value="储能变流器(PCS)开关动态与IGBT热阻畸变">储能变流器(PCS)开关动态与IGBT热阻畸变</option>
                          <option value="直流母线绝缘阻抗骤降与微漏电排查">直流母线绝缘阻抗骤降与微漏电排查</option>
                          <option value="SOC一致性离散与可用容量评估">SOC一致性离散与可用容量评估</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[#595959] block mb-1 font-medium">机理分析大模型引擎:</label>
                        <select
                          value={diagTask.model}
                          onChange={(e) => setDiagTask({ ...diagTask, model: e.target.value })}
                          className="w-full p-2 border border-[#D9D9D9] rounded-md focus:border-[#722ED1] focus:outline-hidden bg-white text-xs"
                        >
                          <option value="电化学机理与多物理场大模型混合分析引擎 V4.2">电化学机理与多物理场大模型混合引擎 V4.2</option>
                          <option value="伏安特性与自放电时序时相大模型 V3.8">伏安特性与自放电时序时相大模型 V3.8</option>
                          <option value="容量增量分析(ICA)与差分电压(DVA)模型 V4.0">容量增量分析(ICA)与差分电压(DVA)模型 V4.0</option>
                          <option value="电力电子高频开关动态仿真模型 V2.5">电力电子高频开关动态仿真模型 V2.5</option>
                        </select>
                      </div>
                    </div>

                    {/* 关联日志快捷提示 */}
                    <div className="p-3 bg-[#FAFAFA] rounded-md border border-[#E8E8E8] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-[#722ED1]" />
                        <div>
                          <span className="font-medium text-[#1F1F1F]">已绑定遥测日志: {uploadedLog.name}</span>
                          <span className="text-[11px] text-[#8C8C8C] block">大小: {uploadedLog.size} · 采样率: {uploadedLog.samplingRate}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDiagSubTab('upload')}
                        className="text-xs text-[#722ED1] hover:underline cursor-pointer"
                      >
                        更换日志 ➔
                      </button>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-[#F0F0F0]">
                      <button
                        type="button"
                        onClick={() => setDiagSubTab('upload')}
                        className="px-3.5 py-1.5 border border-[#D9D9D9] text-[#595959] hover:bg-[#FAFAFA] rounded text-xs cursor-pointer"
                      >
                        下一步：检查/上传日志
                      </button>
                      <button
                        type="button"
                        onClick={handleRunDiagnosisSimulation}
                        className="px-5 py-1.5 bg-[#722ED1] hover:bg-[#531DAB] text-white rounded text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>立即启动 AI 诊断流水线</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------------- */}
                {/* 子面板 2: 上传现场录波日志 (STEP 2) */}
                {/* ---------------------------------------------------------- */}
                {diagSubTab === 'upload' && (
                  <div className="bg-white rounded-lg border border-[#E8E8E8] p-4.5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
                      <div className="flex items-center gap-2">
                        <UploadCloud className="w-4 h-4 text-[#722ED1]" />
                        <span className="font-bold text-xs text-[#1F1F1F]">步骤 2：上传现场故障录波与 BMS 高频时序日志</span>
                      </div>
                      <span className="text-[11px] text-[#8C8C8C]">支持 .bms_log, .csv, .dat, .zip, .log</span>
                    </div>

                    {/* 拖拽上传区域 */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          const f = e.dataTransfer.files[0];
                          setIsUploading(true);
                          setTimeout(() => {
                            setUploadedLog({
                              name: f.name,
                              size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
                              frames: '约 92,000 帧时序数据',
                              samplingRate: '100 Hz',
                              timeRange: '2026-08-25 08:00:00 ~ 10:30:00',
                              isUploaded: true
                            });
                            setIsUploading(false);
                            setStatusMessage(`拖拽文件【${f.name}】已成功解析！`);
                          }, 500);
                        }
                      }}
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer relative ${
                        isDragOver 
                          ? 'border-[#722ED1] bg-purple-50/60 scale-[0.99]' 
                          : 'border-[#D9D9D9] hover:border-[#722ED1] bg-[#FAFAFA]'
                      }`}
                    >
                      <input
                        type="file"
                        accept=".bms_log,.csv,.dat,.zip,.log"
                        onChange={handleFileSelect}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-[#722ED1] flex items-center justify-center">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-semibold text-[#1F1F1F]">
                          点击或将现场录波/BMS时序文件拖拽至此处上传
                        </p>
                        <p className="text-[11px] text-[#8C8C8C]">
                          系统将自动执行微秒级对齐、时序降噪与电化学特征提取
                        </p>
                      </div>
                    </div>

                    {/* 快捷载入预设典型故障日志 */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-[#595959] block">
                        或快捷加载针对当前工单的典型现场录波样本:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {presetLogs.map((p, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setUploadedLog({
                                name: p.name,
                                size: p.size,
                                frames: p.frames,
                                samplingRate: p.samplingRate,
                                timeRange: p.timeRange,
                                isUploaded: true
                              });
                              setDiagTask(prev => ({
                                ...prev,
                                scenario: p.scenario
                              }));
                              setStatusMessage(`已加载典型故障日志: ${p.name}`);
                            }}
                            className={`p-2.5 rounded border text-left transition-all cursor-pointer ${
                              uploadedLog.name === p.name
                                ? 'bg-purple-50 border-[#722ED1] text-[#722ED1]'
                                : 'bg-[#FAFAFA] border-[#E8E8E8] hover:border-[#722ED1] text-[#262626]'
                            }`}
                          >
                            <div className="font-semibold text-xs truncate" title={p.name}>
                              {p.name.split('_')[1] || p.name}
                            </div>
                            <div className="text-[10px] text-[#8C8C8C] mt-1 flex items-center justify-between">
                              <span>{p.size}</span>
                              <span className="font-mono">{p.samplingRate}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 已上传日志详情卡片 */}
                    {uploadedLog.isUploaded && (
                      <div className="p-3 bg-[#F6FFED] border border-[#B7EB8F] rounded-md flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CheckCircle2 className="w-5 h-5 text-[#52C41A] shrink-0" />
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-[#262626] block truncate">
                              {uploadedLog.name}
                            </span>
                            <span className="text-[11px] text-[#595959]">
                              大小: {uploadedLog.size} · 包含 {uploadedLog.frames} · 采样率 {uploadedLog.samplingRate}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            handleRunDiagnosisSimulation();
                          }}
                          className="px-3 py-1.5 bg-[#52C41A] hover:bg-[#73D13D] text-white rounded text-xs font-semibold shrink-0 cursor-pointer transition-colors shadow-xs"
                        >
                          立即送入推演
                        </button>
                      </div>
                    )}

                  </div>
                )}

                {/* ---------------------------------------------------------- */}
                {/* 子面板 3: 诊断推演流水线与实时进度 (STEP 3) */}
                {/* ---------------------------------------------------------- */}
                {diagSubTab === 'pipeline' && (
                  <div className="bg-white rounded-lg border border-[#E8E8E8] p-4.5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#722ED1]" />
                        <span className="font-bold text-xs text-[#1F1F1F]">步骤 3：AI 故障机理多阶段诊断推演流水线</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono px-2 py-0.5 rounded font-semibold ${
                          diagTask.status === '已完成'
                            ? 'bg-[#F6FFED] text-[#52C41A] border border-[#B7EB8F]'
                            : isSimulating
                            ? 'bg-purple-50 text-[#722ED1] border border-[#D3ADF7] animate-pulse'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {diagTask.status === '已完成' ? '推演完毕 (100%)' : isSimulating ? `计算中 (${diagTask.progress}%)` : '待启动'}
                        </span>
                      </div>
                    </div>

                    {/* 进度条 */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#595959] font-medium">{diagTask.stageText}</span>
                        <span className="font-mono font-bold text-[#722ED1]">{diagTask.progress}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#722ED1] to-[#1890FF] transition-all duration-500 rounded-full"
                          style={{ width: `${diagTask.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* 4 步推演流水线步进图 */}
                    <div className="space-y-3 pt-2">
                      {[
                        {
                          step: 1,
                          title: '时序数据完整性与毫秒级时钟对齐',
                          desc: '执行 100Hz 毫秒级多通道时间戳对齐，滤除 BMS 通讯毛刺与偶发丢包。',
                          done: diagTask.progress >= 25,
                          active: diagTask.progress < 25 && isSimulating
                        },
                        {
                          step: 2,
                          title: '电化学物理场参数反演与阻抗谱提取',
                          desc: '根据放电倍率与温升微分方程求解极柱接触内阻 R_contact 与电芯欧姆内阻。',
                          done: diagTask.progress >= 50,
                          active: diagTask.progress >= 25 && diagTask.progress < 75 && isSimulating
                        },
                        {
                          step: 3,
                          title: '多物理场时序大模型与故障图谱关联',
                          desc: '匹配历史 10,000+ 典型热失控与接触劣变样本，判定焦耳热温升异常归因。',
                          done: diagTask.progress >= 85,
                          active: diagTask.progress >= 75 && diagTask.progress < 100 && isSimulating
                        },
                        {
                          step: 4,
                          title: '根因置信度推演与标准化消缺 SOP 生成',
                          desc: '计算综合置信度 97.8%，生成针对目标设备端子扭矩复紧与红外复测规程。',
                          done: diagTask.progress >= 100,
                          active: false
                        }
                      ].map((s) => (
                        <div 
                          key={s.step} 
                          className={`p-3 rounded-lg border flex items-start gap-3 transition-all ${
                            s.done 
                              ? 'bg-[#F6FFED]/40 border-[#B7EB8F]' 
                              : s.active 
                              ? 'bg-purple-50 border-[#D3ADF7] ring-1 ring-[#722ED1]' 
                              : 'bg-[#FAFAFA] border-[#E8E8E8] opacity-60'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                            s.done 
                              ? 'bg-[#52C41A] text-white' 
                              : s.active 
                              ? 'bg-[#722ED1] text-white animate-bounce' 
                              : 'bg-[#D9D9D9] text-[#595959]'
                          }`}>
                            {s.done ? <Check className="w-3.5 h-3.5" /> : s.step}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-[#1F1F1F]">{s.title}</span>
                              {s.done && <span className="text-[10px] text-[#52C41A] font-semibold">已完成</span>}
                              {s.active && <span className="text-[10px] text-[#722ED1] font-semibold animate-pulse">正在求解...</span>}
                            </div>
                            <p className="text-[11px] text-[#595959] mt-0.5 leading-relaxed">{s.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-[#F0F0F0]">
                      <button
                        type="button"
                        disabled={isSimulating}
                        onClick={handleRunDiagnosisSimulation}
                        className="px-3.5 py-1.5 bg-[#FAFAFA] hover:bg-[#F0F0F0] text-[#595959] border border-[#D9D9D9] rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                        <span>{isSimulating ? '推演计算中...' : '启动推演计算'}</span>
                      </button>

                      {hasDiagnosed && (
                        <button
                          type="button"
                          onClick={() => setDiagSubTab('result')}
                          className="px-4 py-1.5 bg-[#722ED1] hover:bg-[#531DAB] text-white rounded text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                        >
                          <span>查看完整诊断结论报告</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                  </div>
                )}

                {/* ---------------------------------------------------------- */}
                {/* 子面板 4: 诊断结论与机理详情 (STEP 4 - 仅诊断后展示真实结果) */}
                {/* ---------------------------------------------------------- */}
                {diagSubTab === 'result' && (
                  <div>
                    {!hasDiagnosed ? (
                      /* 未做过诊断时的空状态引导 (符合用户要求：默认不会有诊断结果) */
                      <div className="bg-white rounded-lg border border-[#E8E8E8] p-8 text-center space-y-4 shadow-xs">
                        <div className="w-16 h-16 rounded-full bg-purple-50 text-[#722ED1] flex items-center justify-center mx-auto border border-purple-100">
                          <BrainCircuit className="w-8 h-8" />
                        </div>
                        <div className="space-y-1 max-w-md mx-auto">
                          <h4 className="text-sm font-bold text-[#1F1F1F]">
                            当前工单尚未执行 AI 深度机理诊断
                          </h4>
                          <p className="text-xs text-[#8C8C8C] leading-relaxed">
                            默认仅展示问题排查 SOP 与相似案例；如需进一步溯源电化学阻抗与多物理场焦耳热微秒级机理，请启动诊断推演流水线。
                          </p>
                        </div>
                        <div className="pt-2 flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => setDiagSubTab('create')}
                            className="px-4 py-2 border border-[#D9D9D9] hover:bg-[#FAFAFA] text-[#595959] rounded text-xs font-medium cursor-pointer"
                          >
                            配置任务参数
                          </button>
                          <button
                            type="button"
                            disabled={isSimulating}
                            onClick={handleRunDiagnosisSimulation}
                            className="px-5 py-2 bg-[#722ED1] hover:bg-[#531DAB] text-white rounded text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            <span>立即启动 AI 诊断流水线</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* 诊断完成后的真实全量结论展示 */
                      <div className="space-y-4">
                        {/* 根因结论主卡片 */}
                        <div className="bg-white rounded-lg border border-[#D3ADF7] p-4.5 space-y-3.5 shadow-xs relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

                          <div className="flex items-start justify-between gap-3 relative">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#722ED1] text-white flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  AI 故障机理诊断结论
                                </span>
                                <span className="font-mono text-xs text-[#722ED1] bg-purple-50 px-2 py-0.5 rounded border border-[#D3ADF7] font-semibold">
                                  置信度 {diagTask.confidence}%
                                </span>
                                <span className="text-xs text-[#F5222D] bg-[#FFF1F0] px-2 py-0.5 rounded border border-[#FFA39E] font-semibold">
                                  风险评级: 高 (92分)
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-[#1F1F1F] mt-1 leading-snug">
                                {diagTask.rootCause}
                              </h4>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowFullReportModal(true)}
                              className="px-2.5 py-1 text-xs text-[#722ED1] bg-white border border-[#D3ADF7] hover:bg-purple-50 rounded font-medium transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>查看完整报告</span>
                            </button>
                          </div>

                          {/* 4 维机理物理量异动矩阵 */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                            <div className="bg-[#FFF1F0] p-2.5 rounded-md border border-[#FFA39E]">
                              <span className="text-[#8C8C8C] block text-[11px]">极端温升 ΔT</span>
                              <span className="text-base font-bold text-[#F5222D] font-mono block mt-0.5">
                                +9.4 ℃
                              </span>
                              <span className="text-[10px] text-[#CF1322]">阈值 4.0℃ (超标 135%)</span>
                            </div>

                            <div className="bg-[#FFF7E6] p-2.5 rounded-md border border-[#FFD591]">
                              <span className="text-[#8C8C8C] block text-[11px]">接触内阻 R_contact</span>
                              <span className="text-base font-bold text-[#D46B08] font-mono block mt-0.5">
                                +32.4 %
                              </span>
                              <span className="text-[10px] text-[#D46B08]">实测 0.68mΩ (劣变)</span>
                            </div>

                            <div className="bg-[#FFF7E6] p-2.5 rounded-md border border-[#FFD591]">
                              <span className="text-[#8C8C8C] block text-[11px]">单体放电压差 ΔV</span>
                              <span className="text-base font-bold text-[#D46B08] font-mono block mt-0.5">
                                48 mV
                              </span>
                              <span className="text-[10px] text-[#D46B08]">一级极化离散预警</span>
                            </div>

                            <div className="bg-[#F6FFED] p-2.5 rounded-md border border-[#B7EB8F]">
                              <span className="text-[#8C8C8C] block text-[11px]">绝缘阻抗 R_iso</span>
                              <span className="text-base font-bold text-[#52C41A] font-mono block mt-0.5">
                                12.4 MΩ
                              </span>
                              <span className="text-[10px] text-[#389E0D]">绝缘状态合格正常</span>
                            </div>
                          </div>

                          {/* 时序特征曲线预览 */}
                          <div className="bg-[#FAFAFA] p-3 rounded-md border border-[#E8E8E8] space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-[#262626] flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5 text-[#1890FF]" />
                                放电倍率与极柱温升/阻抗时序多维耦合曲线 (100Hz 遥测数据)
                              </span>
                              <span className="text-[11px] text-[#8C8C8C]">
                                已对齐 {uploadedLog.name}
                              </span>
                            </div>

                            {/* 简易高保真 SVG 时序走势图 */}
                            <div className="h-32 w-full bg-white rounded border border-[#E8E8E8] p-2 relative flex flex-col justify-end">
                              <svg className="w-full h-full" viewBox="0 0 400 90" preserveAspectRatio="none">
                                <line x1="0" y1="20" x2="400" y2="20" stroke="#F0F0F0" strokeDasharray="3 3" />
                                <line x1="0" y1="45" x2="400" y2="45" stroke="#F0F0F0" strokeDasharray="3 3" />
                                <line x1="0" y1="70" x2="400" y2="70" stroke="#F0F0F0" strokeDasharray="3 3" />
                                
                                <path
                                  d="M0,75 Q100,72 200,68 T400,65"
                                  fill="none"
                                  stroke="#52C41A"
                                  strokeWidth="2"
                                  strokeDasharray="4 2"
                                />
                                <path
                                  d="M0,75 Q80,70 150,55 T280,25 T400,12"
                                  fill="none"
                                  stroke="#F5222D"
                                  strokeWidth="2.5"
                                />
                                <polygon
                                  points="150,55 280,25 400,12 400,65 280,68 150,68"
                                  fill="rgba(245, 34, 45, 0.12)"
                                />
                              </svg>

                              <div className="flex items-center justify-between text-[10px] text-[#8C8C8C] pt-1 px-1 border-t border-[#F0F0F0]">
                                <div className="flex items-center gap-3">
                                  <span className="flex items-center gap-1 text-[#F5222D] font-medium">
                                    <span className="w-2.5 h-1 bg-[#F5222D] rounded" /> 目标模组 极柱温升 (异常)
                                  </span>
                                  <span className="flex items-center gap-1 text-[#52C41A]">
                                    <span className="w-2.5 h-1 bg-[#52C41A] rounded" /> 同簇平均基线 (正常)
                                  </span>
                                </div>
                                <span>08:00 放电开始 (0.5C) ➔ 10:30 触发温升劣变峰值</span>
                              </div>
                            </div>
                          </div>

                          {/* AI 专家标准化排故消缺 SOP */}
                          <div className="bg-[#F0F5FF] p-3.5 rounded-md border border-[#ADC6FF] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-xs text-[#0050B3] flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-[#1890FF]" />
                                AI 机理诊断专家消缺 SOP 策略
                              </span>
                              <button
                                type="button"
                                onClick={handleAdoptAiDiagToNote}
                                className="px-2.5 py-1 bg-[#1890FF] hover:bg-[#40A9FF] text-white rounded text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                              >
                                <Send className="w-3 h-3" />
                                <span>采纳结论并填入消缺备注</span>
                              </button>
                            </div>

                            <div className="space-y-1.5 text-xs text-[#262626]">
                              <div className="flex items-start gap-2 bg-white/80 p-2 rounded border border-[#D6E4FF]">
                                <span className="w-4 h-4 rounded-full bg-[#1890FF] text-white font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                                <span className="leading-relaxed">
                                  现场断开目标电池舱该簇直流隔离开关，执行验电，做好高压放电闭锁与绝缘防护；
                                </span>
                              </div>
                              <div className="flex items-start gap-2 bg-white/80 p-2 rounded border border-[#D6E4FF]">
                                <span className="w-4 h-4 rounded-full bg-[#1890FF] text-white font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                                <span className="leading-relaxed">
                                  使用数显扭矩扳手重新校准电池模块端子紧固螺栓力矩至 <strong>10.0±0.5 N·m</strong>，清洁端子氧化层；
                                </span>
                              </div>
                              <div className="flex items-start gap-2 bg-white/80 p-2 rounded border border-[#D6E4FF]">
                                <span className="w-4 h-4 rounded-full bg-[#1890FF] text-white font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                                <span className="leading-relaxed">
                                  在 0.5C 充放电工况下使用红外热像仪进行 30 分钟连续点温监测，确认极柱温差 ΔT 回落至 &lt; 2.0℃；
                                </span>
                              </div>
                              <div className="flex items-start gap-2 bg-white/80 p-2 rounded border border-[#D6E4FF]">
                                <span className="w-4 h-4 rounded-full bg-[#1890FF] text-white font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                                <span className="leading-relaxed">
                                  通过平台下发 BMS 在线主动均衡指令，校准电芯单体压差至 15mV 以内，完成闭环复核。
                                </span>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 3: 现场消缺流转与流程处置 (PROCESS TAB) */}
            {/* ============================================================== */}
            {mainTab === 'process' && (
              <div className="space-y-4">
                
                {/* 异常现象与快速指引 */}
                <div className="bg-white rounded-lg border border-[#E8E8E8] p-4 space-y-3 shadow-xs">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-[#F0F0F0]">
                    <FileText className="w-4 h-4 text-[#1890FF]" />
                    <span className="font-semibold text-xs text-[#1F1F1F]">工单异常描述与消缺指引</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-[#8C8C8C] block text-[11px] mb-0.5">异常现象与时序特征</span>
                      <p className="text-[#262626] bg-[#F5F5F5] p-2.5 rounded border border-[#E8E8E8] leading-relaxed text-xs">
                        {ticket.description || diagTask.symptomDesc}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#8C8C8C] block text-[11px] mb-0.5">专家系统建议排查要点</span>
                      <p className="text-[#0050B3] bg-[#E6F7FF] p-2.5 rounded border border-[#91D5FF] leading-relaxed text-xs">
                        {ticket.suggestedAction || '1. 现场断开直流开关并进行绝缘耐压复测；2. 针对预警模块单体端子进行力矩校验(10N·m)与红外点温复核；3. 更换采集线束并重新校准均衡状态。'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 责任人处置操作与输入区 */}
                <div className="bg-white rounded-lg border border-[#E8E8E8] p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
                    <div className="flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-[#52C41A]" />
                      <span className="font-semibold text-xs text-[#1F1F1F]">现场处置记录与流程推进</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAdoptSopToNote}
                        className="text-xs text-[#1890FF] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>填入推荐 SOP</span>
                      </button>
                      {hasDiagnosed && (
                        <button
                          type="button"
                          onClick={handleAdoptAiDiagToNote}
                          className="text-xs text-[#722ED1] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>填入 AI 诊断结论</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-[#595959] block mb-1 font-medium">
                      现场处置记录 / 消缺核验说明:
                    </label>
                    <textarea
                      value={handleNote}
                      onChange={(e) => setHandleNote(e.target.value)}
                      placeholder="请输入现场消缺措施、更换备件编号、紧固扭矩实测值或排故核验说明..."
                      className="w-full h-28 p-2.5 text-xs border border-[#D9D9D9] rounded-md focus:border-[#1890FF] focus:outline-hidden focus:ring-1 focus:ring-[#1890FF] resize-none font-sans"
                    />
                  </div>

                  {/* 动作按钮网格 */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {ticket.status === '待受理' && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleAction('处理中', '接单受理')}
                        className="flex-1 py-2 px-3 bg-[#1890FF] hover:bg-[#40A9FF] text-white rounded font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>接单受理 (进入处理中)</span>
                      </button>
                    )}

                    {ticket.status === '处理中' && (
                      <>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleAction('处理中', '追加现场排查记录')}
                          className="py-2 px-3.5 bg-[#FAFAFA] border border-[#D9D9D9] hover:border-[#1890FF] text-[#262626] rounded font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#1890FF]" />
                          <span>追加排故记录</span>
                        </button>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleAction('已完成', '完成现场消缺并提交闭环')}
                          className="flex-1 py-2 px-3.5 bg-[#52C41A] hover:bg-[#73D13D] text-white rounded font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>完成消缺 (提交闭环归档)</span>
                        </button>
                      </>
                    )}

                    {ticket.status === '已完成' && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleAction('已完成', '复核遥测指标正常')}
                        className="flex-1 py-2 px-3 bg-[#52C41A] text-white rounded font-medium text-xs flex items-center justify-center gap-1.5 opacity-90 cursor-default"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>该工单已完成消缺闭环并复核归档</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 流转日志历史 */}
                <div className="bg-white rounded-lg border border-[#E8E8E8] p-4 space-y-3 shadow-xs">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-[#F0F0F0]">
                    <History className="w-4 h-4 text-[#8C8C8C]" />
                    <span className="font-semibold text-xs text-[#1F1F1F]">工单生命周期流转记录</span>
                  </div>
                  <div className="space-y-3 relative pl-4 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8E8E8]">
                    {ticket.logs && ticket.logs.length > 0 ? (
                      ticket.logs.map((log, index) => (
                        <div key={index} className="relative space-y-0.5">
                          <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-[#1890FF] ring-2 ring-white" />
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-medium text-[#262626]">{log.action}</span>
                            <span className="text-[#8C8C8C]">{log.time}</span>
                          </div>
                          <div className="text-[11px] text-[#595959] flex items-center gap-2">
                            <span>操作人: {log.operator}</span>
                            {log.note && <span className="text-[#8C8C8C]">（{log.note}）</span>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-[11px] text-[#8C8C8C]">
                        <span>创建于: {ticket.createdAt} 由主动运维算法系统下发</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 4: 工单与设备资产台账 (INFO TAB) */}
            {/* ============================================================== */}
            {mainTab === 'info' && (
              <div className="space-y-4">
                {/* 顶栏 SLA 预警与责任人信息 */}
                <div className="bg-white p-4 rounded-lg border border-[#E8E8E8] grid grid-cols-2 sm:grid-cols-4 gap-3.5 shadow-xs">
                  <div>
                    <span className="text-[#8C8C8C] block text-[11px]">电站站点</span>
                    <span className="font-semibold text-[#1F1F1F] truncate block mt-0.5">{ticket.stationName}</span>
                  </div>
                  <div>
                    <span className="text-[#8C8C8C] block text-[11px]">当前责任人</span>
                    <span className="font-semibold text-[#1890FF] block mt-0.5">{ticket.assignee}</span>
                  </div>
                  <div>
                    <span className="text-[#8C8C8C] block text-[11px]">SLA 剩余时效</span>
                    <div className="mt-0.5">
                      <SlaBadge remainingHours={ticket.slaRemainingHours} deadline={ticket.slaDeadline} />
                    </div>
                  </div>
                  <div>
                    <span className="text-[#8C8C8C] block text-[11px]">风险综合评分</span>
                    <div className="mt-0.5">
                      <RiskScoreBadge score={ticket.riskScore} />
                    </div>
                  </div>
                </div>

                {/* 设备与区域信息 */}
                <div className="bg-white p-4 rounded-lg border border-[#E8E8E8] space-y-3 shadow-xs">
                  <div className="font-semibold text-xs text-[#1F1F1F] pb-2 border-b border-[#F0F0F0]">
                    目标设备与资产台账
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[#8C8C8C] block text-[11px]">设备位号</span>
                      <span className="font-mono text-[#262626] font-medium">{ticket.deviceCode || 'ST-NT-001-Rack-04'}</span>
                    </div>
                    <div>
                      <span className="text-[#8C8C8C] block text-[11px]">所属区域</span>
                      <span className="text-[#262626] font-medium">{ticket.region}</span>
                    </div>
                    <div>
                      <span className="text-[#8C8C8C] block text-[11px]">下发创建时间</span>
                      <span className="text-[#262626] font-mono">{ticket.createdAt}</span>
                    </div>
                  </div>
                </div>

                {/* 关联主动预警模型穿透 */}
                {ticket.linkedRiskId && (
                  <div className="p-3.5 bg-[#FFF7E6] border border-[#FFD591] rounded-lg flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert className="w-5 h-5 text-[#FA8C16] shrink-0" />
                      <div>
                        <span className="font-semibold text-xs text-[#D46B08]">本工单由主动预警算法模型驱动生成</span>
                        <span className="text-[11px] text-[#8C8C8C] block">关联风险编号: {ticket.linkedRiskId}</span>
                      </div>
                    </div>
                    {onJumpToRisk && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onJumpToRisk(ticket.linkedRiskId!);
                        }}
                        className="px-3 py-1.5 bg-white border border-[#FA8C16] text-[#D46B08] hover:bg-[#FA8C16] hover:text-white rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <span>查看预测特征证据</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* 抽屉底部固定操作栏 */}
          <div className="px-5 py-3 border-t border-[#E8E8E8] bg-[#FAFAFA] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs text-[#8C8C8C]">
              <Sparkles className="w-3.5 h-3.5 text-[#1890FF]" />
              <span>pcare 智能工单协同 · 排查 SOP 与 AI 故障机理诊断</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 border border-[#D9D9D9] hover:bg-white text-[#595959] rounded text-xs font-medium cursor-pointer transition-colors"
              >
                收起抽屉
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 历史相似案例详情模态框 */}
      {activeCaseModal && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#D9D9D9] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-[#E8E8E8] bg-[#FAFAFA] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-[#722ED1]" />
                <h3 className="font-bold text-sm text-[#1F1F1F]">
                  历史相似故障案例档案详情
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveCaseModal(null)}
                className="p-1 text-[#8C8C8C] hover:text-[#262626] rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3.5 text-xs">
              <div className="flex items-center justify-between bg-purple-50/60 p-3 rounded border border-[#D3ADF7]">
                <div>
                  <h4 className="font-bold text-sm text-[#1F1F1F]">{activeCaseModal.title}</h4>
                  <span className="text-[11px] text-[#8C8C8C] mt-0.5 block">
                    站点: {activeCaseModal.stationName} · 设备位号: {activeCaseModal.deviceType}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#722ED1] text-white font-mono font-bold text-xs">
                  匹配度 {activeCaseModal.similarity}%
                </span>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-xs text-[#1F1F1F] block">历史故障现象与告警：</span>
                <p className="p-2.5 bg-[#FAFAFA] rounded border border-[#E8E8E8] text-[#595959] leading-relaxed">
                  {activeCaseModal.reportedSymptom}
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-xs text-[#1F1F1F] block">查明真实根因：</span>
                <p className="p-2.5 bg-[#FFF1F0] rounded border border-[#FFA39E] text-[#CF1322] leading-relaxed font-medium">
                  {activeCaseModal.actualRootCause}
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-xs text-[#1F1F1F] block">现场执行消缺措施与效果：</span>
                <p className="p-2.5 bg-[#F6FFED] rounded border border-[#B7EB8F] text-[#389E0D] leading-relaxed">
                  {activeCaseModal.resolutionAction}
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-xs text-[#1F1F1F] block">长效预防建议：</span>
                <p className="p-2.5 bg-[#FFFBE6] rounded border border-[#FFE58F] text-[#D46B08] leading-relaxed">
                  {activeCaseModal.preventionTip}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#8C8C8C] pt-2 border-t border-[#F0F0F0]">
                <span>处置责任人: {activeCaseModal.resolvedBy}</span>
                <span>闭环耗时: {activeCaseModal.resolutionTime}</span>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#E8E8E8] bg-[#FAFAFA] flex items-center justify-between shrink-0">
              <span className="text-[11px] text-[#8C8C8C]">
                案例来源: 主动运维专家经验知识库
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAdoptCaseToNote(activeCaseModal)}
                  className="px-3.5 py-1.5 bg-[#722ED1] text-white rounded text-xs font-bold hover:bg-[#531DAB] cursor-pointer"
                >
                  借鉴此方案并填入工单
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCaseModal(null)}
                  className="px-3 py-1.5 border border-[#D9D9D9] rounded text-xs text-[#595959] hover:bg-white cursor-pointer"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 完整诊断报告模态框 */}
      {showFullReportModal && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#D9D9D9] w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-[#E8E8E8] bg-[#FAFAFA] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#722ED1]" />
                <h3 className="font-bold text-sm text-[#1F1F1F]">
                  储能电芯接触内阻与多物理场 AI 深度诊断报告
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFullReportModal(false)}
                className="p-1 text-[#8C8C8C] hover:text-[#262626] rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="bg-[#F9F0FF] p-3.5 rounded border border-[#D3ADF7] space-y-1">
                <span className="font-bold text-[#722ED1] text-xs">【机理诊断结论】</span>
                <p className="text-[#262626] leading-relaxed">
                  {diagTask.rootCause}
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-xs text-[#1F1F1F] block">任务与日志元数据:</span>
                <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAFAFA] p-3 rounded border border-[#E8E8E8]">
                  <div><span className="text-[#8C8C8C]">任务ID:</span> {diagTask.id}</div>
                  <div><span className="text-[#8C8C8C]">所属电站:</span> {diagTask.station}</div>
                  <div><span className="text-[#8C8C8C]">排查对象:</span> {diagTask.device}</div>
                  <div><span className="text-[#8C8C8C]">模型引擎:</span> {diagTask.model}</div>
                  <div><span className="text-[#8C8C8C]">置信度:</span> {diagTask.confidence}%</div>
                  <div><span className="text-[#8C8C8C]">耗时:</span> {diagTask.duration}</div>
                  <div className="col-span-2"><span className="text-[#8C8C8C]">关联日志:</span> {uploadedLog.name} ({uploadedLog.size})</div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-xs text-[#1F1F1F] block">现场消缺处理 SOP 建议:</span>
                <div className="p-3 bg-[#E6F7FF] rounded border border-[#91D5FF] text-[#0050B3] space-y-1 leading-relaxed">
                  <p>1. 现场断开该簇直流隔离开关，执行验电与安全放电；</p>
                  <p>2. 使用数显扭矩扳手重新校准端子紧固力矩至 10.0±0.5 N·m；</p>
                  <p>3. 启动红外热像仪在 0.5C 充放电工况下复测极柱温升；</p>
                  <p>4. 复测采样线束绝缘阻抗并下发 BMS 主动均衡标定指令。</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#E8E8E8] bg-[#FAFAFA] flex items-center justify-between shrink-0">
              <span className="text-[11px] text-[#8C8C8C]">
                自动生成于 2026-08-25 · 主动运维 AI 机理分析中心
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAdoptAiDiagToNote}
                  className="px-3 py-1.5 bg-[#722ED1] text-white rounded text-xs font-bold hover:bg-[#531DAB] cursor-pointer"
                >
                  采纳 SOP 并填入工单
                </button>
                <button
                  type="button"
                  onClick={() => setShowFullReportModal(false)}
                  className="px-3 py-1.5 border border-[#D9D9D9] rounded text-xs text-[#595959] hover:bg-white cursor-pointer"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
