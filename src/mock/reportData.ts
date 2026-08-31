import { ReportTemplate, ReportGenerationTask } from '../types';

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'tpl-weekly-operation',
    name: '区域储能资产健康与运维运营周报',
    code: 'TPL-OPS-WEEKLY-V2',
    category: '运营周报',
    description: '适用于周度例会与区域运维督办，快速复盘全域电量充放、SLA工单响应闭环、突发告警消缺与超期作业。',
    tag: '高频',
    estimatedTime: '3 秒',
    targetAudience: '区域运维负责人、现场运维班长、资产运营专员',
    sections: [
      '一、周度综合运营 KPI 概览 (上云/上电/可利用率)',
      '二、削峰填谷充放电电量与转换效率分析',
      '三、pcare 工单 SLA 履约与快速消缺闭环统计',
      '四、AI 算法主动预警命中与重点故障归因',
      '五、例行巡检与隐患整改督办清单',
      '六、下周重点工作与高温防汛运维预警'
    ],
    presetPeriod: 'week',
    defaultTitleTemplate: '华东一区 2026年第{WEEK}周储能资产运营与主动运维分析简报',
    coverColor: '#1890FF'
  },
  {
    id: 'tpl-monthly-whitepaper',
    name: '储能电站月度主动运维与机理诊断白皮书',
    code: 'TPL-DIAG-MONTHLY-V4',
    category: '月度白皮书',
    description: '深度分析全月充放电深度、电芯一致性离散度、SOH健康衰减趋势、机理模型预警命中率与消缺降损成效。',
    tag: '推荐',
    estimatedTime: '5 秒',
    targetAudience: '技术总监、资产管理部、储能技术委员会、电站业主',
    sections: [
      '一、月度全域资产健康度与综合可利用率评估',
      '二、电芯内阻/温升/容量多维机理退化诊断复盘',
      '三、热失控隐患潜伏期提前捕获与精准拦截案例',
      '四、工单全生命周期流转效率与 SLA 达标深度剖析',
      '五、预防性试验、防雷绝缘与液冷系统专项维保',
      '六、全域储能资产寿命延长与策略优化建议'
    ],
    presetPeriod: 'month',
    defaultTitleTemplate: '华东一区 2026年8月储能资产深度运维与健康诊断白皮书',
    coverColor: '#722ED1'
  },
  {
    id: 'tpl-quarterly-eval',
    name: '电站季度资产效益与设备可靠性综合评估报告',
    code: 'TPL-ASSET-QUARTER-V1',
    category: '季度评估',
    description: '面向管理层与资方的季度战略报告，综合评估等效满仓利用小时数、电价套利收益率、重大设备MTBF与安全合规态势。',
    tag: '管理层专报',
    estimatedTime: '6 秒',
    targetAudience: '集团高管、资方代表、电网调度联络员',
    sections: [
      '一、季度收益与削峰填谷等效循环次数(EFC)测算',
      '二、变压器、PCS与BMS重大设备平均无故障时间(MTBF)',
      '三、安全生产零事故合规性审查与消防联动演练结果',
      '四、主动运维平台预测收益与故障挽回价值量化',
      '五、下一季度备品备件库存储备与大修技改规划'
    ],
    presetPeriod: 'quarter',
    defaultTitleTemplate: '华东一区 2026年第三季度储能资产综合效益与设备可靠性评估报告',
    coverColor: '#FA8C16'
  },
  {
    id: 'tpl-station-health-special',
    name: '单电站专题体检与极端工况机理诊断报告',
    code: 'TPL-SPECIAL-STATION-V3',
    category: '单站深度体检',
    description: '针对特定高危或异常电站进行点对点深度扫描，包含单体电池级红外温升曲线、极柱接触阻抗与气液循环全景体检。',
    tag: '技术专刊',
    estimatedTime: '4 秒',
    targetAudience: '现场技术专家、电芯厂商工程师、机理算法团队',
    sections: [
      '一、目标电站基础台账与当下物理工况',
      '二、Rack/Pack 级单体电压温差分布热力图',
      '三、极柱螺栓力矩松动与接触内阻逆变推演',
      '四、液冷循环压力衰减与冷媒管路探伤结果',
      '五、点对点专家消缺指令与定性复查规程'
    ],
    presetPeriod: 'custom',
    defaultTitleTemplate: '【专项诊断】宿迁泗洪50MW/100MWh储能电站极端工况体检报告',
    coverColor: '#13C2C2'
  },
  {
    id: 'tpl-safety-compliance',
    name: '储能安全生产合规与例行作业履约专项报告',
    code: 'TPL-SAFETY-COMPLIANCE-V1',
    category: '安全合规专项',
    description: '聚焦消防联动、可燃气体探测、绝缘耐压试验、防汛防雷与例行巡检作业整改清单，符合国家能源局与电网安全监管要求。',
    tag: '安全专项',
    estimatedTime: '4 秒',
    targetAudience: '安监部、合规专员、地方能源监管部门',
    sections: [
      '一、全域电站消防喷淋与气体灭火系统在线率',
      '二、高压绝缘阻抗监测与漏电保护动作抽检',
      '三、例行巡检与隐患整改闭环率(100%督办)',
      '四、恶劣天气(雷暴/高温/台风)应急响应演练',
      '五、安全生产责任制与持证上岗核验台账'
    ],
    presetPeriod: 'month',
    defaultTitleTemplate: '华东一区 2026年8月储能安全合规与作业履约专项自查报告',
    coverColor: '#52C41A'
  }
];

