import React, { useState, useEffect } from 'react';
import { TicketItem, CONFIG_THRESHOLDS } from '../../types';
import { PriorityBadge, RiskScoreBadge, SlaBadge, TicketStatusBadge } from '../common/Badges';
import { 
  ArrowLeft, 
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
  BookOpen,
  BrainCircuit,
  UploadCloud,
  FileCode,
  Activity,
  Check,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Copy,
  Info,
  CheckSquare,
  Download,
  X
} from 'lucide-react';

interface TicketProcessViewProps {
  ticket: TicketItem;
  onBack: () => void;
  onUpdateStatus?: (ticketId: string, newStatus: TicketItem['status'], note: string) => void;
  onJumpToRisk?: (riskId: string) => void;
  backButtonLabel?: string;
}

// 智能 SOP 结构定义
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

export const TicketProcessView: React.FC<TicketProcessViewProps> = ({
  ticket,
  onBack,
  onUpdateStatus,
  onJumpToRisk,
  backButtonLabel = '返回工作台'
}) => {
  // 选项卡：'troubleshoot' (排查SOP与案例推荐), 'diagnosis' (AI 故障机理诊断), 'process' (现场消缺流转), 'info' (工单与资产台账)
  const [activeTab, setActiveTab] = useState<'troubleshoot' | 'diagnosis' | 'process' | 'info'>('troubleshoot');

  // AI 诊断状态：默认无诊断结果 (需执行推演)
  const [hasDiagnosed, setHasDiagnosed] = useState<boolean>(false);
  const [diagSubTab, setDiagSubTab] = useState<'create' | 'upload' | 'pipeline' | 'result'>('create');
  const [isSimulating, setIsSimulating] = useState(false);
  const [showFullReportModal, setShowFullReportModal] = useState(false);

  // 历史案例详情弹窗
  const [selectedCaseModal, setSelectedCaseModal] = useState<SimilarHistoricalCase | null>(null);

  // 工单处置状态
  const [handleNote, setHandleNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // 日志上传与拖拽状态
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 诊断任务与日志
  const [diagTask, setDiagTask] = useState({
    id: `DIAG-20260825-${ticket.id.slice(-4)}`,
    name: `【${ticket.id}】${ticket.stationName} 深度故障机理诊断`,
    station: ticket.stationName,
    device: ticket.deviceCode || `${ticket.stationName.slice(0, 4)}-Rack-03`,
    scenario: ticket.title.includes('PCS') || ticket.title.includes('IGBT')
      ? '储能变流器(PCS)开关动态与IGBT热阻畸变'
      : ticket.title.includes('绝缘')
      ? '直流母线绝缘阻抗骤降与微漏电排查'
      : '极柱过热与接触内阻劣变分析',
    model: '电化学机理与多物理场大模型混合分析引擎 V4.2',
    samplingRate: '100 Hz',
    status: '就绪' as '就绪' | '分析中' | '已完成' | '已失败',
    progress: 0,
    stageIndex: 0,
    stageText: '任务已配置，待载入录波日志启动推演',
    confidence: 97.8,
    riskScore: ticket.riskScore || 90,
    duration: '1.4 秒',
    rootCause: `${ticket.deviceCode || '预警目标设备'}端子螺栓紧固力矩衰减至 4.2N·m（标准 10N·m），大电流充放电时接触内阻突增 +32.4%，引发局部焦耳热温升超标（ΔT=9.4℃）`,
    symptomDesc: ticket.description || '充放电期间电芯温度持续超温，内阻离散度升高。'
  });

  const [uploadedLog, setUploadedLog] = useState<{
    name: string;
    size: string;
    frames: string;
    samplingRate: string;
    timeRange: string;
    isUploaded: boolean;
  }>({
    name: `${ticket.stationName.slice(0, 4)}_${ticket.deviceCode || '01舱'}_故障录波.bms_log`,
    size: '14.8 MB',
    frames: '128,000 帧高频时序数据',
    samplingRate: '100 Hz (微秒级对齐)',
    timeRange: '2026-08-25 08:00:00 ~ 10:30:00',
    isUploaded: true
  });

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

  // SOP 与案例获取
  const { sop: recommendedSop, cases: recommendedCases } = getRecommendedSopAndCases(ticket);

  // 初始化重置
  useEffect(() => {
    setHasDiagnosed(false);
    setActiveTab('troubleshoot');
    setDiagSubTab('create');
    setDiagTask({
      id: `DIAG-20260825-${ticket.id.slice(-4)}`,
      name: `【${ticket.id}】${ticket.stationName} 深度故障机理诊断`,
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
  }, [ticket.id]);

  // 运行 AI 机理推演流水线
  const handleRunDiagnosisSimulation = () => {
    setIsSimulating(true);
    setActiveTab('diagnosis');
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
      setDiagSubTab('result');
      setStatusMessage('AI 深度机理诊断推演完成！已生成故障根因及机理证据链。');
    }, 2400);
  };

  // 处理日志上传
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

  // 采纳 SOP 至工单
  const handleAdoptSopToNote = () => {
    const text = `【采纳推荐排查 SOP：${recommendedSop.category}】\n一、安全防护要求：${recommendedSop.safetyNotice}\n二、现场排查执行步骤：\n${recommendedSop.steps.map(s => `${s.step}. ${s.title}：${s.detail}（核验判据：${s.keyCheck}）`).join('\n')}\n三、消缺验收合格判据：${recommendedSop.acceptanceCriteria}`;
    setHandleNote(text);
    setActiveTab('process');
    setStatusMessage('已将标准排查 SOP 自动填充至现场处置记录中！');
  };

  // 引用案例至工单
  const handleAdoptCaseToNote = (c: SimilarHistoricalCase) => {
    const text = `【借鉴历史相似案例消缺方案（匹配度 ${c.similarity}%）】\n参考案例：${c.title}（${c.stationName}）\n历史根因：${c.actualRootCause}\n消缺措施：${c.resolutionAction}\n长效预防：${c.preventionTip}`;
    setHandleNote(text);
    setActiveTab('process');
    setSelectedCaseModal(null);
    setStatusMessage(`已成功引用【${c.title.slice(0, 16)}...】消缺经验至现场记录！`);
  };

  // 采纳 AI 诊断至工单
  const handleAdoptAiDiagToNote = () => {
    const text = `【采纳 AI 故障机理诊断结论 (置信度 97.8%)】\n根因定位：${diagTask.rootCause}\n消缺处置策略：\n1. 现场断开直流隔离开关，执行验电与安全放电；\n2. 使用数显扭矩扳手重新校准端子紧固力矩至 10.0 N·m；\n3. 启动红外热像仪在 0.5C 充放电工况下复测极柱温升（目标 ΔT < 2.5℃）；\n4. 下发 BMS 在线主动均衡标定指令。`;
    setHandleNote(text);
    setActiveTab('process');
    setShowFullReportModal(false);
    setStatusMessage('已将 AI 深度机理诊断结论及消缺指令填入现场处置记录！');
  };

  // 执行工单流转
  const handleAction = (status: TicketItem['status'], actionText: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      onUpdateStatus?.(ticket.id, status, handleNote || actionText);
      setIsProcessing(false);
      setStatusMessage(`已成功执行操作: 【${actionText}】，工单状态更新为「${status}」`);
      setHandleNote('');
    }, 400);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* 顶部返回与状态提示栏 */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-[#D9D9D9] text-[#595959] hover:text-[#1890FF] hover:border-[#1890FF] text-xs font-medium cursor-pointer transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#8C8C8C]" />
          <span>{backButtonLabel}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-[#FFFBE6] border border-[#FFE58F] text-[#D48806] text-xs font-medium flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-[#FAAD14]" />
            单工单深度分析 · 融合标准排查 SOP、相似案例与 AI 故障诊断
          </span>
        </div>
      </div>

      {/* 成功状态通知 */}
      {statusMessage && (
        <div className="p-3 bg-[#F6FFED] border border-[#B7EB8F] rounded text-xs text-[#52C41A] flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#52C41A] shrink-0" />
            <span className="font-medium">{statusMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-[#52C41A] hover:underline text-xs cursor-pointer"
          >
            知道了
          </button>
        </div>
      )}

      {/* 工单主卡片 */}
      <div className="bg-white rounded-lg border border-[#E8E8E8] overflow-hidden shadow-xs">
        {/* Header */}
        <div className="p-4 bg-[#FAFAFA] border-b border-[#E8E8E8] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-[#1F1F1F] text-sm bg-white px-2 py-0.5 rounded border border-[#D9D9D9]">
                {ticket.id}
              </span>
              <TicketStatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              <RiskScoreBadge score={ticket.riskScore} />
              {ticket.linkedRiskId && (
                <span className="text-xs text-[#722ED1] bg-[#F9F0FF] px-2 py-0.5 rounded border border-[#D3ADF7] font-mono flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#722ED1]" />
                  关联主动预警 {ticket.linkedRiskId}
                </span>
              )}
              <span className="text-xs text-[#8C8C8C] flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#595959]" />
                {ticket.stationName}
              </span>
            </div>
            <h1 className="text-base font-semibold text-[#1F1F1F] leading-tight pt-0.5">
              {ticket.title}
            </h1>
          </div>

          <div className="flex items-center gap-3 bg-white p-2.5 rounded border border-[#E8E8E8] shrink-0">
            <Clock className="w-4 h-4 text-[#8C8C8C]" />
            <div className="text-right">
              <div className="text-[11px] text-[#8C8C8C]">SLA 倒计时</div>
              <SlaBadge remainingHours={ticket.slaRemainingHours} deadline={ticket.slaDeadline} />
            </div>
          </div>
        </div>

        {/* 顶部主选项卡切换栏 (工作流自然顺序: 排查SOP与相似案例 -> AI故障机理诊断 -> 现场消缺流转 -> 工单基础台账) */}
        <div className="px-5 border-b border-[#E8E8E8] bg-white flex items-center gap-2 overflow-x-auto">
          {/* TAB 1: 标准排查方案 SOP 与相似案例 */}
          <button
            type="button"
            onClick={() => setActiveTab('troubleshoot')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'troubleshoot'
                ? 'border-[#1890FF] text-[#1890FF] bg-blue-50/30'
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
              setActiveTab('diagnosis');
              if (!hasDiagnosed) {
                setDiagSubTab('create');
              } else {
                setDiagSubTab('result');
              }
            }}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'diagnosis'
                ? 'border-[#722ED1] text-[#722ED1] bg-purple-50/30'
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
            onClick={() => setActiveTab('process')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'process'
                ? 'border-[#1890FF] text-[#1890FF] bg-blue-50/30'
                : 'border-transparent text-[#595959] hover:text-[#262626]'
            }`}
          >
            <Wrench className="w-4 h-4 text-[#1890FF]" />
            <span>现场消缺流转</span>
            {ticket.status !== '已完成' && (
              <span className="w-2 h-2 rounded-full bg-[#FA8C16]" />
            )}
          </button>

          {/* TAB 4: 工单与资产台账 */}
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-[#1890FF] text-[#1890FF] bg-blue-50/30'
                : 'border-transparent text-[#595959] hover:text-[#262626]'
            }`}
          >
            <Info className="w-4 h-4 text-[#595959]" />
            <span>工单与资产台账</span>
          </button>
        </div>

        {/* 内容主体区域 */}
        <div className="p-5 text-xs bg-[#F8F9FA]">
          {/* ============================================================== */}
          {/* TAB 1: 排查 SOP 与历史相似案例推荐 */}
          {/* ============================================================== */}
          {activeTab === 'troubleshoot' && (
            <div className="space-y-4">
              {/* 故障现象研判 */}
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
                    <span className="text-[11px] text-[#8C8C8C] block font-medium">工单现象描述:</span>
                    <p className="text-xs text-[#262626] leading-relaxed">
                      {ticket.description}
                    </p>
                  </div>
                  <div className="bg-[#E6F7FF]/50 p-3 rounded-md border border-[#91D5FF] space-y-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] text-[#0050B3] block font-medium">专家处置建议:</span>
                      <p className="text-xs text-[#096DD9] leading-relaxed">
                        {ticket.suggestedAction}
                      </p>
                    </div>
                    <div className="pt-2 flex items-center justify-between text-[11px] text-[#1890FF]">
                      <span>所属区域: {ticket.region}</span>
                      <span>责任人: {ticket.assignee}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 推荐排查 SOP */}
              <div className="bg-white rounded-lg border border-[#E8E8E8] p-4.5 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#F0F0F0]">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#1890FF]" />
                      <span className="font-bold text-xs text-[#1F1F1F]">{recommendedSop.category}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-[#1890FF] text-[10px] font-semibold">
                        SOP 匹配度 98%
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8C8C8C]">
                      {recommendedSop.matchReason}
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleAdoptSopToNote}
                    className="px-3.5 py-1.5 bg-[#1890FF] hover:bg-[#40A9FF] text-white rounded text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>采纳此 SOP 并填入现场记录</span>
                  </button>
                </div>

                {/* 安全防护要求与所需工器具 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-[#FFF2F0] border border-[#FFCCC7] rounded-md space-y-1">
                    <span className="font-bold text-[#CF1322] flex items-center gap-1.5 text-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#CF1322]" />
                      安全作业红线与防护规范:
                    </span>
                    <p className="text-[11px] text-[#595959] leading-relaxed">
                      {recommendedSop.safetyNotice}
                    </p>
                  </div>

                  <div className="p-3 bg-[#FAFAFA] border border-[#E8E8E8] rounded-md space-y-1.5">
                    <span className="font-bold text-[#262626] flex items-center gap-1.5 text-xs">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#1890FF]" />
                      现场所需专用工器具与耗材:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {recommendedSop.toolsRequired.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-white border border-[#D9D9D9] rounded text-[11px] text-[#595959]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4 步标准化排查规程 */}
                <div className="space-y-2.5 pt-1">
                  <span className="font-bold text-xs text-[#1F1F1F] block">标准化排查与消缺四步法:</span>
                  <div className="space-y-2">
                    {recommendedSop.steps.map((s) => (
                      <div key={s.step} className="p-3 bg-[#FAFAFA] rounded-md border border-[#E8E8E8] flex items-start gap-3 hover:border-[#1890FF]/40 transition-colors">
                        <div className="w-5 h-5 rounded-full bg-[#1890FF] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {s.step}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#262626]">{s.title}</span>
                            <span className="text-[10px] text-[#1890FF] bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                              核验判据: {s.keyCheck}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#595959] leading-relaxed">
                            {s.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 验收合格判据 */}
                <div className="p-3 bg-[#F6FFED] border border-[#B7EB8F] rounded-md flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#52C41A] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#389E0D] text-xs">消缺验收合格判据:</span>
                    <p className="text-[11px] text-[#52C41A] mt-0.5">
                      {recommendedSop.acceptanceCriteria}
                    </p>
                  </div>
                </div>
              </div>

              {/* 历史相似案例库推荐 */}
              <div className="bg-white rounded-lg border border-[#E8E8E8] p-4.5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#722ED1]" />
                    <span className="font-bold text-xs text-[#1F1F1F]">历史相似故障处置案例推荐 ({recommendedCases.length} 篇)</span>
                  </div>
                  <span className="text-[11px] text-[#8C8C8C]">
                    依据拓扑相似度、故障特征波形与电芯型号智能匹配
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {recommendedCases.map((c) => (
                    <div 
                      key={c.id}
                      className="p-3.5 rounded-lg border border-[#E8E8E8] bg-[#FAFAFA] hover:bg-white hover:border-[#1890FF] transition-all space-y-2.5 flex flex-col justify-between shadow-xs"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] text-[#8C8C8C]">{c.id}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            c.similarity >= 90 
                              ? 'bg-red-50 text-[#F5222D] border border-red-200' 
                              : 'bg-orange-50 text-[#FA8C16] border border-orange-200'
                          }`}>
                            相似度 {c.similarity}%
                          </span>
                        </div>

                        <h4 className="font-bold text-xs text-[#262626] line-clamp-2 leading-snug" title={c.title}>
                          {c.title}
                        </h4>

                        <div className="space-y-1 text-[11px]">
                          <div className="text-[#8C8C8C]">
                            电站: <span className="text-[#595959] font-medium">{c.stationName}</span>
                          </div>
                          <div className="text-[#8C8C8C]">
                            历史根因: <span className="text-[#262626] font-medium line-clamp-2">{c.actualRootCause}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#F0F0F0] flex items-center justify-between">
                        <span className="text-[10px] text-[#8C8C8C]">{c.resolutionTime}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedCaseModal(c)}
                            className="px-2 py-1 text-xs text-[#1890FF] hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          >
                            查看详情
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdoptCaseToNote(c)}
                            className="px-2 py-1 bg-[#1890FF] text-white hover:bg-[#40A9FF] rounded text-xs transition-colors cursor-pointer"
                          >
                            引用经验
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: AI 故障机理诊断 */}
          {/* ============================================================== */}
          {activeTab === 'diagnosis' && (
            <div className="space-y-4">
              {/* 诊断四步子导航栏 */}
              <div className="bg-white p-2 rounded-lg border border-[#E8E8E8] flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setDiagSubTab('create')}
                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      diagSubTab === 'create'
                        ? 'bg-[#722ED1] text-white shadow-xs'
                        : 'bg-[#FAFAFA] text-[#595959] hover:text-[#262626]'
                    }`}
                  >
                    <span>1. 配置诊断任务</span>
                  </button>

                  <ChevronRight className="w-3.5 h-3.5 text-[#BFBFBF]" />

                  <button
                    type="button"
                    onClick={() => setDiagSubTab('upload')}
                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      diagSubTab === 'upload'
                        ? 'bg-[#722ED1] text-white shadow-xs'
                        : 'bg-[#FAFAFA] text-[#595959] hover:text-[#262626]'
                    }`}
                  >
                    <span>2. 上传录波日志</span>
                    {uploadedLog.isUploaded && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#52C41A]" />
                    )}
                  </button>

                  <ChevronRight className="w-3.5 h-3.5 text-[#BFBFBF]" />

                  <button
                    type="button"
                    onClick={() => setDiagSubTab('pipeline')}
                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      diagSubTab === 'pipeline'
                        ? 'bg-[#722ED1] text-white shadow-xs'
                        : 'bg-[#FAFAFA] text-[#595959] hover:text-[#262626]'
                    }`}
                  >
                    <span>3. 推演流水线</span>
                    {isSimulating && (
                      <Activity className="w-3 h-3 animate-spin text-white" />
                    )}
                  </button>

                  <ChevronRight className="w-3.5 h-3.5 text-[#BFBFBF]" />

                  <button
                    type="button"
                    onClick={() => {
                      if (hasDiagnosed) {
                        setDiagSubTab('result');
                      } else {
                        setStatusMessage('请先启动 AI 推演计算后再查看诊断结论详情！');
                      }
                    }}
                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      diagSubTab === 'result'
                        ? 'bg-[#722ED1] text-white shadow-xs'
                        : hasDiagnosed
                        ? 'bg-[#F9F0FF] text-[#722ED1] border border-[#D3ADF7]'
                        : 'bg-[#FAFAFA] text-[#8C8C8C] opacity-60'
                    }`}
                  >
                    <span>4. 诊断结论详情</span>
                    {hasDiagnosed && (
                      <Check className="w-3 h-3 text-[#52C41A]" />
                    )}
                  </button>
                </div>

                {!hasDiagnosed ? (
                  <button
                    type="button"
                    disabled={isSimulating}
                    onClick={handleRunDiagnosisSimulation}
                    className="px-3.5 py-1.5 bg-[#722ED1] hover:bg-[#531DAB] text-white rounded text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                  >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>{isSimulating ? 'AI 推演中...' : '启动 AI 机理推演'}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowFullReportModal(true)}
                      className="px-2.5 py-1.5 bg-white border border-[#D3ADF7] text-[#722ED1] hover:bg-[#F9F0FF] rounded text-xs font-medium cursor-pointer"
                    >
                      查看完整报告
                    </button>
                    <button
                      type="button"
                      onClick={handleAdoptAiDiagToNote}
                      className="px-3 py-1.5 bg-[#722ED1] text-white hover:bg-[#531DAB] rounded text-xs font-bold cursor-pointer"
                    >
                      采纳结论至工单
                    </button>
                  </div>
                )}
              </div>

              {/* 子步骤 1: 配置诊断任务 */}
              {diagSubTab === 'create' && (
                <div className="bg-white rounded-lg border border-[#E8E8E8] p-4.5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-[#722ED1]" />
                      <span className="font-bold text-xs text-[#1F1F1F]">步骤 1：确认诊断任务参数与分析对象</span>
                    </div>
                    <span className="font-mono text-xs text-[#8C8C8C]">任务编号: {diagTask.id}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#595959] block">所属电站名称</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={diagTask.station} 
                        className="w-full p-2 bg-[#FAFAFA] border border-[#D9D9D9] rounded text-xs font-medium text-[#262626]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#595959] block">排查目标设备位号</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={diagTask.device} 
                        className="w-full p-2 bg-[#FAFAFA] border border-[#D9D9D9] rounded text-xs font-mono font-medium text-[#262626]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#595959] block">分析诊断算法场景</label>
                      <select 
                        value={diagTask.scenario} 
                        onChange={(e) => setDiagTask(prev => ({ ...prev, scenario: e.target.value }))}
                        className="w-full p-2 bg-white border border-[#D9D9D9] rounded text-xs font-medium text-[#262626] focus:border-[#722ED1]"
                      >
                        <option value="极柱过热与接触内阻劣变分析">极柱过热与接触内阻劣变分析 (针对电芯温差)</option>
                        <option value="储能变流器(PCS)开关动态与IGBT热阻畸变">储能变流器(PCS)开关动态与IGBT热阻畸变</option>
                        <option value="直流母线绝缘阻抗骤降与微漏电排查">直流母线绝缘阻抗骤降与微漏电排查</option>
                        <option value="电芯微短路自放电与析锂特征推演">电芯微短路自放电与析锂特征推演</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#595959] block">机理模型引擎版本</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={diagTask.model} 
                        className="w-full p-2 bg-[#FAFAFA] border border-[#D9D9D9] rounded text-xs font-mono text-[#595959]"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#F0F0F0] flex items-center justify-between">
                    <span className="text-[11px] text-[#8C8C8C]">
                      配置就绪后，前往步骤 2 确认/载入高频时序录波日志
                    </span>
                    <button
                      type="button"
                      onClick={() => setDiagSubTab('upload')}
                      className="px-4 py-2 bg-[#722ED1] hover:bg-[#531DAB] text-white rounded text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>下一步：确认录波日志</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* 子步骤 2: 上传/加载录波日志 */}
              {diagSubTab === 'upload' && (
                <div className="bg-white rounded-lg border border-[#E8E8E8] p-4.5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
                    <div className="flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-[#722ED1]" />
                      <span className="font-bold text-xs text-[#1F1F1F]">步骤 2：现场高频录波 / BMS 时序日志载入</span>
                    </div>
                    <span className="text-xs text-[#8C8C8C]">支持 .bms_log, .csv, .dat 格式</span>
                  </div>

                  {/* 拖拽上传框 */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        const f = e.dataTransfer.files[0];
                        setUploadedLog({
                          name: f.name,
                          size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
                          frames: '约 96,000 帧时序数据',
                          samplingRate: '100 Hz (自适应)',
                          timeRange: '2026-08-25 08:00:00 ~ 10:00:00',
                          isUploaded: true
                        });
                        setStatusMessage(`日志文件【${f.name}】已成功载入！`);
                      }
                    }}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer relative ${
                      isDragOver 
                        ? 'border-[#722ED1] bg-purple-50/60' 
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
                        点击或将现场录波 / BMS 时序文件拖拽至此处上传
                      </p>
                      <p className="text-[11px] text-[#8C8C8C]">
                        系统将自动执行微秒级通道对齐、时序降噪与电化学阻抗提取
                      </p>
                    </div>
                  </div>

                  {/* 快捷载入典型样本 */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-[#595959] block">
                      或快捷加载当前工单对应的典型现场录波样本:
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
                            setDiagTask(prev => ({ ...prev, scenario: p.scenario }));
                            setStatusMessage(`已加载样本日志: ${p.name}`);
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

                  {/* 已载入日志详情 */}
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
                        onClick={handleRunDiagnosisSimulation}
                        className="px-3.5 py-1.5 bg-[#52C41A] hover:bg-[#73D13D] text-white rounded text-xs font-semibold shrink-0 cursor-pointer shadow-xs"
                      >
                        立即送入推演
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 子步骤 3: 推演流水线 */}
              {diagSubTab === 'pipeline' && (
                <div className="bg-white rounded-lg border border-[#E8E8E8] p-4.5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#722ED1]" />
                      <span className="font-bold text-xs text-[#1F1F1F]">步骤 3：AI 故障机理多阶段诊断推演流水线</span>
                    </div>
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

                  {/* 4 步推演流水线 */}
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
                      onClick={() => setDiagSubTab('upload')}
                      className="px-3 py-1.5 border border-[#D9D9D9] rounded text-xs text-[#595959] hover:bg-[#FAFAFA] cursor-pointer"
                    >
                      ← 返回重选录波日志
                    </button>
                    {hasDiagnosed && (
                      <button
                        type="button"
                        onClick={() => setDiagSubTab('result')}
                        className="px-4 py-1.5 bg-[#722ED1] text-white rounded text-xs font-bold hover:bg-[#531DAB] cursor-pointer"
                      >
                        查看诊断结论详情 →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 子步骤 4: 诊断结论详情与多物理场机理剖析 */}
              {diagSubTab === 'result' && (
                <div className="space-y-4">
                  {/* 核心结论卡 */}
                  <div className="bg-white rounded-lg border border-[#E8E8E8] p-4.5 space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#F0F0F0]">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <BrainCircuit className="w-5 h-5 text-[#722ED1]" />
                          <h3 className="font-bold text-sm text-[#1F1F1F]">AI 故障机理诊断结论</h3>
                          <span className="px-2 py-0.5 rounded bg-purple-100 text-[#722ED1] text-xs font-bold font-mono">
                            综合置信度 97.8%
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8C8C8C]">
                          基于 100Hz 高频时序录波微分阻抗求解与热电多物理场反演
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowFullReportModal(true)}
                          className="px-3 py-1.5 bg-white border border-[#D3ADF7] text-[#722ED1] hover:bg-[#F9F0FF] rounded text-xs font-medium cursor-pointer"
                        >
                          查看全屏报告
                        </button>
                        <button
                          type="button"
                          onClick={handleAdoptAiDiagToNote}
                          className="px-3.5 py-1.5 bg-[#722ED1] hover:bg-[#531DAB] text-white rounded text-xs font-bold transition-colors cursor-pointer shadow-xs"
                        >
                          采纳诊断结论至工单
                        </button>
                      </div>
                    </div>

                    {/* 根因判定与置信度雷达卡 */}
                    <div className="p-3.5 bg-[#F9F0FF] border border-[#D3ADF7] rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#722ED1]">【核心根因定性判定】</span>
                        <span className="text-[11px] text-[#722ED1] font-mono">推演耗时: {diagTask.duration}</span>
                      </div>
                      <p className="text-xs text-[#262626] font-medium leading-relaxed">
                        {diagTask.rootCause}
                      </p>
                    </div>

                    {/* 电化学与物理机理量化参数矩阵 */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-[#FAFAFA] p-3 rounded border border-[#E8E8E8] space-y-1">
                        <span className="text-[11px] text-[#8C8C8C] block">接触内阻实测估算</span>
                        <div className="text-sm font-bold text-[#F5222D] font-mono">0.33 mΩ</div>
                        <span className="text-[10px] text-[#FA8C16] block">超标 +32.4% (标准≤0.25)</span>
                      </div>

                      <div className="bg-[#FAFAFA] p-3 rounded border border-[#E8E8E8] space-y-1">
                        <span className="text-[11px] text-[#8C8C8C] block">极柱实测紧固力矩</span>
                        <div className="text-sm font-bold text-[#F5222D] font-mono">4.2 N·m</div>
                        <span className="text-[10px] text-[#FA8C16] block">标准 10.0±0.5 N·m</span>
                      </div>

                      <div className="bg-[#FAFAFA] p-3 rounded border border-[#E8E8E8] space-y-1">
                        <span className="text-[11px] text-[#8C8C8C] block">大电流焦耳热温升</span>
                        <div className="text-sm font-bold text-[#F5222D] font-mono">ΔT = 9.4 ℃</div>
                        <span className="text-[10px] text-[#8C8C8C] block">放电 0.5C 工况实测</span>
                      </div>

                      <div className="bg-[#FAFAFA] p-3 rounded border border-[#E8E8E8] space-y-1">
                        <span className="text-[11px] text-[#8C8C8C] block">热失控演化风险</span>
                        <div className="text-sm font-bold text-[#FA8C16] font-mono">中高风险 (二级)</div>
                        <span className="text-[10px] text-[#52C41A] block">暂无隔膜击穿微短路</span>
                      </div>
                    </div>

                    {/* AI 推荐消缺策略 */}
                    <div className="p-3.5 bg-[#E6F7FF] border border-[#91D5FF] rounded-lg space-y-1.5">
                      <span className="font-bold text-xs text-[#0050B3] flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-[#1890FF]" />
                        推荐闭环消缺策略:
                      </span>
                      <div className="text-xs text-[#096DD9] space-y-1 leading-relaxed">
                        <p>1. 现场断开该簇直流隔离开关，执行验电与安全放电；</p>
                        <p>2. 使用数显扭矩扳手重新校准端子紧固力矩至 10.0±0.5 N·m，并清除接触面氧化层；</p>
                        <p>3. 启动红外热像仪在 0.5C 充放电工况下复测极柱温升（目标 ΔT &lt; 2.0℃）；</p>
                        <p>4. 平台在线下发 BMS 主动均衡标定指令。</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: 现场消缺流转 (pcare 模拟操作) */}
          {/* ============================================================== */}
          {activeTab === 'process' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 左侧两列：现场排查记录与流转日志 */}
                <div className="md:col-span-2 space-y-4">
                  {/* 故障基本摘要 */}
                  <div className="p-3.5 bg-white rounded-lg border border-[#E8E8E8] space-y-2 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
                      <span className="font-bold text-xs text-[#1F1F1F]">故障简要信息</span>
                      <span className="font-mono text-xs text-[#8C8C8C]">{ticket.id}</span>
                    </div>
                    <p className="text-xs text-[#595959] leading-relaxed">
                      {ticket.description}
                    </p>
                  </div>

                  {/* 流转日志 */}
                  <div className="bg-white rounded-lg border border-[#E8E8E8] p-4 space-y-3 shadow-xs">
                    <h3 className="text-xs font-bold text-[#1F1F1F] flex items-center gap-1.5">
                      <History className="w-4 h-4 text-[#8C8C8C]" />
                      流转记录与操作审计日志
                    </h3>
                    <div className="space-y-2">
                      {ticket.logs?.map((log, idx) => (
                        <div key={idx} className="p-2.5 rounded bg-[#FAFAFA] border border-[#E8E8E8] text-xs flex items-start justify-between">
                          <div>
                            <div className="font-medium text-[#1F1F1F]">
                              {log.operator}: <span className="font-normal text-[#595959]">{log.action}</span>
                            </div>
                            {log.note && <p className="text-[11px] text-[#8C8C8C] mt-1 whitespace-pre-line leading-relaxed">{log.note}</p>}
                          </div>
                          <span className="text-[11px] text-[#8C8C8C] tabular-nums shrink-0 ml-2">{log.time}</span>
                        </div>
                      )) ?? (
                        <div className="p-2.5 rounded bg-[#FAFAFA] border border-[#E8E8E8] text-xs text-[#8C8C8C]">
                          由主动运维平台自动派发至 pcare 流程引擎
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 右侧一列：现场处置意见与流程流转面板 */}
                <div className="bg-white p-4.5 rounded-lg border border-[#E8E8E8] space-y-4 shadow-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="border-b border-[#E8E8E8] pb-2">
                      <h3 className="text-xs font-bold text-[#1F1F1F] flex items-center gap-1.5">
                        <Wrench className="w-4 h-4 text-[#1890FF]" />
                        pcare 现场消缺流转面板
                      </h3>
                      <p className="text-[11px] text-[#8C8C8C]">录入现场排查结论与闭环指令</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#595959] block">
                        处理意见 / 现场排查与消缺记录
                      </label>
                      <textarea
                        value={handleNote}
                        onChange={(e) => setHandleNote(e.target.value)}
                        placeholder="可点击左侧【排查SOP】或【AI诊断】一键填入现场排查方案，亦可手动录入消缺结论..."
                        rows={7}
                        className="w-full p-2.5 text-xs rounded bg-white border border-[#D9D9D9] text-[#262626] focus:outline-hidden focus:border-[#1890FF] focus:ring-1 focus:ring-[#1890FF] resize-none placeholder:text-[#BFBFBF] leading-relaxed"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                      {ticket.status === '待受理' && (
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleAction('处理中', '接单受理并安排工程师到站')}
                          className="w-full py-2 px-3 bg-[#1890FF] hover:bg-[#40A9FF] text-white rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>接单受理 (转为处理中)</span>
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleAction('处理中', '派发现场抢修班组并更新进度')}
                        className="w-full py-2 px-3 bg-white hover:bg-[#F5F5F5] text-[#595959] border border-[#D9D9D9] rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 text-[#8C8C8C]" />
                        <span>派发现场班组 / 记录进度</span>
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleAction('挂起中', '等待厂家备件或调度停电窗口审批')}
                        className="w-full py-2 px-3 bg-[#FFFBE6] hover:bg-[#FFF1B8] text-[#D48806] border border-[#FFE58F] rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5 text-[#FAAD14]" />
                        <span>申请挂起 (等备件/等停电)</span>
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleAction('已完成', '消缺排查完毕，现场复测各项电气指标合格，闭环归档')}
                        className="w-full py-2 px-3 bg-[#52C41A] hover:bg-[#73D13D] text-white rounded text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>现场消缺完毕 · 验收归档</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E8E8E8]">
                    <button
                      type="button"
                      onClick={onBack}
                      className="w-full py-1.5 text-center text-xs text-[#8C8C8C] hover:text-[#1890FF] cursor-pointer transition-colors"
                    >
                      ← 取消并{backButtonLabel}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: 工单与资产台账 */}
          {/* ============================================================== */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-[#E8E8E8] p-5 space-y-4 shadow-xs">
                <h3 className="font-bold text-xs text-[#1F1F1F]">基础资产与台账信息</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-[#FAFAFA] rounded-md border border-[#E8E8E8] text-xs">
                  <div>
                    <span className="text-[#8C8C8C] block text-[11px]">关联电站</span>
                    <span className="font-semibold text-[#1F1F1F]">{ticket.stationName}</span>
                  </div>
                  <div>
                    <span className="text-[#8C8C8C] block text-[11px]">所属区域</span>
                    <span className="text-[#595959]">{ticket.region}区域</span>
                  </div>
                  <div>
                    <span className="text-[#8C8C8C] block text-[11px]">设备/点位位号</span>
                    <span className="font-mono text-[#1F1F1F] font-semibold">{ticket.deviceCode ?? '全站通用'}</span>
                  </div>
                  <div>
                    <span className="text-[#8C8C8C] block text-[11px]">当前责任人</span>
                    <span className="font-semibold text-[#1890FF]">{ticket.assignee}</span>
                  </div>
                  <div>
                    <span className="text-[#8C8C8C] block text-[11px]">工单创建时间</span>
                    <span className="text-[#595959]">{ticket.createdAt}</span>
                  </div>
                  <div>
                    <span className="text-[#8C8C8C] block text-[11px]">SLA 承诺截止</span>
                    <span className="text-[#595959] font-semibold">{ticket.slaDeadline}</span>
                  </div>
                </div>

                {/* 关联风险源 */}
                {ticket.linkedRiskId && (
                  <div className="p-3.5 rounded bg-[#F9F0FF] border border-[#D3ADF7] flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-[#531DAB]">关联主动运维平台预警源</span>
                      <p className="text-[11px] text-[#722ED1]">
                        该工单由预警单号 <span className="font-mono font-medium">{ticket.linkedRiskId}</span> 触发生成，支持双向追溯。
                      </p>
                    </div>
                    {onJumpToRisk && (
                      <button
                        type="button"
                        onClick={() => onJumpToRisk(ticket.linkedRiskId!)}
                        className="px-3 py-1.5 bg-white text-[#722ED1] hover:bg-[#F9F0FF] rounded border border-[#D3ADF7] font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <span>溯源预警详情</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 相似案例详情模态框 */}
      {selectedCaseModal && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#D9D9D9] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-[#E8E8E8] bg-[#FAFAFA] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#8C8C8C]">{selectedCaseModal.id}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-[#1890FF]">
                  匹配度 {selectedCaseModal.similarity}%
                </span>
                <h3 className="font-bold text-xs text-[#1F1F1F] truncate max-w-md">
                  {selectedCaseModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCaseModal(null)}
                className="p-1 text-[#8C8C8C] hover:text-[#262626] rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-[#FAFAFA] p-3 rounded border border-[#E8E8E8]">
                <div><span className="text-[#8C8C8C]">发生电站:</span> {selectedCaseModal.stationName}</div>
                <div><span className="text-[#8C8C8C]">涉及设备:</span> {selectedCaseModal.deviceType}</div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-xs text-[#1F1F1F] block">历史故障现象与告警:</span>
                <p className="text-[#595959] bg-[#FAFAFA] p-2.5 rounded border border-[#E8E8E8] leading-relaxed">
                  {selectedCaseModal.reportedSymptom}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-xs text-[#F5222D] block">现场查明真实根因:</span>
                <p className="text-[#262626] bg-[#FFF2F0] p-2.5 rounded border border-[#FFCCC7] leading-relaxed">
                  {selectedCaseModal.actualRootCause}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-xs text-[#1890FF] block">采取的消缺处置措施:</span>
                <p className="text-[#262626] bg-[#E6F7FF] p-2.5 rounded border border-[#91D5FF] leading-relaxed">
                  {selectedCaseModal.resolutionAction}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-xs text-[#52C41A] block">长效防范建议:</span>
                <p className="text-[#52C41A] bg-[#F6FFED] p-2.5 rounded border border-[#B7EB8F] leading-relaxed">
                  {selectedCaseModal.preventionTip}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#8C8C8C] pt-2 border-t border-[#F0F0F0]">
                <span>处置责任人: {selectedCaseModal.resolvedBy}</span>
                <span>闭环耗时: {selectedCaseModal.resolutionTime}</span>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#E8E8E8] bg-[#FAFAFA] flex items-center justify-between shrink-0">
              <span className="text-[11px] text-[#8C8C8C]">
                案例来源: 主动运维专家经验知识库
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAdoptCaseToNote(selectedCaseModal)}
                  className="px-3.5 py-1.5 bg-[#1890FF] text-white rounded text-xs font-bold hover:bg-[#40A9FF] cursor-pointer"
                >
                  借鉴此方案并填入工单
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCaseModal(null)}
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
