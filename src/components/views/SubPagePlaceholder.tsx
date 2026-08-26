import React, { useState } from 'react';
import { ActiveView } from '../../types';
import { 
  ArrowLeft, 
  ShieldAlert, 
  Ticket, 
  CheckSquare, 
  BarChart3, 
  FileText, 
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
  Radar,
  BellRing,
  AlertCircle,
  History,
  Send,
  TrendingUp,
  AlertTriangle,
  ListTodo,
  Stethoscope,
  BrainCircuit,
  AreaChart,
  Gauge,
  SlidersHorizontal,
  Server,
  Box,
  ArrowUpCircle,
  Building2,
  Settings2,
  Search,
  Filter,
  RefreshCw,
  Download,
  Plus,
  CheckCircle2,
  Clock,
  Activity
} from 'lucide-react';

interface SubPagePlaceholderProps {
  view: ActiveView;
  onReturnToWorkbench: () => void;
  onNavigate?: (view: ActiveView) => void;
}

export const SubPagePlaceholder: React.FC<SubPagePlaceholderProps> = ({
  view,
  onReturnToWorkbench,
  onNavigate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const pageMeta: Record<string, { 
    title: string; 
    subtitle: string; 
    category: string;
    desc: string; 
    icon: React.ComponentType<{ className?: string }>; 
    color: string; 
    badge: string;
    stats: Array<{ label: string; value: string; unit?: string; change?: string; isPositive?: boolean }>;
    tableHeaders: string[];
    sampleRows: Array<string[]>;
    quickActions?: Array<{ label: string; icon: React.ComponentType<{ className?: string }>; action: string }>;
  }> = {
    screen_posture: {
      title: '态势大屏 (Situational Cockpit)',
      subtitle: '全域储能资产全景态势实时数字孪生感知大屏',
      category: '风险与告警',
      desc: '汇聚 484 座并网储能电站实时拓扑、全省电网充放电调度响应负荷、微秒级频发越限与告警热力分布图。支持多屏联动与全景投屏。',
      icon: Radar,
      color: 'text-[#1890FF] bg-[#E6F7FF] border-[#91D5FF]',
      badge: '大屏可视化',
      stats: [
        { label: '接入电站总数', value: '484', unit: '座', change: '+12座较上月', isPositive: true },
        { label: '总装机容量', value: '1,248.5', unit: 'MWh', change: '利用率 94.2%', isPositive: true },
        { label: '当前放电负荷', value: '382.4', unit: 'MW', change: '顶峰响应中', isPositive: true },
        { label: '实时在网预警', value: '8', unit: '项', change: '高风险 3', isPositive: false },
      ],
      tableHeaders: ['电站编号与名称', '所属区域', '容量规格', 'SOC', '充放电状态', '当前告警/预警', '操作'],
      sampleRows: [
        ['ST-001 南通如东 50MW/100MWh 储能电站', '苏中地区', '100.0 MWh', '68.5%', '恒功率放电', '压差偏大预警 (ΔV 48mV)', '查看拓扑'],
        ['ST-002 盐城大丰 30MW/60MWh 共享储能电站', '苏北地区', '60.0 MWh', '82.0%', '待机待调度', '正常', '查看拓扑'],
        ['ST-003 无锡高新 20MW/40MWh 用户侧电站', '苏南地区', '40.0 MWh', '41.2%', '恒流充电', 'PCS散热器超温告警', '查看拓扑'],
        ['ST-004 常州金坛 100MW/200MWh 盐穴压缩空气/储能站', '苏南地区', '200.0 MWh', '91.0%', '满电备用', '正常', '查看拓扑']
      ]
    },
    alarm_current: {
      title: '当前告警 (Active Alarms)',
      subtitle: '越限越位即时告警明细及实时遥信遥测异常',
      category: '风险与告警 > 告警中心',
      desc: '展示实时从 BMS、PCS 及动环网关上报的硬性越限信号，支持按告警等级（致命/严重/一般）、电站名称及发生时间实时过滤与批量确认。',
      icon: AlertCircle,
      color: 'text-[#F5222D] bg-[#FFF1F0] border-[#FFA39E]',
      badge: '实时高频',
      stats: [
        { label: '致命告警 (L1)', value: '1', unit: '条', change: '需即刻处置', isPositive: false },
        { label: '严重告警 (L2)', value: '4', unit: '条', change: '处理中 3', isPositive: false },
        { label: '一般告警 (L3)', value: '18', unit: '条', change: '待消缺', isPositive: true },
        { label: '当日消缺率', value: '88.5%', unit: '', change: '+2.4%', isPositive: true },
      ],
      tableHeaders: ['告警编号', '级别', '所属电站与设备', '告警描述', '触发时间', '持续时长', '当前状态', '操作'],
      sampleRows: [
        ['ALM-2026-0825-01', '致命 (L1)', '南通如东站 #02舱-Rack04', '单体过充截止越限 (3.65V)', '10:24:12', '18分22秒', '未确认', '转工单'],
        ['ALM-2026-0825-02', '严重 (L2)', '无锡高新站 PCS-01机柜', 'IGBT模块热阻超温 (88℃)', '09:12:45', '1小时29分', '已通知', '转工单'],
        ['ALM-2026-0825-03', '严重 (L2)', '宿迁泗洪站 液冷机组#1', '系统管路压力过低 (<0.15MPa)', '08:44:10', '1小时58分', '处理中', '转工单'],
        ['ALM-2026-0825-04', '一般 (L3)', '常州金坛站 消防动环', '机舱温湿度传感器通信丢包', '07:30:00', '3小时12分', '已派发', '详情']
      ]
    },
    alarm_history: {
      title: '历史告警 (Alarm History)',
      subtitle: '历史告警归档台账与频发异常回溯分析',
      category: '风险与告警 > 告警中心',
      desc: '支持按时间跨度、电站分类、设备序列号进行多维告警复盘，提供告警频次 Pareto 图表与消缺历时回溯。',
      icon: History,
      color: 'text-[#595959] bg-[#FAFAFA] border-[#D9D9D9]',
      badge: '历史归档',
      stats: [
        { label: '近30天告警总数', value: '342', unit: '次', change: '-15.4% 环比下降', isPositive: true },
        { label: '平均消缺时长', value: '42.5', unit: '分钟', change: '优于 SLA 指标', isPositive: true },
        { label: '误报过滤数', value: '68', unit: '次', change: '算法抑制 19.8%', isPositive: true },
        { label: '复盘归档率', value: '100%', unit: '', change: '闭环完备', isPositive: true },
      ],
      tableHeaders: ['告警编号', '电站名称', '告警内容', '发生时间', '恢复时间', '处置责任人', '消缺工单', '归档结论'],
      sampleRows: [
        ['ALM-2026-0824-88', '徐州贾汪站', '绝缘监测仪阻抗告警 (<100kΩ)', '08-24 14:20', '08-24 15:05', '王强', 'WO-2026-0824-03', '更换绝缘采样板恢复'],
        ['ALM-2026-0823-65', '苏州昆山站', '电池簇通信中断', '08-23 09:10', '08-23 09:32', '李明', 'WO-2026-0823-01', '网线接头松动紧固'],
        ['ALM-2026-0822-41', '南京江宁站', '空调压缩机高压报警', '08-22 16:40', '08-22 17:50', '赵刚', 'WO-2026-0822-09', '冷凝器清洗除尘']
      ]
    },
    alarm_push_config: {
      title: '告警推送配置 (Alarm Notification Rules)',
      subtitle: '多通道即时告警推送策略、等级阈值与升级规则配置',
      category: '风险与告警 > 告警中心',
      desc: '设置各区域、各电站告警推送规则，支持短信、企业微信、钉钉群机器人、邮件及电话语音强提醒，支持告警未受理超时自动向上升级机制。',
      icon: Send,
      color: 'text-[#1890FF] bg-[#E6F7FF] border-[#91D5FF]',
      badge: '规则引擎',
      stats: [
        { label: '生效推送策略', value: '16', unit: '条', change: '覆盖全部区域', isPositive: true },
        { label: '绑定义务人员', value: '42', unit: '人', change: '运维值班排班中', isPositive: true },
        { label: '推送成功率', value: '99.8%', unit: '', change: '双通道冗余保障', isPositive: true },
        { label: '平均通知时延', value: '< 2.5', unit: '秒', change: '微秒级分发', isPositive: true },
      ],
      tableHeaders: ['策略名称', '适用告警级别', '生效电站范围', '推送通道', '通知接收对象', '升级升级时限', '状态', '操作'],
      sampleRows: [
        ['致命告警语音电话强通知策略', '致命 (L1)', '全省 484 座电站', '电话语音 + 企微 + 短信', '值班长 + 区域负责人', '5分钟未接单升级', '已启用', '编辑配置'],
        ['严重告警企微群与责任人直派', '严重 (L2)', '华东一区全部站点', '企业微信机器人 + 极光Push', '当班工程师 + 站长', '15分钟未接单升级', '已启用', '编辑配置'],
        ['一般告警工作台待办静默提醒', '一般 (L3)', '全网电站', '平台工作台 + 邮件日报', '现场运维组', '无', '已启用', '编辑配置']
      ]
    },
    warning_current: {
      title: '当前预警 (Active AI Warnings)',
      subtitle: '基于电化学与热动力学 AI 模型的微观劣变前置预测',
      category: '风险与告警 > 预警分析',
      desc: '提前数小时至数天捕获电芯热失控前驱特征、微短路、绝缘隐患与容量跳水，在发生物理硬件告警前完成主动拦截与预防性维护。',
      icon: AlertTriangle,
      color: 'text-[#FA8C16] bg-[#FFF7E6] border-[#FFD591]',
      badge: '前置预防',
      stats: [
        { label: '当前高风险预警', value: '8', unit: '项', change: '综合风险分 ≥80', isPositive: false },
        { label: '算法模型置信度', value: '96.2%', unit: '', change: '时序分析模型', isPositive: true },
        { label: '平均提前预警时长', value: '18.4', unit: '小时', change: '提前拦截', isPositive: true },
        { label: '预警转工单率', value: '75.0%', unit: '', change: '闭环高效', isPositive: true },
      ],
      tableHeaders: ['预警编号', '电站名称与舱位', '预警类型', '特征指标与数值', '综合风险分', '首发时间', '状态', '操作'],
      sampleRows: [
        ['WARN-2026-0825-01', '南通如东站 01#舱-Rack02', '电芯温差散度异常扩大', 'ΔT > 4.2℃ (持续上升)', '92 (高风险)', '08-25 08:30', '待处理', '下发工单'],
        ['WARN-2026-0825-02', '盐城大丰站 02#舱-05簇', '微短路阻抗突变隐患', '电压自放电率 2.8mV/h', '88 (高风险)', '08-25 09:15', '研判中', '下发工单'],
        ['WARN-2026-0825-03', '无锡高新站 03#储能柜', 'SOC一致性衰减截断', '可用容量离散度 8.5%', '78 (中风险)', '08-25 07:50', '已带参派发', '查看工单']
      ]
    },
    warning_push_config: {
      title: '预警推送配置 (Warning Notification Rules)',
      subtitle: 'AI 预测预警分级订阅、敏感度阈值与带参下发策略',
      category: '风险与告警 > 预警分析',
      desc: '按算法模型类型（温差/绝缘/一致性/SOC）及置信度分级配置通知接收人，支持主动将预警诊断包作为带参参数自动下发至工单系统。',
      icon: Settings2,
      color: 'text-[#722ED1] bg-[#F9F0FF] border-[#D3ADF7]',
      badge: '模型分发',
      stats: [
        { label: '预警推送规则', value: '8', unit: '条', change: '全模型覆盖', isPositive: true },
        { label: '自动转单阈值', value: '风险分 ≥85', unit: '', change: '自动带参派工', isPositive: true },
        { label: '专家研判通道', value: '已开通', unit: '', change: '远程支持团队', isPositive: true },
        { label: '推送召回率', value: '98.5%', unit: '', change: '高敏感度', isPositive: true },
      ],
      tableHeaders: ['规则名称', '监控模型', '风险分阈值', '通知对象', '自动带参派单', '推送渠道', '状态', '操作'],
      sampleRows: [
        ['热失控前驱高危预警极速直派', '电芯温差散度模型', '分值 ≥ 85', '区域责任工程师 + 站长', '自动生成 pcare 工单', '企微 + 短信', '运行中', '编辑'],
        ['绝缘阻抗渐变中危预警提醒', '直流侧阻抗模型', '分值 ≥ 70', '值班技术员', '手工核验派单', '工作台待办', '运行中', '编辑'],
        ['容量一致性周报订阅策略', 'SOC/SOH评估模型', '分值 ≥ 60', '资产运营经理', '汇总至周报', '邮件通知', '运行中', '编辑']
      ]
    },
    risk_tasks: {
      title: '风险任务 (Risk Tasks)',
      subtitle: '高风险隐患专项治理、消缺督办与整改追踪闭环',
      category: '风险与告警',
      desc: '集中管理由高风险预警与严重告警升级而来的专项整改任务，提供全流程节点打卡、复核销号与责任人绩效考核追踪。',
      icon: ListTodo,
      color: 'text-[#FA8C16] bg-[#FFF7E6] border-[#FFD591]',
      badge: '闭环督办',
      stats: [
        { label: '当前督办任务', value: '6', unit: '项', change: '4项整改中', isPositive: false },
        { label: '整改按期率', value: '96.5%', unit: '', change: '+1.5%', isPositive: true },
        { label: '复发率 (30天内)', value: '< 1.2%', unit: '', change: '根因消缺', isPositive: true },
        { label: '本周已闭环', value: '5', unit: '项', change: '归档完成', isPositive: true },
      ],
      tableHeaders: ['任务编号', '任务名称', '关联风险/电站', '督办等级', '牵头责任人', '整改截止期', '进度', '操作'],
      sampleRows: [
        ['TSK-RSK-0825-01', '南通如东站 02#舱热管理液冷管路专项复紧', 'ST-001 (液冷渗漏)', '特级督办', '张伟 (区域总)', '2026-08-27', '60%', '推进处理'],
        ['TSK-RSK-0824-02', '盐城大丰站 BMS采样线束批量防磨绝缘套管加装', 'ST-002 (微短路隐患)', '重点督办', '李志刚', '2026-08-28', '35%', '推进处理'],
        ['TSK-RSK-0820-03', '常州金坛站 消防联动阀门压力衰减回溯消缺', 'ST-004 (消防动环)', '常规督办', '周建国', '2026-08-25', '100%', '验收销号']
      ]
    },
    health_inspection: {
      title: '健康巡检 (Health Inspection)',
      subtitle: '储能系统电气、结构、动环多维度全景体检与健康度打分',
      category: '分析诊断',
      desc: '自动化执行电站健康体检算法，涵盖电芯 SOH 衰减率、内阻一致性、PCS 转换效率、温控系统能耗比及消防安全等 24 项关键指标。',
      icon: Stethoscope,
      color: 'text-[#52C41A] bg-[#F6FFED] border-[#B7EB8F]',
      badge: '健康评估',
      stats: [
        { label: '全域电站健康均分', value: '94.8', unit: '分', change: '健康等级 A+', isPositive: true },
        { label: '亚健康电站 (70-85分)', value: '12', unit: '座', change: '需例行体检', isPositive: false },
        { label: '体检覆盖率', value: '100%', unit: '', change: '自动每日体检', isPositive: true },
        { label: '建议优化策略项', value: '28', unit: '条', change: '可提升充放效率', isPositive: true },
      ],
      tableHeaders: ['电站名称', '综合健康评分', '电芯健康度(SOH)', '热管理健康度', '电气绝缘等级', '上次体检时间', '评估结论', '操作'],
      sampleRows: [
        ['南通如东 50MW/100MWh 储能电站', '91.5 分 (优秀)', '96.2%', '89.0% (建议清洗冷凝器)', 'I级正常 (>500MΩ)', '今天 04:00', '整体优良，局部温差待关注', '查看体检报告'],
        ['盐城大丰 30MW/60MWh 共享储能电站', '96.8 分 (卓越)', '98.5%', '97.2%', 'I级正常 (>500MΩ)', '今天 04:00', '全项优良，状态稳定', '查看体检报告'],
        ['无锡高新 20MW/40MWh 用户侧电站', '84.0 分 (良好)', '93.1%', '79.5% (PCS温升高)', 'II级关注 (320MΩ)', '今天 04:00', '建议例行维护 PCS 冷却风道', '查看体检报告']
      ]
    },
    ai_diagnosis: {
      title: 'AI诊断 (AI Diagnostic Engine)',
      subtitle: '深度电化学机理与大数据混合智能故障根因溯源',
      category: '分析诊断',
      desc: '利用大模型与电化学物理机理模型对电芯历史时序曲线、充放电伏安特性进行解耦分析，精准定位电极活性物质损失、锂沉积或物理连接松动。',
      icon: BrainCircuit,
      color: 'text-[#722ED1] bg-[#F9F0FF] border-[#D3ADF7]',
      badge: '专家大模型',
      stats: [
        { label: '诊断分析准确率', value: '97.8%', unit: '', change: '基于10万+故障库', isPositive: true },
        { label: '平均诊断耗时', value: '1.2', unit: '秒', change: '秒级出具报告', isPositive: true },
        { label: '典型故障知识库', value: '1,420', unit: '条', change: '涵盖主流电芯型号', isPositive: true },
        { label: 'SOP匹配度', value: '99.1%', unit: '', change: '自动生成排查清单', isPositive: true },
      ],
      tableHeaders: ['诊断任务', '分析对象', '识别根因', '置信度', '机理分析依据', '推荐消缺方案', '诊断时间', '操作'],
      sampleRows: [
        ['DIAG-2026-0825-01', '南通如东站 02#舱-03模组', '极柱螺栓接触电阻偏大导致局部温升', '96.5%', '恒流放电阶段 I²R 焦耳热特性完全吻合', '对03#模组正负极端子进行标准力矩复紧(8N·m)', '10:15', '导出诊断报告'],
        ['DIAG-2026-0824-02', '无锡高新站 PCS-01', '滤波电容容量衰减导致谐波畸变', '94.2%', '网侧 THDu 谐波含量突增至 4.8%', '停电更换 C3/C4 滤波电容组', '昨日 16:30', '导出诊断报告']
      ]
    },
    analysis_perf: {
      title: '运行分析 - 性能 (Performance Analytics)',
      subtitle: '综合充放电效率、等效利用小时数与容量衰减曲线',
      category: '分析诊断 > 运行分析',
      desc: '深度挖掘电站全生命周期吞吐电量、充放电能量转换效率 (RTE)、辅助用电率与容量衰减速率，支持同类型电站横向对标分析。',
      icon: Gauge,
      color: 'text-[#1890FF] bg-[#E6F7FF] border-[#91D5FF]',
      badge: '能效对标',
      stats: [
        { label: '平均转换效率 (RTE)', value: '87.6%', unit: '', change: '+0.4% 同比提升', isPositive: true },
        { label: '等效充放电循环', value: '1.82', unit: '次/天', change: '调度响应充分', isPositive: true },
        { label: '站用电耗电率', value: '3.45%', unit: '', change: '液冷变频节能优化中', isPositive: true },
        { label: '可用容量保持率', value: '97.2%', unit: '', change: '衰减曲线正常', isPositive: true },
      ],
      tableHeaders: ['电站名称', '电池类型', '额定容量', '当日吞吐量', '转换效率(RTE)', '辅电耗比', '等效利用小时', '对标排名'],
      sampleRows: [
        ['常州金坛盐穴储能站', 'LFP 280Ah', '200.0 MWh', '356.2 MWh', '89.2%', '2.8%', '3.56 h', 'Top 1 (标杆)'],
        ['南通如东储能电站', 'LFP 314Ah', '100.0 MWh', '174.5 MWh', '88.1%', '3.2%', '3.49 h', 'Top 5 (优良)'],
        ['盐城大丰共享储能电站', 'LFP 280Ah', '60.0 MWh', '102.8 MWh', '87.4%', '3.6%', '3.42 h', 'Top 12 (优良)']
      ]
    },
    analysis_config: {
      title: '运行分析 - 配置 (Strategy Configuration)',
      subtitle: '充放电调度控制策略、保护定值与削峰填谷时段参数',
      category: '分析诊断 > 运行分析',
      desc: '统一配置电网调峰调频曲线、SOC 上下限保护阈值、恒功率/恒流充放模式及电价峰谷套利参数策略下发。',
      icon: SlidersHorizontal,
      color: 'text-[#595959] bg-[#FAFAFA] border-[#D9D9D9]',
      badge: '策略控制',
      stats: [
        { label: '当前生效控制策略', value: '两充两放峰谷套利', unit: '', change: '全站同步', isPositive: true },
        { label: 'SOC 工作区间定值', value: '5% - 95%', unit: '', change: '延长电芯寿命', isPositive: true },
        { label: '最大允许充放倍率', value: '0.5 C', unit: '', change: '热平衡保护', isPositive: true },
        { label: '策略下发同步率', value: '100%', unit: '', change: '484 站已就绪', isPositive: true },
      ],
      tableHeaders: ['策略名称', '适用电站类型', '时段划分', '目标SOC区间', '功率限制', '最近修改时间', '下发状态', '操作'],
      sampleRows: [
        ['江苏电网夏季调峰响应策略 V2.4', '电网侧集中式储能', '谷电 00:00-08:00 / 峰电 17:00-21:00', '10% - 95%', '≤ 50 MW', '2026-08-20', '已下发运行', '修改参数'],
        ['工业园区用户侧防逆流与需量控制策略', '用户侧分布式储能', '根据变压器实时容量动态限制', '15% - 90%', '动态跟随', '2026-08-15', '已下发运行', '修改参数']
      ]
    },
    device_management: {
      title: '设备管理 (Device Management)',
      subtitle: 'BMS、PCS、变压器、电池舱与动环传感器设备全生命周期资产台账',
      category: '资产管理 assets > 设备',
      desc: '管理全网 484 座电站共计 12,850 台电气设备的台账明细、出厂铭牌、序列号、固件版本、维保周期及运行实时状态。',
      icon: Box,
      color: 'text-[#1890FF] bg-[#E6F7FF] border-[#91D5FF]',
      badge: '资产设备',
      stats: [
        { label: '资产设备在册总数', value: '12,850', unit: '台', change: '在线率 99.4%', isPositive: true },
        { label: '电池舱总数', value: '968', unit: '舱', change: '均为标准集装箱', isPositive: true },
        { label: 'PCS 变流器总数', value: '1,420', unit: '台', change: '正常运行 1,416', isPositive: true },
        { label: '维保临期设备', value: '14', unit: '台', change: '本月计划巡检', isPositive: false },
      ],
      tableHeaders: ['设备编号 (SN)', '设备名称与类型', '所属电站/舱位', '设备厂商与型号', '安装投运日期', '维保周期', '运行状态', '操作'],
      sampleRows: [
        ['DEV-PCS-2024-0012', '1250kW 储能变流器 (PCS)', '南通如东站 #01舱', '阳光电源 SC1250UD', '2024-06-18', '每年一次 (下月到期)', '运行正常', '设备档案'],
        ['DEV-BMS-2024-0894', '主控 BMS 电池管理系统', '南通如东站 #01舱', '宁德时代 BMS-Master-V3', '2024-06-18', '每半年一次', '运行正常', '设备档案'],
        ['DEV-HVAC-2024-034', '40kW 工业变频液冷机组', '南通如东站 #01舱', '英维克 Envicool-L40', '2024-06-18', '每季度一次', '运行正常', '设备档案'],
        ['DEV-BAT-2024-1102', 'LFP 314Ah 电池插箱模组', '盐城大丰站 #02舱', '中创新航 LFP-314-1P16S', '2024-09-01', '状态免维', '运行正常', '设备档案']
      ]
    },
    device_upgrade: {
      title: '设备升级管理 (OTA & Firmware Upgrade)',
      subtitle: 'BMS 主从控固件、PCS 控制器程序远程 OTA 批量升级与回滚管理',
      category: '资产管理 assets > 设备',
      desc: '支持向全网电站分批下发安全固件补丁、算法模型更新包与通信协议升级，具备灰度升级验证、断点续传与一键快速回滚机制。',
      icon: ArrowUpCircle,
      color: 'text-[#722ED1] bg-[#F9F0FF] border-[#D3ADF7]',
      badge: '固件OTA',
      stats: [
        { label: '当前最新固件版本', value: 'V3.8.2-Release', unit: '', change: '优化主动均衡算法', isPositive: true },
        { label: '全网固件升级率', value: '92.4%', unit: '', change: '已完成 447 站', isPositive: true },
        { label: '升级中任务', value: '2', unit: '批次', change: '华东区灰度中', isPositive: true },
        { label: '升级异常回滚数', value: '0', unit: '次', change: '100% 成功率', isPositive: true },
      ],
      tableHeaders: ['升级批次号', '目标设备类型', '目标固件版本', '下发范围', '升级进度', '发布时间', '状态', '操作'],
      sampleRows: [
        ['OTA-2026-0820-A', 'BMS 从控采集板 (BMU)', 'v3.8.2-opt', '华东一区 12 座试点电站', '100% (12/12)', '2026-08-20', '升级完成', '查看日志'],
        ['OTA-2026-0824-B', 'PCS 协调控制器 (EMS-Edge)', 'v2.4.0-patch', '苏北地区 8 座电站', '62.5% (5/8)', '2026-08-24', '灰度升级中', '升级监控'],
        ['OTA-2026-0810-C', '消防动环网关固件', 'v1.9.5-sec', '全网 484 座电站', '100% (484/484)', '2026-08-10', '升级完成', '查看日志']
      ]
    },
    station_management: {
      title: '站点管理 (Station Assets)',
      subtitle: '全域储能电站资产档案、地理坐标、投运容量与值守信息',
      category: '资产管理 assets',
      desc: '统一维护电站接入并网许可证、经纬度地理信息、并网电压等级（10kV/35kV/110kV）、变压器台数、消防责任人及驻站值班排班表。',
      icon: Building2,
      color: 'text-[#1890FF] bg-[#E6F7FF] border-[#91D5FF]',
      badge: '电站台账',
      stats: [
        { label: '电站资产在网总数', value: '484', unit: '座', change: '已全部建档', isPositive: true },
        { label: '电网侧大型集中电站', value: '62', unit: '座', change: '容量占比 65%', isPositive: true },
        { label: '工商业分布式储能站', value: '380', unit: '座', change: '快速增长', isPositive: true },
        { label: '独立共享储能电站', value: '42', unit: '座', change: '容量占比 25%', isPositive: true },
      ],
      tableHeaders: ['电站编号', '电站名称', '所属区域与地址', '电站类型', '总容量/总功率', '并网电压', '站长/联系人', '操作'],
      sampleRows: [
        ['ST-001', '南通如东 50MW/100MWh 储能电站', '江苏省南通市如东县沿海经济开发区', '集中式独立储能', '100.0 MWh / 50 MW', '110 kV', '陈建国 (138****1234)', '电站详情'],
        ['ST-002', '盐城大丰 30MW/60MWh 共享储能电站', '江苏省盐城市大丰区港区产业园', '共享储能电站', '60.0 MWh / 30 MW', '35 kV', '李明华 (139****5678)', '电站详情'],
        ['ST-003', '无锡高新 20MW/40MWh 用户侧电站', '江苏省无锡市新吴区综合保税区', '工商业用户侧', '40.0 MWh / 20 MW', '10 kV', '王强 (137****9012)', '电站详情'],
        ['ST-004', '常州金坛 100MW/200MWh 储能电站', '江苏省常州市金坛区盐穴储能基地', '大规模并网电站', '200.0 MWh / 100 MW', '220 kV', '赵伟 (136****3456)', '电站详情']
      ]
    }
  };

  const current = pageMeta[view] || {
    title: '功能页面',
    subtitle: '主动运维平台功能中心',
    category: '平台服务',
    desc: '该模块正在由平台分析引擎实时渲染与同步中。',
    icon: Layers,
    color: 'text-[#595959] bg-[#FAFAFA] border-[#E8E8E8]',
    badge: '子系统',
    stats: [
      { label: '服务状态', value: '正常运行', unit: '', change: '100% 可用', isPositive: true },
      { label: '数据同步', value: '实时同步中', unit: '', change: '延时 < 100ms', isPositive: true }
    ],
    tableHeaders: ['项目编号', '项目名称', '所属模块', '状态', '更新时间', '操作'],
    sampleRows: [
      ['SYS-001', '系统数据通道 A', '核心通信网关', '正常', '刚刚', '查看']
    ]
  };

  const Icon = current.icon;

  return (
    <div className="space-y-4 max-w-[1920px] mx-auto animate-in fade-in duration-200">
      
      {/* 顶部面包屑与快捷导航栏 */}
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
            <span className="text-xs text-[#8C8C8C]">{current.category}</span>
            <span className="text-xs text-[#BFBFBF]">/</span>
            <span className="text-xs font-semibold text-[#1F1F1F]">{current.title}</span>
            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-[#E6F7FF] text-[#1890FF] border border-[#91D5FF]">
              {current.badge}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => alert('已触发实时数据刷新')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#D9D9D9] hover:bg-[#FAFAFA] text-xs text-[#595959] cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3 h-3 text-[#1890FF]" />
            <span>刷新数据</span>
          </button>
          <button
            type="button"
            onClick={() => alert('已导出当前视图台账清单 (Excel)')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#1890FF] hover:bg-[#40A9FF] text-white text-xs font-medium cursor-pointer transition-colors shadow-xs"
          >
            <Download className="w-3 h-3" />
            <span>导出报表</span>
          </button>
        </div>
      </div>

      {/* 核心指标统计卡片网格 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {current.stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg p-3.5 border border-[#E8E8E8] shadow-none flex flex-col justify-between">
            <span className="text-xs text-[#8C8C8C] block">{stat.label}</span>
            <div className="my-1.5 flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-[#1F1F1F]">{stat.value}</span>
              {stat.unit && <span className="text-xs text-[#8C8C8C]">{stat.unit}</span>}
            </div>
            {stat.change && (
              <span className={`text-[11px] font-medium ${stat.isPositive ? 'text-[#52C41A]' : 'text-[#FA8C16]'}`}>
                {stat.change}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 业务表格与数据台账区 */}
      <div className="bg-white rounded-lg border border-[#E8E8E8] p-4 space-y-3.5 shadow-none">
        
        {/* 表格顶部工具栏 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#F0F0F0]">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#8C8C8C] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索电站名称、编号、设备SN或特征关键字..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#D9D9D9] rounded-md focus:border-[#1890FF] focus:outline-hidden"
              />
            </div>
            <button
              type="button"
              className="px-2.5 py-1.5 border border-[#D9D9D9] hover:bg-[#FAFAFA] text-xs text-[#595959] rounded-md flex items-center gap-1 cursor-pointer"
            >
              <Filter className="w-3 h-3 text-[#1890FF]" />
              <span>筛选</span>
            </button>
          </div>

          <div className="text-xs text-[#8C8C8C] flex items-center gap-2">
            <span>共检索到 {current.sampleRows.length} 条记录</span>
          </div>
        </div>

        {/* 数据表格 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#E8E8E8] text-[#595959] font-medium">
                {current.tableHeaders.map((head, idx) => (
                  <th key={idx} className="p-2.5 first:pl-3 last:pr-3 whitespace-nowrap">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0]">
              {current.sampleRows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-[#F5F7FA] transition-colors">
                  {row.map((cell, cellIdx) => {
                    const isLast = cellIdx === row.length - 1;
                    return (
                      <td key={cellIdx} className="p-2.5 first:pl-3 last:pr-3 text-[#262626] whitespace-nowrap">
                        {isLast ? (
                          <button
                            type="button"
                            onClick={() => alert(`已触发对【${row[0]}】的操作`)}
                            className="text-[#1890FF] hover:underline font-medium cursor-pointer"
                          >
                            {cell}
                          </button>
                        ) : cellIdx === 0 ? (
                          <span className="font-medium text-[#1F1F1F]">{cell}</span>
                        ) : (
                          <span>{cell}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 表格底部信息与回到工作台导引 */}
        <div className="pt-3 border-t border-[#F0F0F0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#8C8C8C]">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#1890FF]" />
            <span>数据源连接正常 · 主动运维分析引擎实时计算</span>
          </div>
          <button
            type="button"
            onClick={onReturnToWorkbench}
            className="text-[#1890FF] hover:underline font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>回到首页工作台集中处置</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