export const DEFAULT_SAMPLE_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>{{reportTitle}}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 24px; color: #1e293b; background: #f8fafc; }
    .card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; border-radius: 12px; padding: 28px; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .metric { background: #f1f5f9; padding: 16px; border-radius: 8px; }
    .metric-value { font-size: 24px; font-weight: bold; color: #0f172a; margin-top: 4px; }
    .metric-label { font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="header">
    <div style="font-size: 12px; opacity: 0.85; margin-bottom: 6px;">储能主动运维与资产健康智能报告</div>
    <h1 style="margin: 0 0 12px 0; font-size: 24px;">{{reportTitle}}</h1>
    <div style="font-size: 13px; opacity: 0.9; display: flex; gap: 20px;">
      <span>📍 监测范围: {{scope}}</span>
      <span>📅 统计周期: {{dateRange}}</span>
      <span>👤 责任编制: {{creator}}</span>
    </div>
  </div>

  <div class="grid" style="margin-bottom: 24px;">
    <div class="metric">
      <div class="metric-label">全域上云率</div>
      <div class="metric-value">{{cloudRate}}</div>
    </div>
    <div class="metric">
      <div class="metric-label">实时上电率</div>
      <div class="metric-value">{{powerOnRate}}</div>
    </div>
    <div class="metric">
      <div class="metric-label">SLA 工单达标率</div>
      <div class="metric-value">{{slaRate}}</div>
    </div>
    <div class="metric">
      <div class="metric-label">重点隐患预警</div>
      <div class="metric-value">{{totalRisks}} 项</div>
    </div>
  </div>

  <div class="card">
    <h2 style="font-size: 16px; margin-top: 0; color: #0f172a;">一、全域运行态势与消缺概况</h2>
    <p style="font-size: 14px; line-height: 1.6; color: #475569;">
      本次报告覆盖监测范围 <strong>{{scope}}</strong>，统计周期为 <strong>{{dateRange}}</strong>。期间累计接入工单 <strong>{{totalTickets}}</strong> 单（已处理闭环 <strong>{{completedTickets}}</strong> 单），排查重点风险 <strong>{{totalRisks}}</strong> 项，执行例行任务 <strong>{{totalTasks}}</strong> 项（已超期 <strong>{{overdueTasks}}</strong> 项）。
    </p>
  </div>
</body>
</html>`;

export const INITIAL_REPORT_TASKS: ReportGenerationTask[] = [
  {
    id: 'RPT-TASK-20260830-01',
    taskType: 'once',
    templateId: 'tpl-weekly-operation',
    templateName: '区域储能资产健康与运维运营周报',
    reportTitle: '华东一区 2026年第34周储能资产运营与主动运维分析简报',
    periodType: 'week',
    dateRange: '2026-08-18 ~ 2026-08-25',
    scope: '华东一区 (全域484座电站)',
    creator: '张伟 (区域运维负责人)',
    createdAt: '2026-08-25 09:30',
    completedAt: '2026-08-25 09:30:04',
    status: 'completed',
    progress: 100,
    stepLog: '报告生成完毕，已固化 HTML 单文件与矢量图表',
    fileFormat: 'HTML',
    fileSize: '1.42 MB',
    config: {
      includeAiInsights: true,
      includeDischargeDetails: true,
      includeSlaTickets: true,
      includeRiskMatrix: true,
      includeRoutineTasks: true
    }
  },
  {
    id: 'RPT-TASK-SCHED-01',
    taskType: 'periodic',
    templateId: 'tpl-weekly-operation',
    templateName: '区域储能资产健康与运维运营周报',
    reportTitle: '【周期调度】华东一区 区域运营周度主动运维全景简报',
    periodType: 'week',
    dateRange: '动态周期: 每周一 08:00 自动回溯上周数据',
    scope: '华东一区 (全域484座电站)',
    creator: '张伟 (系统定时巡检)',
    createdAt: '2026-08-01 08:00',
    completedAt: '2026-08-25 08:00:05',
    status: 'completed',
    progress: 100,
    stepLog: '最近一次调度成功生成，已向【华东运维大群】推送报告',
    fileFormat: 'HTML',
    fileSize: '1.48 MB',
    scheduleConfig: {
      frequency: 'weekly',
      executionTime: '08:00',
      dayOfWeek: 1,
      cronSummary: '每周一 08:00 定时执行',
      dataWindow: 'previous_cycle',
      isActive: true,
      nextExecutionTime: '2026-08-31 08:00:00',
      lastExecutionTime: '2026-08-25 08:00:00',
      executionCount: 14,
      notifyChannels: ['dingtalk', 'wecom', 'system'],
      recipients: '华东运维班组群、区域技术专工'
    },
    config: {
      includeAiInsights: true,
      includeDischargeDetails: true,
      includeSlaTickets: true,
      includeRiskMatrix: true,
      includeRoutineTasks: true
    }
  },
  {
    id: 'RPT-TASK-SCHED-02',
    taskType: 'periodic',
    templateId: 'tpl-monthly-whitepaper',
    templateName: '储能电站月度主动运维与机理诊断白皮书',
    reportTitle: '【周期调度】全域储能资产月度主动运维与机理诊断白皮书',
    periodType: 'month',
    dateRange: '动态周期: 每月 1 日 09:00 自动回溯上月整月数据',
    scope: '华东一区 (全域484座电站)',
    creator: '李工 (技术总监)',
    createdAt: '2026-07-01 09:00',
    completedAt: '2026-08-01 09:00:08',
    status: 'completed',
    progress: 100,
    stepLog: '最近一次月报生成归档完成，已抄送资产管理委员会',
    fileFormat: 'HTML',
    fileSize: '2.35 MB',
    scheduleConfig: {
      frequency: 'monthly',
      executionTime: '09:00',
      dayOfMonth: 1,
      cronSummary: '每月 1 日 09:00 定时执行',
      dataWindow: 'previous_cycle',
      isActive: true,
      nextExecutionTime: '2026-09-01 09:00:00',
      lastExecutionTime: '2026-08-01 09:00:00',
      executionCount: 6,
      notifyChannels: ['email', 'wecom'],
      recipients: '资产管理部、储能技术委员会'
    },
    config: {
      includeAiInsights: true,
      includeDischargeDetails: true,
      includeSlaTickets: true,
      includeRiskMatrix: true,
      includeRoutineTasks: true
    }
  },
  {
    id: 'RPT-TASK-20260830-02',
    taskType: 'once',
    templateId: 'tpl-monthly-whitepaper',
    templateName: '储能电站月度主动运维与机理诊断白皮书',
    reportTitle: '华东一区 2026年8月储能资产深度运维与健康诊断白皮书',
    periodType: 'month',
    dateRange: '2026-08-01 ~ 2026-08-25',
    scope: '华东一区 (全域484座电站)',
    creator: '张伟 (区域运维负责人)',
    createdAt: '2026-08-25 14:15',
    completedAt: '2026-08-25 14:15:06',
    status: 'completed',
    progress: 100,
    stepLog: '报告生成完毕，包含 4 维物理量时序异动与机理推演',
    fileFormat: 'HTML',
    fileSize: '2.18 MB',
    config: {
      includeAiInsights: true,
      includeDischargeDetails: true,
      includeSlaTickets: true,
      includeRiskMatrix: true,
      includeRoutineTasks: true
    }
  },
  {
    id: 'RPT-TASK-SCHED-03',
    taskType: 'periodic',
    templateId: 'tpl-safety-compliance',
    templateName: '储能安全生产合规与例行作业履约专项报告',
    reportTitle: '【周期调度】每日全域储能电站例行安全合规与早班作业巡查',
    periodType: 'custom',
    dateRange: '动态周期: 每日 06:30 自动回溯近 24 小时数据',
    scope: '华东一区 (全域484座电站)',
    creator: '王安全 (安监专员)',
    createdAt: '2026-08-10 06:30',
    completedAt: '2026-08-25 06:30:03',
    status: 'completed',
    progress: 100,
    stepLog: '调度任务暂停中 (已由责任人挂起维护)',
    fileFormat: 'HTML',
    fileSize: '1.20 MB',
    scheduleConfig: {
      frequency: 'daily',
      executionTime: '06:30',
      cronSummary: '每日 06:30 定时执行',
      dataWindow: 'recent_24h',
      isActive: false,
      nextExecutionTime: '已挂起 (暂停中)',
      lastExecutionTime: '2026-08-25 06:30:00',
      executionCount: 15,
      notifyChannels: ['dingtalk', 'system'],
      recipients: '早班值守班组'
    },
    config: {
      includeAiInsights: true,
      includeDischargeDetails: false,
      includeSlaTickets: true,
      includeRiskMatrix: true,
      includeRoutineTasks: true
    }
  },
  {
    id: 'RPT-TASK-20260830-03',
    taskType: 'once',
    templateId: 'tpl-station-health-special',
    templateName: '单电站专题体检与极端工况机理诊断报告',
    reportTitle: '【专项体检】宿迁泗洪50MW储能电站极柱接触内阻专项分析报告',
    periodType: 'custom',
    dateRange: '2026-08-20 ~ 2026-08-25',
    scope: '宿迁泗洪储能电站 (ST-SQ-001)',
    creator: '张海波 (特种作业电气工程师)',
    createdAt: '2026-08-25 16:40',
    completedAt: '2026-08-25 16:40:05',
    status: 'completed',
    progress: 100,
    stepLog: '已完成 12# 簇极柱螺栓力矩与接触阻抗专项提取',
    fileFormat: 'HTML',
    fileSize: '1.15 MB',
    config: {
      includeAiInsights: true,
      includeDischargeDetails: false,
      includeSlaTickets: true,
      includeRiskMatrix: true,
      includeRoutineTasks: false
    }
  }
];
