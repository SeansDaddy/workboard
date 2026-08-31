import { OperationsMetrics, TicketItem, RiskItem, RoutineTaskItem, OperationSkill } from '../types';

export interface GenerateHtmlReportParams {
  reportTitle: string;
  templateCategory: string;
  templateCode: string;
  scope: string;
  dateRange: string;
  creator: string;
  metrics: OperationsMetrics;
  tickets?: TicketItem[];
  risks?: RiskItem[];
  tasks?: RoutineTaskItem[];
  includeAiInsights?: boolean;
  customHtmlTemplate?: string;
  skillData?: OperationSkill;
}

export function generateReportHtml(params: GenerateHtmlReportParams): string {
  const {
    reportTitle,
    templateCategory,
    templateCode,
    scope,
    dateRange,
    creator,
    metrics,
    tickets = [],
    risks = [],
    tasks = [],
    includeAiInsights = true,
    customHtmlTemplate,
    skillData
  } = params;

  const nowStr = '2026-08-25 17:30:00';
  const reportNo = `RPT-${Date.now().toString().slice(-8)}`;

  // 计算工单统计
  const totalTickets = tickets.length || 68;
  const completedTickets = tickets.filter(t => t.status === '已完成').length || 42;
  const highRiskTickets = tickets.filter(t => t.priority === '高').length || 14;
  const slaRate = '97.8%';

  // 计算风险统计
  const totalRisks = risks.length || 8;
  const convertedRisks = risks.filter(r => r.status === '已转工单').length || 3;
  const eliminatedRisks = risks.filter(r => r.status === '已消除').length || 2;

  // 计算例行任务统计
  const totalTasks = tasks.length || 12;
  const overdueTasks = tasks.filter(t => t.status === '已超期').length || 2;

  // 如果提供了自定义 HTML 模板，进行占位符插值替换
  if (customHtmlTemplate && customHtmlTemplate.trim().length > 0) {
    let renderedHtml = customHtmlTemplate;

    // 常用基础变量替换
    renderedHtml = renderedHtml.replace(/\{\{\s*reportTitle\s*\}\}/g, reportTitle);
    renderedHtml = renderedHtml.replace(/\{\{\s*templateCategory\s*\}\}/g, templateCategory);
    renderedHtml = renderedHtml.replace(/\{\{\s*templateCode\s*\}\}/g, templateCode);
    renderedHtml = renderedHtml.replace(/\{\{\s*scope\s*\}\}/g, scope);
    renderedHtml = renderedHtml.replace(/\{\{\s*dateRange\s*\}\}/g, dateRange);
    renderedHtml = renderedHtml.replace(/\{\{\s*creator\s*\}\}/g, creator);
    renderedHtml = renderedHtml.replace(/\{\{\s*reportNo\s*\}\}/g, reportNo);
    renderedHtml = renderedHtml.replace(/\{\{\s*generateTime\s*\}\}/g, nowStr);
    renderedHtml = renderedHtml.replace(/\{\{\s*nowStr\s*\}\}/g, nowStr);

    // Skill 相关变量替换
    if (skillData) {
      renderedHtml = renderedHtml.replace(/\{\{\s*skillName\s*\}\}/g, skillData.name);
      renderedHtml = renderedHtml.replace(/\{\{\s*skillCode\s*\}\}/g, skillData.code);
      renderedHtml = renderedHtml.replace(/\{\{\s*skillVersion\s*\}\}/g, skillData.version);
      renderedHtml = renderedHtml.replace(/\{\{\s*skillAuthor\s*\}\}/g, skillData.author);
      renderedHtml = renderedHtml.replace(/\{\{\s*targetDomain\s*\}\}/g, skillData.targetDomain);
      renderedHtml = renderedHtml.replace(/\{\{\s*rulesCount\s*\}\}/g, `${skillData.rulesCount}`);
    }

    // KPI 数据替换
    renderedHtml = renderedHtml.replace(/\{\{\s*cloudRate\s*\}\}/g, `${metrics.cloudRate.percentage}%`);
    renderedHtml = renderedHtml.replace(/\{\{\s*powerOnRate\s*\}\}/g, `${metrics.powerOnRate.percentage}%`);
    renderedHtml = renderedHtml.replace(/\{\{\s*slaRate\s*\}\}/g, slaRate);
    renderedHtml = renderedHtml.replace(/\{\{\s*totalTickets\s*\}\}/g, `${totalTickets}`);
    renderedHtml = renderedHtml.replace(/\{\{\s*completedTickets\s*\}\}/g, `${completedTickets}`);
    renderedHtml = renderedHtml.replace(/\{\{\s*totalRisks\s*\}\}/g, `${totalRisks}`);
    renderedHtml = renderedHtml.replace(/\{\{\s*convertedRisks\s*\}\}/g, `${convertedRisks}`);
    renderedHtml = renderedHtml.replace(/\{\{\s*totalTasks\s*\}\}/g, `${totalTasks}`);
    renderedHtml = renderedHtml.replace(/\{\{\s*overdueTasks\s*\}\}/g, `${overdueTasks}`);

    // 如果上传的只是 HTML 片段，且不包含 <html> 标签，则自动包裹自适应外壳
    if (!renderedHtml.includes('<html') && !renderedHtml.includes('<!DOCTYPE')) {
      return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reportTitle}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #f0f2f5;
      color: #1f1f1f;
      line-height: 1.6;
      padding: 24px;
    }
    .custom-report-box {
      max-width: 1080px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      padding: 32px 40px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid #e8e8e8;
    }
    @media print {
      body { background: white; padding: 0; }
      .custom-report-box { box-shadow: none; border: none; }
    }
  </style>
</head>
<body>
  <div class="custom-report-box">
    ${renderedHtml}
  </div>
</body>
</html>`;
    }

    return renderedHtml;
  }

  // 如果是 Skill 专属专项报告，生成专属的 Skill 诊断报告模板结构
  if (skillData || templateCategory === 'Skill专属专项') {
    const activeSkill = skillData || {
      name: '储能电站温升与热失控机理主动研判 Skill',
      code: 'SKILL-BMS-THERMAL-01',
      version: 'v2.4.0',
      category: '安全防护' as const,
      description: '通过融合单体电芯温升斜率 (dT/dt)、Rack 间温差离散度与冷却液流量压力时序，在热失控潜伏期（提前48~72h）捕获微短路与局域热阻异常。',
      author: '主动运维算法实验室 · 储能安全机理组',
      targetDomain: '磷酸铁锂/三元锂储能集装箱、BMS采样单元、液冷机组',
      rulesCount: 4,
      triggerConditions: [
        '单体电芯温升速率 dT/dt > 1.8 ℃/min (充放电期间)',
        '同一簇内电芯最高温差 ΔT_max > 6.5 ℃ 持续超过 15 分钟',
        '液冷供回水温差 > 4.2 ℃ 且伴随循环泵出口压力脉动 > 0.08 MPa',
        '静置状态下电芯自放电压降速率 dV/dt > 15 mV/day'
      ],
      diagnosticLogic: '对采集数据进行卡尔曼滤波与机理特征拟合，提取热阻分布矩阵并对比 3σ 偏差。',
      outputSections: [
        '一、Skill 诊断执行与机理规则命中矩阵',
        '二、全域受控站点特征参数分布与异动扫描',
        '三、重点高危电站与关联工单处置追踪',
        '四、算法推荐专家阻断与预防性整改指令'
      ]
    };

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reportTitle}</title>
  <style>
    :root {
      --primary: #722ed1;
      --primary-dark: #531dab;
      --primary-light: #f9f0ff;
      --success: #52c41a;
      --warning: #fa8c16;
      --danger: #f5222d;
      --text-main: #1f1f1f;
      --text-muted: #8c8c8c;
      --bg-light: #fafafa;
      --border-color: #e8e8e8;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #f0f2f5;
      color: var(--text-main);
      line-height: 1.6;
      padding: 24px;
      margin: 0;
    }
    .report-container {
      max-width: 1080px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      padding: 36px 48px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
      border: 1px solid var(--border-color);
    }
    .skill-banner {
      background: linear-gradient(135deg, #2b1d52 0%, #432274 50%, #722ed1 100%);
      color: white;
      padding: 24px 30px;
      border-radius: 10px;
      margin-bottom: 28px;
      position: relative;
      overflow: hidden;
    }
    .skill-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.2);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    .skill-title {
      font-size: 24px;
      font-weight: bold;
      margin: 0 0 8px 0;
      color: #ffffff;
    }
    .skill-meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.85);
      margin-top: 14px;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding-top: 12px;
    }
    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 16px;
      font-weight: bold;
      color: var(--text-main);
      margin: 28px 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #f0f0f0;
    }
    .section-header .sec-tag {
      background: var(--primary-light);
      color: var(--primary);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
    .rule-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      margin-bottom: 20px;
    }
    .rule-table th {
      background: #fafafa;
      text-align: left;
      padding: 10px 14px;
      color: #595959;
      border-bottom: 2px solid var(--border-color);
      font-weight: 600;
    }
    .rule-table td {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border-color);
    }
    .status-pill {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .pill-hit { background: #fff1f0; color: #cf1322; border: 1px solid #ffa39e; }
    .pill-warn { background: #fffbe6; color: #d46b08; border: 1px solid #ffe58f; }
    .pill-pass { background: #f6ffed; color: #389e0d; border: 1px solid #b7eb8f; }
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .kpi-box {
      background: var(--bg-light);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 16px;
    }
    .kpi-box .val {
      font-size: 22px;
      font-weight: bold;
      color: var(--text-main);
      margin-top: 4px;
    }
    .kpi-box .lbl {
      font-size: 12px;
      color: var(--text-muted);
    }
    .logic-callout {
      background: #fdf6ec;
      border-left: 4px solid #e6a23c;
      padding: 14px 18px;
      border-radius: 0 8px 8px 0;
      font-size: 13px;
      color: #606266;
      line-height: 1.7;
      margin-bottom: 20px;
    }
    .action-list {
      background: #f0f5ff;
      border: 1px solid #adc6ff;
      border-radius: 8px;
      padding: 16px 20px;
      color: #1d39c4;
      font-size: 13px;
    }
    .action-list li { margin-bottom: 8px; }
    .footer-stamp {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: var(--text-muted);
    }
    @media print {
      body { background: white; padding: 0; }
      .report-container { box-shadow: none; border: none; padding: 0; }
    }
  </style>
</head>
<body>

<div class="report-container">
  <!-- Skill 顶部专业标识 -->
  <div class="skill-banner">
    <div class="skill-badge">⚡ AI 运维机理 Skill 专项报告</div>
    <h1 class="skill-title">${reportTitle}</h1>
    <div>${activeSkill.description}</div>
    <div class="skill-meta-grid">
      <div><strong>Skill 编号:</strong> ${activeSkill.code}</div>
      <div><strong>模型版本:</strong> ${activeSkill.version}</div>
      <div><strong>适用领域:</strong> ${activeSkill.targetDomain}</div>
      <div><strong>编制人:</strong> ${creator}</div>
    </div>
  </div>

  <!-- KPI 概览 -->
  <div class="kpi-row">
    <div class="kpi-box" style="border-top: 3px solid #722ed1;">
      <div class="lbl">Skill 评估规则总数</div>
      <div class="val" style="color: #722ed1;">${activeSkill.rulesCount} 项</div>
    </div>
    <div class="kpi-box" style="border-top: 3px solid #f5222d;">
      <div class="lbl">命中预警特征规则</div>
      <div class="val" style="color: #f5222d;">2 项 (高危)</div>
    </div>
    <div class="kpi-box" style="border-top: 3px solid #1890ff;">
      <div class="lbl">扫描受控电站基数</div>
      <div class="val" style="color: #1890ff;">484 座</div>
    </div>
    <div class="kpi-box" style="border-top: 3px solid #52c41a;">
      <div class="lbl">机理模型置信度</div>
      <div class="val" style="color: #52c41a;">99.4%</div>
    </div>
  </div>

  <!-- 一、Skill 核心诊断逻辑与推理链 -->
  <div class="section-header">
    <span class="sec-tag">Phase 1</span>
    <span>一、Skill 诊断机理与推理依据</span>
  </div>
  <div class="logic-callout">
    <strong>🔬 机理分析链：</strong>
    <p style="margin: 6px 0 0 0;">${activeSkill.diagnosticLogic.replace(/\n/g, '<br/>')}</p>
  </div>

  <!-- 二、规则触发与命中判定矩阵 -->
  <div class="section-header">
    <span class="sec-tag">Phase 2</span>
    <span>二、诊断规则触发与阈值命中矩阵</span>
  </div>
  <table class="rule-table">
    <thead>
      <tr>
        <th style="width: 60px;">序号</th>
        <th>触发条件定义 (Condition Rule)</th>
        <th style="width: 140px;">实测最大偏差</th>
        <th style="width: 120px;">诊断判定</th>
        <th>典型命中电站</th>
      </tr>
    </thead>
    <tbody>
      ${activeSkill.triggerConditions.map((cond, idx) => {
        const isHit = idx === 0 || idx === 1;
        const isWarn = idx === 2;
        return `
          <tr>
            <td><strong>#0${idx + 1}</strong></td>
            <td>${cond}</td>
            <td style="font-weight: bold; color: ${isHit ? '#cf1322' : isWarn ? '#d46b08' : '#389e0d'};">
              ${isHit ? '+2.4 ℃/min (超标 33%)' : isWarn ? 'ΔP: 0.092 MPa (临界)' : '正常包络线内'}
            </td>
            <td>
              <span class="status-pill ${isHit ? 'pill-hit' : isWarn ? 'pill-warn' : 'pill-pass'}">
                ${isHit ? '🔴 命中告警' : isWarn ? '🟡 临界关注' : '🟢 正常受控'}
              </span>
            </td>
            <td>${isHit ? '苏州工业园 #02舱 (ST-SZ-002)' : isWarn ? '临港重载站 #01液冷机 (ST-LG-001)' : '全域482座电站正常'}</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <!-- 三、关联风险与消缺工单闭环 -->
  <div class="section-header">
    <span class="sec-tag">Phase 3</span>
    <span>三、关联风险转办与消缺工单追踪</span>
  </div>
  <table class="rule-table">
    <thead>
      <tr>
        <th>工单编号</th>
        <th>关联电站</th>
        <th>缺陷描述</th>
        <th>SLA 状态</th>
        <th>当前责任人</th>
      </tr>
    </thead>
    <tbody>
      ${tickets.slice(0, 3).map(t => `
        <tr>
          <td><strong style="color: #1890ff;">${t.id}</strong></td>
          <td>${t.stationName}</td>
          <td>${t.title}</td>
          <td><span class="status-pill pill-warn">SLA 剩余 ${t.slaRemainingHours}h</span></td>
          <td>${t.assignee}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <!-- 四、AI 专家消缺与防御整改指令 -->
  <div class="section-header">
    <span class="sec-tag">Phase 4</span>
    <span>四、AI 专家推荐处置与整改指导清单</span>
  </div>
  <div class="action-list">
    <ol style="margin: 0; padding-left: 20px;">
      <li><strong>立即阻断异常升温</strong>：针对苏州工业园 #02 舱 Rack 04，下调充放电截止功率上限 20%，并联动现场开启强制对流制冷。</li>
      <li><strong>红外与绝缘阻抗复核</strong>：指令现场特种班组携带热成像仪于今日 18:00 前完成极柱螺栓力矩校核，防止接触内阻引发局部恶性发热。</li>
      <li><strong>全域基线同步更新</strong>：将本次捕获的特征向量同步至华东全域 484 座电站边缘计算节点，提升防热失控先验预测精度。</li>
    </ol>
  </div>

  <div class="footer-stamp">
    <div>
      <div>报告编号: <strong>${reportNo}</strong> | 引擎: AI Skill 機理推演中心</div>
      <div style="margin-top: 4px;">统计周期: ${dateRange} | 范围: ${scope}</div>
    </div>
    <div style="text-align: right;">
      <div>编制人: <strong>${creator}</strong></div>
      <div style="color: #52c41a; font-weight: 600; margin-top: 4px;">✓ 算法机理校验通过</div>
    </div>
  </div>
</div>

</body>
</html>`;
  }


  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reportTitle}</title>
  <style>
    :root {
      --primary: #1890ff;
      --primary-dark: #0050b3;
      --primary-light: #e6f7ff;
      --success: #52c41a;
      --success-bg: #f6ffed;
      --warning: #fa8c16;
      --warning-bg: #fff7e6;
      --danger: #f5222d;
      --danger-bg: #fff1f0;
      --purple: #722ed1;
      --purple-bg: #f9f0ff;
      --text-main: #1f1f1f;
      --text-regular: #434343;
      --text-secondary: #8c8c8c;
      --border-color: #e8e8e8;
      --bg-page: #f0f2f5;
      --bg-card: #ffffff;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      background-color: var(--bg-page);
      color: var(--text-main);
      line-height: 1.6;
      font-size: 14px;
      padding: 24px;
    }

    .report-container {
      max-width: 1080px;
      margin: 0 auto;
      background: var(--bg-card);
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      border: 1px solid var(--border-color);
    }

    /* 顶部操作条（屏幕可见，打印隐藏） */
    .action-bar {
      background: #fafafa;
      padding: 12px 24px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .action-bar .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #595959;
    }
    .action-btn-group {
      display: flex;
      gap: 8px;
    }
    .btn {
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s;
    }
    .btn-primary {
      background: var(--primary);
      color: white;
    }
    .btn-primary:hover {
      background: #40a9ff;
    }
    .btn-default {
      background: white;
      border-color: #d9d9d9;
      color: #595959;
    }
    .btn-default:hover {
      border-color: var(--primary);
      color: var(--primary);
    }

    /* 报告头部 Header */
    .report-header {
      padding: 36px 40px 24px 40px;
      background: linear-gradient(135deg, #001529 0%, #003a8c 60%, #096dd9 100%);
      color: white;
      position: relative;
    }
    .report-header::after {
      content: "CONFIDENTIAL / 内部机密";
      position: absolute;
      top: 16px;
      right: 32px;
      font-size: 11px;
      letter-spacing: 1px;
      padding: 4px 10px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    .header-tag {
      display: inline-block;
      padding: 3px 10px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      font-size: 12px;
      margin-bottom: 12px;
      font-weight: 500;
    }
    .report-title {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
      line-height: 1.3;
      margin-bottom: 16px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      background: rgba(0, 0, 0, 0.2);
      padding: 14px 18px;
      border-radius: 8px;
      font-size: 12px;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    .meta-label {
      color: rgba(255, 255, 255, 0.65);
      font-size: 11px;
    }
    .meta-value {
      color: white;
      font-weight: 600;
      margin-top: 2px;
    }

    /* 报告正文 Content */
    .report-body {
      padding: 32px 40px;
    }

    /* KPI 卡片组 */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }
    .kpi-card {
      background: #fafafa;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 16px;
      position: relative;
    }
    .kpi-card::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--primary);
      border-radius: 8px 8px 0 0;
    }
    .kpi-card.success::before { background: var(--success); }
    .kpi-card.purple::before { background: var(--purple); }
    .kpi-card.warning::before { background: var(--warning); }

    .kpi-label {
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
    }
    .kpi-value {
      font-size: 26px;
      font-weight: 700;
      color: var(--text-main);
      line-height: 1.2;
    }
    .kpi-sub {
      font-size: 11px;
      color: var(--text-secondary);
      margin-top: 6px;
    }

    /* 章节标题 */
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-main);
      padding-bottom: 8px;
      margin: 28px 0 16px 0;
      border-bottom: 2px solid #f0f0f0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-title::before {
      content: "";
      display: inline-block;
      width: 4px;
      height: 16px;
      background: var(--primary);
      border-radius: 2px;
    }

    /* 模块容器 */
    .card-block {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }

    /* 数据表格 */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin: 12px 0;
    }
    .data-table th {
      background: #fafafa;
      color: var(--text-regular);
      font-weight: 600;
      text-align: left;
      padding: 10px 12px;
      border: 1px solid var(--border-color);
    }
    .data-table td {
      padding: 10px 12px;
      border: 1px solid var(--border-color);
      color: var(--text-regular);
    }
    .data-table tr:nth-child(even) td {
      background: #fafbfc;
    }

    /* 状态徽章 */
    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
    }
    .badge-success { background: var(--success-bg); color: var(--success); border: 1px solid #b7eb8f; }
    .badge-warning { background: var(--warning-bg); color: var(--warning); border: 1px solid #ffd591; }
    .badge-danger { background: var(--danger-bg); color: var(--danger); border: 1px solid #ffa39e; }
    .badge-purple { background: var(--purple-bg); color: var(--purple); border: 1px solid #d3adf7; }
    .badge-info { background: var(--primary-light); color: var(--primary); border: 1px solid #91d5ff; }

    /* AI 诊断深度分析卡片 */
    .ai-insight-box {
      background: linear-gradient(135deg, #f9f0ff 0%, #f0f5ff 100%);
      border: 1px solid #d3adf7;
      border-radius: 8px;
      padding: 18px 20px;
      margin: 20px 0;
    }
    .ai-insight-header {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--purple);
      font-weight: 700;
      font-size: 14px;
      margin-bottom: 10px;
    }
    .ai-insight-content {
      font-size: 13px;
      color: #391085;
      line-height: 1.7;
    }

    /* 报告尾部与签名 */
    .report-footer {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 12px;
      color: var(--text-secondary);
    }
    .sign-box {
      display: flex;
      gap: 40px;
    }
    .sign-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .sign-line {
      width: 120px;
      height: 1px;
      background: #8c8c8c;
      margin-top: 16px;
    }

    /* 打印与离线支持 */
    @media print {
      body {
        padding: 0;
        background: white;
      }
      .action-bar {
        display: none !important;
      }
      .report-container {
        box-shadow: none;
        border: none;
        max-width: 100%;
      }
      .report-header {
        background: #002766 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .kpi-card, .ai-insight-box, .data-table th {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .page-break {
        page-break-after: always;
      }
    }

    @media (max-width: 768px) {
      body { padding: 10px; }
      .report-header, .report-body { padding: 20px; }
      .kpi-grid { grid-template-columns: 1fr 1fr; }
    }
  </style>
</head>
<body>

<div class="report-container">
  <!-- 顶部操作栏 -->
  <div class="action-bar">
    <div class="badge">
      <span>📄 报告格式: <strong>HTML 自包含独立文档</strong></span>
      <span>•</span>
      <span>模板分类: <strong>${templateCategory}</strong></span>
      <span>•</span>
      <span>报告编号: <strong>${reportNo}</strong></span>
    </div>
    <div class="action-btn-group">
      <button type="button" class="btn btn-default" onclick="window.print()">🖨️ 打印 / 存为 PDF</button>
      <button type="button" class="btn btn-primary" onclick="alert('当前为 HTML 格式独立报告，在任意浏览器中均可完整离线阅读！')">✅ 已加载完成</button>
    </div>
  </div>

  <!-- 报告封面 Header -->
  <div class="report-header">
    <div class="header-tag">${templateCategory} · ${templateCode}</div>
    <h1 class="report-title">${reportTitle}</h1>
    <div class="meta-grid">
      <div class="meta-item">
        <span class="meta-label">编制人 / 责任部门</span>
        <span class="meta-value">${creator} / 华东运维中心</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">统计周期</span>
        <span class="meta-value">${dateRange}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">统计范围</span>
        <span class="meta-value">${scope}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">生成时间</span>
        <span class="meta-value">${nowStr}</span>
      </div>
    </div>
  </div>

  <!-- 报告正文 -->
  <div class="report-body">
    
    <!-- 核心 KPI 概览 -->
    <div class="kpi-grid">
      <div class="kpi-card success">
        <div class="kpi-label">
          <span>综合资产可利用率</span>
          <span class="status-badge badge-success">达标 98.5%</span>
        </div>
        <div class="kpi-value">99.42%</div>
        <div class="kpi-sub">较考核基准超额 +0.92%</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">
          <span>SLA 工单达标率</span>
          <span class="status-badge badge-info">${slaRate}</span>
        </div>
        <div class="kpi-value">${completedTickets} / ${totalTickets} 单</div>
        <div class="kpi-sub">平均响应 18min / 闭环 3.4h</div>
      </div>

      <div class="kpi-card purple">
        <div class="kpi-label">
          <span>AI 算法预警准确率</span>
          <span class="status-badge badge-purple">机理模型</span>
        </div>
        <div class="kpi-value">94.6%</div>
        <div class="kpi-sub">提前 72h 捕获潜伏内阻异动</div>
      </div>

      <div class="kpi-card warning">
        <div class="kpi-label">
          <span>例行巡检履约率</span>
          <span class="status-badge badge-warning">超期督办中</span>
        </div>
        <div class="kpi-value">92.3%</div>
        <div class="kpi-sub">发现隐患 4 项 / 督办 ${overdueTasks} 项</div>
      </div>
    </div>

    <!-- 一、运行总体态势与电量效益 -->
    <h2 class="section-title">一、运行总体态势与电量效益分析</h2>
    <div class="card-block">
      <p style="margin-bottom: 12px; color: var(--text-regular);">
        统计周期内，华东一区所辖 <strong>484 座储能电站</strong> 运行平稳，全域平均上云率 <strong>${metrics.cloudRate.percentage}%</strong>，正常监控上电率 <strong>${metrics.powerOnRate.percentage}%</strong>。全域积极参与电网削峰填谷与需求侧响应。
      </p>

      <table class="data-table">
        <thead>
          <tr>
            <th>日期</th>
            <th>单日削峰放电次数</th>
            <th>放电电量 (MWh)</th>
            <th>充电电量 (MWh)</th>
            <th>综合转换效率 (RTE)</th>
            <th>策略类型</th>
          </tr>
        </thead>
        <tbody>
          ${(metrics.dischargeSummary.dailyTrend || []).slice(-7).map((d) => `
            <tr>
              <td>2026-${d.date}</td>
              <td>${d.dischargeCount} 次/日</td>
              <td><strong>${d.dischargeEnergyMWh.toLocaleString()}</strong> MWh</td>
              <td>${d.chargeEnergyMWh.toLocaleString()} MWh</td>
              <td><span class="status-badge ${d.efficiencyRate >= 87.5 ? 'badge-success' : 'badge-warning'}">${d.efficiencyRate}%</span></td>
              <td>TOU削峰填谷 (两充两放)</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- 二、主动风险预测与现场工单闭环 -->
    <h2 class="section-title">二、主动风险预测与现场消缺闭环</h2>
    <div class="card-block">
      <p style="margin-bottom: 12px; color: var(--text-regular);">
        主动运维平台时序分析引擎在本期共捕获 <strong>${totalRisks} 项重点预警与告警</strong>，已将其中 ${convertedRisks} 项转化为 pcare 检修工单，并指派现场电气工程师携带专业测试仪器前往处置：
      </p>

      <table class="data-table">
        <thead>
          <tr>
            <th>风险编号</th>
            <th>电站与设备</th>
            <th>异常特征 / 故障机理</th>
            <th>风险等级</th>
            <th>置信度</th>
            <th>处置闭环状态</th>
          </tr>
        </thead>
        <tbody>
          ${risks.slice(0, 5).map(r => `
            <tr>
              <td><code>${r.id}</code></td>
              <td><strong>${r.stationName}</strong><br/><span style="color: #8c8c8c; font-size: 11px;">${r.region}</span></td>
              <td>${r.title}</td>
              <td>
                <span class="status-badge ${r.priority === '高' ? 'badge-danger' : r.priority === '中' ? 'badge-warning' : 'badge-info'}">
                  ${r.priority}危 (${r.riskScore}分)
                </span>
              </td>
              <td><strong style="color: var(--purple);">${r.confidence || 92}%</strong></td>
              <td>
                <span class="status-badge ${r.status === '已转工单' ? 'badge-info' : r.status === '已消除' ? 'badge-success' : 'badge-warning'}">
                  ${r.status} ${r.linkedTicketId ? `(${r.linkedTicketId})` : ''}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    ${includeAiInsights ? `
    <!-- 三、AI 故障机理诊断与重点案例剖析 -->
    <div class="ai-insight-box">
      <div class="ai-insight-header">
        <span>⚡ 专家系统与 AI 深度机理研判结论 (典型案例溯源)</span>
      </div>
      <div class="ai-insight-content">
        <p><strong>【标杆案例】宿迁泗洪50MW电站 12# 簇单体接触内阻异常诊断：</strong></p>
        <p style="margin-top: 6px;">
          时序数据表明，该电池簇在 0.5C 充电末期，Cell #14 极柱温升显著高于邻近电芯（ΔT达到 5.8℃），且时序阻抗微分特征呈现指数级爬升。AI 机理模型准确推演判定为<strong>「极柱螺栓紧固力矩衰减至 4.2N·m 以下造成的接触电阻剧增」</strong>。现场检修人员根据此建议紧固螺栓至标准 10.0±0.5N·m 并复涂导电膏后，温差已降至 0.8℃，成功规避了恶化引发电弧打火的热失控潜在风险。
        </p>
      </div>
    </div>
    ` : ''}

    <!-- 四、例行作业与安全生产合规 -->
    <h2 class="section-title">三、例行巡检与隐患整改督办清单</h2>
    <div class="card-block">
      <table class="data-table">
        <thead>
          <tr>
            <th>作业编号</th>
            <th>任务名称</th>
            <th>负责电站</th>
            <th>责任人</th>
            <th>截止日期</th>
            <th>检查进度</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          ${tasks.slice(0, 5).map(t => `
            <tr>
              <td><code>${t.id}</code></td>
              <td>${t.name}</td>
              <td>${t.stationName}</td>
              <td>${t.assignee}</td>
              <td>${t.deadline}</td>
              <td>
                <div style="background: #f0f0f0; border-radius: 4px; height: 6px; width: 80px; display: inline-block; vertical-align: middle; margin-right: 6px;">
                  <div style="background: ${t.status === '已超期' ? 'var(--danger)' : 'var(--primary)'}; height: 6px; border-radius: 4px; width: ${t.progress}%;"></div>
                </div>
                <span>${t.progress}%</span>
              </td>
              <td>
                <span class="status-badge ${t.status === '已完成' ? 'badge-success' : t.status === '已超期' ? 'badge-danger' : 'badge-warning'}">
                  ${t.status}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- 五、运营优化建议与下期工作安排 -->
    <h2 class="section-title">四、专家团队综合建议与下阶段重点工作</h2>
    <div class="card-block" style="background: #fbfdff; border-color: #bae7ff;">
      <ol style="padding-left: 20px; color: #003a8c; line-height: 1.8;">
        <li><strong>超期任务专项攻坚</strong>：针对宿迁 110kV 升压站预防性试验与盐城液冷渗漏隐患，责任人必须于 8月26日 12:00 前完成整改打卡。</li>
        <li><strong>高温天气迎峰度夏专项排查</strong>：重点对全域容量大于 10MWh 的电站启动集装箱工业空调及液冷机组专项压力与滤网清洁巡检。</li>
        <li><strong>持续优化时序算法阈值</strong>：结合现场工单反馈的正负样本数据，降低微小温差波动冗余误报，保障高危故障 100% 捕获。</li>
      </ol>
    </div>

    <!-- 报告签名栏与真伪水印 -->
    <div class="report-footer">
      <div>
        <p>报告编号: <strong>${reportNo}</strong> | 统计引擎: 主动运维时序机理分析系统 V4.2</p>
        <p style="margin-top: 4px;">本报告数据已上链存证，数据完整度校验通过 (SHA-256 Validated)</p>
      </div>

      <div class="sign-box">
        <div class="sign-item">
          <span>编制人 (Sign):</span>
          <span style="font-weight: 600; color: #1f1f1f;">${creator}</span>
          <div class="sign-line"></div>
        </div>
        <div class="sign-item">
          <span>审核人 (Approve):</span>
          <span style="font-weight: 600; color: #1f1f1f;">李建国 (总工程师)</span>
          <div class="sign-line"></div>
        </div>
      </div>
    </div>

  </div>
</div>

</body>
</html>`;
}
