import React, { useState } from 'react';
import { 
  Upload, 
  X, 
  FileCode, 
  Check, 
  Sparkles, 
  Zap, 
  HelpCircle, 
  Layers, 
  ShieldCheck, 
  Code2, 
  AlertCircle 
} from 'lucide-react';
import { OperationSkill } from '../../types';
import { parseUploadedSkillFile } from '../../utils/skillParser';

interface SkillUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkillImported: (skill: OperationSkill) => void;
}

const SAMPLE_SKILL_RAW = `---
name: "储能高压直流母线极柱阻抗与温升体检 Skill"
code: "SKILL-DC-BUSBAR-05"
version: "v1.2.0"
domain: "直流汇流柜 / 极柱连接螺栓"
author: "特种电气体检组"
---
## 诊断目标
针对直流母线铜排、极柱螺栓接触内阻与热成像点温进行异常研判，避免恶性接触发热。

## 触发规则
- 极柱端子红外测温与环境温差 > 15℃
- 接触内阻较出厂基准值升高 > 25%
- 充放电大电流切换瞬间出现 > 50mV 阶跃压降

## 诊断逻辑
1. 采集高负荷充放电峰值点各簇端子红外测温数据；
2. 关联直流母线电流积分计算等效接触电阻；
3. 标定力矩松动与热膨胀形变异常点；
4. 联动生成现场带电检测与紧固工单。

## 产出章节
- 一、直流侧极柱温升与接触内阻分布矩阵
- 二、异常过热端子与松动隐患点清单
- 三、带电检测及螺栓力矩复紧整改指令`;

