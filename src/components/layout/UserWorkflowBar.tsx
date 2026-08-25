import React from 'react';
import { 
  ShieldAlert, 
  PlusCircle, 
  Wrench, 
  CheckCircle2, 
  FileText, 
  Sparkles,
  Layers,
  RotateCcw
} from 'lucide-react';
import { ActiveView } from '../../types';

export type WorkflowStepId = 'all' | '01' | '02' | '03' | '04' | '05';

interface UserWorkflowBarProps {
  selectedStep: WorkflowStepId;
  onSelectStep: (step: WorkflowStepId) => void;
  unhandledRisksCount: number;
  myPendingTicketsCount: number;
  inProgressTasksCount: number;
  myCompletedTicketsCount: number;
}

export const UserWorkflowBar: React.FC<UserWorkflowBarProps> = ({
  selectedStep,
  onSelectStep,
  unhandledRisksCount,
  myPendingTicketsCount,
  inProgressTasksCount,
  myCompletedTicketsCount
}) => {
  const steps = [
    {
      id: '01' as WorkflowStepId,
      step: '01',
      name: '主动研判',
      sub: '预警告警 & 资产态势',
      badge: `${unhandledRisksCount} 项待研判`,
      badgeColor: unhandledRisksCount > 0 ? 'bg-[#FFF7E6] text-[#FA8C16] border-[#FFD591]' : 'bg-[#F5F5F5] text-[#8C8C8C] border-[#D9D9D9]',
      icon: ShieldAlert,
      iconColor: 'text-[#FA8C16]',
      iconBg: 'bg-[#FFF7E6]',
      filterDesc: '仅展示：高风险预警与告警 + 储能资产态势'
    },
    {
      id: '02' as WorkflowStepId,
      step: '02',
      name: '工单派发',
      sub: '待派工单 & 作业下发',
      badge: '待派发',
      badgeColor: 'bg-[#E6F7FF] text-[#1890FF] border-[#91D5FF]',
      icon: PlusCircle,
      iconColor: 'text-[#1890FF]',
      iconBg: 'bg-[#E6F7FF]',
      filterDesc: '仅展示：待办工单精选 + 例行作业计划'
    },
    {
      id: '03' as WorkflowStepId,
      step: '03',
      name: '现场消缺',
      sub: '在办处置 & SLA履约',
      badge: `${myPendingTicketsCount} 单在办`,
      badgeColor: myPendingTicketsCount > 0 ? 'bg-[#FFF1F0] text-[#F5222D] border-[#FFA39E]' : 'bg-[#F6FFED] text-[#52C41A] border-[#B7EB8F]',
      icon: Wrench,
      iconColor: 'text-[#F5222D]',
      iconBg: 'bg-[#FFF1F0]',
      filterDesc: '仅展示：消缺在办工单 + 现场巡检作业'
    },
    {
      id: '04' as WorkflowStepId,
      step: '04',
      name: '复核验收',
      sub: '核验确认 & 闭环归档',
      badge: `${myCompletedTicketsCount} 单已闭环`,
      badgeColor: 'bg-[#F6FFED] text-[#52C41A] border-[#B7EB8F]',
      icon: CheckCircle2,
      iconColor: 'text-[#52C41A]',
      iconBg: 'bg-[#F6FFED]',
      filterDesc: '仅展示：已完工/闭环工单 + 验收清单'
    },
    {
      id: '05' as WorkflowStepId,
      step: '05',
      name: '报告复盘',
      sub: '资产简报 & 绩效复盘',
      badge: '周报/月报',
      badgeColor: 'bg-[#F9F0FF] text-[#722ED1] border-[#D3ADF7]',
      icon: FileText,
      iconColor: 'text-[#722ED1]',
      iconBg: 'bg-[#F9F0FF]',
      filterDesc: '仅展示：储能资产态势简报 + 绩效复盘'
    }
  ];

  return (
    <div className="bg-white rounded-lg p-3.5 border border-[#E8E8E8] shadow-none">
      {/* 头部标题、工作流过滤状态与重置按钮 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0F0F0]">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-1 h-3.5 bg-[#1890FF] rounded-xs" />
          <span className="text-xs font-semibold text-[#1F1F1F]">
            责任人闭环工作流筛选 (Workbench Flow Filter)
          </span>
          {selectedStep === 'all' ? (
            <span className="text-[10px] text-[#52C41A] bg-[#F6FFED] px-1.5 py-0.2 rounded border border-[#B7EB8F] font-medium">
              默认展示全部工作台模块
            </span>
          ) : (
            <span className="text-[10px] text-[#1890FF] bg-[#E6F7FF] px-1.5 py-0.2 rounded border border-[#91D5FF] font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              当前筛选: {steps.find(s => s.id === selectedStep)?.name} ({steps.find(s => s.id === selectedStep)?.filterDesc})
            </span>
          )}
        </div>

        {/* 重置为全部 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectStep('all')}
            className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors flex items-center gap-1 ${
              selectedStep === 'all'
                ? 'bg-[#1890FF] text-white shadow-xs'
                : 'bg-[#F5F5F5] text-[#595959] hover:bg-[#E8E8E8] hover:text-[#1F1F1F]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>全流程视图 (默认全部)</span>
          </button>
        </div>
      </div>

      {/* 五大工作流分类卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 pt-3">
        {steps.map((st) => {
          const Icon = st.icon;
          const isSelected = selectedStep === st.id;

          return (
            <div 
              key={st.step}
              onClick={() => onSelectStep(isSelected ? 'all' : st.id)}
              className={`relative flex flex-col justify-between p-2.5 rounded border transition-all cursor-pointer select-none group ${
                isSelected 
                  ? 'bg-[#E6F7FF]/40 border-[#1890FF] ring-2 ring-[#1890FF]/20 shadow-xs' 
                  : 'bg-[#FAFAFA] border-[#E8E8E8] hover:bg-white hover:border-[#1890FF]/60'
              }`}
            >
              {/* 顶部序号与状态徽标 */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className={`font-mono text-[10px] font-bold ${
                    isSelected ? 'text-[#1890FF]' : 'text-[#8C8C8C] group-hover:text-[#1890FF]'
                  }`}>
                    {st.step}
                  </span>
                  <div className={`p-1 rounded ${st.iconBg} ${st.iconColor}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${st.badgeColor}`}>
                  {st.badge}
                </span>
              </div>

              {/* 步骤名称与描述 */}
              <div className="space-y-0.5 my-1">
                <div className={`text-xs font-semibold flex items-center justify-between ${
                  isSelected ? 'text-[#0050B3]' : 'text-[#1F1F1F] group-hover:text-[#1890FF]'
                }`}>
                  <span>{st.name}</span>
                  {isSelected && (
                    <span className="text-[10px] text-[#1890FF] font-medium bg-white px-1 rounded border border-[#91D5FF]">
                      展示中
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-[#8C8C8C] leading-tight">
                  {st.sub}
                </div>
              </div>

              {/* 底部视图切换提示 */}
              <div className="pt-2 mt-1 border-t border-[#F0F0F0] flex items-center justify-between text-[10px]">
                <span className="text-[#8C8C8C]">
                  {isSelected ? '点击取消筛选' : '点击切换工作台'}
                </span>
                <span className={`font-medium ${
                  isSelected ? 'text-[#1890FF]' : 'text-[#8C8C8C] group-hover:text-[#1890FF]'
                }`}>
                  {isSelected ? '已选中' : '筛选'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
