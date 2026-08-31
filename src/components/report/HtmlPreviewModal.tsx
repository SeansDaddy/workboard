import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  FileCode, 
  Eye, 
  ExternalLink,
  Code2,
  FileText
} from 'lucide-react';
import { ReportGenerationTask } from '../../types';

interface HtmlPreviewModalProps {
  task: ReportGenerationTask | null;
  isOpen: boolean;
  onClose: () => void;
}

export const HtmlPreviewModal: React.FC<HtmlPreviewModalProps> = ({
  task,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !task || !task.htmlContent) return null;

  const handleDownload = () => {
    const blob = new Blob([task.htmlContent || ''], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${task.reportTitle.replace(/\s+/g, '_')}_${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(task.htmlContent || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(task.htmlContent || '');
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden">
        {/* 头部 */}
        <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                {task.reportTitle}
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {task.fileFormat} 交付件
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                任务编号: {task.id} · 生成时间: {task.completedAt || task.createdAt} · 范围: {task.scope}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 切换渲染/源码 */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs mr-2">
              <button
                type="button"
                onClick={() => setActiveTab('visual')}
                className={`px-3 py-1 rounded-md flex items-center gap-1 font-medium transition-all cursor-pointer ${
                  activeTab === 'visual'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                排版渲染
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1 rounded-md flex items-center gap-1 font-medium transition-all cursor-pointer ${
                  activeTab === 'code'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                HTML 源码
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '已复制' : '复制源码'}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              打印/导出PDF
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              下载 HTML
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 视口内容 */}
        <div className="flex-1 bg-slate-100 p-3 overflow-hidden">
          {activeTab === 'visual' ? (
            <iframe
              srcDoc={task.htmlContent}
              title={task.reportTitle}
              className="w-full h-full bg-white rounded-lg shadow-sm border border-slate-200"
              sandbox="allow-same-origin allow-scripts allow-popups"
            />
          ) : (
            <div className="w-full h-full bg-slate-950 rounded-lg p-4 overflow-auto">
              <pre className="text-xs font-mono text-slate-100 whitespace-pre-wrap leading-relaxed">
                {task.htmlContent}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
