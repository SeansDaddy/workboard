import React from 'react';
import { 
  Stethoscope, 
  FileSpreadsheet, 
  Send, 
  Target, 
  CheckCircle, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export type QuickActionType = 'diagnose' | 'report' | 'push' | 'track' | 'closeout';

interface QuickAccessBarProps {
  onTriggerAction: (action: QuickActionType) => void;
}

export const QuickAccessBar: React.FC<QuickAccessBarProps> = ({ onTriggerAction }) => {
  const actions = [
    {
      id: 'diagnose' as QuickActionType,
      title: '故障诊断',
      desc: '电芯温差与PCS诊断',
      icon: Stethoscope,
      bgColor: 'bg-white hover:bg-[#F5F5F5] border-[#E8E8E8] text-[#262626]',
      iconColor: 'text-[#1890FF]',
      iconBg: 'bg-blue-50'
    },
    {
      id: 'report' as QuickActionType,
      title: '报告生成',
      desc: '周度运维运营简报',
      icon: FileSpreadsheet,
      bgColor: 'bg-white hover:bg-[#F5F5F5] border-[#E8E8E8] text-[#262626]',
      iconColor: 'text-[#52C41A]',
      iconBg: 'bg-emerald-50'
    },
    {
      id: 'push' as QuickActionType,
      title: '风险推送',
      desc: '现场应急通知推送',
      icon: Send,
      bgColor: 'bg-white hover:bg-[#F5F5F5] border-[#E8E8E8] text-[#262626]',
      iconColor: 'text-[#FA8C16]',
      iconBg: 'bg-amber-50'
    },
    {
      id: 'track' as QuickActionType,
      title: '风险跟踪',
      desc: '预警命中率与复盘',
      icon: Target,
      bgColor: 'bg-white hover:bg-[#F5F5F5] border-[#E8E8E8] text-[#262626]',
      iconColor: 'text-[#722ED1]',
      iconBg: 'bg-purple-50'
    },
    {
      id: 'closeout' as QuickActionType,
      title: '工单闭环',
      desc: '消缺验收与归档',
      icon: CheckCircle,
      bgColor: 'bg-white hover:bg-[#F5F5F5] border-[#E8E8E8] text-[#262626]',
      iconColor: 'text-[#13C2C2]',
      iconBg: 'bg-cyan-50'
    }
  ];

  return (
    <div className="bg-white rounded-lg p-3 border border-[#E8E8E8] shadow-none">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#262626] flex items-center gap-1.5">
            <span className="w-1 h-3.5 bg-[#1890FF] rounded-xs" />
            快捷通道
          </span>
          <span className="text-[11px] text-[#8C8C8C]">高频业务下钻入口</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={() => onTriggerAction(act.id)}
              className={`flex items-center gap-2 p-2 rounded border transition-colors text-left group cursor-pointer ${act.bgColor}`}
            >
              <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${act.iconBg}`}>
                <Icon className={`w-3.5 h-3.5 ${act.iconColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-[#262626] truncate flex items-center justify-between">
                  <span>{act.title}</span>
                  <ChevronRight className="w-3 h-3 text-[#BFBFBF] group-hover:text-[#262626] transition-colors" />
                </div>
                <div className="text-[10px] text-[#8C8C8C] truncate">{act.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
