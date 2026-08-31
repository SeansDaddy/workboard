import { OperationSkill } from '../types';

export const INITIAL_OPERATION_SKILLS: OperationSkill[] = [
  {
    id: 'skill-bms-thermal',
    name: '储能电站温升与热失控机理主动研判 Skill',
    code: 'SKILL-BMS-THERMAL-01',
    version: 'v2.4.0',
    category: '安全防护',
    description: '通过融合单体电芯温升斜率 (dT/dt)、Rack 间温差离散度与冷却液流量压力时序，在热失控潜伏期（提前48~72h）捕获微短路与局域热阻异常。',
    author: '主动运维算法实验室 · 储能安全机理组',
    targetDomain: '磷酸铁锂/三元锂储能集装箱、BMS采样单元、液冷机组',
    rulesCount: 14,
    triggerConditions: [
      '单体电芯温升速率 dT/dt > 1.8 ℃/min (充放电期间)',
      '同一簇内电芯最高温差 ΔT_max > 6.5 ℃ 持续超过 15 分钟',
      '液冷供回水温差 > 4.2 ℃ 且伴随循环泵出口压力脉动 > 0.08 MPa',
      '静置状态下电芯自放电压降速率 dV/dt > 15 mV/day'
    ],
    diagnosticLogic: `1. 读取各电站 Rack/Pack 级别最高温、最低温、平均温与环境温时序曲线；
2. 滤除工况突变引起的正常温升，应用卡尔曼滤波提取电芯固有内阻发热分量；
3. 比对同批次电芯热阻矩阵，若偏离均值 3σ 则标定为局部热阻异变；
4. 结合气敏传感器 (CO, H2, VOC) 复合时序数据，综合输出热失控潜伏预警等级与精准消缺指导。`,
    outputSections: [
      '一、全域温升时序特征与极值温差分布热力图',
      '二、异常温升簇与可疑微短路单体定位清单',
      '三、液冷与风冷循环散热效能多维评估',
      '四、防热失控先验消缺指令与现场排查建议'
    ],
    skillContentRaw: `---
name: "储能电站温升与热失控机理主动研判 Skill"
code: "SKILL-BMS-THERMAL-01"
version: "v2.4.0"
domain: "储能安全 / BMS机理"
---
## 诊断目标
对储能电站电池簇开展高频温升与热阻时序分析，提前预警潜在热失控与微短路风险。

## 触发规则
- 单体温升速率 > 1.8℃/min
- 簇内温差 ΔT > 6.5℃
- 液冷供回水温差异常
- 气敏传感器微量挥发物突增

## 执行输出
- 温差时序热力图
- 极柱接触阻抗与微短路排查表
- 专家阻断措施建议`,
    createdAt: '2026-08-20'
  },
  {
    id: 'skill-sla-closedloop',
    name: 'SLA 工单全生命周期履约与消缺时效诊断 Skill',
    code: 'SKILL-SLA-CLOSEDLOOP-02',
    version: 'v1.8.2',
    category: 'SLA履约',
    description: '深度追踪 pcare 运维工单从触发派发、接单响应、现场处置、备件领用到验收归档的全流程节点，诊断超期瓶颈与闭环质量。',
    author: '智能运营中心 · 流程效率工程组',
    targetDomain: 'pcare 工单流转系统、现场抢修班组、备品备件库',
    rulesCount: 9,
    triggerConditions: [
      '一级紧急工单派发后接单响应耗时 > 15 分钟',
      '高风险缺陷现场到达耗时 > 2 小时 (市区) / > 4 小时 (偏远站)',
      '单次工单流转因“缺件/复测未过”退单重派次数 ≥ 2 次',
      'SLA 承诺履约周期剩余时长 < 20% 仍处于未到场状态'
    ],
    diagnosticLogic: `1. 提取工单时序日志 (派单、接单、签到、填报、审核、归档)；
2. 计算各站点与各班组平均响应 MTTR (Mean Time to Resolution) 与超时率；
3. 关联备品备件领料耗时与返工率，挖掘工单超期的主要根因；
4. 输出服务水平协议 (SLA) 综合履约指数与班组绩效排行榜。`,
    outputSections: [
      '一、全域工单流转时效与 SLA 承诺达成率',
      '二、超期与临期工单根因瓶颈聚类剖析 (缺件/派工延迟/技术卡点)',
      '三、各运维片区与班组消缺闭环效率对比',
      '四、工单流转优化与自动调度派发提升方案'
    ],
    skillContentRaw: `---
name: "SLA 工单全生命周期履约与消缺时效诊断 Skill"
code: "SKILL-SLA-CLOSEDLOOP-02"
version: "v1.8.2"
domain: "运维工单 / SLA效能"
---
## 诊断目标
分析工单流转瓶颈，优化全域 484 座电站平均消缺闭环时间 (MTTR)。

## 关键监控节点
- 响应延迟 (Target < 20min)
- 到场履约 (Target < 2h)
- 闭环验收通过率 (Target > 98%)`,
    createdAt: '2026-08-22'
  },
  {
    id: 'skill-discharge-health',
    name: '削峰填谷充放电深度与电池健康衰减(SOH)评估 Skill',
    code: 'SKILL-DISCHARGE-HEALTH-03',
    version: 'v3.1.0',
    category: '电池诊断',
    description: '通过充放电安时积分 (Ah)、开路电压 (OCV) 曲线拟合与等效循环寿命 (EFC) 测算，量化储能电站全生命周期健康度与收益效率。',
    author: '电化学储能国家重点实验室 · 衰减机理联合组',
    targetDomain: '储能电池堆、PCS逆变器、电价套利调度策略',
    rulesCount: 12,
    triggerConditions: [
      '实测可用放电容量较标称容量衰减 > 4.5% / 年',
      '充放电能量转换效率 (Round-Trip Efficiency) < 85.5%',
      '深度放电 (DOD > 95%) 频次超过设定安全阈值',
      '单簇充放电截止时单体电压压差离散系数 CV > 0.035'
    ],
    diagnosticLogic: `1. 采集每日充放电曲线，对恒流恒压阶段进行特征积分；
2. 拟合电芯微分容量曲线 (dQ/dV)，提取相变峰值位移与活性锂损失量；
3. 评估削峰填谷策略下的温升加剧与衰减速率加速因子；
4. 给出充放电倍率优化建议与自适应均衡策略。`,
    outputSections: [
      '一、削峰填谷电量统计与综合充放转换效率 (RTE)',
      '二、电芯健康度 (SOH) 衰减趋势与预期剩余寿命 (RUL)',
      '三、容量跳水与极化内阻增大风险簇清单',
      '四、充放电充止电压阈值与恒流倍率精细化调优建议'
    ],
    createdAt: '2026-08-24'
  },
  {
    id: 'skill-insulation-cell',
    name: '高压绝缘阻抗与单体一致性极柱体检 Skill',
    code: 'SKILL-INSULATION-CELL-04',
    version: 'v2.0.1',
    category: '设备体检',
    description: '针对高压直流母线正负极对地绝缘电阻、防雷接地阻抗、以及极柱螺栓力矩松动与接触阻抗异常进行专项体检。',
    author: '特种高压电气检测中心',
    targetDomain: '直流高压配电柜、汇流柜、绝缘监测仪、极柱铜排',
    rulesCount: 8,
    triggerConditions: [
      '正极/负极对地绝缘阻抗 < 100 Ω/V (严重告警 < 50 Ω/V)',
      '大雨/潮湿天气下绝缘阻抗骤降幅度 > 60%',
      '极柱接触内阻较出厂基准值升高 > 30%',
      '单体端子红外测温与相邻正常端子温差 > 10 ℃'
    ],
    diagnosticLogic: `1. 汇总全站绝缘监测仪历史波形与气象环境湿度数据；
2. 判断绝缘阻抗下降为环境潮气引起还是不可逆绝缘击穿破损；
3. 结合现场例行维保力矩紧固与红外热成像点温记录；
4. 输出绝缘隐患排查步骤与带电检测工单。`,
    outputSections: [
      '一、全域电站直流侧正负极对地绝缘状态全景',
      '二、低绝缘阻抗告警站点与潜在击穿隐患点定位',
      '三、电芯极柱螺栓接触内阻与温升异常体检表',
      '四、绝缘恢复与现场紧固整改标准作业指导 (SOP)'
    ],
    createdAt: '2026-08-25'
  }
];
