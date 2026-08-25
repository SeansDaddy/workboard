import React from 'react';
import { OperationsMetrics } from '../../types';
import { DashboardModule } from '../modules/DashboardModule';
import { 
  BarChart3, 
  ArrowLeft, 
  Sparkles, 
  Layers, 
  TrendingUp,
  Cloud,
  Power,
  Zap,
  Activity
} from 'lucide-react';

interface DashboardPageProps {
  metrics: OperationsMetrics;
  onReturnToWorkbench: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  metrics,
  onReturnToWorkbench
}) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 顶部面包屑与标题栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded border border-[#E8E8E8]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReturnToWorkbench}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-[#D9D9D9] text-[#595959] hover:text-[#1890FF] hover:border-[#1890FF] text-xs font-medium cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#8C8C8C]" />
            <span>返回工作台</span>
          </button>
          <div className="h-4 w-px bg-[#E8E8E8]" />
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[#F6FFED] text-[#52C41A] border border-[#B7EB8F]">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-[#1F1F1F]">运营看板 · 储能资产健康度与多维运行态势</h1>
                <span className="text-[10px] text-[#52C41A] bg-[#F6FFED] px-1.5 py-0.2 rounded border border-[#B7EB8F] font-medium">
                  5 块核心磁贴全息监控
                </span>
              </div>
              <p className="text-[11px] text-[#8C8C8C]">
                监控全域 484 座电站的接入上云率、上电受控率、14天充放电双轴趋势、运行策略台账及实时物理状态分布
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#595959]">
          <span>今日累计放电: <strong className="text-[#1F1F1F] font-semibold">{metrics.dischargeSummary.todayCount}</strong> 次 ({metrics.dischargeSummary.todayEnergyMWh} MWh)</span>
        </div>
      </div>

      {/* 完整运营看板模块 */}
      <div className="w-full">
        <DashboardModule metrics={metrics} />
      </div>
    </div>
  );
};
