import React, { useState, useEffect } from 'react';
import { RiskItem, CONFIG_THRESHOLDS } from '../../types';
import { RiskTypeBadge, RiskStatusBadge, PriorityBadge, RiskScoreBadge } from '../common/Badges';
import { 
  ArrowLeft, 
  ShieldAlert, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  PlusCircle, 
  FileText, 
  ExternalLink,
  Cpu,
  Activity,
  Layers,
  SearchCheck,
  BookOpen,
  FolderGit2,
  BrainCircuit,
  SlidersHorizontal,
  UploadCloud,
  FileCode,
  Play,
  RotateCcw,
  Check,
  Eye,
  Download,
  CheckSquare,
  ShieldCheck,
  X,
  Printer,
  ChevronRight,
  Flame,
  Zap,
  Info,
  Clock,
  Building2,
  UserCheck,
  History,
  MessageSquare,
  Wrench,
  CheckCheck,
  Sliders,
  Copy,
  ThumbsUp,
  ThumbsDown,
  BookmarkPlus,
  Send,
  HelpCircle
} from 'lucide-react';

interface RiskDetailViewProps {
  risk: RiskItem;
  onBack: () => void;
  backButtonLabel?: string;
  onConvertToTicket: (risk: RiskItem, customNote?: string) => void;
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

export const RiskDetailView: React.FC<RiskDetailViewProps> = ({
  risk,
  onBack,
  backButtonLabel = '返回风险中心',
  onConvertToTicket,
  onEliminateRisk,
  onJumpToTicket
}) => {
  const isConverted = risk.status === '已转工单';
  const isEliminated = risk.status === '已消除';

  // 主选项卡：
  // 'troubleshoot' (排查与标准处理方案 SOP - 默认首选)
  // 'cases' (相似案例借鉴)
  // 'diagnosis' (AI 故障机理诊断 - 任务配置/日志上传/推演/结果)
  // 'telemetry' (风险特征与时序证据)
  // 'process' (研判处置与生命周期闭环)
  const [activeTab, setActiveTab] = useState<'troubleshoot' | 'cases' | 'diagnosis' | 'telemetry' | 'process'>('troubleshoot');

  // AI 诊断状态
  const [hasDiagnosed, setHasDiagnosed] = useState<boolean>(false);
  const [diagSubTab, setDiagSubTab] = useState<'create' | 'upload' | 'pipeline' | 'result'>('create');
  const [isSimulating, setIsSimulating] = useState(false);
  const [diagProgress, setDiagProgress] = useState(0);
  const [diagStageText, setDiagStageText] = useState('准备就绪，待启动 AI 诊断流水线');

  // 弹窗状态
  const [activeCaseModal, setActiveCaseModal] = useState<SimilarHistoricalCase | null>(null);
  const [showFullReportModal, setShowFullReportModal] = useState(false);
  const [showEliminateModal, setShowEliminateModal] = useState(false);
  const [eliminateReason, setEliminateReason] = useState('经现场巡检与高频阻抗测试，实测特征参数已恢复正常安全基线，消除风险。');

  // 处置备注
  const [handleNote, setHandleNote] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // 案例点赞/点踩反馈状态 (key: caseId, value: 'up' | 'down' | null)
  const [caseFeedback, setCaseFeedback] = useState<Record<string, 'up' | 'down'>>({
    'CASE-2026-0312': 'up'
  });
  // 案例反馈原因记录
  const [caseFeedbackNotes, setCaseFeedbackNotes] = useState<Record<string, string>>({});
  const [activeFeedbackModalCase, setActiveFeedbackModalCase] = useState<{ id: string; title: string; type: 'up' | 'down' } | null>(null);
  const [feedbackNoteInput, setFeedbackNoteInput] = useState('');

  // AI 诊断结果点赞/点踩反馈状态 ('up' | 'down' | null)
  const [diagFeedback, setDiagFeedback] = useState<'up' | 'down' | null>(null);
  const [diagFeedbackNote, setDiagFeedbackNote] = useState<string>('');
  const [showDiagFeedbackModal, setShowDiagFeedbackModal] = useState<boolean>(false);
  const [diagFeedbackType, setDiagFeedbackType] = useState<'up' | 'down'>('up');

  // 一键转为案例弹窗状态
  const [showSaveAsCaseModal, setShowSaveAsCaseModal] = useState(false);
  const [newCaseData, setNewCaseData] = useState({
    title: '',
    stationName: '',
    deviceType: '',
    reportedSymptom: '',
    actualRootCause: '',
    resolutionAction: '',
    preventionTip: '',
    isPublic: true,
    tags: 'AI诊断沉淀, 接触内阻, 极柱过热'
  });
  const [customCasesList, setCustomCasesList] = useState<SimilarHistoricalCase[]>([]);

  // 诊断任务状态
  const [diagTask, setDiagTask] = useState({
    id: 'DIAG-20260825-RK01',
    name: '',
    station: '',
    device: '',
    scenario: '极柱过热与接触内阻劣变分析',
    model: '电化学机理与多物理场大模型混合分析引擎 V4.2',
    samplingRate: '100 Hz (微秒级高频录波)',
    status: '就绪' as '就绪' | '分析中' | '已完成' | '已失败',
    confidence: 97.8,
    riskScore: risk.riskScore,
    duration: '1.4 秒'
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

  // 拖拽与上传状态
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 获取当前风险对应的 SOP 与案例
  const { sop: recommendedSop, cases: recommendedCases } = getRecommendedSopAndCasesForRisk(risk);

  useEffect(() => {
    setHasDiagnosed(false);
    setActiveTab('troubleshoot');
    setDiagSubTab('create');
    const targetDevice = `${risk.stationId}-Rack-01`;
    setDiagTask({
      id: `DIAG-20260825-${risk.id.replace(/[^0-9]/g, '').slice(-4) || '101'}`,
      name: `【${risk.id}】${risk.stationName} - ${risk.title.replace(/【.*?】/, '')} 深度机理诊断`,
      station: risk.stationName,
      device: targetDevice,
      scenario: risk.title.includes('PCS') || risk.title.includes('IGBT')
        ? '储能变流器(PCS)开关动态与IGBT热阻畸变'
        : risk.title.includes('绝缘')
        ? '高压直流母线对地微变绝缘阻抗劣化'
        : '电芯极柱接触内阻突变与焦耳发热推演',
      model: '电化学机理与多物理场大模型混合分析引擎 V4.2',
      samplingRate: '100 Hz (微秒级高频录波)',
      status: '就绪',
      confidence: 97.8,
      riskScore: risk.riskScore,
      duration: '1.4 秒'
    });
  }, [risk]);

  // 运行 AI 仿真诊断流水线
  const handleRunDiagnosis = () => {
    setIsSimulating(true);
    setActiveTab('diagnosis');
    setDiagSubTab('pipeline');
    setDiagProgress(15);
    setDiagStageText('① 正在解析 BMS 高频录波时序，执行微秒级通道对齐与去噪校验...');

    setTimeout(() => {
      setDiagProgress(48);
      setDiagStageText('② 正在构建电化学阻抗谱 (EIS) 逆变矩阵，剥离欧姆内阻与极化过电位...');
    }, 700);

    setTimeout(() => {
      setDiagProgress(82);
      setDiagStageText('③ 正在执行流固热多物理场瞬态焦耳发热仿真与知识图谱根因溯源...');
    }, 1400);

    setTimeout(() => {
      setDiagProgress(100);
      setDiagStageText('④ 诊断推演完成！综合置信度 97.8%，消缺 SOP 与置信度证据链已生成');
      setIsSimulating(false);
      setHasDiagnosed(true);
      setDiagSubTab('result');
      setStatusMessage('AI 故障机理诊断推演已完成，成功生成完整诊断报告与证据链！');
    }, 2100);
  };

  // 采纳 SOP 转工单
  const handleAdoptSop = () => {
    const text = `【采纳排查处置 SOP · ${recommendedSop.category}】\n安全红线：${recommendedSop.safetyNotice}\n所需工器具：${recommendedSop.toolsRequired.join('、')}\n\n标准实施步骤：\n${recommendedSop.steps.map((s) => `${s.step}. ${s.title}: ${s.detail} (判据: ${s.keyCheck})`).join('\n')}\n\n验收标准：${recommendedSop.acceptanceCriteria}`;
    onConvertToTicket(risk, text);
    setStatusMessage('已成功采纳标准排查 SOP 方案并一键转为 pcare 工单！');
  };

  // 采纳案例转工单
  const handleAdoptCase = (c: SimilarHistoricalCase) => {
    const text = `【借鉴历史相似案例消缺经验 · ${c.id}】\n参考案例：${c.title} (${c.stationName})\n相似度：${c.similarity}%\n查明真实根因：${c.actualRootCause}\n消缺处置方案：${c.resolutionAction}\n长效防范策略：${c.preventionTip}`;
    onConvertToTicket(risk, text);
    setActiveCaseModal(null);
    setStatusMessage(`已成功引用案例 [${c.id}] 方案并一键转为 pcare 工单！`);
  };

  // 采纳 AI 诊断结论转工单
  const handleAdoptAiDiag = () => {
    const text = `【采纳 AI 多物理场机理诊断结论 (置信度 97.8%)】\n诊断任务：${diagTask.id} (${diagTask.model})\n设备定位：${diagTask.station} - ${diagTask.device}\n根因定性：${risk.stationId}-Rack-01 极柱螺栓预紧力衰减，导致接触内阻增加 +32.4%，大电流充放电产生局部焦耳热（ΔT=9.4℃）。\n推荐消缺：使用数显扭矩扳手重新校准紧固至 10.0 N·m，清理氧化层涂抹导电硅脂，并在 0.5C 带载监测红外点温。`;
    onConvertToTicket(risk, text);
    setShowFullReportModal(false);
    setStatusMessage('已成功采纳 AI 故障机理诊断报告并一键转为 pcare 工单！');
  };

  // 点赞/点踩案例
  const handleToggleCaseFeedback = (caseId: string, caseTitle: string, type: 'up' | 'down') => {
    const current = caseFeedback[caseId];
    if (current === type) {
      // 取消反馈
      const next = { ...caseFeedback };
      delete next[caseId];
      setCaseFeedback(next);
      setStatusMessage(`已撤销对案例 [${caseId}] 的评价反馈。`);
    } else {
      // 打开反馈附注弹窗或直接记录
      setActiveFeedbackModalCase({ id: caseId, title: caseTitle, type });
      setFeedbackNoteInput(caseFeedbackNotes[caseId] || '');
    }
  };

  // 提交案例反馈
  const handleSaveCaseFeedback = () => {
    if (!activeFeedbackModalCase) return;
    const { id, type } = activeFeedbackModalCase;
    setCaseFeedback((prev) => ({ ...prev, [id]: type }));
    if (feedbackNoteInput.trim()) {
      setCaseFeedbackNotes((prev) => ({ ...prev, [id]: feedbackNoteInput.trim() }));
    }
    setActiveFeedbackModalCase(null);
    setStatusMessage(
      type === 'up' 
        ? `感谢反馈！已标记案例 [${id}] 为【可用/有参考价值】，将提升该类特征在全局案例库中的推荐权重。`
        : `已收集反馈！已标记案例 [${id}] 为【错误/不适用】，模型将自动降权并记录专家修正建议。`
    );
  };

  // 点赞/点踩 AI 诊断结论
  const handleToggleDiagFeedback = (type: 'up' | 'down') => {
    if (diagFeedback === type) {
      setDiagFeedback(null);
      setStatusMessage('已撤销对本次 AI 诊断推演结论的评价反馈。');
    } else {
      setDiagFeedbackType(type);
      setShowDiagFeedbackModal(true);
    }
  };

  // 提交 AI 诊断反馈
  const handleSaveDiagFeedback = () => {
    setDiagFeedback(diagFeedbackType);
    setShowDiagFeedbackModal(false);
    setStatusMessage(
      diagFeedbackType === 'up'
        ? '感谢反馈！已确认本次 AI 机理诊断结论【准确无误】，该诊断证据链已自动纳入专家基准库！'
        : '已收集反馈！已标记本次 AI 诊断结果为【存在偏差/错误】，系统已捕获时序特征样本并提交算法团队复核调优。'
    );
  };

  // 准备将 AI 诊断一键沉淀转为历史案例
  const handleOpenSaveAsCaseModal = () => {
    setNewCaseData({
      title: `【${risk.stationName}】${risk.title.replace(/【.*?】/, '')} 深度诊断消缺案例`,
      stationName: risk.stationName,
      deviceType: `${risk.stationId}-Rack-01 (电芯极柱连接模组)`,
      reportedSymptom: risk.symptomDetail || '单体极柱接触内阻偏离基线，大电流充放电时温升 ΔT 持续发散 (8.5℃)。',
      actualRootCause: '微秒级高频阻抗逆变判定极柱连接螺栓预紧力衰减，导致接触电阻增大(+32.4%)，引发局部 28.5W 焦耳发热。',
      resolutionAction: '使用数显扭矩扳手重新校准紧固至 10.0±0.5 N·m，清理极柱氧化层并均匀涂抹高导电防氧化紫铜硅脂。',
      preventionTip: '每季度红外热像巡检对比充放电温差，并在检修期按标准力矩复核关键螺栓接触压紧力。',
      isPublic: true,
      tags: 'AI诊断沉淀, 接触内阻, 极柱过热, 标准SOP'
    });
    setShowSaveAsCaseModal(true);
  };

  // 确认保存为历史案例
  const handleConfirmSaveAsCase = () => {
    if (!newCaseData.title.trim()) {
      setStatusMessage('案例标题不能为空！');
      return;
    }
    const newCaseItem: SimilarHistoricalCase = {
      id: `CASE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newCaseData.title,
      stationName: newCaseData.stationName,
      deviceType: newCaseData.deviceType,
      similarity: 99,
      reportedSymptom: newCaseData.reportedSymptom,
      actualRootCause: newCaseData.actualRootCause,
      resolutionAction: newCaseData.resolutionAction,
      resolutionTime: '1.5 小时 (AI辅助加速)',
      resolvedBy: `${risk.assignee || '现场值守工程师'} (AI机理沉淀)`,
      preventionTip: newCaseData.preventionTip
    };

    setCustomCasesList((prev) => [newCaseItem, ...prev]);
    // 默认标记为可用案例
    setCaseFeedback((prev) => ({ ...prev, [newCaseItem.id]: 'up' }));
    setShowSaveAsCaseModal(false);
    setStatusMessage(`🎉 成功将本次 AI 诊断结论沉淀为全局知识库案例 [${newCaseItem.id}]！已支持全局检索与经验借鉴。`);
    // 自动切换到案例 tab 方便查看
    setActiveTab('cases');
  };

  // 确认消除风险
  const handleConfirmEliminate = () => {
    if (onEliminateRisk) {
      onEliminateRisk(risk.id, eliminateReason);
      setShowEliminateModal(false);
      setStatusMessage(`风险 [${risk.id}] 已标记为已消除！`);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* 顶部面包屑与标题栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded border border-[#E8E8E8] shadow-none">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-[#D9D9D9] text-[#595959] hover:text-[#1890FF] hover:border-[#1890FF] text-xs font-medium cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#8C8C8C]" />
            <span>{backButtonLabel}</span>
          </button>
          <div className="h-4 w-px bg-[#E8E8E8]" />
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[#FFF7E6] text-[#FA8C16] border border-[#FFD591]">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8C8C8C]">风险中心 / 算法深度分析</span>
                <span className="text-[#D9D9D9]">/</span>
                <span className="font-mono text-xs font-bold text-[#1F1F1F]">{risk.id}</span>
                <span className="text-[10px] text-[#FA8C16] bg-[#FFFBE6] px-1.5 py-0.2 rounded border border-[#FFE58F] font-medium">
                  下钻全景视图
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 顶部右侧快捷操作 */}
        <div className="flex items-center gap-2">
          {!isConverted && !isEliminated && (
            <>
              <button
                type="button"
                onClick={() => setShowEliminateModal(true)}
                className="px-3 py-1.5 bg-white border border-[#D9D9D9] text-[#595959] hover:text-[#52C41A] hover:border-[#52C41A] rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#52C41A]" />
                <span>标记消除</span>
              </button>
              <button
                type="button"
                onClick={() => onConvertToTicket(risk, handleNote || undefined)}
                className="px-3.5 py-1.5 bg-[#FA8C16] hover:bg-[#FFA940] text-white rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>转为 pcare 工单</span>
              </button>
            </>
          )}

          {isConverted && (
            <button
              type="button"
              onClick={() => risk.linkedTicketId && onJumpToTicket?.(risk.linkedTicketId)}
              className="px-3.5 py-1.5 bg-[#F6FFED] hover:bg-[#D9F7BE] text-[#52C41A] border border-[#B7EB8F] rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#52C41A]" />
              <span>查看关联工单 ({risk.linkedTicketId})</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </button>
          )}

          {isEliminated && (
            <span className="px-3 py-1 bg-[#F5F5F5] border border-[#E8E8E8] text-[#8C8C8C] text-xs font-medium rounded flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-[#8C8C8C]" />
              <span>已消除</span>
            </span>
          )}
        </div>
      </div>

      {/* 提示消息 */}
      {statusMessage && (
        <div className="flex items-center justify-between p-3 bg-[#E6F7FF] border border-[#91D5FF] text-[#0050B3] text-xs rounded animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1890FF] shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setStatusMessage(null)}
            className="text-[#8C8C8C] hover:text-[#262626] cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 风险详报主卡片 */}
      <div className="bg-white rounded-lg border border-[#E8E8E8] overflow-hidden shadow-none">
        {/* Header 风险概览 */}
        <div className="p-4 bg-[#FAFAFA] border-b border-[#E8E8E8] space-y-2.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-[#1F1F1F] text-sm bg-white px-2 py-0.5 rounded border border-[#D9D9D9]">
                {risk.id}
              </span>
              <RiskTypeBadge type={risk.type} />
              <PriorityBadge priority={risk.priority} />
              <RiskScoreBadge score={risk.riskScore} />
              <RiskStatusBadge status={risk.status} linkedTicketId={risk.linkedTicketId} />
              {risk.confidence && (
                <span className="text-xs text-[#722ED1] bg-[#F9F0FF] px-2 py-0.5 rounded border border-[#D3ADF7] font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#722ED1]" />
                  置信度 {risk.confidence}%
                </span>
              )}
            </div>

            <div className="text-xs text-[#8C8C8C] flex items-center gap-3">
              <span>发现时间: <strong className="text-[#595959]">{risk.discoveredAt}</strong></span>
              <span>责任人: <strong className="text-[#595959]">{risk.assignee}</strong></span>
            </div>
          </div>

          <div>
            <h1 className="text-base font-bold text-[#1F1F1F] leading-tight">
              {risk.title}
            </h1>
            <p className="text-xs text-[#595959] mt-1 leading-relaxed">
              {risk.symptomDetail || '该电站遥测数据持续偏离基线特征，系统算法主动捕捉潜在劣化风险。'}
            </p>
          </div>

          {/* 属性元数据栏 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#F0F0F0] text-xs">
            <div className="bg-white p-2 rounded border border-[#E8E8E8]">
              <span className="text-[#8C8C8C] text-[11px] block">所属电站</span>
              <span className="font-medium text-[#262626] truncate block">{risk.stationName}</span>
            </div>
            <div className="bg-white p-2 rounded border border-[#E8E8E8]">
              <span className="text-[#8C8C8C] text-[11px] block">区域归属</span>
              <span className="font-medium text-[#262626]">{risk.region} 区域</span>
            </div>
            <div className="bg-white p-2 rounded border border-[#E8E8E8]">
              <span className="text-[#8C8C8C] text-[11px] block">预警类别</span>
              <span className="font-medium text-[#262626]">{risk.category}</span>
            </div>
            <div className="bg-white p-2 rounded border border-[#E8E8E8]">
              <span className="text-[#8C8C8C] text-[11px] block">目标设备</span>
              <span className="font-mono font-medium text-[#1890FF]">{risk.stationId}-Rack-01</span>
            </div>
          </div>
        </div>

        {/* 选项卡切换栏 (与控制台风险预警「去分析」完全一致) */}
        <div className="px-4 border-b border-[#E8E8E8] bg-white flex items-center gap-2 overflow-x-auto">
          {/* TAB 1: 标准处理方案 (SOP) */}
          <button
            type="button"
            onClick={() => setActiveTab('troubleshoot')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'troubleshoot'
                ? 'border-[#FA8C16] text-[#FA8C16] bg-orange-50/40'
                : 'border-transparent text-[#595959] hover:text-[#262626]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#FA8C16]" />
            <span>排查与标准处理方案 (SOP)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-orange-100 text-[#D46B08] font-normal">
              首选推荐
            </span>
          </button>

          {/* TAB 2: 相似历史案例 */}
          <button
            type="button"
            onClick={() => setActiveTab('cases')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'cases'
                ? 'border-[#1890FF] text-[#1890FF] bg-blue-50/40'
                : 'border-transparent text-[#595959] hover:text-[#262626]'
            }`}
          >
            <FolderGit2 className="w-4 h-4 text-[#1890FF]" />
            <span>历史相似案例库</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-[#1890FF] font-normal">
              {recommendedCases.length} 案例
            </span>
          </button>

          {/* TAB 3: AI 故障机理诊断 */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('diagnosis');
              if (!hasDiagnosed) setDiagSubTab('create');
              else setDiagSubTab('result');
            }}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'diagnosis'
                ? 'border-[#722ED1] text-[#722ED1] bg-purple-50/40'
                : 'border-transparent text-[#595959] hover:text-[#262626]'
            }`}
          >
            <BrainCircuit className="w-4 h-4 text-[#722ED1]" />
            <span>AI 故障机理深度诊断</span>
            {hasDiagnosed ? (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#722ED1] text-white font-mono">
                已推演 97.8%
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-100 text-[#8C8C8C]">
                4 步流转
              </span>
            )}
          </button>

          {/* TAB 4: 时序特征与量化证据链 */}
          <button
            type="button"
            onClick={() => setActiveTab('telemetry')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'telemetry'
                ? 'border-[#1890FF] text-[#1890FF] bg-blue-50/40'
                : 'border-transparent text-[#595959] hover:text-[#262626]'
            }`}
          >
            <Activity className="w-4 h-4 text-[#1890FF]" />
            <span>特征与量化证据链</span>
          </button>

          {/* TAB 5: 研判处置与生命周期 */}
          <button
            type="button"
            onClick={() => setActiveTab('process')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'process'
                ? 'border-[#52C41A] text-[#52C41A] bg-green-50/40'
                : 'border-transparent text-[#595959] hover:text-[#262626]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#52C41A]" />
            <span>研判处置与闭环</span>
          </button>
        </div>

        {/* 选项卡内容展示区 */}
        <div className="p-5 lg:p-6">
          {/* TAB 1: 标准排查方案 (SOP) */}
          {activeTab === 'troubleshoot' && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50/40 rounded-lg border border-[#FFD591] space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#FA8C16] text-white">
                      智能推荐 SOP
                    </span>
                    <h3 className="font-bold text-sm text-[#873800]">
                      {recommendedSop.category}
                    </h3>
                  </div>

                  {!isConverted && (
                    <button
                      type="button"
                      onClick={handleAdoptSop}
                      className="px-3.5 py-1.5 bg-[#FA8C16] text-white rounded text-xs font-semibold hover:bg-[#D46B08] transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-xs"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>采纳此 SOP 并一键转工单</span>
                    </button>
                  )}
                </div>

                <div className="text-xs text-[#D46B08] bg-white/70 p-2.5 rounded border border-[#FFE58F]">
                  <span className="font-medium">匹配依据：</span>
                  <span>{recommendedSop.matchReason}</span>
                </div>

                {/* 安全防护要点 */}
                <div className="p-3 bg-[#FFF1F0] rounded border border-[#FFA39E] text-xs text-[#CF1322] flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#F5222D]" />
                  <div>
                    <span className="font-bold">现场安全作业红线：</span>
                    <span className="leading-relaxed">{recommendedSop.safetyNotice}</span>
                  </div>
                </div>

                {/* 所需工器具 */}
                <div className="space-y-1.5 pt-1">
                  <span className="font-bold text-xs text-[#1F1F1F] flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-[#FA8C16]" />
                    <span>现场排查所需工器具与仪表：</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {recommendedSop.toolsRequired.map((tool, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-white border border-[#E8E8E8] text-xs text-[#595959] font-medium"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4 步标准化排查规程 */}
                <div className="space-y-2.5 pt-2">
                  <span className="font-bold text-xs text-[#1F1F1F] flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-[#FA8C16]" />
                    <span>标准化排查与消缺步骤 (4 Steps)：</span>
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recommendedSop.steps.map((step) => (
                      <div
                        key={step.step}
                        className="p-3.5 bg-white rounded border border-[#E8E8E8] hover:border-[#FFD591] transition-all space-y-1.5 shadow-none"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#FFF7E6] text-[#FA8C16] font-bold text-xs flex items-center justify-center border border-[#FFD591]">
                            {step.step}
                          </span>
                          <span className="font-bold text-xs text-[#262626]">{step.title}</span>
                        </div>
                        <p className="text-xs text-[#595959] leading-relaxed pl-7">
                          {step.detail}
                        </p>
                        <div className="text-[11px] text-[#D46B08] bg-[#FFFBE6] p-1.5 rounded ml-7 font-mono">
                          <strong>关键判据：</strong>{step.keyCheck}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 验收与闭环标准 */}
                <div className="p-3 bg-white rounded border border-[#B7EB8F] text-xs text-[#237804] flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#52C41A]" />
                  <div>
                    <span className="font-bold">消缺验收合格判据：</span>
                    <span className="leading-relaxed">{recommendedSop.acceptanceCriteria}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 历史相似案例库 */}
          {activeTab === 'cases' && (
            <div className="space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                <span className="text-xs text-[#8C8C8C]">
                  基于向量空间相似度算法从全局知识库中匹配到 <strong>{[...customCasesList, ...recommendedCases].length}</strong> 条高相关性处置案例：
                </span>
                <span className="text-[11px] text-[#595959] bg-[#FAFAFA] px-2.5 py-1 rounded border border-[#E8E8E8] flex items-center gap-1.5 self-start sm:self-auto">
                  <ThumbsUp className="w-3 h-3 text-[#52C41A]" />
                  <span>支持对匹配案例进行【有用/错误】反馈，模型自动自适应调优</span>
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[...customCasesList, ...recommendedCases].map((c) => {
                  const feedback = caseFeedback[c.id];
                  const feedbackNote = caseFeedbackNotes[c.id];
                  const isNewlyAdded = customCasesList.some((item) => item.id === c.id);

                  return (
                    <div
                      key={c.id}
                      className={`p-4 rounded-lg border transition-all space-y-2.5 ${
                        feedback === 'down'
                          ? 'border-[#FFA39E] bg-[#FFF1F0]/40'
                          : feedback === 'up'
                          ? 'border-[#B7EB8F] bg-[#F6FFED]/40'
                          : 'border-[#E8E8E8] bg-[#FAFAFA] hover:bg-white hover:border-[#91D5FF]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E6F7FF] text-[#1890FF] border border-[#91D5FF]">
                            相似度 {c.similarity}%
                          </span>
                          {isNewlyAdded && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F9F0FF] text-[#722ED1] border border-[#D3ADF7] flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              AI诊断新沉淀
                            </span>
                          )}
                          <span className="font-mono text-xs font-semibold text-[#8C8C8C]">{c.id}</span>
                          <span className="font-bold text-xs text-[#1F1F1F]">{c.title}</span>
                          
                          {/* 反馈状态标签 */}
                          {feedback === 'up' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#E6FFFB] text-[#08979C] border border-[#87E8DE] flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3 text-[#13C2C2]" />
                              已标记可用案例
                            </span>
                          )}
                          {feedback === 'down' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#FFF2E8] text-[#D4380D] border border-[#FFBB96] flex items-center gap-1">
                              <ThumbsDown className="w-3 h-3 text-[#FA541C]" />
                              已标记错误/不适用
                            </span>
                          )}
                        </div>

                        {/* 操作栏：点赞/点踩 + 查看档案 + 借鉴经验 */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-white rounded border border-[#D9D9D9] p-0.5 shadow-2xs">
                            <button
                              type="button"
                              title="点赞：反馈此案例正确、可用并富有参考价值"
                              onClick={() => handleToggleCaseFeedback(c.id, c.title, 'up')}
                              className={`px-2 py-1 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                                feedback === 'up'
                                  ? 'bg-[#52C41A] text-white font-bold'
                                  : 'text-[#595959] hover:bg-gray-100 hover:text-[#52C41A]'
                              }`}
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>{feedback === 'up' ? '可用' : '赞'}</span>
                            </button>
                            <div className="w-px h-3.5 bg-[#E8E8E8] mx-0.5" />
                            <button
                              type="button"
                              title="点踩：反馈此案例错误、现象不符或处置措施失效"
                              onClick={() => handleToggleCaseFeedback(c.id, c.title, 'down')}
                              className={`px-2 py-1 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                                feedback === 'down'
                                  ? 'bg-[#F5222D] text-white font-bold'
                                  : 'text-[#595959] hover:bg-gray-100 hover:text-[#F5222D]'
                              }`}
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                              <span>{feedback === 'down' ? '误判' : '踩'}</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => setActiveCaseModal(c)}
                            className="px-2.5 py-1 text-xs text-[#1890FF] hover:bg-[#E6F7FF] rounded transition-colors cursor-pointer"
                          >
                            查看档案
                          </button>
                          {!isConverted && (
                            <button
                              type="button"
                              onClick={() => handleAdoptCase(c)}
                              className="px-3 py-1 bg-white border border-[#1890FF] text-[#1890FF] hover:bg-[#1890FF] hover:text-white rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              <Copy className="w-3 h-3" />
                              <span>借鉴经验转工单</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {feedbackNote && (
                        <div className="text-[11px] text-[#595959] bg-white/90 p-2 rounded border border-[#E8E8E8] flex items-center gap-1.5">
                          <MessageSquare className="w-3 h-3 text-[#1890FF] shrink-0" />
                          <span><strong>反馈附注：</strong>{feedbackNote}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                        <div className="bg-white p-2.5 rounded border border-[#F0F0F0]">
                          <span className="text-[#8C8C8C] block text-[11px] mb-0.5">申报现象与告警:</span>
                          <span className="text-[#595959]">{c.reportedSymptom}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded border border-[#F0F0F0]">
                          <span className="text-[#8C8C8C] block text-[11px] mb-0.5">查明真实根因:</span>
                          <span className="text-[#262626] font-medium">{c.actualRootCause}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded border border-[#F0F0F0]">
                          <span className="text-[#8C8C8C] block text-[11px] mb-0.5">消缺处置措施:</span>
                          <span className="text-[#0050B3] font-medium">{c.resolutionAction}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#8C8C8C] pt-1 border-t border-[#F0F0F0]">
                        <div className="flex items-center gap-3">
                          <span>处置人: <strong className="text-[#595959]">{c.resolvedBy}</strong></span>
                          <span>闭环耗时: <strong className="text-[#52C41A]">{c.resolutionTime}</strong></span>
                        </div>
                        <span className="text-[#FA8C16]">防范建议: {c.preventionTip}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: AI 故障机理深度诊断 (4 步流转) */}
          {activeTab === 'diagnosis' && (
            <div className="space-y-4">
              {/* 子导航 */}
              <div className="flex items-center gap-2 pb-2 border-b border-[#F0F0F0] overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setDiagSubTab('create')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    diagSubTab === 'create' ? 'bg-[#722ED1] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>① 配置诊断任务</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-[#BFBFBF]" />
                <button
                  type="button"
                  onClick={() => setDiagSubTab('upload')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    diagSubTab === 'upload' ? 'bg-[#722ED1] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>② 载入/上传录波日志</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-[#BFBFBF]" />
                <button
                  type="button"
                  onClick={() => setDiagSubTab('pipeline')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    diagSubTab === 'pipeline' ? 'bg-[#722ED1] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>③ 多物理场推演流水线</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-[#BFBFBF]" />
                <button
                  type="button"
                  onClick={() => setDiagSubTab('result')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    diagSubTab === 'result' ? 'bg-[#722ED1] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>④ 诊断结论与证据报告</span>
                  {hasDiagnosed && <span className="w-2 h-2 rounded-full bg-[#52C41A]" />}
                </button>
              </div>

              {/* 子步骤 1: 配置任务 */}
              {diagSubTab === 'create' && (
                <div className="p-4 bg-[#FAFAFA] rounded-lg border border-[#E8E8E8] space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#1F1F1F]">配置 AI 机理诊断任务与仿真场景</span>
                    <span className="font-mono text-[#722ED1] bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {diagTask.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="bg-white p-3 rounded border border-[#E8E8E8] space-y-1">
                      <span className="text-[#8C8C8C] text-[11px] block">诊断模型引擎</span>
                      <span className="font-medium text-[#262626]">{diagTask.model}</span>
                    </div>
                    <div className="bg-white p-3 rounded border border-[#E8E8E8] space-y-1">
                      <span className="text-[#8C8C8C] text-[11px] block">推演场景策略</span>
                      <span className="font-medium text-[#262626]">{diagTask.scenario}</span>
                    </div>
                    <div className="bg-white p-3 rounded border border-[#E8E8E8] space-y-1">
                      <span className="text-[#8C8C8C] text-[11px] block">采样精度与通道</span>
                      <span className="font-medium text-[#262626]">{diagTask.samplingRate}</span>
                    </div>
                    <div className="bg-white p-3 rounded border border-[#E8E8E8] space-y-1">
                      <span className="text-[#8C8C8C] text-[11px] block">目标电站与设备</span>
                      <span className="font-medium text-[#262626]">{diagTask.station} ({diagTask.device})</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setDiagSubTab('upload')}
                      className="px-3.5 py-1.5 bg-white border border-[#D9D9D9] text-[#595959] hover:text-[#1890FF] rounded text-xs font-medium cursor-pointer"
                    >
                      前往核对时序日志
                    </button>
                    <button
                      type="button"
                      onClick={handleRunDiagnosis}
                      disabled={isSimulating}
                      className="px-4 py-2 bg-[#722ED1] hover:bg-[#531DAB] text-white rounded text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>一键启动 AI 仿真推演</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 子步骤 2: 载入录波日志 */}
              {diagSubTab === 'upload' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-[#FAFAFA] rounded-lg border border-[#E8E8E8] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#1F1F1F]">已预装现场高频采样录波时序</span>
                      <span className="text-[11px] text-[#52C41A] bg-[#F6FFED] px-2 py-0.5 rounded border border-[#B7EB8F]">
                        通道校验合格
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded border border-[#E8E8E8] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-blue-50 text-[#1890FF]">
                          <FileCode className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-medium text-[#1F1F1F] text-xs block">{uploadedLog.name}</span>
                          <span className="text-[11px] text-[#8C8C8C]">
                            {uploadedLog.size} · {uploadedLog.frames} · {uploadedLog.timeRange}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-[#1890FF] font-mono">{uploadedLog.samplingRate}</span>
                    </div>

                    {/* 拖拽上传模拟区 */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        setIsUploading(true);
                        setTimeout(() => {
                          setIsUploading(false);
                          setStatusMessage('已成功加载自定义录波时序文件 (18.2 MB)！');
                        }, 800);
                      }}
                      className={`p-6 rounded-lg border-2 border-dashed text-center transition-colors cursor-pointer ${
                        isDragOver ? 'border-[#722ED1] bg-purple-50/50' : 'border-[#D9D9D9] hover:border-[#722ED1] bg-white'
                      }`}
                    >
                      <UploadCloud className="w-8 h-8 mx-auto text-[#8C8C8C] mb-2" />
                      <p className="text-xs font-medium text-[#262626]">
                        {isUploading ? '正在解析时序文件通道...' : '点击或拖拽上传现场 COMTRADE / CSV / BMS 录波时序'}
                      </p>
                      <p className="text-[11px] text-[#8C8C8C] mt-1">支持微秒级对齐，最大单文件 500 MB</p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleRunDiagnosis}
                        disabled={isSimulating}
                        className="px-4 py-2 bg-[#722ED1] hover:bg-[#531DAB] text-white rounded text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>开始推演</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 子步骤 3: 推演进度 */}
              {diagSubTab === 'pipeline' && (
                <div className="p-5 bg-purple-50/40 rounded-lg border border-purple-200 space-y-4 text-xs">
                  <div className="flex items-center justify-between font-bold text-sm text-[#722ED1]">
                    <span className="flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 animate-pulse" />
                      <span>多物理场机理逆变与时序推演流水线</span>
                    </span>
                    <span className="font-mono">{diagProgress}%</span>
                  </div>

                  <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#722ED1] to-[#9254DE] h-full transition-all duration-300 rounded-full"
                      style={{ width: `${diagProgress}%` }}
                    />
                  </div>

                  <div className="p-3 bg-white rounded border border-purple-200 text-[#595959] font-mono text-xs leading-relaxed">
                    {diagStageText}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className={`p-2 rounded border ${diagProgress >= 30 ? 'bg-purple-100/60 border-purple-300 text-[#722ED1]' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                      1. 时序高频滤波与通道微秒对齐
                    </div>
                    <div className={`p-2 rounded border ${diagProgress >= 60 ? 'bg-purple-100/60 border-purple-300 text-[#722ED1]' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                      2. 电化学与热阻多物理场逆变求解
                    </div>
                    <div className={`p-2 rounded border ${diagProgress >= 90 ? 'bg-purple-100/60 border-purple-300 text-[#722ED1]' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                      3. 知识图谱根因定性与消缺决策
                    </div>
                  </div>
                </div>
              )}

              {/* 子步骤 4: 诊断结论与证据报告 */}
              {diagSubTab === 'result' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-200 space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#722ED1]" />
                        <span className="font-bold text-sm text-[#722ED1]">
                          AI 物理机理诊断结论 (置信度 {diagTask.confidence}%)
                        </span>
                      </div>

                      {/* 结论区操作栏：点赞/点踩反馈 + 一键转案例 + 全屏报告 + 转工单 */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* 诊断结果点赞/点踩 */}
                        <div className="flex items-center bg-white rounded border border-[#D9D9D9] p-0.5 shadow-2xs">
                          <button
                            type="button"
                            title="反馈诊断结果准确：机理根因与现场吻合，已用于指导消缺"
                            onClick={() => handleToggleDiagFeedback('up')}
                            className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                              diagFeedback === 'up'
                                ? 'bg-[#52C41A] text-white font-bold'
                                : 'text-[#595959] hover:bg-gray-100 hover:text-[#52C41A]'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{diagFeedback === 'up' ? '诊断准确' : '诊断准确'}</span>
                          </button>
                          <div className="w-px h-3.5 bg-[#E8E8E8] mx-0.5" />
                          <button
                            type="button"
                            title="反馈诊断结果错误：根因判断有偏差或与实际不符"
                            onClick={() => handleToggleDiagFeedback('down')}
                            className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                              diagFeedback === 'down'
                                ? 'bg-[#F5222D] text-white font-bold'
                                : 'text-[#595959] hover:bg-gray-100 hover:text-[#F5222D]'
                            }`}
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span>{diagFeedback === 'down' ? '诊断偏差' : '诊断偏差'}</span>
                          </button>
                        </div>

                        {/* 一键转为案例按钮 */}
                        <button
                          type="button"
                          onClick={handleOpenSaveAsCaseModal}
                          className="px-3 py-1 bg-white border border-[#722ED1] text-[#722ED1] hover:bg-purple-50 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5 text-[#722ED1]" />
                          <span>一键转为案例</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowFullReportModal(true)}
                          className="px-3 py-1 bg-white border border-[#D9D9D9] text-[#595959] hover:text-[#722ED1] hover:border-[#722ED1] rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>全屏诊断报告</span>
                        </button>
                        {!isConverted && (
                          <button
                            type="button"
                            onClick={handleAdoptAiDiag}
                            className="px-3.5 py-1 bg-[#722ED1] hover:bg-[#531DAB] text-white rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>采纳结论转工单</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {diagFeedback && (
                      <div className={`p-2 rounded text-xs flex items-center gap-2 ${
                        diagFeedback === 'up' ? 'bg-[#F6FFED] border border-[#B7EB8F] text-[#389E0D]' : 'bg-[#FFF1F0] border border-[#FFA39E] text-[#CF1322]'
                      }`}>
                        {diagFeedback === 'up' ? <ThumbsUp className="w-3.5 h-3.5" /> : <ThumbsDown className="w-3.5 h-3.5" />}
                        <span>
                          {diagFeedback === 'up' 
                            ? '已记录：该 AI 诊断结果被判定为【正确诊断】，已加入电站机理专家库。' 
                            : '已记录：该 AI 诊断结果被判定为【存在偏差】，样本已回传模型实验室进行参数校正。'}
                        </span>
                        {diagFeedbackNote && <span className="text-[#595959] ml-2">附注：{diagFeedbackNote}</span>}
                      </div>
                    )}

                    <div className="bg-white p-3.5 rounded border border-purple-200 space-y-2">
                      <p className="text-xs text-[#1F1F1F] leading-relaxed">
                        <strong>根因定性判断：</strong>
                        系统通过微秒级高频阻抗逆变模型识别到 <strong>{risk.stationId}-Rack-01</strong> 处电芯极柱接触内阻出现突增劣化 (+32.4%)。在大电流充放电阶段，接触面产生异常焦耳发热功率 (28.5W)，引发单体表面温升 ΔT 达 9.4℃，高度符合铜排紧固螺栓预紧力衰减特征。
                      </p>
                      <div className="p-2.5 bg-[#FFFBE6] rounded border border-[#FFE58F] text-[#D46B08] text-[11px]">
                        <strong>建议消缺对策：</strong>
                        断电后使用数显扭矩扳手重新校准紧固至 10.0±0.5 N·m，清除接触氧化膜并涂布高导电防氧化紫铜硅脂，并在 0.5C 带载验证红外温升。
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: 时序特征与量化证据链 */}
          {activeTab === 'telemetry' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-[#FAFAFA] rounded border border-[#E8E8E8]">
                  <span className="text-[#8C8C8C] block text-[11px]">监测特征参数</span>
                  <span className="font-medium text-[#1F1F1F]">{risk.evidence?.metric || '单体电芯最高温差 ΔT'}</span>
                </div>
                <div className="p-3 bg-[#FAFAFA] rounded border border-[#E8E8E8]">
                  <span className="text-[#8C8C8C] block text-[11px]">实测特征极值</span>
                  <span className="font-bold text-[#F5222D]">{risk.evidence?.value || '8.5℃'}</span>
                </div>
                <div className="p-3 bg-[#FAFAFA] rounded border border-[#E8E8E8]">
                  <span className="text-[#8C8C8C] block text-[11px]">安全临界阈值</span>
                  <span className="font-medium text-[#595959]">{risk.evidence?.threshold || '5.0℃'}</span>
                </div>
                <div className="p-3 bg-[#FAFAFA] rounded border border-[#E8E8E8]">
                  <span className="text-[#8C8C8C] block text-[11px]">特征劣化趋势</span>
                  <span className="font-medium text-[#D46B08]">{risk.evidence?.trend || '持续阶梯式发散'}</span>
                </div>
              </div>

              <div className="p-4 bg-[#FFFBE6]/50 rounded-lg border border-[#FFE58F] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#D48806]">特征时序偏离与基线对比 (Telemetry Verification)</span>
                  <span className="text-[11px] text-[#8C8C8C]">采样间隔: 100ms</span>
                </div>
                <p className="text-xs text-[#595959] leading-relaxed">
                  在过去 6 个充放电循环中，该指标自 3.2℃ 持续抬升至 8.5℃，偏离同模组中位数 4.2 倍标准差，模型拟合优度 R²=0.962，触发主动预警推送。
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: 研判处置与生命周期闭环 */}
          {activeTab === 'process' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#FAFAFA] rounded-lg border border-[#E8E8E8] space-y-3">
                <div className="font-bold text-sm text-[#1F1F1F]">风险研判处置与生命周期流转</div>

                <div className="space-y-2">
                  <label className="text-xs text-[#595959] font-medium block">
                    处置研判备注 / 工单派发说明：
                  </label>
                  <textarea
                    rows={3}
                    value={handleNote}
                    onChange={(e) => setHandleNote(e.target.value)}
                    placeholder="输入现场消缺指导、班组调配要求或排除原因..."
                    className="w-full p-2.5 border border-[#D9D9D9] rounded text-xs focus:outline-none focus:border-[#1890FF] bg-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0F0F0]">
                  {!isConverted && !isEliminated && (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowEliminateModal(true)}
                        className="px-3.5 py-1.5 bg-white border border-[#D9D9D9] text-[#595959] hover:text-[#52C41A] hover:border-[#52C41A] rounded text-xs font-medium cursor-pointer transition-colors"
                      >
                        标记消除该风险
                      </button>
                      <button
                        type="button"
                        onClick={() => onConvertToTicket(risk, handleNote || undefined)}
                        className="px-4 py-1.5 bg-[#FA8C16] hover:bg-[#FFA940] text-white rounded text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>确认转为 pcare 工单</span>
                      </button>
                    </>
                  )}

                  {isConverted && (
                    <div className="text-xs text-[#52C41A] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#52C41A]" />
                      <span>该风险已于 pcare 系统生成工单 ({risk.linkedTicketId})，进入闭环跟踪</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 历史案例详情弹窗 */}
      {activeCaseModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-xl w-full p-5 space-y-4 border border-[#E8E8E8] shadow-lg animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#E8E8E8] pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#E6F7FF] text-[#1890FF] border border-[#91D5FF]">
                  相似度 {activeCaseModal.similarity}%
                </span>
                <span className="font-bold text-sm text-[#1F1F1F]">{activeCaseModal.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveCaseModal(null)}
                className="text-[#8C8C8C] hover:text-[#262626] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-[#FAFAFA] rounded border border-[#E8E8E8] grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[#8C8C8C] block text-[11px]">发生电站</span>
                  <span className="font-medium text-[#262626]">{activeCaseModal.stationName}</span>
                </div>
                <div>
                  <span className="text-[#8C8C8C] block text-[11px]">设备部位</span>
                  <span className="font-medium text-[#262626]">{activeCaseModal.deviceType}</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded border border-[#E8E8E8] space-y-1">
                <span className="font-bold text-[#1F1F1F]">查明真实根因：</span>
                <p className="text-[#595959] leading-relaxed">{activeCaseModal.actualRootCause}</p>
              </div>

              <div className="p-3 bg-blue-50/50 rounded border border-blue-200 space-y-1">
                <span className="font-bold text-[#0050B3]">消缺处置方案：</span>
                <p className="text-[#0050B3] leading-relaxed">{activeCaseModal.resolutionAction}</p>
              </div>

              <div className="p-3 bg-[#FFFBE6] rounded border border-[#FFE58F] space-y-1">
                <span className="font-bold text-[#D46B08]">长效防范策略：</span>
                <p className="text-[#D46B08] leading-relaxed">{activeCaseModal.preventionTip}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E8E8]">
              <button
                type="button"
                onClick={() => setActiveCaseModal(null)}
                className="px-3 py-1.5 border border-[#D9D9D9] text-[#595959] hover:bg-gray-50 rounded text-xs cursor-pointer"
              >
                关闭
              </button>
              {!isConverted && (
                <button
                  type="button"
                  onClick={() => handleAdoptCase(activeCaseModal)}
                  className="px-3.5 py-1.5 bg-[#1890FF] hover:bg-[#40A9FF] text-white rounded text-xs font-semibold cursor-pointer"
                >
                  借鉴此方案并转工单
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 全屏诊断报告模态框 */}
      {showFullReportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 space-y-4 border border-[#E8E8E8] shadow-2xl animate-in fade-in my-8">
            <div className="flex items-center justify-between border-b border-[#E8E8E8] pb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#722ED1]" />
                <h2 className="font-bold text-base text-[#1F1F1F]">
                  主动运维 AI 故障机理诊断与多物理场仿真报告
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowFullReportModal(false)}
                className="text-[#8C8C8C] hover:text-[#262626] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#FAFAFA] rounded border border-[#E8E8E8] grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[#8C8C8C] block text-[11px]">报告编号</span>
                  <span className="font-mono font-medium text-[#1F1F1F]">{diagTask.id}</span>
                </div>
                <div>
                  <span className="text-[#8C8C8C] block text-[11px]">置信度</span>
                  <span className="font-bold text-[#722ED1]">{diagTask.confidence}%</span>
                </div>
                <div>
                  <span className="text-[#8C8C8C] block text-[11px]">生成时间</span>
                  <span className="font-medium text-[#595959]">2026-08-25 10:35:12</span>
                </div>
              </div>

              {/* 诊断结论反馈状态栏 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-purple-50/50 rounded border border-purple-200">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#722ED1]">诊断结果有效性评价：</span>
                  {diagFeedback === 'up' && (
                    <span className="text-[#52C41A] font-medium flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5" /> 已标记【诊断准确】
                    </span>
                  )}
                  {diagFeedback === 'down' && (
                    <span className="text-[#F5222D] font-medium flex items-center gap-1">
                      <ThumbsDown className="w-3.5 h-3.5" /> 已标记【存在偏差】
                    </span>
                  )}
                  {!diagFeedback && <span className="text-[#8C8C8C]">暂未评价</span>}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white rounded border border-[#D9D9D9] p-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => handleToggleDiagFeedback('up')}
                      className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                        diagFeedback === 'up' ? 'bg-[#52C41A] text-white font-bold' : 'text-[#595959] hover:bg-gray-100 hover:text-[#52C41A]'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>准确</span>
                    </button>
                    <div className="w-px h-3.5 bg-[#E8E8E8] mx-0.5" />
                    <button
                      type="button"
                      onClick={() => handleToggleDiagFeedback('down')}
                      className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                        diagFeedback === 'down' ? 'bg-[#F5222D] text-white font-bold' : 'text-[#595959] hover:bg-gray-100 hover:text-[#F5222D]'
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>偏差</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowFullReportModal(false);
                      handleOpenSaveAsCaseModal();
                    }}
                    className="px-2.5 py-1 bg-white border border-[#722ED1] text-[#722ED1] hover:bg-purple-100 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>转为知识库案例</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded border border-[#E8E8E8] space-y-2">
                <h4 className="font-bold text-[#1F1F1F] text-xs">一、故障根因定性与拓扑溯源</h4>
                <p className="text-[#595959] leading-relaxed">
                  通过对 {risk.stationName} 采集之 100Hz 高频录波时序进行微秒级通道解耦与阻抗逆变计算，诊断引擎判定在 {risk.stationId}-Rack-01 极柱螺栓连接处存在明显的接触阻抗劣化 (+32.4%)。大电流充放电循环期间，接触面产生异常焦耳热 (28.5W)，引发单体温升 ΔT 达 9.4℃。
                </p>
              </div>

              <div className="p-3.5 bg-white rounded border border-[#E8E8E8] space-y-2">
                <h4 className="font-bold text-[#1F1F1F] text-xs">二、多物理场机理逆变与量化验证</h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-purple-50/50 border border-purple-200">
                    <span className="text-[#722ED1] font-medium block">接触内阻实测估算</span>
                    <span className="text-sm font-bold text-[#722ED1]">0.33 mΩ (基线: 0.25 mΩ)</span>
                  </div>
                  <div className="p-2 rounded bg-purple-50/50 border border-purple-200">
                    <span className="text-[#722ED1] font-medium block">局部焦耳热发散功率</span>
                    <span className="text-sm font-bold text-[#CF1322]">28.5 W</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-[#FFFBE6] rounded border border-[#FFE58F] space-y-1">
                <h4 className="font-bold text-[#D46B08] text-xs">三、推荐现场消缺 SOP 策略</h4>
                <p className="text-[#D46B08] leading-relaxed">
                  停电验电后使用数显扭矩扳手重新校准紧固至 10.0±0.5 N·m，清理接触氧化膜并涂布高导电防氧化紫铜硅脂，并在 0.5C 带载监测红外点温（目标 ΔT &lt; 2.5℃）。
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#E8E8E8]">
              <button
                type="button"
                onClick={() => {
                  setShowFullReportModal(false);
                  handleOpenSaveAsCaseModal();
                }}
                className="px-3 py-1.5 bg-white border border-[#722ED1] text-[#722ED1] hover:bg-purple-50 rounded text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>一键转为知识库案例</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFullReportModal(false)}
                  className="px-3.5 py-1.5 border border-[#D9D9D9] text-[#595959] hover:bg-gray-50 rounded text-xs cursor-pointer"
                >
                  关闭
                </button>
                {!isConverted && (
                  <button
                    type="button"
                    onClick={handleAdoptAiDiag}
                    className="px-4 py-1.5 bg-[#722ED1] hover:bg-[#531DAB] text-white rounded text-xs font-semibold cursor-pointer"
                  >
                    采纳报告结论并转工单
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 案例反馈原因弹窗 */}
      {activeFeedbackModalCase && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4 border border-[#E8E8E8] shadow-lg animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#E8E8E8] pb-3">
              <div className="flex items-center gap-2">
                {activeFeedbackModalCase.type === 'up' ? (
                  <div className="p-1 rounded bg-[#F6FFED] text-[#52C41A] border border-[#B7EB8F]">
                    <ThumbsUp className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="p-1 rounded bg-[#FFF1F0] text-[#F5222D] border border-[#FFA39E]">
                    <ThumbsDown className="w-4 h-4" />
                  </div>
                )}
                <span className="font-bold text-sm text-[#1F1F1F]">
                  {activeFeedbackModalCase.type === 'up' ? '标记为可用/优秀案例' : '标记为错误/不适用案例'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveFeedbackModalCase(null)}
                className="text-[#8C8C8C] hover:text-[#262626] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 bg-[#FAFAFA] rounded border border-[#E8E8E8]">
                <span className="text-[#8C8C8C] block text-[11px]">目标案例</span>
                <span className="font-medium text-[#262626] font-mono">{activeFeedbackModalCase.id} - {activeFeedbackModalCase.title}</span>
              </div>

              <div>
                <label className="text-[#595959] font-medium block mb-1">
                  {activeFeedbackModalCase.type === 'up' 
                    ? '评价说明（如：处置措施有效、根因判断与现场极度契合等，选填）：' 
                    : '错误或不适用原因（如：设备型号不匹配、根因判断偏差、防范对策失效等，选填）：'}
                </label>
                <textarea
                  rows={3}
                  value={feedbackNoteInput}
                  onChange={(e) => setFeedbackNoteInput(e.target.value)}
                  placeholder={
                    activeFeedbackModalCase.type === 'up'
                      ? '输入赞赏原因或关键经验亮点...'
                      : '请说明为何判定此案例不适用或存在错误，帮助模型降权优化...'
                  }
                  className="w-full p-2.5 border border-[#D9D9D9] rounded text-xs focus:outline-none focus:border-[#1890FF] bg-white"
                />
              </div>

              <div className="text-[11px] text-[#8C8C8C] bg-blue-50/60 p-2 rounded border border-blue-100 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#1890FF] shrink-0" />
                <span>您的反馈将实时接入知识库推荐算法与专家闭环微调体系。</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E8E8]">
              <button
                type="button"
                onClick={() => setActiveFeedbackModalCase(null)}
                className="px-3 py-1.5 border border-[#D9D9D9] text-[#595959] rounded text-xs cursor-pointer hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveCaseFeedback}
                className={`px-4 py-1.5 text-white rounded text-xs font-semibold cursor-pointer shadow-xs ${
                  activeFeedbackModalCase.type === 'up'
                    ? 'bg-[#52C41A] hover:bg-[#73D13D]'
                    : 'bg-[#F5222D] hover:bg-[#FF4D4F]'
                }`}
              >
                提交反馈
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI 诊断反馈弹窗 */}
      {showDiagFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4 border border-[#E8E8E8] shadow-lg animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#E8E8E8] pb-3">
              <div className="flex items-center gap-2">
                {diagFeedbackType === 'up' ? (
                  <div className="p-1 rounded bg-[#F6FFED] text-[#52C41A] border border-[#B7EB8F]">
                    <ThumbsUp className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="p-1 rounded bg-[#FFF1F0] text-[#F5222D] border border-[#FFA39E]">
                    <ThumbsDown className="w-4 h-4" />
                  </div>
                )}
                <span className="font-bold text-sm text-[#1F1F1F]">
                  {diagFeedbackType === 'up' ? '反馈 AI 诊断结果正确' : '反馈 AI 诊断结果存在偏差/错误'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowDiagFeedbackModal(false)}
                className="text-[#8C8C8C] hover:text-[#262626] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 bg-purple-50/50 rounded border border-purple-200">
                <span className="text-[#722ED1] font-mono block text-[11px]">任务编号: {diagTask.id}</span>
                <span className="font-medium text-[#262626]">{diagTask.name || risk.title}</span>
              </div>

              <div>
                <label className="text-[#595959] font-medium block mb-1">
                  {diagFeedbackType === 'up'
                    ? '专家确认说明（可记录现场实测吻合度、力矩实测值等）：'
                    : '诊断偏差说明（例如真实根因是母线绝缘而非极柱内阻、推荐SOP不适等）：'}
                </label>
                <textarea
                  rows={3}
                  value={diagFeedbackNote}
                  onChange={(e) => setDiagFeedbackNote(e.target.value)}
                  placeholder={
                    diagFeedbackType === 'up'
                      ? '输入现场核实确认细节...'
                      : '请详细描述现场实际发现的真实故障原因与诊断差异...'
                  }
                  className="w-full p-2.5 border border-[#D9D9D9] rounded text-xs focus:outline-none focus:border-[#722ED1] bg-white"
                />
              </div>

              <div className="text-[11px] text-[#595959] bg-[#FAFAFA] p-2 rounded border border-[#E8E8E8]">
                <span>说明：被点赞的诊断结论将优先推荐沉淀为知识库案例，被点踩的样本将进入误报样本集用于大模型强化学习迭代。</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E8E8]">
              <button
                type="button"
                onClick={() => setShowDiagFeedbackModal(false)}
                className="px-3 py-1.5 border border-[#D9D9D9] text-[#595959] rounded text-xs cursor-pointer hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveDiagFeedback}
                className={`px-4 py-1.5 text-white rounded text-xs font-semibold cursor-pointer shadow-xs ${
                  diagFeedbackType === 'up'
                    ? 'bg-[#52C41A] hover:bg-[#73D13D]'
                    : 'bg-[#F5222D] hover:bg-[#FF4D4F]'
                }`}
              >
                确认提交
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 一键转为历史案例模态框 */}
      {showSaveAsCaseModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 space-y-4 border border-[#E8E8E8] shadow-2xl animate-in fade-in my-6">
            <div className="flex items-center justify-between border-b border-[#E8E8E8] pb-3">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-[#722ED1]" />
                <div>
                  <h3 className="font-bold text-base text-[#1F1F1F]">
                    将本次 AI 诊断与消缺对策一键沉淀为历史案例
                  </h3>
                  <p className="text-[11px] text-[#8C8C8C]">
                    系统已自动提取诊断根因、证据链数据与 SOP，请复核后归档至全局案例库
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSaveAsCaseModal(false)}
                className="text-[#8C8C8C] hover:text-[#262626] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#595959] font-medium block">案例标题：</label>
                  <input
                    type="text"
                    value={newCaseData.title}
                    onChange={(e) => setNewCaseData({ ...newCaseData, title: e.target.value })}
                    className="w-full p-2 border border-[#D9D9D9] rounded text-xs focus:outline-none focus:border-[#722ED1]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#595959] font-medium block">发生电站 / 关联设备：</label>
                  <input
                    type="text"
                    value={`${newCaseData.stationName} · ${newCaseData.deviceType}`}
                    onChange={(e) => setNewCaseData({ ...newCaseData, deviceType: e.target.value })}
                    className="w-full p-2 border border-[#D9D9D9] rounded text-xs focus:outline-none focus:border-[#722ED1]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#595959] font-medium block">申报现象与遥测预警特征：</label>
                <textarea
                  rows={2}
                  value={newCaseData.reportedSymptom}
                  onChange={(e) => setNewCaseData({ ...newCaseData, reportedSymptom: e.target.value })}
                  className="w-full p-2 border border-[#D9D9D9] rounded text-xs focus:outline-none focus:border-[#722ED1]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#595959] font-medium block">AI 诊断查明真实根因 (Root Cause)：</label>
                <textarea
                  rows={2}
                  value={newCaseData.actualRootCause}
                  onChange={(e) => setNewCaseData({ ...newCaseData, actualRootCause: e.target.value })}
                  className="w-full p-2 border border-[#D9D9D9] rounded text-xs focus:outline-none focus:border-[#722ED1]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#0050B3] font-medium block">消缺处置方案与操作细节：</label>
                <textarea
                  rows={2}
                  value={newCaseData.resolutionAction}
                  onChange={(e) => setNewCaseData({ ...newCaseData, resolutionAction: e.target.value })}
                  className="w-full p-2 border border-[#91D5FF] rounded text-xs focus:outline-none focus:border-[#1890FF] bg-blue-50/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#D46B08] font-medium block">长效防范策略与巡检要点：</label>
                <textarea
                  rows={2}
                  value={newCaseData.preventionTip}
                  onChange={(e) => setNewCaseData({ ...newCaseData, preventionTip: e.target.value })}
                  className="w-full p-2 border border-[#FFD591] rounded text-xs focus:outline-none focus:border-[#FA8C16] bg-orange-50/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[#595959] font-medium block">检索标签 (Tags)：</label>
                  <input
                    type="text"
                    value={newCaseData.tags}
                    onChange={(e) => setNewCaseData({ ...newCaseData, tags: e.target.value })}
                    className="w-full p-2 border border-[#D9D9D9] rounded text-xs focus:outline-none focus:border-[#722ED1]"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="isPublicCase"
                    checked={newCaseData.isPublic}
                    onChange={(e) => setNewCaseData({ ...newCaseData, isPublic: e.target.checked })}
                    className="rounded text-[#722ED1] focus:ring-[#722ED1]"
                  />
                  <label htmlFor="isPublicCase" className="text-xs text-[#262626] font-medium cursor-pointer">
                    发布至全网共享案例库 (跨电站相似故障自动推荐)
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E8E8]">
              <button
                type="button"
                onClick={() => setShowSaveAsCaseModal(false)}
                className="px-3.5 py-1.5 border border-[#D9D9D9] text-[#595959] rounded text-xs hover:bg-gray-50 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmSaveAsCase}
                className="px-4 py-1.5 bg-[#722ED1] hover:bg-[#531DAB] text-white rounded text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>确认入库并沉淀为案例</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 消除风险确认模态框 */}
      {showEliminateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4 border border-[#E8E8E8] shadow-lg animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#E8E8E8] pb-3">
              <span className="font-bold text-sm text-[#1F1F1F]">标记消除风险 · {risk.id}</span>
              <button
                type="button"
                onClick={() => setShowEliminateModal(false)}
                className="text-[#8C8C8C] hover:text-[#262626] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-[#595959] font-medium block">
                消除研判依据与说明：
              </label>
              <textarea
                rows={3}
                value={eliminateReason}
                onChange={(e) => setEliminateReason(e.target.value)}
                className="w-full p-2.5 border border-[#D9D9D9] rounded text-xs focus:outline-none focus:border-[#52C41A]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E8E8]">
              <button
                type="button"
                onClick={() => setShowEliminateModal(false)}
                className="px-3 py-1.5 border border-[#D9D9D9] text-[#595959] rounded text-xs cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmEliminate}
                className="px-3.5 py-1.5 bg-[#52C41A] hover:bg-[#73D13D] text-white rounded text-xs font-semibold cursor-pointer"
              >
                确认消除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
