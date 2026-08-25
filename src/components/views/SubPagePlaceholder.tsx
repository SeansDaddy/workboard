import React from 'react';
import { ActiveView } from '../../types';
import { 
  ArrowLeft, 
  ShieldAlert, 
  Ticket, 
  CheckSquare, 
  BarChart3, 
  FileText, 
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface SubPagePlaceholderProps {
  view: ActiveView;
  onReturnToWorkbench: () => void;
}

export const SubPagePlaceholder: React.FC<SubPagePlaceholderProps> = ({
  view,
  onReturnToWorkbench
}) => {
  const pageMeta: Record<string, { title: string; subtitle: string; desc: string; icon: any; color: string; badge: string }> = {
    page_risk_center: {
      title: '风险中心 (Risk Center)',
      subtitle: '主动运维平台 · 算法特征分析与风险预测大盘',
      desc: '聚合电芯温差散度、PCS热阻劣化、绝缘阻抗下降、SOC容量截断等多维度时序预警与越限告警。工作台首页提供高频聚合视图，本模块提供全区域时序下钻与回溯。',
      icon: ShieldAlert,
      color: 'text-[#FA8C16] bg-[#FFF7E6] border-[#FFD591]',
      badge: '主动分析引擎'
    },
    page_ticket_center: {
      title: '工单中心 (Ticket Center)',
      subtitle: 'pcare 外部工单协同与全生命周期流转',
      desc: '工作台首页展示当前用户在办及高风险置顶工单。完整工单中心承载从工单派发、现场签到、挂起申请、备件申领到消缺验收的完整业务流程。',
      icon: Ticket,
      color: 'text-[#1890FF] bg-[#E6F7FF] border-[#91D5FF]',
      badge: '外部工单源 pcare'
    },
    page_task_center: {
      title: '作业管理 (Task Management)',
      subtitle: '周期性例行巡检与专项整改台账',
      desc: '涵盖日检、周检、月度及季度电气绝缘测试、消防系统联动试验与消缺整改任务。强化超期预警机制，杜绝“该做没做”的安全死角。',
      icon: CheckSquare,
      color: 'text-[#F5222D] bg-[#FFF1F0] border-[#FFA39E]',
      badge: '标准SOP作业'
    },
    page_dashboard: {
      title: '运营看板 (Operations Dashboard)',
      subtitle: '储能电站资产接入、电量结算与综合能效深度看板',
      desc: '提供全区域 484 座电站上云率、上电率、近14天充放电双指标曲线、运行策略配置与实时物理状态分布，支持按地市、容量档位与投运年限多维切片。',
      icon: BarChart3,
      color: 'text-[#52C41A] bg-[#F6FFED] border-[#B7EB8F]',
      badge: '资产态势感知'
    },
    page_report_center: {
      title: '运维报告 (O&M Reports)',
      subtitle: '区域资产健康度周报、月度运营分析白皮书与消缺复盘',
      desc: '自动汇总电站可利用率、等效放电小时数、SLA履约率、算法预警命中率与现场故障归因，支持一键导出 PDF/Excel 汇报材料。',
      icon: FileText,
      color: 'text-[#722ED1] bg-[#F9F0FF] border-[#D3ADF7]',
      badge: '智能报表生成'
    }
  };

  const current = pageMeta[view] || {
    title: '系统模块',
    subtitle: '主动运维平台子系统',
    desc: '该模块正在由平台分析引擎实时渲染。',
    icon: Layers,
    color: 'text-[#595959] bg-[#FAFAFA] border-[#E8E8E8]',
    badge: '子系统'
  };

  const Icon = current.icon;

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* 顶部返回条 */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onReturnToWorkbench}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-[#D9D9D9] text-[#595959] hover:text-[#1890FF] hover:border-[#1890FF] text-xs font-medium cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#8C8C8C]" />
          <span>返回首页工作台</span>
        </button>

        <div className="text-xs text-[#8C8C8C]">
          当前定位：{current.title}
        </div>
      </div>

      {/* 模块主介绍卡 */}
      <div className="bg-white rounded border border-[#E8E8E8] p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded border ${current.color}`}>
            <Icon className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-[#1F1F1F]">{current.title}</h1>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#E6F7FF] text-[#1890FF] border border-[#91D5FF]">
                {current.badge}
              </span>
            </div>
            <p className="text-xs text-[#8C8C8C]">{current.subtitle}</p>
          </div>
        </div>

        <div className="p-4 bg-[#FAFAFA] rounded border border-[#E8E8E8] text-xs text-[#595959] leading-relaxed space-y-2">
          <span className="font-medium text-[#1F1F1F] block">业务边界与定位说明：</span>
          <p>{current.desc}</p>
          <p className="text-[#8C8C8C]">
            （依据需求规范 1.2，首页工作台聚焦“聚合展示、立体决策与直达跳转”，具体处理闭环流转在点击下钻后进入本模块或外部 pcare 系统完成。）
          </p>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-[#F0F0F0]">
          <div className="flex items-center gap-2 text-xs text-[#8C8C8C]">
            <Sparkles className="w-4 h-4 text-[#1890FF]" />
            <span>首页工作台已实时聚合本模块关键指标</span>
          </div>

          <button
            type="button"
            onClick={onReturnToWorkbench}
            className="px-4 py-2 bg-[#1890FF] hover:bg-[#40A9FF] text-white rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>回到工作台处理事项</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
