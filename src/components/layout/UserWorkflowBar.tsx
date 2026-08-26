import React from 'react';
import { 
  ShieldAlert, 
  PlusCircle, 
  Wrench, 
  CheckCircle2, 
  FileText, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

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
      filterDesc: '高风险预警与告警 + 储能资产态势',
      flowOutput: '异常特征诊断包',
      flowAction: '触发预警·带参下发'
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
      filterDesc: '待办工单精选 + 例行作业计划',
      flowOutput: 'pcare电子派工单',
      flowAction: '指定责任·下发SLA'
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
      filterDesc: '消缺在办工单 + 现场巡检作业',
      flowOutput: '现场排故消缺记录',
      flowAction: '现场打卡·排故上报'
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
      filterDesc: '已完工/闭环工单 + 验收清单',
      flowOutput: '遥测恢复归档单',
      flowAction: '遥测核验·签字归档'
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
      filterDesc: '储能资产态势简报 + 绩效复盘',
      flowOutput: '运维白皮书案例库',
      flowAction: '闭环达成·沉淀经验'
    }
  ];

  return (
    <div className="bg-white rounded-lg p-4 border border-[#E8E8E8] shadow-none space-y-3.5">
      {/* 头部标题、工作流过滤状态与重置按钮 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#F0F0F0]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-1.5 h-4 bg-[#1890FF] rounded-xs" />
          <span className="text-sm font-bold text-[#1F1F1F]">
            责任人闭环工作流全景与流转关系 (Closed-Loop Workflow Pipeline)
          </span>
          {selectedStep === 'all' ? (
            <span className="text-xs text-[#52C41A] bg-[#F6FFED] px-2 py-0.5 rounded border border-[#B7EB8F] font-semibold">
              默认全流程贯通视图
            </span>
          ) : (
            <span className="text-xs text-[#1890FF] bg-[#E6F7FF] px-2 py-0.5 rounded border border-[#91D5FF] font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              当前聚焦环节: {steps.find(s => s.id === selectedStep)?.name} ({steps.find(s => s.id === selectedStep)?.filterDesc})
            </span>
          )}
        </div>

        {/* 重置为全部 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectStep('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
              selectedStep === 'all'
                ? 'bg-[#1890FF] text-white shadow-xs'
                : 'bg-[#F5F5F5] text-[#595959] hover:bg-[#E8E8E8] hover:text-[#1F1F1F]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>全流程视图 (默认全部)</span>
          </button>
        </div>
      </div>

      {/* 显性化流转管道：全流程横向串联与流转关系呈现 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4 items-stretch">
        {steps.map((st, idx) => {
          const Icon = st.icon;
          const isSelected = selectedStep === st.id;
          const isLast = idx === steps.length - 1;

          return (
            <div key={st.step} className="relative flex flex-col h-full">
              {/* 单个节点卡片 */}
              <div 
                onClick={() => onSelectStep(isSelected ? 'all' : st.id)}
                className={`relative flex flex-col justify-between p-3.5 rounded-lg border transition-all cursor-pointer select-none group h-full ${
                  isSelected 
                    ? 'bg-[#E6F7FF]/60 border-[#1890FF] ring-2 ring-[#1890FF]/30 shadow-xs' 
                    : 'bg-[#FAFAFA] border-[#E8E8E8] hover:bg-white hover:border-[#1890FF]/70 hover:shadow-xs'
                }`}
              >
                {/* 顶部序号与状态徽标 */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                      isSelected 
                        ? 'bg-[#1890FF] text-white border-[#1890FF]' 
                        : 'bg-white text-[#595959] border-[#D9D9D9] group-hover:border-[#1890FF] group-hover:text-[#1890FF]'
                    }`}>
                      {st.step}
                    </span>
                    <div className={`p-1.5 rounded-md ${st.iconBg} ${st.iconColor} border border-current/20`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${st.badgeColor}`}>
                    {st.badge}
                  </span>
                </div>

                {/* 步骤名称与描述 */}
                <div className="space-y-1 my-1">
                  <div className={`text-sm font-bold flex items-center justify-between ${
                    isSelected ? 'text-[#0050B3]' : 'text-[#1F1F1F] group-hover:text-[#1890FF]'
                  }`}>
                    <span>{st.name}</span>
                    {isSelected ? (
                      <span className="text-xs text-[#1890FF] font-semibold bg-white px-2 py-0.5 rounded border border-[#91D5FF]">
                        当前聚焦
                      </span>
                    ) : (
                      <span className="text-xs text-[#8C8C8C] group-hover:text-[#1890FF] transition-colors">
                        筛选 ➔
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#8C8C8C] leading-snug">
                    {st.sub}
                  </div>
                </div>

                {/* 显性流转输出物与阶段产出标签 */}
                <div className="mt-2.5 pt-2.5 border-t border-[#F0F0F0] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8C8C8C]">阶段产出:</span>
                    <span className="font-semibold text-[#262626] truncate max-w-[120px]" title={st.flowOutput}>
                      {st.flowOutput}
                    </span>
                  </div>
                </div>
              </div>

              {/* 居中对齐的流转关系指示箭头 (仅在节点之间展示) */}
              {!isLast && (
                <div className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 items-center justify-center pointer-events-none">
                  <div 
                    className="bg-white border border-[#1890FF]/50 text-[#1890FF] rounded-full p-1 shadow-sm flex items-center justify-center"
                    title={`流转动作: ${st.flowAction}`}
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-[#1890FF]" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 底部全链路流转关系说明横条 (显性指引端到端流转逻辑) */}
      <div className="bg-[#FAFAFA] rounded-md p-2.5 px-3.5 border border-[#E8E8E8] text-xs text-[#595959] flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-[#1F1F1F] shrink-0">流转链路:</span>
          <span className="text-[#FA8C16] font-semibold">01 主动研判 (预警发现)</span>
          <span className="text-[#8C8C8C]">➔[带参派发]➔</span>
          <span className="text-[#1890FF] font-semibold">02 工单派发 (下发pcare)</span>
          <span className="text-[#8C8C8C]">➔[派驻消缺]➔</span>
          <span className="text-[#F5222D] font-semibold">03 现场消缺 (SLA履约)</span>
          <span className="text-[#8C8C8C]">➔[完工上报]➔</span>
          <span className="text-[#52C41A] font-semibold">04 复核验收 (遥测恢复)</span>
          <span className="text-[#8C8C8C]">➔[经验沉淀]➔</span>
          <span className="text-[#722ED1] font-semibold">05 报告复盘 (白皮书)</span>
        </div>
        <span className="text-xs text-[#8C8C8C] shrink-0">
          点击任意节点即可联动工作台模块
        </span>
      </div>
    </div>
  );
};
