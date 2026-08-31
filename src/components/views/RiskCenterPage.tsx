import React from 'react';
import { 
  RiskItem, 
  OperationsMetrics, 
  CONFIG_THRESHOLDS 
} from '../../types';
import { RiskModule } from '../modules/RiskModule';
import { 
  ShieldAlert, 
  ArrowLeft, 
  Sparkles, 
  RefreshCw, 
  Download,
  Filter,
  CheckCircle2
} from 'lucide-react';

interface RiskCenterPageProps {
  risks: RiskItem[];
  regionalTop5: OperationsMetrics['regionalRiskTop5'];
  onReturnToWorkbench: () => void;
  onOpenRiskAnalysis?: (risk: RiskItem) => void;
  onOpenRiskDetail: (risk: RiskItem) => void;
  onConvertToTicket: (risk: RiskItem) => void;
  onJumpToTicket: (ticketId: string) => void;
  initialFilter?: string;
}

export const RiskCenterPage: React.FC<RiskCenterPageProps> = ({
  risks,
  regionalTop5,
  onReturnToWorkbench,
  onOpenRiskAnalysis,
  onOpenRiskDetail,
  onConvertToTicket,
  onJumpToTicket,
  initialFilter = 'all'
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
            <div className="p-1 rounded bg-[#FFF7E6] text-[#FA8C16] border border-[#FFD591]">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-[#1F1F1F]">风险中心 · 算法特征分析与风险预测大盘</h1>
                <span className="text-[10px] text-[#FA8C16] bg-[#FFFBE6] px-1.5 py-0.2 rounded border border-[#FFE58F] font-medium">
                  主动分析引擎
                </span>
              </div>
              <p className="text-[11px] text-[#8C8C8C]">
                聚合电芯温差散度、PCS热阻劣化、绝缘阻抗下降、SOC容量截断等多维度时序预警与越限告警
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8C8C8C]">
            共 <strong className="text-[#1F1F1F] font-semibold">{risks.length}</strong> 条风险记录
          </span>
        </div>
      </div>

      {/* 完整风险中心模块 */}
      <div className="w-full">
        <RiskModule
          risks={risks}
          regionalTop5={regionalTop5}
          onOpenRiskAnalysis={onOpenRiskAnalysis}
          onOpenRiskDetail={onOpenRiskDetail}
          onConvertToTicket={onConvertToTicket}
          onJumpToTicket={onJumpToTicket}
          initialFilter={initialFilter}
        />
      </div>
    </div>
  );
};
