/**
 * Proactive O&M Operations Workbench - Core Type Definitions & Thresholds
 */

// 优先级枚举
export type PriorityLevel = '高' | '中' | '低';

// 工单状态 (以 pcare 为准)
export type TicketStatus = '待受理' | '处理中' | '挂起中' | '待验收' | '已完成';

// 风险类型
export type RiskType = '预警' | '告警';

// 风险状态
export type RiskStatus = '待处理' | '已转工单' | '已忽略' | '已消除';

// 作业类型 (例行作业)
export type TaskType = '巡检' | '整改';

// 作业状态
export type TaskStatus = '待执行' | '执行中' | '已完成' | '已超期';

// 作业周期
export type TaskPeriod = '日' | '周' | '月' | '季';

// 运行策略 (长期配置)
export type OperationStrategy = 'TOU削峰填谷' | '最大自发自用' | '全额上网' | '需量控制/备用';

// 实时状态 (物理当下状态)
export type RealTimeStatus = '充电' | '放电' | '待机' | '故障';

// 工单定义 (pcare 数据源)
export interface TicketItem {
  id: string; // 工单号，如 PC-20260825-001
  title: string; // 工单摘要
  priority: PriorityLevel; // 优先级
  riskScore: number; // 风险分 0-100 (主动运维平台评估)
  stationId: string; // 电站ID
  stationName: string; // 关联电站名
  region: string; // 区域 (苏北, 苏南, 浙北等)
  assignee: string; // 责任人
  createdAt: string; // 创建时间
  slaRemainingHours: number; // SLA 剩余小时数 (负数表示已超时)
  slaDeadline: string; // SLA 截止时间
  status: TicketStatus; // pcare 流程状态
  deviceCode?: string; // 设备位号 (如 2#储能集装箱-PCS-03)
  description?: string; // 故障现象与分析
  suggestedAction?: string; // 专家系统建议动作
  linkedRiskId?: string; // 关联的主动运维平台风险ID
  logs?: Array<{
    time: string;
    operator: string;
    action: string;
    note?: string;
  }>;
}

// 风险定义 (主动运维平台分析产出)
export interface RiskItem {
  id: string; // 风险编号，如 R-20260825-101
  title: string; // 风险标题/特征描述
  type: RiskType; // 告警 (已发生越限) / 预警 (预测潜在故障)
  riskScore: number; // 风险分 0-100
  priority: PriorityLevel; // 优先级
  region: string; // 区域
  stationId: string; // 电站ID
  stationName: string; // 电站名称
  assignee: string; // 责任人
  status: RiskStatus; // 待处理 / 已转工单 / 已忽略 / 已消除
  discoveredAt: string; // 发现时间
  category: string; // 风险类别 (电池热失控前兆, PCS过温, SOC离散度过大, 绝缘阻抗下降)
  confidence?: number; // 预测置信度 (0-100%)
  symptomDetail?: string; // 现象详述
  evidence?: {
    metric: string;
    value: string;
    threshold: string;
    trend: string;
  };
  linkedTicketId?: string; // 已转工单的工单号 (双向链接)
}

// 例行作业定义
export interface RoutineTaskItem {
  id: string; // 任务编号，如 TK-20260825-01
  name: string; // 任务名称
  taskType: TaskType; // 巡检 / 整改
  stationId: string; // 关联电站
  stationName: string; // 关联电站名
  region: string; // 区域
  assignee: string; // 责任人
  status: TaskStatus; // 待执行 / 执行中 / 已完成 / 已超期
  deadline: string; // 截止时间
  period: TaskPeriod; // 周期 (日 / 周 / 月)
  progress: number; // 进度百分比 (0-100)
  itemsTotal: number; // 检查项总数
  itemsCompleted: number; // 已检查项
  defectFound?: number; // 发现缺陷数
  overdueHours?: number; // 超期小时数
  description?: string;
}

// 放电统计每日数据 (近 14 天)
export interface DailyDischargeStat {
  date: string; // 日期 MM-DD
  dischargeCount: number; // 日放电次数
  dischargeEnergyMWh: number; // 放电电量 (MWh)
  chargeEnergyMWh: number; // 充电电量 (MWh)
  efficiencyRate: number; // 综合转换效率 %
}

// 运营指标全局概览
export interface OperationsMetrics {
  cloudRate: {
    percentage: number; // 上云率 %
    connectedStations: number; // 已接入电站数
    totalStations: number; // 总电站数
    dailyChange: number; // 较昨日变化 %
  };
  powerOnRate: {
    percentage: number; // 上电率 %
    monitoredStations: number; // 当前上电电站数
    connectedStations: number; // 已接入电站数
    offlineStations: number; // 离线/检修数
    dailyChange: number; // 较昨日变化 %
  };
  dischargeSummary: {
    todayCount: number; // 今日放电次数
    todayEnergyMWh: number; // 今日放电电量 MWh
    dailyTrend: DailyDischargeStat[];
  };
  strategyDistribution: Array<{
    name: OperationStrategy;
    count: number;
    percentage: number;
    color: string;
  }>;
  realtimeStatusDistribution: Array<{
    name: RealTimeStatus;
    count: number;
    percentage: number;
    color: string;
  }>;
  regionalRiskTop5: Array<{
    region: string;
    warningCount: number; // 预警数
    alarmCount: number; // 告警数
    total: number;
  }>;
}

// 路由与页面状态定义
export type ActiveView = 
  | 'workbench' 
  | 'ticket_process' 
  | 'ticket_detail'
  | 'risk_detail' 
  | 'task_process'
  | 'quick_action_modal'
  | 'page_risk_center'
  | 'page_ticket_center'
  | 'page_task_center'
  | 'page_dashboard'
  | 'page_report_center';

// 阈值常量配置 (可在 mock 中统一读取与调整)
export const CONFIG_THRESHOLDS = {
  HIGH_RISK_SCORE_MIN: 80, // 风险分 >= 80 为高风险
  SLA_URGENT_HOURS: 4, // SLA 剩余 < 4h 为临期预警 (橙色)
  SLA_EXPIRED_HOURS: 0, // SLA <= 0h 为已超时 (深红 + 行微红)
  CURRENT_REGION: '华东一区 (江苏/苏北/苏南)',
  CURRENT_USER_NAME: '张伟',
  CURRENT_USER_ROLE: '区域运维负责人',
  CURRENT_USER_AVATAR: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
};
