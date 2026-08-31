import React, { useState } from 'react';
import { 
  X, 
  Zap, 
  Layers, 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  Copy, 
  Check, 
  Play, 
  Code2,
  BookOpen
} from 'lucide-react';
import { OperationSkill } from '../../types';

interface SkillDetailModalProps {
  skill: OperationSkill | null;
  isOpen: boolean;
  onClose: () => void;
  onGenerateReportFromSkill: (skill: OperationSkill) => void;
  onConvertToTemplate: (skill: OperationSkill) => void;
}

export const SkillDetailModal: React.FC<SkillDetailModalProps> = ({
  skill,
  isOpen,
  onClose,
  onGenerateReportFromSkill,
  onConvertToTemplate
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'rules' | 'raw'>('rules');

  if (!isOpen || !skill) return null;

  const handleCopyRaw = () => {
    if (skill.skillContentRaw) {
      navigator.clipboard.writeText(skill.skillContentRaw);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{skill.name}</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/20 text-white">
                  {skill.code}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  {skill.version}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                适用领域: {skill.targetDomain} · 编写: {skill.author}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab 切换 */}
        <div className="px-6 py-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'rules'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              诊断机理与规则矩阵
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'raw'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Skill 原始定义 (Markdown/YAML)
            </button>
          </div>

          {activeTab === 'raw' && skill.skillContentRaw && (
            <button
              onClick={handleCopyRaw}
              className="text-xs text-slate-600 hover:text-purple-700 flex items-center gap-1 font-medium cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '已复制' : '复制代码'}
            </button>
          )}
        </div>

        {/* 主体 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'rules' ? (
            <>
              {/* 简介 */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-700 leading-relaxed">
                <strong className="text-slate-900 block mb-1">📖 Skill 概述：</strong>
                {skill.description}
              </div>

              {/* 触发规则条件 */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  触发诊断与预警条件 ({skill.triggerConditions.length} 项)
                </h3>
                <div className="space-y-2">
                  {skill.triggerConditions.map((rule, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 bg-amber-50/50 border border-amber-200/70 rounded-lg p-3 text-xs"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <span className="font-mono font-medium text-slate-800">{rule}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 诊断逻辑 */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-600" />
                  核心诊断推理链
                </h3>
                <div className="bg-purple-50/40 border border-purple-200/60 rounded-lg p-3 text-xs text-purple-950 whitespace-pre-wrap leading-relaxed">
                  {skill.diagnosticLogic}
                </div>
              </div>

              {/* 产出章节 */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  报告产出标准章节
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {skill.outputSections.map((sec, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{sec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <pre className="text-xs font-mono bg-slate-950 text-slate-100 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {skill.skillContentRaw || '未提供原始 YAML/Markdown 文本'}
            </pre>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onConvertToTemplate(skill);
              onClose();
            }}
            className="text-xs font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            固化为报告模板
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              关闭
            </button>
            <button
              type="button"
              onClick={() => {
                onGenerateReportFromSkill(skill);
                onClose();
              }}
              className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              立即基于此 Skill 生成报告
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
