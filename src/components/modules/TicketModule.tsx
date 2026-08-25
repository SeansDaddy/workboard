import React, { useState, useMemo } from 'react';
import { 
  TicketItem, 
  CONFIG_THRESHOLDS, 
  PriorityLevel 
} from '../../types';
import { 
  PriorityBadge, 
  RiskScoreBadge, 
  SlaBadge, 
  TicketStatusBadge 
} from '../common/Badges';
import { FilterChips, FilterChipItem } from '../common/FilterChips';
import { 
  Ticket, 
  ChevronDown, 
  ChevronRight, 
  ArrowUpRight, 
  Flame, 
  Clock, 
  Sparkles, 
  Building2, 
  ExternalLink,
  ShieldAlert,
  Search,
  Filter
} from 'lucide-react';

interface TicketModuleProps {
  tickets: TicketItem[];
  onOpenTicketProcess: (ticket: TicketItem) => void;
  onOpenTicketDetail: (ticket: TicketItem) => void;
  onJumpToRisk?: (riskId: string) => void;
  initialFilter?: string;
}

export const TicketModule: React.FC<TicketModuleProps> = ({
  tickets,
  onOpenTicketProcess,
  onOpenTicketDetail,
  onJumpToRisk,
  initialFilter = 'all'
}) => {
  const [filterKey, setFilterKey] = useState<string>(initialFilter);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // 高风险判定: 优先级 = 高 或 风险分 >= 80
  const isHighRisk = (item: TicketItem) => {
    return item.priority === '高' || item.riskScore >= CONFIG_THRESHOLDS.HIGH_RISK_SCORE_MIN;
  };

  // 排序规则: 高风险置顶 (组内风险分降序) → 优先级 → SLA 剩余升序
  const sortedTickets = useMemo(() => {
    const priorityWeight: Record<PriorityLevel, number> = { 高: 3, 中: 2, 低: 1 };

    return [...tickets].sort((a, b) => {
      const aIsHigh = isHighRisk(a);
      const bIsHigh = isHighRisk(b);

      // 1. 高风险置顶
      if (aIsHigh && !bIsHigh) return -1;
      if (!aIsHigh && bIsHigh) return 1;

      // 如果同为高风险，按风险分降序
      if (aIsHigh && bIsHigh) {
        if (b.riskScore !== a.riskScore) {
          return b.riskScore - a.riskScore;
        }
      }

      // 2. 按优先级排序
      if (priorityWeight[b.priority] !== priorityWeight[a.priority]) {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }

      // 3. 按 SLA 剩余时间升序 (紧迫者靠前)
      return a.slaRemainingHours - b.slaRemainingHours;
    });
  }, [tickets]);

  // 筛选计算
  const filteredTickets = useMemo(() => {
    return sortedTickets.filter((item) => {
      // 关键字搜索
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const match = 
          item.id.toLowerCase().includes(kw) ||
          item.title.toLowerCase().includes(kw) ||
          item.stationName.toLowerCase().includes(kw) ||
          item.assignee.toLowerCase().includes(kw);
        if (!match) return false;
      }

      // chip 筛选
      if (filterKey === 'mine') {
        return item.assignee === CONFIG_THRESHOLDS.CURRENT_USER_NAME;
      }
      if (filterKey === 'mine_high_risk') {
        return item.assignee === CONFIG_THRESHOLDS.CURRENT_USER_NAME && isHighRisk(item);
      }
      if (filterKey === 'high_risk') {
        return isHighRisk(item);
      }
      if (filterKey === 'sla_urgent') {
        return item.slaRemainingHours < CONFIG_THRESHOLDS.SLA_URGENT_HOURS;
      }
      if (filterKey === 'processing') {
        return item.status === '处理中';
      }
      return true;
    });
  }, [sortedTickets, filterKey, searchKeyword]);

  // Stat chips 数据统计
  const filterChips: FilterChipItem[] = useMemo(() => {
    const totalCount = tickets.length;
    const mineCount = tickets.filter((t) => t.assignee === CONFIG_THRESHOLDS.CURRENT_USER_NAME).length;
    const highRiskCount = tickets.filter((t) => isHighRisk(t)).length;
    const urgentCount = tickets.filter((t) => t.slaRemainingHours < CONFIG_THRESHOLDS.SLA_URGENT_HOURS).length;

    return [
      { key: 'all', label: '全部工单', count: totalCount },
      { key: 'mine', label: '待我处理', count: mineCount, badgeColor: 'primary' },
      { key: 'high_risk', label: '高风险', count: highRiskCount, badgeColor: 'danger' },
      { key: 'sla_urgent', label: 'SLA临期/超时', count: urgentCount, badgeColor: 'warning' },
    ];
  }, [tickets]);

  // 自动生成的文字总结 (根据数据动态变化)
  const summarySentence = useMemo(() => {
    const highCount = tickets.filter((t) => isHighRisk(t) && t.assignee === CONFIG_THRESHOLDS.CURRENT_USER_NAME).length;
    const urgentCount = tickets.filter((t) => t.slaRemainingHours < CONFIG_THRESHOLDS.SLA_URGENT_HOURS && t.assignee === CONFIG_THRESHOLDS.CURRENT_USER_NAME).length;
    
    if (urgentCount > 0) {
      return `当前有 ${urgentCount} 项工单进入紧急 SLA 倒计时 (<4h)，其中 ${highCount} 项为高风险事项，建议优先安排现场处理。`;
    }
    return `当前区域工单整体可控，待我处理 ${tickets.filter(t => t.assignee === CONFIG_THRESHOLDS.CURRENT_USER_NAME).length} 件，暂无严重超时风险。`;
  }, [tickets]);

  const toggleRow = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  return (
    <div className="bg-white rounded-lg border border-[#E8E8E8] shadow-none flex flex-col h-full">
      {/* 模块头部 */}
      <div className="p-3.5 border-b border-[#E8E8E8] space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-blue-50 text-[#1890FF] border border-blue-100">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[#1F1F1F]">工单处理</h2>
                <span className="text-[10px] text-[#8C8C8C] px-1.5 py-0.2 bg-[#F5F5F5] rounded border border-[#E8E8E8]">
                  数据源: pcare
                </span>
              </div>
              <p className="text-[11px] text-[#8C8C8C]">按高风险与 SLA 紧急度立体排序，支持一键直达处理流</p>
            </div>
          </div>

          {/* 搜索框 */}
          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8C8C8C]" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="筛选工单/电站..."
              className="w-full pl-8 pr-2.5 py-1 text-xs rounded bg-[#F5F5F5] border border-[#E8E8E8] text-[#262626] placeholder:text-[#BFBFBF] focus:bg-white focus:outline-hidden focus:border-[#1890FF]"
            />
          </div>
        </div>

        {/* 筛选 chip 栏 */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          <FilterChips
            items={filterChips}
            activeKey={filterKey}
            onChange={setFilterKey}
          />
        </div>

        {/* 智能文字总结 */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#E6F7FF] border border-[#91D5FF] text-[11px] text-[#0050B3]">
          <Sparkles className="w-3.5 h-3.5 text-[#1890FF] shrink-0" />
          <span className="leading-snug">{summarySentence}</span>
        </div>
      </div>

      {/* 工单表格区 */}
      <div className="overflow-x-auto flex-1 min-h-[360px] max-h-[520px] overflow-y-auto text-xs">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#FAFAFA] text-[#595959] font-medium sticky top-0 z-10 text-[11px] border-b border-[#E8E8E8]">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center">展开</th>
              <th className="py-2.5 px-3">工单号 / 标题</th>
              <th className="py-2.5 px-2.5 text-center">优先级</th>
              <th className="py-2.5 px-2.5">风险分</th>
              <th className="py-2.5 px-3">关联电站</th>
              <th className="py-2.5 px-2.5">责任人</th>
              <th className="py-2.5 px-3">SLA 剩余</th>
              <th className="py-2.5 px-2.5 text-center">状态</th>
              <th className="py-2.5 px-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0] text-[#262626]">
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-[#8C8C8C]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Ticket className="w-8 h-8 text-[#D9D9D9]" />
                    <span>暂无符合筛选条件的工单</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTickets.map((item) => {
                const high = isHighRisk(item);
                const isExpired = item.slaRemainingHours <= CONFIG_THRESHOLDS.SLA_EXPIRED_HOURS;
                const isExpanded = expandedRowId === item.id;

                // SLA 超时整行微红高亮
                let rowBgClass = 'hover:bg-[#FAFAFA]';
                if (isExpired) {
                  rowBgClass = 'bg-[#FFF1F0]/50 hover:bg-[#FFF1F0] border-l-2 border-l-[#F5222D]';
                } else if (high) {
                  rowBgClass = 'hover:bg-[#F0F5FF]/40';
                }

                return (
                  <React.Fragment key={item.id}>
                    <tr 
                      onClick={() => toggleRow(item.id)}
                      className={`transition-colors cursor-pointer group ${rowBgClass}`}
                    >
                      {/* 展开图标 */}
                      <td className="py-2.5 px-3 text-center text-[#8C8C8C]">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-[#1890FF] inline" />
                        ) : (
                          <ChevronRight className="w-4 h-4 group-hover:text-[#262626] inline" />
                        )}
                      </td>

                      {/* 工单号与标题 */}
                      <td className="py-2.5 px-3 max-w-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[11px] font-semibold text-[#1F1F1F]">
                            {item.id}
                          </span>
                          {high && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#F5222D] bg-[#FFF1F0] px-1 py-0.2 rounded border border-[#FFA39E]">
                              <Flame className="w-2.5 h-2.5 fill-current" />
                              高风险
                            </span>
                          )}
                          {item.linkedRiskId && (
                            <span className="text-[10px] text-[#722ED1] bg-[#F9F0FF] px-1 py-0.2 rounded border border-[#D3ADF7] font-mono">
                              预警源
                            </span>
                          )}
                        </div>
                        <div className="font-medium text-[#262626] line-clamp-1 mt-0.5" title={item.title}>
                          {item.title}
                        </div>
                      </td>

                      {/* 优先级 */}
                      <td className="py-2.5 px-2.5 text-center">
                        <PriorityBadge priority={item.priority} />
                      </td>

                      {/* 风险分 */}
                      <td className="py-2.5 px-2.5">
                        <RiskScoreBadge score={item.riskScore} />
                      </td>

                      {/* 电站 */}
                      <td className="py-2.5 px-3 max-w-[130px] truncate text-[#595959]">
                        <div className="truncate font-medium text-[#262626]" title={item.stationName}>
                          {item.stationName}
                        </div>
                        <div className="text-[10px] text-[#8C8C8C]">{item.region}区域</div>
                      </td>

                      {/* 责任人 */}
                      <td className="py-2.5 px-2.5 whitespace-nowrap">
                        <span className={`px-1.5 py-0.2 rounded text-xs ${
                          item.assignee === CONFIG_THRESHOLDS.CURRENT_USER_NAME
                            ? 'bg-[#E6F7FF] text-[#0050B3] font-medium'
                            : 'text-[#595959]'
                        }`}>
                          {item.assignee}
                        </span>
                      </td>

                      {/* SLA 剩余时限 */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <SlaBadge remainingHours={item.slaRemainingHours} deadline={item.slaDeadline} />
                      </td>

                      {/* 状态 */}
                      <td className="py-2.5 px-2.5 text-center whitespace-nowrap">
                        <TicketStatusBadge status={item.status} />
                      </td>

                      {/* 操作 */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenTicketDetail(item)}
                            className="px-2 py-1 text-[11px] text-[#595959] hover:text-[#1890FF] hover:bg-[#F5F5F5] rounded transition-colors cursor-pointer"
                          >
                            详情
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenTicketProcess(item)}
                            className="px-2.5 py-1 text-[11px] font-medium bg-[#1890FF] text-white hover:bg-[#40A9FF] rounded transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>去处理</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* 行内展开详情 */}
                    {isExpanded && (
                      <tr className="bg-[#FAFAFA] text-xs">
                        <td colSpan={9} className="p-3.5 pl-10 border-y border-[#E8E8E8]">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <span className="font-medium text-[#262626] flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5 text-[#8C8C8C]" />
                                设备与点位信息
                              </span>
                              <p className="text-[#595959] font-mono text-[11px]">
                                {item.deviceCode ?? '未指定具体回路/整站'}
                              </p>
                              <p className="text-[11px] text-[#8C8C8C]">
                                创建时间: <span className="font-medium text-[#595959]">{item.createdAt}</span>
                              </p>
                              <p className="text-[11px] text-[#8C8C8C]">
                                承诺截止: <span className="font-medium text-[#262626]">{item.slaDeadline}</span>
                              </p>
                            </div>

                            <div className="space-y-1">
                              <span className="font-medium text-[#262626]">现象详述与分析</span>
                              <p className="text-[#595959] text-[11px] leading-relaxed">
                                {item.description ?? '暂无详细描述'}
                              </p>
                            </div>

                            <div className="space-y-1.5 bg-[#E6F7FF]/60 p-2.5 rounded border border-[#91D5FF]">
                              <span className="font-medium text-[#0050B3] flex items-center gap-1 text-[11px]">
                                <Sparkles className="w-3.5 h-3.5 text-[#1890FF]" />
                                专家诊断建议
                              </span>
                              <p className="text-[#003A8C] text-[11px] leading-relaxed">
                                {item.suggestedAction ?? '请联系区域技术专家进行联调。'}
                              </p>

                              {item.linkedRiskId && (
                                <div className="pt-1 border-t border-[#91D5FF]/60 flex items-center justify-between text-[11px]">
                                  <span className="text-[#595959]">关联预警单:</span>
                                  {onJumpToRisk ? (
                                    <button
                                      type="button"
                                      onClick={() => onJumpToRisk(item.linkedRiskId!)}
                                      className="text-[#1890FF] font-mono font-medium hover:underline flex items-center gap-0.5 cursor-pointer"
                                    >
                                      {item.linkedRiskId} →
                                    </button>
                                  ) : (
                                    <span className="font-mono text-[#1890FF]">{item.linkedRiskId}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 底部统计栏 */}
      <div className="p-2.5 px-3.5 bg-[#FAFAFA] border-t border-[#E8E8E8] flex items-center justify-between text-[11px] text-[#8C8C8C]">
        <div>
          显示 <span className="font-semibold text-[#262626]">{filteredTickets.length}</span> 条工单 (共 {tickets.length} 条)
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5222D]" />
            超时/高风险优先置顶
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1890FF]" />
            pcare 实时同步
          </span>
        </div>
      </div>
    </div>
  );
};
