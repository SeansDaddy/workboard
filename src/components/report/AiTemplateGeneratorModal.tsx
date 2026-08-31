import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  RefreshCw, 
  Check, 
  Code2, 
  Eye, 
  Layers, 
  Zap, 
  Lightbulb, 
  Palette,
  FileText
} from 'lucide-react';
import { ReportTemplate } from '../../types';

interface AiTemplateGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTemplate: (template: ReportTemplate) => void;
}

const PRESET_PROMPTS = [
  '储能电站温升与热失控机理主动研判专项报告',
  '华东全域 SLA 工单全流程履约与消缺时效周报',
  '削峰填谷充放电深度与电池衰减(SOH)综合评估',
  '直流母线高压绝缘阻抗与单体一致性极柱体检',
  '储能安全合规与极端恶劣天气(防汛/高温)特巡专报'
];

export const AiTemplateGeneratorModal: React.FC<AiTemplateGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSaveTemplate
}) => {
  const [prompt, setPrompt] = useState<string>('储能电站温升与热失控机理主动研判专项报告');
  const [category, setCategory] = useState<ReportTemplate['category']>('AI生成模板');
  const [targetAudience, setTargetAudience] = useState<string>('区域运维负责人、现场技术专工、安全总监');
  const [themeColor, setThemeColor] = useState<string>('#722ED1');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedTemplate, setGeneratedTemplate] = useState<ReportTemplate | null>(null);
  const [activePreviewMode, setActivePreviewMode] = useState<'preview' | 'code'>('preview');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/ai/generate-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          category,
          targetAudience,
          themeColor
        })
      });

      const data = await response.json();
      if (data.success && data.template) {
        const tpl: ReportTemplate = {
          id: `tpl-ai-${Date.now()}`,
          name: data.template.name || `${prompt.slice(0, 14)}报告模板`,
          code: data.template.code || `TPL-AI-${Math.floor(1000 + Math.random() * 9000)}`,
          category: 'AI生成模板',
          description: data.template.description || `由 AI 辅助分析「${prompt}」生成的专业结构化运维报告模板。`,
          tag: 'AI生成',
          estimatedTime: data.template.estimatedTime || '3 秒',
          targetAudience: data.template.targetAudience || targetAudience,
          sections: data.template.sections || [
            '一、核心 KPI 运行态势全景',
            '二、时序机理算法预警诊断',
            '三、关联缺陷工单消缺流转',
            '四、专家处置指令与整改建议'
          ],
          presetPeriod: 'week',
          defaultTitleTemplate: data.template.defaultTitleTemplate || `华东一区 2026年${prompt.slice(0, 10)}专项报告`,
          coverColor: data.template.coverColor || themeColor,
          htmlTemplate: data.template.htmlTemplate,
          isCustom: true
        };
        setGeneratedTemplate(tpl);
      } else {
        throw new Error(data.error || '生成失败');
      }
    } catch (err: any) {
      console.warn('AI Template Generation failed:', err);
      // Local smart fallback template
      const titleSnippet = prompt.trim().slice(0, 16);
      const fallbackTpl: ReportTemplate = {
        id: `tpl-ai-${Date.now()}`,
        name: `${titleSnippet}报告模板`,
        code: `TPL-AI-${Math.floor(1000 + Math.random() * 9000)}`,
        category: 'AI生成模板',
        description: `基于 AI 智能理解「${prompt}」自动编排的定制化运维报告模板，集成多维 KPI 概览与专家闭环。`,
        tag: 'AI生成',
        estimatedTime: '3 秒',
        targetAudience: targetAudience || '区域运维班组、站长、资产运营部',
        sections: [
          `一、${titleSnippet}核心 KPI 运行态势全景`,
          '二、时序特征偏离与机理算法预警诊断',
          '三、关联工单流转与超期消缺督办清单',
          '四、AI 专家运维优化建议与风险阻断措施'
        ],
        presetPeriod: 'week',
        defaultTitleTemplate: `华东一区 2026年${titleSnippet}深度分析报告`,
        coverColor: themeColor,
        htmlTemplate: `<div class="ai-generated-report" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f1f1f;">
  <div style="background: linear-gradient(135deg, #1d39c4 0%, #2f54eb 50%, #597ef7 100%); color: white; padding: 24px 28px; border-radius: 10px; margin-bottom: 24px;">
    <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; margin-bottom: 8px;">🤖 AI 智能辅助编排报告</div>
    <h1 style="font-size: 22px; font-weight: bold; margin: 0 0 10px 0; color: #ffffff;">{{reportTitle}}</h1>
    <div style="display: flex; flex-wrap: wrap; gap: 16px; font-size: 12px; opacity: 0.9;">
      <span>📍 监测范围: {{scope}}</span>
      <span>📅 统计周期: {{dateRange}}</span>
      <span>👤 责任编制: {{creator}}</span>
      <span>📄 编号: {{reportNo}}</span>
    </div>
  </div>

  <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px;">
    <div style="background: #f0f5ff; border: 1px solid #adc6ff; border-radius: 8px; padding: 14px;">
      <div style="color: #2f54eb; font-size: 12px; font-weight: 600;">全域上云率</div>
      <div style="font-size: 22px; font-weight: bold; color: #1f1f1f; margin-top: 4px;">{{cloudRate}}</div>
    </div>
    <div style="background: #f6ffed; border: 1px solid #b7eb8f; border-radius: 8px; padding: 14px;">
      <div style="color: #52c41a; font-size: 12px; font-weight: 600;">上电监控正常率</div>
      <div style="font-size: 22px; font-weight: bold; color: #1f1f1f; margin-top: 4px;">{{powerOnRate}}</div>
    </div>
    <div style="background: #fff7e6; border: 1px solid #ffd591; border-radius: 8px; padding: 14px;">
      <div style="color: #fa8c16; font-size: 12px; font-weight: 600;">SLA 履约达标率</div>
      <div style="font-size: 22px; font-weight: bold; color: #1f1f1f; margin-top: 4px;">{{slaRate}}</div>
    </div>
    <div style="background: #fff1f0; border: 1px solid #ffa39e; border-radius: 8px; padding: 14px;">
      <div style="color: #f5222d; font-size: 12px; font-weight: 600;">重点隐患与预警</div>
      <div style="font-size: 22px; font-weight: bold; color: #1f1f1f; margin-top: 4px;">{{totalRisks}} 项</div>
    </div>
  </div>

  <div style="background: #fafafa; border: 1px solid #e8e8e8; border-radius: 8px; padding: 18px 20px; margin-bottom: 20px;">
    <h3 style="color: #1f1f1f; font-size: 15px; margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
      <span style="background: #2f54eb; width: 4px; height: 14px; border-radius: 2px;"></span>
      一、${titleSnippet}关键运行态势与异常排查
    </h3>
    <p style="color: #595959; font-size: 13px; line-height: 1.8; margin: 0;">
      在本次统计周期内，系统针对 <strong>{{scope}}</strong> 开展高频特征扫描。共接入工单 <strong>{{totalTickets}}</strong> 单（已闭环 <strong>{{completedTickets}}</strong> 单），排查重点风险 <strong>{{totalRisks}}</strong> 项，例行任务 <strong>{{totalTasks}}</strong> 项（已超期 <strong>{{overdueTasks}}</strong> 项）。
    </p>
  </div>

  <div style="background: #f6ffed; border: 1px solid #b7eb8f; border-radius: 8px; padding: 16px 20px; color: #237804; font-size: 13px; line-height: 1.7;">
    <strong>💡 AI 智能研判与决策建议：</strong>
    <p style="margin: 6px 0 0 0;">
      根据算法对电池温升斜率与工单 SLA 耗时的多维拟合分析，建议针对排查出的重点电站组织专项热阻力矩校核，并督促现场于 24 小时内完成临期工单消缺。
    </p>
  </div>
</div>`,
        isCustom: true
      };
      setGeneratedTemplate(fallbackTpl);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!generatedTemplate) return;
    onSaveTemplate(generatedTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                AI 辅助生成报告模板
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                  Gemini & 机理大模型
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                输入您的运维管理需求或选取预设场景，AI 将自动设计报告章节、配色风格与响应式 HTML 模板源码
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/80 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 主体双栏内容 */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* 左侧：输入配置 */}
          <div className="md:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-purple-600" />
                报告模板需求描述 (Prompt) <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="例如：生成一份储能电池热失控预警与电芯温升专项体检模板，包含温差热力图、微短路排查与SOP整改建议"
                rows={3}
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
              />
            </div>

            {/* 快速预设标签 */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 mb-1.5 block">💡 快速载入预设场景：</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(p)}
                    className="text-[11px] text-slate-600 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 border border-slate-200 px-2.5 py-1 rounded-md transition-all text-left"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* 适用受众与分类 */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">模板分类</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as ReportTemplate['category'])}
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="AI生成模板">AI生成模板</option>
                  <option value="运营周报">运营周报</option>
                  <option value="月度白皮书">月度白皮书</option>
                  <option value="单站深度体检">单站深度体检</option>
                  <option value="安全合规专项">安全合规专项</option>
                  <option value="自定义专属专项">自定义专属专项</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Palette className="w-3 h-3 text-purple-600" />
                  主题色调
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={e => setThemeColor(e.target.value)}
                    className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0.5"
                  />
                  <span className="text-xs font-mono text-slate-600">{themeColor}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">适用受众</label>
              <input
                type="text"
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value)}
                placeholder="例如：区域运维负责人、现场技术专工"
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            {/* 生成按钮 */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-lg font-semibold text-xs shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    AI 正在构思模板结构与 HTML 布局...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    ✨ 一键生成报告模板
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 右侧：生成结果展示与实时预览 */}
          <div className="md:col-span-7 flex flex-col bg-slate-50 rounded-xl border border-slate-200 p-4 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-slate-800">
                  {generatedTemplate ? generatedTemplate.name : '模板生成实时预览区'}
                </span>
                {generatedTemplate && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                    {generatedTemplate.code}
                  </span>
                )}
              </div>

              {generatedTemplate && (
                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setActivePreviewMode('preview')}
                    className={`px-2.5 py-1 rounded-md flex items-center gap-1 font-medium transition-all ${
                      activePreviewMode === 'preview'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    可视化渲染
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreviewMode('code')}
                    className={`px-2.5 py-1 rounded-md flex items-center gap-1 font-medium transition-all ${
                      activePreviewMode === 'code'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Code2 className="w-3 h-3" />
                    HTML 源码
                  </button>
                </div>
              )}
            </div>

            {/* 预览窗口内容 */}
            <div className="flex-1 min-h-[340px] mt-3 bg-white rounded-lg border border-slate-200 p-4 overflow-y-auto">
              {isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400">
                  <div className="relative mb-4">
                    <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
                    <Sparkles className="w-5 h-5 text-purple-600 absolute inset-0 m-auto" />
                  </div>
                  <p className="text-xs font-semibold text-slate-600">Gemini 正在分析业务特征与机理规则...</p>
                  <p className="text-[11px] text-slate-400 mt-1">设计精美指标卡片、插值占位符与专家研判结论</p>
                </div>
              ) : generatedTemplate ? (
                activePreviewMode === 'preview' ? (
                  <div className="space-y-4">
                    {/* 章节标签 */}
                    <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-3">
                      <div className="text-[11px] font-bold text-purple-900 mb-1.5 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-purple-600" />
                        AI 智能规划核心章节：
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {generatedTemplate.sections.map((sec, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] bg-white border border-purple-200 text-purple-800 px-2 py-0.5 rounded shadow-2xs font-medium"
                          >
                            {sec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 渲染模板内容 */}
                    <div
                      className="border border-slate-200 rounded-lg p-4 bg-white shadow-2xs text-xs scale-[0.92] origin-top"
                      dangerouslySetInnerHTML={{
                        __html: (generatedTemplate.htmlTemplate || '')
                          .replace(/\{\{\s*reportTitle\s*\}\}/g, generatedTemplate.defaultTitleTemplate)
                          .replace(/\{\{\s*scope\s*\}\}/g, '华东一区 (全域484座电站)')
                          .replace(/\{\{\s*dateRange\s*\}\}/g, '2026-08-18 ~ 2026-08-25')
                          .replace(/\{\{\s*creator\s*\}\}/g, '张工 (区域运维负责人)')
                          .replace(/\{\{\s*reportNo\s*\}\}/g, 'RPT-AI-20260830')
                          .replace(/\{\{\s*cloudRate\s*\}\}/g, '99.2%')
                          .replace(/\{\{\s*powerOnRate\s*\}\}/g, '98.6%')
                          .replace(/\{\{\s*slaRate\s*\}\}/g, '97.8%')
                          .replace(/\{\{\s*totalTickets\s*\}\}/g, '68')
                          .replace(/\{\{\s*completedTickets\s*\}\}/g, '42')
                          .replace(/\{\{\s*totalRisks\s*\}\}/g, '8')
                          .replace(/\{\{\s*totalTasks\s*\}\}/g, '12')
                          .replace(/\{\{\s*overdueTasks\s*\}\}/g, '2')
                      }}
                    />
                  </div>
                ) : (
                  <pre className="text-[11px] font-mono text-slate-700 bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[340px]">
                    {generatedTemplate.htmlTemplate}
                  </pre>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400 text-center">
                  <Sparkles className="w-10 h-10 text-slate-300 mb-3" />
                  <p className="text-xs font-semibold text-slate-600">尚未生成模板</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                    请在左侧输入您希望生成的报告类型与诊断重点，点击「一键生成报告模板」
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {generatedTemplate ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                模板设计已完成，支持随时选用或二次修改
              </span>
            ) : (
              <span>准备就绪，支持通过自然语言一键编排</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!generatedTemplate}
              className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 rounded-lg shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              确认保存至模板库
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
