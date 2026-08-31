import React, { useState, useEffect } from 'react';
import { RiskItem, CONFIG_THRESHOLDS } from '../../types';
import { PriorityBadge, RiskScoreBadge, RiskTypeBadge, RiskStatusBadge } from '../common/Badges';
import { 
  X, 
  ShieldAlert, 
  Building2, 
  Clock, 
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
  CheckSquare,
  PlusCircle,
  Eye,
  Sliders,
  CheckCheck
} from 'lucide-react';

interface RiskAnalysisDrawerProps {
  risk: RiskItem | null;
  onClose: () => void;
  onConvertToTicket?: (risk: RiskItem, customNote?: string) => void;
  onEliminateRisk?: (riskId: string, note: string) => void;
  onJumpToTicket?: (ticketId: string) => void;
}

// 智能 SOP 接口
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

// 历史相似案例接口
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

// 根据风险特征自动匹配排查处置 SOP 与 相似案例
function getRecommendedSopAndCasesForRisk(risk: RiskItem): {
  sop: TroubleshootingSOP;
  cases: SimilarHistoricalCase[];
} {
  const text = `${risk.title} ${risk.category || ''} ${risk.symptomDetail || ''}`.toLowerCase();

  // 1. PCS / 变流器 / IGBT / 散热风机类型
  if (text.includes('pcs') || text.includes('igbt') || text.includes('变流器') || text.includes('超温') || text.includes('风机') || text.includes('谐波')) {
    return {
      sop: {
        category: '储能变流器 (PCS) 功率器件热阻与散热异常标准排查 SOP',
        matchReason: '根据风险特征中【PCS逆变桥臂/IGBT超温/散热异常】，系统自动匹配电力电子热管理与开关器件排查规程。',
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
  if (text.includes('绝缘') || text.includes('接地') || text.includes('漏电') || text.includes('阻抗') || text.includes('对地')) {
    return {
      sop: {
        category: '高压直流母线与电池簇对地绝缘阻抗劣化排查 SOP',
        matchReason: '根据风险特征中【绝缘阻抗骤降/接地阻抗低】，系统自动匹配高压绝缘安全与漏电排查标准规程。',
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

  // 3. 微短路 / 自放电 / 静置压降异变类型
  if (text.includes('微短路') || text.includes('自放电') || text.includes('压降') || text.includes('析锂')) {
    return {
      sop: {
        category: '电芯微短路低压自放电与析锂早期演化排查 SOP',
        matchReason: '根据风险特征中【微短路/自放电加剧/静置压降异常】，系统自动匹配电化学内短路与析锂风险排查规程。',
        safetyNotice: '疑似微短路电芯存在热失控潜在风险，严禁现场强行大倍率快充；测试期间须配备手持式红外热像仪连续监控表面温升。',
        toolsRequired: ['六位半高精度数字万用表', '电芯交流阻抗测试仪', '红外热像仪 (带微小温差跟踪)', '防爆防燃专用绝缘手套箱'],
        steps: [
          {
            step: 1,
            title: '静置阶段 OCV 开路电压衰减速率多点采样',
            detail: '在充放电结束后静置 2 小时，每隔 15 分钟连续采集异常电芯与同模组基准电芯的 OCV 开路电压。',
            keyCheck: '正常电芯静置压降速率 ≤ 0.2mV/h，微短路电芯压降速率 > 1.5mV/h。'
          },
          {
            step: 2,
            title: '采集板采样回路与均衡电路防窜电测试',
            detail: '断开 BAF 采样线束接头，使用万用表测量采样线绝缘阻抗与被动均衡 MOS 管是否击穿导通。',
            keyCheck: '排除均衡 MOS 击穿常开导致的虚假自放电。'
          },
          {
            step: 3,
            title: '交流 1kHz 阻抗谱测试与极化特性复核',
            detail: '使用便携式交流阻抗仪测量电芯欧姆内阻与电荷转移阻抗，比对同批次健康电芯分布区间。',
            keyCheck: '电芯内阻与同模组均值偏差 ≤ 10%，无异常虚接与内部短路通路。'
          },
          {
            step: 4,
            title: '容量标定与整包备件隔离更换建议',
            detail: '若确认电芯内部自放电加剧，按安全规范进行模组安全隔离，申报备件调拨与换装。',
            keyCheck: '更换后执行 1 轮完整充放电标定，压差收敛至 10mV 以内。'
          }
        ],
        acceptanceCriteria: '整簇充放电静置 4 小时后，单体电芯 OCV 压降速率与相邻电芯一致，无自放电与局部温升异常。'
      },
      cases: [
        {
          id: 'CASE-2026-0045',
          title: '无锡高新区用户侧储能单体电芯微短路自放电与温升劣变案例',
          stationName: '无锡高新用户侧站',
          deviceType: '01#储能柜-03#电池箱',
          similarity: 92,
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

  // 4. 默认/电芯单体温差大 / 接触内阻增大 / 极柱松动 (如 R-20260825-101)
  return {
    sop: {
      category: '电芯单体温差偏高与极柱接触内阻劣化标准排查 SOP',
      matchReason: '根据风险特征中【单体电芯温差持续偏高 / 接触内阻估算偏大】，系统自动匹配电化学连接可靠性排查标准规程。',
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
          detail: '拆卸异常电芯连接铜排，检查极柱及压接面是否有电弧灼痕或氧化膜；清理后使用数显扭矩扳手重新紧固至 10.0±0.5 N·m，并涂布极薄层导电硅脂。',
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
          detail: '恢复电池簇并网，在 0.5C 充放电工况下使用红外热像仪对异常电芯与相邻电芯进行连续点温跟踪，平台下发 BMS 主动均衡指令。',
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
      }
    ]
  };
}

export const RiskAnalysisDrawer: React.FC<RiskAnalysisDrawerProps> = ({
  risk,
  onClose,
  onConvertToTicket,
  onEliminateRisk,
  onJumpToTicket
}) => {
  // 抽屉宽度展开状态
  const [isExpandedWidth, setIsExpandedWidth] = useState(true);

  // 主选项卡：
  // 'troubleshoot' (排查与标准处理方案 - 默认首选！)
  // 'cases' (相似案例借鉴)
  // 'diagnosis' (AI 故障机理诊断 - 任务配置/日志上传/推演/结果)
  // 'telemetry' (风险特征与时序证据)
  // 'process' (研判处置与转工单)
  const [mainTab, setMainTab] = useState<'troubleshoot' | 'cases' | 'diagnosis' | 'telemetry' | 'process'>('troubleshoot');

  // AI 诊断是否有结果状态：默认不会有诊断结果 (hasDiagnosed = false)
  const [hasDiagnosed, setHasDiagnosed] = useState<boolean>(false);

  // 诊断子选项卡：
  // 'create' (配置任务) ➔ 'upload' (上传日志) ➔ 'pipeline' (推演流水线) ➔ 'result' (诊断结论详情)
  const [diagSubTab, setDiagSubTab] = useState<'create' | 'upload' | 'pipeline' | 'result'>('create');

  // 查看历史案例详情弹窗
  const [activeCaseModal, setActiveCaseModal] = useState<SimilarHistoricalCase | null>(null);

  // 诊断报告全屏模态框
  const [showFullReportModal, setShowFullReportModal] = useState(false);

  // 处置备注
  const [handleNote, setHandleNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // 诊断任务与日志状态
  const [diagTask, setDiagTask] = useState({
    id: 'DIAG-20260825-RK01',
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

  // 计算当前风险的 SOP 与推荐案例
  const { sop: recommendedSop, cases: recommendedCases } = risk 
    ? getRecommendedSopAndCasesForRisk(risk)
    : { sop: {} as TroubleshootingSOP, cases: [] };

  // 初始化或切换风险时，重置状态为【未诊断】，并匹配设备和默认描述
  useEffect(() => {
    if (risk) {
      setHasDiagnosed(false);
      setMainTab('troubleshoot'); // 默认打开排查与标准处理方案
      setDiagSubTab('create');    // 诊断内部默认从创建任务开始
      const targetDevice = `${risk.stationId}-Rack-01`;
      setDiagTask({
        id: `DIAG-20260825-${risk.id.replace(/[^0-9]/g, '').slice(-4) || '101'}`,
        name: `【${risk.id}】${risk.stationName} - ${risk.title.replace(/【.*?】/, '')} 深度故障机理诊断`,
        station: risk.stationName,
        device: targetDevice,
        scenario: risk.title.includes('PCS') || risk.title.includes('IGBT')
          ? '储能变流器(PCS)开关动态与IGBT热阻畸变'
          : risk.title.includes('绝缘')
          ? '直流母线绝缘阻抗骤降与微漏电排查'
          : risk.title.includes('微短路') || risk.title.includes('自放电')
          ? '电芯微短路与极化自放电演化分析'
          : '极柱过热与接触内阻劣变分析',
        model: '电化学机理与多物理场大模型混合分析引擎 V4.2',
        samplingRate: '100 Hz',
        status: '就绪',
        progress: 0,
        stageIndex: 0,
        stageText: '任务已配置，待载入录波日志启动推演',
        confidence: risk.confidence || 96.5,
        riskScore: risk.riskScore || 90,
        duration: '1.4 秒',
        rootCause: `${targetDevice} 采样回路与极柱连接接触内阻突增 +32.4%，放电焦耳热温升超标（ΔT=9.4℃），符合螺栓力矩衰减特征`,
        symptomDesc: risk.symptomDetail || risk.title
      });
      setUploadedLog({
        name: `${risk.stationName.slice(0, 4)}_${targetDevice}_故障录波.bms_log`,
        size: '14.8 MB',
        frames: '128,000 帧高频时序数据',
        samplingRate: '100 Hz (微秒级对齐)',
        timeRange: '2026-08-25 08:00:00 ~ 10:30:00',
        isUploaded: true
      });
    }
  }, [risk?.id]);

  if (!risk) return null;

  const isConverted = risk.status === '已转工单';

  // 预设典型故障日志
  const presetLogs = [
    {
      name: `${risk.stationName.slice(0, 4)}_02舱Rack04_单体温差与极化阻抗异常.bms_log`,
      size: '14.8 MB',
      frames: '128,000 帧',
      samplingRate: '100 Hz',
      timeRange: '2026-08-25 08:00:00 ~ 10:30:00',
      scenario: '极柱过热与接触内阻劣变分析'
    },
    {
      name: `${risk.stationName.slice(0, 4)}_05簇_电芯微短路低压自放电时序.csv`,
      size: '8.6 MB',
      frames: '24,000 帧',
      samplingRate: '10 Hz',
      timeRange: '2026-08-25 00:00:00 ~ 09:00:00 (静置期)',
      scenario: '电芯微短路与绝缘劣变演化'
    },
    {
      name: `${risk.stationName.slice(0, 4)}_PCS01_网侧谐波与IGBT温升波动.dat`,
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

  // 3. 一键采纳【标准处理方案 (SOP)】转为工单
  const handleAdoptSopAndConvertToTicket = () => {
    const text = `【采纳标准处理方案：${recommendedSop.category}】\n一、安全防护要求：${recommendedSop.safetyNotice}\n二、现场排查执行步骤：\n${recommendedSop.steps.map(s => `${s.step}. ${s.title}：${s.detail}（核验判据：${s.keyCheck}）`).join('\n')}\n三、消缺验收合格判据：${recommendedSop.acceptanceCriteria}`;
    setHandleNote(text);
    onConvertToTicket?.(risk, text);
    setStatusMessage(`已采纳标准处理方案并成功生成工单派发！`);
  };

  // 4. 一键引用【相似案例】转为工单
  const handleAdoptCaseAndConvertToTicket = (c: SimilarHistoricalCase) => {
    const text = `【借鉴历史相似案例消缺方案（匹配度 ${c.similarity}%）】\n参考案例：${c.title}（${c.stationName}）\n历史根因：${c.actualRootCause}\n消缺措施：${c.resolutionAction}\n长效预防：${c.preventionTip}`;
    setHandleNote(text);
    onConvertToTicket?.(risk, text);
    setActiveCaseModal(null);
    setStatusMessage(`已成功引用【${c.title.slice(0, 16)}...】经验并生成工单！`);
  };

  // 5. 一键采纳【AI 深度诊断结论】转为工单
  const handleAdoptAiDiagAndConvertToTicket = () => {
    const text = `【采纳 AI 故障机理诊断结论 (置信度 97.8%)】\n根因定位：${diagTask.rootCause}\n消缺处置策略：\n1. 现场断开直流隔离开关，执行验电与安全放电；\n2. 使用数显扭矩扳手重新校准端子紧固力矩至 10.0 N·m；\n3. 启动红外热像仪在 0.5C 充放电工况下复测极柱温升（目标 ΔT < 2.5℃）；\n4. 下发 BMS 在线主动均衡标定指令。`;
    setHandleNote(text);
    onConvertToTicket?.(risk, text);
    setShowFullReportModal(false);
    setStatusMessage(`已采纳 AI 故障机理诊断结论并成功生成工单！`);
  };

  // 6. 标记消除/研判抑制
  const handleEliminate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onEliminateRisk?.(risk.id, handleNote || '经研判确认属工况瞬态波动/已现场排查无异常，执行标记消除');
      setIsProcessing(false);
      setStatusMessage(`风险 ${risk.id} 已成功标记为「已消除」！`);
    }, 300);
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
              <div className="p-2 rounded-lg bg-orange-50 text-[#FA8C16] border border-orange-100 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-bold text-[#1F1F1F]">{risk.id}</span>
                  <RiskTypeBadge type={risk.type} />
                  <PriorityBadge priority={risk.priority} />
                  <RiskScoreBadge score={risk.riskScore} />
                  <RiskStatusBadge status={risk.status} linkedTicketId={risk.linkedTicketId} />
                  <span className="text-xs text-[#8C8C8C] flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#595959]" />
                    {risk.stationName}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[#262626] truncate max-w-xl mt-0.5" title={risk.title}>
                  {risk.title}
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

          {/* 选项卡导航栏 (工作台风险分析：标准方案、相似案例、故障诊断、特征证据、流转处置) */}
          <div className="px-5 border-b border-[#E8E8E8] bg-white flex items-center justify-between shrink-0 overflow-x-auto">
            <div className="flex items-center gap-1">
              
              {/* TAB 1: 标准处理方案 (SOP) */}
              <button
                type="button"
                onClick={() => setMainTab('troubleshoot')}
                className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  mainTab === 'troubleshoot'
                    ? 'border-[#FA8C16] text-[#FA8C16] bg-orange-50/40'
                    : 'border-transparent text-[#595959] hover:text-[#262626]'
                }`}
              >
                <BookOpen className="w-4 h-4 text-[#FA8C16]" />
                <span>标准处理方案 (SOP)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-orange-100 text-[#D46B08] font-medium">
                  推荐
                </span>
              </button>

              {/* TAB 2: 相似案例 */}
              <button
                type="button"
                onClick={() => setMainTab('cases')}
                className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  mainTab === 'cases'
                    ? 'border-[#1890FF] text-[#1890FF] bg-blue-50/40'
                    : 'border-transparent text-[#595959] hover:text-[#262626]'
                }`}
              >
                <FolderGit2 className="w-4 h-4 text-[#1890FF]" />
                <span>相似案例</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-[#1890FF] font-medium">
                  {recommendedCases.length} 案例
                </span>
              </button>

              {/* TAB 3: AI 故障诊断功能 */}
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
                <span>故障机理诊断</span>
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

              {/* TAB 4: 风险特征与时序证据 */}
              <button
                type="button"
                onClick={() => setMainTab('telemetry')}
                className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  mainTab === 'telemetry'
                    ? 'border-[#1890FF] text-[#1890FF] bg-blue-50/40'
                    : 'border-transparent text-[#595959] hover:text-[#262626]'
                }`}
              >
                <Activity className="w-4 h-4 text-[#1890FF]" />
                <span>特征与证据链</span>
              </button>

              {/* TAB 5: 研判流转与转工单 */}
              <button
                type="button"
                onClick={() => setMainTab('process')}
                className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  mainTab === 'process'
                    ? 'border-[#1890FF] text-[#1890FF] bg-blue-50/40'
                    : 'border-transparent text-[#595959] hover:text-[#262626]'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-[#1890FF]" />
                <span>转工单/处置</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs shrink-0">
              <span className="text-[#8C8C8C]">算法置信度:</span>
              <span className="font-mono font-bold text-[#722ED1]">{risk.confidence ?? 95}%</span>
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
            {/* TAB 1: 标准处理方案 (SOP) */}
            {/* ============================================================== */}
            {mainTab === 'troubleshoot' && (
              <div className="space-y-4">
                
                {/* 风险现象与研判摘要 */}
                <div className="bg-white rounded-lg border border-[#E8E8E8] p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#FA8C16]" />
                      <span className="font-bold text-xs text-[#1F1F1F]">风险现象研判与特征识别</span>
                    </div>
                    <span className="font-mono text-xs text-[#8C8C8C]">
                      分析时间: {risk.discoveredAt}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 bg-[#FAFAFA] p-3 rounded-md border border-[#E8E8E8] space-y-1">
                      <span className="text-[11px] text-[#8C8C8C] block font-medium">算法预测现象与物理成因:</span>
                      <p className="text-xs text-[#262626] leading-relaxed">
                        {risk.symptomDetail || '多物理场时序检测显示，该设备在充放电循环中指标明显异于全站均值，存在极柱温升或电气阻抗劣化隐患。'}
                      </p>
                    </div>
                    <div className="bg-orange-50/60 p-3 rounded-md border border-[#FFD591] space-y-1.5">
                      <span className="text-[11px] text-[#D46B08] font-semibold block">风险研判级别</span>
                      <div className="flex items-center gap-2">
                        <RiskScoreBadge score={risk.riskScore} />
                        <span className="text-xs text-[#8C8C8C]">{risk.category}</span>
                      </div>
                      <span className="text-[10px] text-[#8C8C8C] block">
                        建议结合现场排查 SOP 及时消缺闭环
                      </span>
                    </div>
                  </div>
                </div>

                {/* 推荐的标准排查处置 SOP */}
                <div className="bg-white rounded-lg border border-[#FFD591] p-4.5 space-y-3.5 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-28 h-28 bg-orange-50/80 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none" />

                  <div className="flex items-start justify-between gap-3 relative">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#FA8C16] text-white flex items-center gap-1">
                          <CheckSquare className="w-3.5 h-3.5" />
                          标准处理方案 (SOP)
                        </span>
                        <span className="text-xs font-semibold text-[#D46B08]">
                          {recommendedSop.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#595959] mt-1">
                        {recommendedSop.matchReason}
                      </p>
                    </div>

                    {!isConverted ? (
                      <button
                        type="button"
                        onClick={handleAdoptSopAndConvertToTicket}
                        className="px-3.5 py-1.5 bg-[#FA8C16] hover:bg-[#D46B08] text-white rounded text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>采纳此方案并转工单</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => risk.linkedTicketId && onJumpToTicket?.(risk.linkedTicketId)}
                        className="px-3 py-1.5 bg-[#F6FFED] border border-[#B7EB8F] text-[#52C41A] rounded text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>已转工单 ({risk.linkedTicketId})</span>
                      </button>
                    )}
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
                    <span className="font-bold text-xs text-[#1F1F1F] block">标准排查与处置步骤拆解:</span>
                    <div className="space-y-2">
                      {recommendedSop.steps.map((st) => (
                        <div key={st.step} className="p-3 bg-[#FAFAFA] rounded-md border border-[#E8E8E8] flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-[#FA8C16] text-white text-xs font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                            {st.step}
                          </span>
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <div className="font-semibold text-xs text-[#262626]">
                              {st.title}
                            </div>
                            <p className="text-[11px] text-[#595959] leading-relaxed">
                              {st.detail}
                            </p>
                            <div className="text-[11px] text-[#D46B08] bg-orange-50/60 px-2 py-0.5 rounded inline-block mt-1 font-medium">
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

                {/* 底部快速通道 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-blue-50/60 rounded-lg border border-blue-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FolderGit2 className="w-5 h-5 text-[#1890FF]" />
                      <div>
                        <span className="font-bold text-xs text-[#1F1F1F] block">查看相似历史案例</span>
                        <span className="text-[11px] text-[#8C8C8C]">已匹配 {recommendedCases.length} 项相似消缺经验</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMainTab('cases')}
                      className="px-3 py-1 bg-white border border-[#1890FF] text-[#1890FF] rounded text-xs font-semibold hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      前往查看
                    </button>
                  </div>

                  <div className="p-3.5 bg-purple-50/60 rounded-lg border border-purple-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <BrainCircuit className="w-5 h-5 text-[#722ED1]" />
                      <div>
                        <span className="font-bold text-xs text-[#1F1F1F] block">AI 故障机理深度诊断</span>
                        <span className="text-[11px] text-[#8C8C8C]">时序多物理场阻抗与热阻仿真</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMainTab('diagnosis');
                        setDiagSubTab('create');
                      }}
                      className="px-3 py-1 bg-[#722ED1] text-white rounded text-xs font-semibold hover:bg-[#531DAB] transition-colors cursor-pointer"
                    >
                      发起诊断
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: 相似案例推荐与借鉴 */}
            {/* ============================================================== */}
            {mainTab === 'cases' && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg border border-[#E8E8E8] p-4.5 space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
                    <div className="flex items-center gap-2">
                      <FolderGit2 className="w-4 h-4 text-[#1890FF]" />
                      <span className="font-bold text-xs text-[#1F1F1F]">历史相似故障案例推荐与经验借鉴</span>
                    </div>
                    <span className="text-[11px] text-[#8C8C8C]">
                      已根据风险时序特征自动检索知识库匹配
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {recommendedCases.map((c) => (
                      <div 
                        key={c.id}
                        className="p-3.5 rounded-lg border border-[#E8E8E8] hover:border-[#91D5FF] bg-[#FAFAFA] hover:bg-white transition-all space-y-2 relative"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F7FF] text-[#1890FF] border border-[#91D5FF]">
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
                              <span>·</span>
                              <span>消缺人: {c.resolvedBy}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setActiveCaseModal(c)}
                              className="px-2.5 py-1 bg-white border border-[#D9D9D9] hover:border-[#1890FF] text-[#595959] hover:text-[#1890FF] rounded text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              查看详情
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdoptCaseAndConvertToTicket(c)}
                              className="px-2.5 py-1 bg-[#E6F7FF] border border-[#91D5FF] text-[#0050B3] hover:bg-[#1890FF] hover:text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              借鉴方案转工单
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
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 3: AI 故障机理诊断 (生命周期：配置 ➔ 上传 ➔ 推演 ➔ 结论) */}
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
                      <span>② 载入录波日志</span>
                      {uploadedLog.isUploaded && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#52C41A]" />
                      )}
                    </button>

                    {/* 子 TAB 3: 推演计算流水线 */}
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
                        <span className="w-2 h-2 rounded-full bg-[#FA8C16] animate-ping" />
                      )}
                    </button>

                    {/* 子 TAB 4: 诊断结论详情与证据链 */}
                    <button
                      type="button"
                      onClick={() => setDiagSubTab('result')}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                        diagSubTab === 'result'
                          ? 'bg-[#722ED1] text-white shadow-xs'
                          : 'bg-[#FAFAFA] text-[#595959] hover:bg-[#F0F0F0] border border-[#E8E8E8]'
                      }`}
                    >
                      <BrainCircuit className="w-3.5 h-3.5" />
                      <span>④ 诊断结论与证据链</span>
                      {hasDiagnosed && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#52C41A] text-white font-mono">
                          97.8%
                        </span>
                      )}
                    </button>
                  </div>

                  {/* 状态徽标 */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                      diagTask.status === '已完成' 
                        ? 'bg-green-50 text-[#52C41A] border border-green-200' 
                        : diagTask.status === '分析中'
                        ? 'bg-purple-50 text-[#722ED1] border border-purple-200 animate-pulse'
                        : 'bg-gray-50 text-gray-500 border border-gray-200'
                    }`}>
                      {diagTask.status}
                    </span>
                  </div>
                </div>

                {/* ------------------------------------------------------------ */}
                {/* 诊断子 TAB 1: 创建/配置诊断任务 */}
                {/* ------------------------------------------------------------ */}
                {diagSubTab === 'create' && (
                  <div className="bg-white rounded-lg border border-[#E8E8E8] p-4.5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-[#722ED1]" />
                        <span className="font-bold text-xs text-[#1F1F1F]">配置 AI 多物理场机理诊断任务</span>
                      </div>
                      <span className="font-mono text-xs text-[#8C8C8C]">
                        任务编号: {diagTask.id}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-[#595959]">诊断任务名称</label>
                        <input
                          type="text"
                          value={diagTask.name}
                          onChange={(e) => setDiagTask({ ...diagTask, name: e.target.value })}
                          className="w-full px-3 py-1.5 bg-[#FAFAFA] border border-[#D9D9D9] rounded text-xs text-[#262626] focus:bg-white focus:border-[#722ED1] outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-[#595959]">目标电站与设备位号</label>
                        <input
                          type="text"
                          value={`${diagTask.station} (${diagTask.device})`}
                          readOnly
                          className="w-full px-3 py-1.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded text-xs text-[#595959] outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-[#595959]">诊断物理机理场景模型</label>
                        <select
                          value={diagTask.scenario}
                          onChange={(e) => setDiagTask({ ...diagTask, scenario: e.target.value })}
                          className="w-full px-3 py-1.5 bg-[#FAFAFA] border border-[#D9D9D9] rounded text-xs text-[#262626] focus:bg-white focus:border-[#722ED1] outline-none cursor-pointer"
                        >
                          <option value="极柱过热与接触内阻劣变分析">极柱过热与接触内阻劣变分析 (Joule Heating & Resistance)</option>
                          <option value="电芯微短路与极化自放电演化分析">电芯微短路与极化自放电演化分析 (Micro-Short Circuit & OCV)</option>
                          <option value="直流母线绝缘阻抗骤降与微漏电排查">直流母线绝缘阻抗骤降与微漏电排查 (Insulation & Leakage)</option>
                          <option value="储能变流器(PCS)开关动态与IGBT热阻畸变">储能变流器(PCS)开关动态与IGBT热阻畸变 (Thermal Impedance)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-[#595959]">高频采样率与微秒级时钟对齐</label>
                        <select
                          value={diagTask.samplingRate}
                          onChange={(e) => setDiagTask({ ...diagTask, samplingRate: e.target.value })}
                          className="w-full px-3 py-1.5 bg-[#FAFAFA] border border-[#D9D9D9] rounded text-xs text-[#262626] focus:bg-white focus:border-[#722ED1] outline-none cursor-pointer font-mono"
                        >
                          <option value="100 Hz">100 Hz (微秒级高频录波 - 推荐)</option>
                          <option value="10 Hz">10 Hz (标准 BMS 遥测采样)</option>
                          <option value="1 kHz">1 kHz (变流器电网暂态与谐波录波)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[#595959]">异常表征描述 (作为先验约束条件)</label>
                      <textarea
                        value={diagTask.symptomDesc}
                        onChange={(e) => setDiagTask({ ...diagTask, symptomDesc: e.target.value })}
                        rows={2}
                        className="w-full p-2.5 bg-[#FAFAFA] border border-[#D9D9D9] rounded text-xs text-[#262626] focus:bg-white focus:border-[#722ED1] outline-none resize-none"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-[#F0F0F0]">
                      <span className="text-[11px] text-[#8C8C8C]">
                        配置完成后请载入高频录波文件以开展多物理场推演
                      </span>
                      <button
                        type="button"
                        onClick={() => setDiagSubTab('upload')}
                        className="px-4 py-1.5 bg-[#722ED1] hover:bg-[#531DAB] text-white rounded text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span>下一步：载入故障录波数据</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------ */}
                {/* 诊断子 TAB 2: 上传/载入故障录波与日志 */}
                {/* ------------------------------------------------------------ */}
                {diagSubTab === 'upload' && (
                  <div className="bg-white rounded-lg border border-[#E8E8E8] p-4.5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
                      <div className="flex items-center gap-2">
                        <UploadCloud className="w-4 h-4 text-[#722ED1]" />
                        <span className="font-bold text-xs text-[#1F1F1F]">载入故障录波与时序数据</span>
                      </div>
                      <span className="text-[11px] text-[#8C8C8C]">
                        支持 .bms_log, .csv, .dat, .h5 高频时序格式
                      </span>
                    </div>

                    {/* 拖拽上传区域 */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
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
                              samplingRate: '100 Hz (自适应)',
                              timeRange: '2026-08-25 08:00:00 ~ 10:00:00',
                              isUploaded: true
                            });
                            setIsUploading(false);
                            setStatusMessage(`已成功载入文件【${f.name}】！`);
                          }, 500);
                        }
                      }}
                      className={`p-6 border-2 border-dashed rounded-lg text-center transition-all ${
                        isDragOver 
                          ? 'border-[#722ED1] bg-purple-50/50' 
                          : 'border-[#D9D9D9] hover:border-[#722ED1] bg-[#FAFAFA]'
                      }`}
                    >
                      <input
                        type="file"
                        id="risk-file-upload-input"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <label htmlFor="risk-file-upload-input" className="cursor-pointer block space-y-2">
                        <div className="w-10 h-10 mx-auto rounded-full bg-purple-100 text-[#722ED1] flex items-center justify-center">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-[#722ED1] hover:underline">
                            点击浏览本地文件
                          </span>
                          <span className="text-xs text-[#8C8C8C]"> 或直接拖拽录波文件至此区域</span>
                        </div>
                        <p className="text-[11px] text-[#BFBFBF]">
                          系统将自动执行微秒级通道对其、丢失帧插值以及基线零漂修正
                        </p>
                      </label>
                    </div>

                    {/* 已载入文件详情 */}
                    {uploadedLog.isUploaded && (
                      <div className="p-3 bg-purple-50/40 rounded-lg border border-purple-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded bg-[#722ED1] text-white">
                            <FileCode className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-[#262626] font-mono">
                              {uploadedLog.name}
                            </div>
                            <div className="text-[11px] text-[#8C8C8C] flex items-center gap-2 mt-0.5">
                              <span>大小: {uploadedLog.size}</span>
                              <span>·</span>
                              <span>采样: {uploadedLog.samplingRate}</span>
                              <span>·</span>
                              <span>数据帧: {uploadedLog.frames}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-[#52C41A]">
                            ✓ 时序特征已解析
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 快捷选择预设真实故障波形 */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-semibold text-[#595959] block">
                        或快捷切换系统内典型工况录波数据源:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {presetLogs.map((log, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setUploadedLog({
                                ...log,
                                isUploaded: true
                              });
                              setDiagTask(prev => ({ ...prev, scenario: log.scenario }));
                              setStatusMessage(`已切换为预设波形: 【${log.name}】`);
                            }}
                            className={`p-2.5 rounded border cursor-pointer transition-all ${
                              uploadedLog.name === log.name
                                ? 'border-[#722ED1] bg-purple-50 text-[#722ED1]'
                                : 'border-[#E8E8E8] bg-[#FAFAFA] hover:border-purple-200 text-[#595959]'
                            }`}
                          >
                            <span className="font-semibold text-[11px] block truncate" title={log.name}>
                              {log.name}
                            </span>
                            <span className="text-[10px] text-[#8C8C8C] block mt-0.5">
                              {log.size} · {log.samplingRate}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-[#F0F0F0]">
                      <button
                        type="button"
                        onClick={() => setDiagSubTab('create')}
                        className="px-3 py-1.5 bg-white border border-[#D9D9D9] text-[#595959] rounded text-xs hover:text-[#262626] transition-colors cursor-pointer"
                      >
                        上一步
                      </button>

                      <button
                        type="button"
                        onClick={handleRunDiagnosisSimulation}
                        disabled={isSimulating}
                        className="px-5 py-1.5 bg-[#722ED1] hover:bg-[#531DAB] disabled:bg-purple-300 text-white rounded text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>启动 AI 故障机理仿真推演</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------ */}
                {/* 诊断子 TAB 3: 推演计算流水线 */}
                {/* ------------------------------------------------------------ */}
                {diagSubTab === 'pipeline' && (
                  <div className="bg-white rounded-lg border border-[#E8E8E8] p-4.5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-[#722ED1]" />
                        <span className="font-bold text-xs text-[#1F1F1F]">多物理场机理逆变与时序推演进度</span>
                      </div>
                      <span className="font-mono text-xs text-[#722ED1] font-bold">
                        {diagTask.progress}%
                      </span>
                    </div>

                    {/* 进度条 */}
                    <div className="w-full bg-[#F0F0F0] h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-[#722ED1] via-[#1890FF] to-[#52C41A] h-full transition-all duration-500 rounded-full"
                        style={{ width: `${diagTask.progress}%` }}
                      />
                    </div>

                    {/* 动态计算日志提示 */}
                    <div className="p-3 bg-[#FAFAFA] rounded-md border border-[#E8E8E8] text-xs text-[#595959] flex items-center gap-2 font-mono">
                      {isSimulating ? (
                        <RotateCcw className="w-4 h-4 text-[#722ED1] animate-spin shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-[#52C41A] shrink-0" />
                      )}
                      <span>{diagTask.stageText}</span>
                    </div>

                    {/* 4 阶段流水线卡片 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {[
                        { title: '阶段一：高频录波毫秒级对齐与去噪', desc: '微秒级时钟对齐、零漂校正与电压微分滤波', done: diagTask.progress >= 25 },
                        { title: '阶段二：电化学极化阻抗谱逆变求解', desc: '开路电压松弛曲线、接触内阻与欧姆极化计算', done: diagTask.progress >= 50 },
                        { title: '阶段三：多物理场焦耳热温升拓扑推演', desc: '结合瞬态充放电负荷计算端子与极柱导热平衡', done: diagTask.progress >= 80 },
                        { title: '阶段四：知识图谱根因定性与置信度评估', desc: '大模型根因定性、消缺策略生成与置信度收敛', done: diagTask.progress >= 100 }
                      ].map((stage, idx) => (
                        <div 
                          key={idx}
                          className={`p-3 rounded-lg border transition-all ${
                            stage.done 
                              ? 'border-green-200 bg-green-50/40 text-[#262626]' 
                              : 'border-[#E8E8E8] bg-[#FAFAFA] text-[#8C8C8C]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-xs">{stage.title}</span>
                            {stage.done ? (
                              <Check className="w-4 h-4 text-[#52C41A]" />
                            ) : (
                              <span className="text-[10px] text-gray-400">待执行</span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#595959]">{stage.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-[#F0F0F0]">
                      <button
                        type="button"
                        onClick={() => setDiagSubTab('upload')}
                        className="px-3 py-1.5 bg-white border border-[#D9D9D9] text-[#595959] rounded text-xs hover:text-[#262626] transition-colors cursor-pointer"
                      >
                        返回日志
                      </button>

                      {hasDiagnosed ? (
                        <button
                          type="button"
                          onClick={() => setDiagSubTab('result')}
                          className="px-4 py-1.5 bg-[#722ED1] text-white rounded text-xs font-semibold hover:bg-[#531DAB] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>查看完整诊断结论与证据链</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleRunDiagnosisSimulation}
                          disabled={isSimulating}
                          className="px-4 py-1.5 bg-[#722ED1] text-white rounded text-xs font-semibold hover:bg-[#531DAB] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>启动推演计算</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------ */}
                {/* 诊断子 TAB 4: 诊断结论详情与物理场特征矩阵 */}
                {/* ------------------------------------------------------------ */}
                {diagSubTab === 'result' && (
                  <div className="space-y-4">
                    {!hasDiagnosed ? (
                      /* 未推演时的空状态引导 */
                      <div className="bg-white rounded-lg border border-[#E8E8E8] p-8 text-center space-y-3 shadow-xs">
                        <div className="w-12 h-12 rounded-full bg-purple-50 text-[#722ED1] flex items-center justify-center mx-auto">
                          <BrainCircuit className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#1F1F1F]">当前尚未启动 AI 故障机理深度推演</h4>
                          <p className="text-xs text-[#8C8C8C] max-w-md mx-auto mt-1">
                            请在配置诊断任务并载入故障录波日志后，点击「启动推演」以生成多物理场阻抗计算与根因证据链。
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRunDiagnosisSimulation}
                          className="px-4 py-2 bg-[#722ED1] hover:bg-[#531DAB] text-white rounded text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>立即启动 AI 仿真推演</span>
                        </button>
                      </div>
                    ) : (
                      /* 已推演完成的丰富物理场诊断报告 */
                      <div className="space-y-4">
                        
                        {/* 核心诊断结论卡片 */}
                        <div className="bg-white rounded-lg border border-[#D3ADF7] p-4.5 space-y-3.5 shadow-xs relative overflow-hidden">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#722ED1] text-white flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  AI 物理机理诊断结论
                                </span>
                                <span className="text-xs text-[#52C41A] font-bold font-mono">
                                  综合置信度 {diagTask.confidence}%
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-[#1F1F1F] leading-snug pt-1">
                                根因定位：{diagTask.rootCause}
                              </h4>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => setShowFullReportModal(true)}
                                className="px-3 py-1.5 bg-white border border-[#722ED1] text-[#722ED1] hover:bg-purple-50 rounded text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>完整诊断报告</span>
                              </button>
                              
                              {!isConverted && (
                                <button
                                  type="button"
                                  onClick={handleAdoptAiDiagAndConvertToTicket}
                                  className="px-3 py-1.5 bg-[#722ED1] hover:bg-[#531DAB] text-white rounded text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                                >
                                  <PlusCircle className="w-3.5 h-3.5" />
                                  <span>采纳诊断转工单</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* 物理场量化特征矩阵 */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                            <div className="p-2.5 bg-[#FAFAFA] rounded border border-[#E8E8E8]">
                              <span className="text-[11px] text-[#8C8C8C] block">接触内阻实测估算</span>
                              <span className="text-xs font-bold text-[#F5222D] font-mono">0.38 mΩ (+32.4%)</span>
                              <span className="text-[10px] text-[#8C8C8C] block">标准基线: ≤0.25 mΩ</span>
                            </div>
                            <div className="p-2.5 bg-[#FAFAFA] rounded border border-[#E8E8E8]">
                              <span className="text-[11px] text-[#8C8C8C] block">极柱实测温差 ΔT</span>
                              <span className="text-xs font-bold text-[#FA8C16] font-mono">9.4 ℃</span>
                              <span className="text-[10px] text-[#8C8C8C] block">正常容限: ≤3.0 ℃</span>
                            </div>
                            <div className="p-2.5 bg-[#FAFAFA] rounded border border-[#E8E8E8]">
                              <span className="text-[11px] text-[#8C8C8C] block">紧固力矩评估</span>
                              <span className="text-xs font-bold text-[#F5222D] font-mono">4.2 N·m</span>
                              <span className="text-[10px] text-[#8C8C8C] block">出厂标准: 10.0±0.5 N·m</span>
                            </div>
                            <div className="p-2.5 bg-[#FAFAFA] rounded border border-[#E8E8E8]">
                              <span className="text-[11px] text-[#8C8C8C] block">演化劣化趋势</span>
                              <span className="text-xs font-bold text-[#D46B08]">急剧恶化 (指数型)</span>
                              <span className="text-[10px] text-[#8C8C8C] block">剩余安全窗口: 48 小时</span>
                            </div>
                          </div>
                        </div>

                        {/* 诊断机理建议策略 */}
                        <div className="bg-white rounded-lg border border-[#E8E8E8] p-4 space-y-2.5 shadow-xs">
                          <span className="font-bold text-xs text-[#1F1F1F] block">AI 推荐的现场消缺闭环动作：</span>
                          <div className="space-y-1.5 text-xs text-[#595959]">
                            <div className="flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-purple-100 text-[#722ED1] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                              <span>使用数显扭矩扳手对预警极柱螺栓按 10.0 N·m 重新紧固，清除端子氧化层并涂布极薄层导电膏。</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-purple-100 text-[#722ED1] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                              <span>在 0.5C 充放电工况下使用红外热像仪连续点温复测 30 分钟，确认温升 ΔT 回落至 2.5℃ 以内。</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-purple-100 text-[#722ED1] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                              <span>下发平台 BMS 主动均衡与容量重标定指令，消除单体极化压差。</span>
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
            {/* TAB 4: 风险特征与时序证据 */}
            {/* ============================================================== */}
            {mainTab === 'telemetry' && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg border border-[#E8E8E8] p-4.5 space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#1890FF]" />
                      <span className="font-bold text-xs text-[#1F1F1F]">主动运维平台 · 时序量化证据链</span>
                    </div>
                    <span className="text-[11px] text-[#8C8C8C]">
                      微秒级遥测与特征工程
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-[#FAFAFA] rounded-md border border-[#E8E8E8] text-xs">
                    <div>
                      <span className="text-[#8C8C8C] block text-[11px]">关联电站</span>
                      <span className="font-medium text-[#1F1F1F]">{risk.stationName}</span>
                    </div>
                    <div>
                      <span className="text-[#8C8C8C] block text-[11px]">所属区域</span>
                      <span className="text-[#595959]">{risk.region}区域</span>
                    </div>
                    <div>
                      <span className="text-[#8C8C8C] block text-[11px]">风险分类</span>
                      <span className="font-medium text-[#1F1F1F]">{risk.category}</span>
                    </div>
                    <div>
                      <span className="text-[#8C8C8C] block text-[11px]">算法置信度</span>
                      <span className="font-medium text-[#722ED1]">{risk.confidence ?? 95}%</span>
                    </div>
                    <div>
                      <span className="text-[#8C8C8C] block text-[11px]">发现时间</span>
                      <span className="text-[#595959]">{risk.discoveredAt}</span>
                    </div>
                    <div>
                      <span className="text-[#8C8C8C] block text-[11px]">区域责任人</span>
                      <span className="font-medium text-[#1890FF]">{risk.assignee}</span>
                    </div>
                  </div>

                  {risk.evidence && (
                    <div className="p-3 bg-[#FFFBE6]/60 rounded-md border border-[#FFE58F] space-y-2">
                      <span className="text-xs font-bold text-[#D48806] block">越限指标与时序偏离度</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-[#8C8C8C] block text-[11px]">监测指标</span>
                          <span className="font-medium text-[#262626]">{risk.evidence.metric}</span>
                        </div>
                        <div>
                          <span className="text-[#8C8C8C] block text-[11px]">当前实测值</span>
                          <span className="font-bold text-[#F5222D] font-mono">{risk.evidence.value}</span>
                        </div>
                        <div>
                          <span className="text-[#8C8C8C] block text-[11px]">正常基线阈值</span>
                          <span className="font-mono text-[#595959]">{risk.evidence.threshold}</span>
                        </div>
                        <div>
                          <span className="text-[#8C8C8C] block text-[11px]">时序偏离趋势</span>
                          <span className="font-medium text-[#FA8C16]">{risk.evidence.trend}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-[#1F1F1F] block">物理成因与机理分析：</span>
                    <p className="text-xs text-[#595959] leading-relaxed bg-[#FAFAFA] p-3 rounded border border-[#E8E8E8]">
                      {risk.symptomDetail}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 5: 研判流转与转工单 */}
            {/* ============================================================== */}
            {mainTab === 'process' && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg border border-[#E8E8E8] p-4.5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
                    <div className="flex items-center gap-2">
                      <PlusCircle className="w-4 h-4 text-[#1890FF]" />
                      <span className="font-bold text-xs text-[#1F1F1F]">风险处置与工单闭环派发</span>
                    </div>
                    <span className="text-xs text-[#8C8C8C]">
                      对接 pcare 主动消缺流转体系
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#262626]">处置记录与派工消缺指导说明</label>
                      <textarea
                        value={handleNote}
                        onChange={(e) => setHandleNote(e.target.value)}
                        placeholder="请输入派发说明，或在【标准处理方案】、【相似案例】、【故障诊断】中一键采纳填入..."
                        rows={6}
                        className="w-full p-3 bg-[#FAFAFA] border border-[#D9D9D9] rounded-md text-xs text-[#262626] focus:bg-white focus:border-[#1890FF] outline-none resize-none leading-relaxed"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleEliminate}
                        disabled={isProcessing || isConverted}
                        className="px-4 py-2 bg-white border border-[#D9D9D9] hover:border-[#52C41A] text-[#595959] hover:text-[#52C41A] rounded text-xs font-medium transition-colors cursor-pointer"
                      >
                        标记风险已消除
                      </button>

                      {!isConverted ? (
                        <button
                          type="button"
                          onClick={() => {
                            onConvertToTicket?.(risk, handleNote);
                            setStatusMessage(`风险 ${risk.id} 已成功转为工单派发！`);
                          }}
                          disabled={isProcessing}
                          className="px-5 py-2 bg-[#FA8C16] hover:bg-[#FFA940] text-white rounded text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>立即转为 pcare 工单派发</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => risk.linkedTicketId && onJumpToTicket?.(risk.linkedTicketId)}
                          className="px-4 py-2 bg-[#F6FFED] border border-[#B7EB8F] text-[#52C41A] rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>查看已关联工单 ({risk.linkedTicketId})</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* 抽屉底部固定操作栏 */}
          <div className="px-5 py-3 border-t border-[#E8E8E8] bg-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs text-[#8C8C8C]">
              <span className="font-mono">{risk.id}</span>
              <span>·</span>
              <span>{risk.stationName}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 bg-white border border-[#D9D9D9] text-[#595959] hover:text-[#262626] rounded text-xs font-medium transition-colors cursor-pointer"
              >
                关闭
              </button>

              {!isConverted ? (
                <button
                  type="button"
                  onClick={handleAdoptSopAndConvertToTicket}
                  className="px-4 py-1.5 bg-[#FA8C16] hover:bg-[#FFA940] text-white rounded text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>采纳方案转工单</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => risk.linkedTicketId && onJumpToTicket?.(risk.linkedTicketId)}
                  className="px-3.5 py-1.5 bg-[#F6FFED] border border-[#B7EB8F] text-[#52C41A] rounded text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>查看工单 {risk.linkedTicketId}</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 历史案例详情弹窗 */}
      {activeCaseModal && (
        <div className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-150">
          <div className="bg-white rounded-lg max-w-xl w-full border border-[#D9D9D9] shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E8]">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-purple-100 text-[#722ED1] text-xs font-bold">
                  相似度 {activeCaseModal.similarity}%
                </span>
                <h3 className="text-sm font-bold text-[#1F1F1F]">
                  {activeCaseModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveCaseModal(null)}
                className="text-[#8C8C8C] hover:text-[#262626] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-[#262626]">
              <div className="p-3 bg-[#FAFAFA] rounded border border-[#E8E8E8] space-y-1">
                <span className="text-[#8C8C8C] block text-[11px]">电站与设备信息:</span>
                <span className="font-medium">{activeCaseModal.stationName} · {activeCaseModal.deviceType}</span>
              </div>

              <div className="p-3 bg-red-50/50 rounded border border-red-200 space-y-1">
                <span className="text-[#F5222D] block font-semibold text-[11px]">故障现象 (Symptom):</span>
                <p className="text-xs leading-relaxed">{activeCaseModal.reportedSymptom}</p>
              </div>

              <div className="p-3 bg-orange-50/50 rounded border border-orange-200 space-y-1">
                <span className="text-[#D46B08] block font-semibold text-[11px]">实际查明根因 (Root Cause):</span>
                <p className="text-xs leading-relaxed">{activeCaseModal.actualRootCause}</p>
              </div>

              <div className="p-3 bg-blue-50/50 rounded border border-blue-200 space-y-1">
                <span className="text-[#0050B3] block font-semibold text-[11px]">现场消缺措施 (Action):</span>
                <p className="text-xs leading-relaxed">{activeCaseModal.resolutionAction}</p>
              </div>

              <div className="p-3 bg-green-50/50 rounded border border-green-200 space-y-1">
                <span className="text-[#389E0D] block font-semibold text-[11px]">长效预防与运维建议 (Prevention):</span>
                <p className="text-xs leading-relaxed">{activeCaseModal.preventionTip}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E8E8E8]">
              <span className="text-[11px] text-[#8C8C8C]">
                解决耗时: {activeCaseModal.resolutionTime} · 消缺人: {activeCaseModal.resolvedBy}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCaseModal(null)}
                  className="px-3 py-1.5 bg-white border border-[#D9D9D9] text-[#595959] rounded text-xs hover:text-[#262626] cursor-pointer"
                >
                  关闭
                </button>
                <button
                  type="button"
                  onClick={() => handleAdoptCaseAndConvertToTicket(activeCaseModal)}
                  className="px-3.5 py-1.5 bg-[#1890FF] text-white rounded text-xs font-semibold hover:bg-[#40A9FF] cursor-pointer shadow-xs"
                >
                  借鉴此方案转工单
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 完整机理诊断报告全屏弹窗 */}
      {showFullReportModal && (
        <div className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-3xl w-full border border-[#D9D9D9] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E8]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded bg-purple-100 text-[#722ED1]">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1F1F1F]">
                    AI 多物理场电化学机理深度诊断全量分析报告
                  </h3>
                  <span className="text-xs text-[#8C8C8C] font-mono">
                    报告编号: REP-{diagTask.id} · 生成时间: 2026-08-25 10:45:00
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFullReportModal(false)}
                className="text-[#8C8C8C] hover:text-[#262626] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-[#262626] max-h-[65vh] overflow-y-auto pr-1">
              <div className="p-3.5 bg-purple-50/50 rounded-lg border border-purple-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#722ED1]">一、物理故障机理根因定性</span>
                  <span className="text-xs font-bold text-[#52C41A] font-mono">置信度 97.8%</span>
                </div>
                <p className="text-xs leading-relaxed text-[#262626]">
                  {diagTask.rootCause}。根据频域阻抗分析（EIS），该极柱欧姆接触阻抗偏离同簇基线均值 +32.4%，大电流充放电下局部热通量集中，焦耳热功率达 28.5W，引发单体端子温升达 9.4℃。
                </p>
              </div>

              <div className="p-3.5 bg-[#FAFAFA] rounded-lg border border-[#E8E8E8] space-y-2">
                <span className="font-bold text-xs text-[#1F1F1F] block">二、时序高频特征与阻抗拓扑计算结果</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="bg-white p-2 rounded border border-[#E8E8E8]">
                    <span className="text-[10px] text-[#8C8C8C] block">接触电阻 R_contact</span>
                    <span className="font-bold text-[#F5222D]">0.38 mΩ</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-[#E8E8E8]">
                    <span className="text-[10px] text-[#8C8C8C] block">等效紧固力矩 Torque</span>
                    <span className="font-bold text-[#F5222D]">4.2 N·m</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-[#E8E8E8]">
                    <span className="text-[10px] text-[#8C8C8C] block">实测焦耳发热功率 P_loss</span>
                    <span className="font-bold text-[#FA8C16]">28.5 W</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-[#E8E8E8]">
                    <span className="text-[10px] text-[#8C8C8C] block">温升速率 dT/dt</span>
                    <span className="font-bold text-[#FA8C16]">0.18 ℃/min</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-green-50/50 rounded-lg border border-green-200 space-y-2">
                <span className="font-bold text-xs text-[#389E0D] block">三、标准化消缺闭环与防范策略</span>
                <p className="text-xs leading-relaxed text-[#262626]">
                  1. 断开直流开关验电放电后，使用数显扭矩扳手重新紧固螺栓至 10.0±0.5 N·m；<br />
                  2. 涂抹紫铜导电防氧化硅脂，并使用红外热像仪在 0.5C 带载验证温差；<br />
                  3. 平台在线下发主动均衡参数修正，消除单体 SOC 极化偏差。
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E8E8E8]">
              <button
                type="button"
                onClick={() => alert('报告导出完成（PDF格式）')}
                className="px-3.5 py-1.5 bg-white border border-[#D9D9D9] hover:border-[#1890FF] text-[#595959] hover:text-[#1890FF] rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>导出 PDF 详报</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFullReportModal(false)}
                  className="px-3.5 py-1.5 bg-white border border-[#D9D9D9] text-[#595959] rounded text-xs hover:text-[#262626] cursor-pointer"
                >
                  关闭
                </button>
                <button
                  type="button"
                  onClick={handleAdoptAiDiagAndConvertToTicket}
                  className="px-4 py-1.5 bg-[#722ED1] text-white rounded text-xs font-semibold hover:bg-[#531DAB] cursor-pointer shadow-xs"
                >
                  采纳诊断并转工单
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