export const SkillUploadModal: React.FC<SkillUploadModalProps> = ({
  isOpen,
  onClose,
  onSkillImported
}) => {
  const [skillContent, setSkillContent] = useState<string>(SAMPLE_SKILL_RAW);
  const [skillName, setSkillName] = useState<string>('储能高压直流母线极柱阻抗与温升体检 Skill');
  const [skillCode, setSkillCode] = useState<string>('SKILL-DC-BUSBAR-05');
  const [skillVersion, setSkillVersion] = useState<string>('v1.2.0');
  const [category, setCategory] = useState<OperationSkill['category']>('设备体检');
  const [targetDomain, setTargetDomain] = useState<string>('直流汇流柜 / 极柱连接螺栓');
  const [author, setAuthor] = useState<string>('特种电气体检组');
  const [triggerRulesText, setTriggerRulesText] = useState<string>(
    '极柱端子红外测温与环境温差 > 15℃\n接触内阻较出厂基准值升高 > 25%\n充放电大电流切换瞬间出现 > 50mV 阶跃压降'
  );
  const [diagnosticLogic, setDiagnosticLogic] = useState<string>(
    '采集高负荷充放电峰值点各簇端子红外测温数据，关联母线电流计算接触内阻，标定力矩松动隐患。'
  );
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setSkillContent(content);
        setFileName(file.name);
        const parsed = parseUploadedSkillFile(content, file.name);
        if (parsed.name) setSkillName(parsed.name);
        if (parsed.code) setSkillCode(parsed.code);
        if (parsed.version) setSkillVersion(parsed.version);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.targetDomain) setTargetDomain(parsed.targetDomain);
        if (parsed.author) setAuthor(parsed.author);
        if (parsed.triggerConditions) setTriggerRulesText(parsed.triggerConditions.join('\n'));
        if (parsed.diagnosticLogic) setDiagnosticLogic(parsed.diagnosticLogic);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    const rules = triggerRulesText
      .split('\n')
      .map(r => r.trim())
      .filter(Boolean);

    const newSkill: OperationSkill = {
      id: `skill-user-${Date.now()}`,
      name: skillName.trim(),
      code: skillCode.trim() || `SKILL-CUSTOM-${Math.floor(1000 + Math.random() * 9000)}`,
      version: skillVersion.trim() || 'v1.0.0',
      category,
      description: `基于导入的 ${skillName} 运维技能规格，自动匹配电站时序与风险规则开展报告生成。`,
      author: author.trim() || '现场技术专家',
      targetDomain: targetDomain.trim() || '储能电站全域设备',
      rulesCount: rules.length || 3,
      triggerConditions: rules.length > 0 ? rules : [
        '采集指标偏离正常运行包络线 3σ',
        '高压绝缘或温升出现阶跃异常',
        'SLA 响应耗时超标'
      ],
      diagnosticLogic: diagnosticLogic.trim() || '结合多维指标进行卡尔曼滤波与机理关联推演。',
      outputSections: [
        '一、Skill 诊断执行与机理规则命中矩阵',
        '二、全域受控站点特征参数分布与异动扫描',
        '三、重点高危电站与关联工单处置追踪',
        '四、算法推荐专家阻断与预防性整改指令'
      ],
      skillContentRaw: skillContent,
      isCustom: true,
      createdAt: '2026-08-30'
    };

    onSkillImported(newSkill);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-amber-50 via-purple-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                上传 / 导入 AI 运维 Skill 规格
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  支持 Markdown / YAML / JSON
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                导入专家的诊断机理、触发条件与算法规则，一键驱动高精度专业报告自动生成
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/80 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* 文件拖拽上传区 */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
              isDragOver
                ? 'border-purple-500 bg-purple-50/60'
                : 'border-slate-300 hover:border-purple-400 bg-slate-50/60'
            }`}
          >
            <input
              type="file"
              id="skill-file-upload"
              accept=".md,.json,.yaml,.yml,.txt"
              onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
            <label
              htmlFor="skill-file-upload"
              className="cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-xs text-slate-700 font-semibold">
                {fileName ? (
                  <span className="text-purple-700 font-bold">已载入 Skill 文件: {fileName}</span>
                ) : (
                  <span>点击或拖拽上传本地 Skill 规格文件 (SKILL.md / skill.json / yaml)</span>
                )}
              </div>
              <span className="text-[11px] text-slate-400">
                支持标准 Frontmatter 格式、规则矩阵与诊断逻辑自动解析
              </span>
            </label>
          </div>

          {/* 基础属性 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Skill 技能名称 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={skillName}
                onChange={e => setSkillName(e.target.value)}
                placeholder="例如：储能电池热失控预警 Skill"
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Skill 编号</label>
              <input
                type="text"
                value={skillCode}
                onChange={e => setSkillCode(e.target.value)}
                placeholder="SKILL-CUSTOM-01"
                className="w-full text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">所属分类</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as OperationSkill['category'])}
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="安全防护">安全防护</option>
                <option value="SLA履约">SLA履约</option>
                <option value="电池诊断">电池诊断</option>
                <option value="设备体检">设备体检</option>
                <option value="能效与调度">能效与调度</option>
                <option value="自定义Skill">自定义Skill</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">适用业务领域</label>
              <input
                type="text"
                value={targetDomain}
                onChange={e => setTargetDomain(e.target.value)}
                placeholder="例如：储能BMS / PCS逆变器"
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">编写专家/机构</label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="特种运维算法组"
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          {/* 触发规则与机理逻辑 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>触发诊断规则条件 (每行一条规则)</span>
              <span className="text-[11px] font-normal text-slate-400">将直接映射至报告的规则命中评定矩阵</span>
            </label>
            <textarea
              value={triggerRulesText}
              onChange={e => setTriggerRulesText(e.target.value)}
              rows={3}
              className="w-full text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">核心机理诊断逻辑与推理链</label>
            <textarea
              value={diagnosticLogic}
              onChange={e => setDiagnosticLogic(e.target.value)}
              rows={2}
              className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
            />
          </div>

          {/* 底部按钮 */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-700 hover:to-purple-700 rounded-lg shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              确认导入 Skill 库
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
