import { OperationSkill } from '../types';

/**
 * 解析用户上传的 Skill 文件内容（支持 Markdown / YAML / JSON / 文本）
 */
export function parseUploadedSkillFile(fileContent: string, fileName: string): Partial<OperationSkill> {
  const trimmed = fileContent.trim();
  
  // 1. 尝试作为 JSON 解析
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      return {
        name: parsed.name || parsed.skillName || fileName.replace(/\.[^/.]+$/, ''),
        code: parsed.code || `SKILL-CUSTOM-${Date.now().toString().slice(-4)}`,
        version: parsed.version || 'v1.0.0',
        category: parsed.category || '自定义Skill',
        description: parsed.description || '自定义导入的运维诊断技能与机理模型',
        author: parsed.author || '现场运维专家',
        targetDomain: parsed.targetDomain || parsed.domain || '储能运维全域资产',
        rulesCount: Array.isArray(parsed.triggerConditions) ? parsed.triggerConditions.length : (parsed.rulesCount || 5),
        triggerConditions: Array.isArray(parsed.triggerConditions) ? parsed.triggerConditions : [
          '时序指标偏离基线 3σ 触发报警',
          'SLA 响应延迟超过设定预警线',
          '设备单体物理量离散度异常'
        ],
        diagnosticLogic: parsed.diagnosticLogic || parsed.logic || '结合多维指标进行关联推理与健康度加权评分。',
        outputSections: Array.isArray(parsed.outputSections) ? parsed.outputSections : [
          '一、Skill 核心指标基线与偏离度',
          '二、触发规则命中清单与异常电站',
          '三、机理模型深度诊断推演',
          '四、专家处置方案与工单督办指令'
        ],
        skillContentRaw: fileContent,
        isCustom: true
      };
    } catch {
      // ignore
    }
  }

  // 2. 解析 Markdown / Frontmatter / 结构化文本
  const lines = trimmed.split('\n');
  let name = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  let code = `SKILL-IMP-${Math.floor(1000 + Math.random() * 9000)}`;
  let version = 'v1.0.0';
  let description = '';
  let author = '自定义导入';
  let domain = '储能电站与设备运行';
  const triggerConditions: string[] = [];
  const outputSections: string[] = [];
  let diagnosticLogic = '';

  let currentSection = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // YAML Frontmatter 键值对提取
    if (line.toLowerCase().startsWith('name:')) {
      name = line.substring(5).replace(/['"]/g, '').trim();
    } else if (line.toLowerCase().startsWith('code:')) {
      code = line.substring(5).replace(/['"]/g, '').trim();
    } else if (line.toLowerCase().startsWith('version:')) {
      version = line.substring(8).replace(/['"]/g, '').trim();
    } else if (line.toLowerCase().startsWith('domain:') || line.toLowerCase().startsWith('targetdomain:')) {
      domain = line.substring(line.indexOf(':') + 1).replace(/['"]/g, '').trim();
    } else if (line.toLowerCase().startsWith('author:')) {
      author = line.substring(7).replace(/['"]/g, '').trim();
    } else if (line.toLowerCase().startsWith('description:')) {
      description = line.substring(12).replace(/['"]/g, '').trim();
    } else if (line.startsWith('# ')) {
      name = line.substring(2).trim();
    } else if (line.startsWith('## ')) {
      currentSection = line.substring(3).trim();
    } else if (line.startsWith('- ') || line.startsWith('* ') || /^\d+\.\s/.test(line)) {
      const item = line.replace(/^[-*]|\d+\.\s*/, '').trim();
      if (currentSection.includes('规则') || currentSection.includes('触发') || currentSection.includes('条件') || currentSection.toLowerCase().includes('trigger') || currentSection.toLowerCase().includes('rule')) {
        triggerConditions.push(item);
      } else if (currentSection.includes('章节') || currentSection.includes('输出') || currentSection.includes('结构') || currentSection.toLowerCase().includes('output') || currentSection.toLowerCase().includes('section')) {
        outputSections.push(item);
      }
    } else if (currentSection.includes('逻辑') || currentSection.includes('推理') || currentSection.includes('算法') || currentSection.toLowerCase().includes('logic')) {
      diagnosticLogic += (diagnosticLogic ? '\n' : '') + line;
    } else if (!description && !line.startsWith('---') && !line.startsWith('#')) {
      description = line;
    }
  }

  if (triggerConditions.length === 0) {
    triggerConditions.push(
      '采集指标偏离正常运行包络线',
      '关键传感器出现异常阶跃或突变',
      '时序关联性下降并命中故障特征库'
    );
  }

  if (outputSections.length === 0) {
    outputSections.push(
      '一、Skill 诊断对象与全景运行态势',
      '二、机理模型特征提取与异常置信度',
      '三、高危隐患点定位与关联工单闭环',
      '四、运维优化建议与风险防御举措'
    );
  }

  if (!description) {
    description = `基于上传的 ${name} 技能规范，实现对电站时序数据、工单与预警的自动化智能诊断与报告编排。`;
  }

  if (!diagnosticLogic) {
    diagnosticLogic = '结合上传 Skill 的规则定义，自动匹配多维运行数据，生成高置信度的分析结论。';
  }

  return {
    name,
    code,
    version,
    category: '自定义Skill',
    description,
    author,
    targetDomain: domain,
    rulesCount: triggerConditions.length,
    triggerConditions,
    diagnosticLogic,
    outputSections,
    skillContentRaw: fileContent,
    isCustom: true
  };
}
