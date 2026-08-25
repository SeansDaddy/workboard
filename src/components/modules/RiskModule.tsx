import React, { useState, useMemo } from 'react';
import { 
  RiskItem, 
  OperationsMetrics, 
  CONFIG_THRESHOLDS, 
  PriorityLevel 
} from '../../types';
import { 
  RiskTypeBadge, 
  RiskStatusBadge, 
  PriorityBadge, 
  RiskScoreBadge 
} from '../common/Badges';
import { FilterChips, FilterChipItem } from '../common/FilterChips';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { 
  ShieldAlert, 
  Sparkles, 
  AlertTriangle, 
  ChevronDown, 
  ChevronRight, 
  ArrowUpRight, 
  ExternalLink,
  PlusCircle,
  BarChart2,
  CheckCircle2,
  TrendingUp,
  Search
} from 'lucide-react';

interface RiskModuleProps {
  risks: RiskItem[];
  regionalTop5: OperationsMetrics['regionalRiskTop5'];
  onOpenRiskDetail: (risk: RiskItem) => void;
  onConvertToTicket: (risk: RiskItem) => void;
  onJumpToTicket: (ticketId: string) => void;
  initialFilter?: string;
}

export const RiskModule: React.FC<RiskModuleProps> = ({
  risks,
  regionalTop5,
  onOpenRiskDetail,
  onConvertToTicket,
  onJumpToTicket,
  initialFilter = 'all'
}) => {
  const [filterKey, setFilterKey] = useState<string>(initialFilter);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // 区分统计 (待处理风险不包含已转工单)
  const unhandledRisks = useMemo(() => {
    return risks.filter((r) => r.status !== '已转工单' && r.status !== '已忽略');
  }, [risks]);

  // 高风险预警数 & 高风险告警数 (分开统计)
  const highWarningCount = useMemo(() => {
    return unhandledRisks.filter((r) => r.type === '预警' && (r.priority === '高' || r.riskScore >= CONFIG_THRESHOLDS.HIGH_RISK_SCORE_MIN)).length;
  }, [unhandledRisks]);

  const highAlarmCount = useMemo(() => {
    return unhandledRisks.filter((r) => r.type === '告警' && (r.priority === '高' || r.riskScore >= CONFIG_THRESHOLDS.HIGH_RISK_SCORE_MIN)).length;
  }, [unhandledRisks]);

  // 过滤列表
  const filteredRisks = useMemo(() => {
    return risks.filter((item) => {
      // 关键字
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const match = 
          item.id.toLowerCase().includes(kw) ||
          item.title.toLowerCase().includes(kw) ||
          item.stationName.toLowerCase().includes(kw) ||
          item.category.toLowerCase().includes(kw);
        if (!match) return false;
      }

      if (filterKey === 'warning') {
        return item.type === '预警';
      }
      if (filterKey === 'alarm') {
        return item.type === '告警';
      }
      if (filterKey === 'unhandled_warning') {
        return item.type === '预警' && item.status === '待处理';
      }
      if (filterKey === 'converted') {
        return item.status === '已转工单';
      }
      if (filterKey === 'pending') {
        return item.status === '待处理';
      }
      if (filterKey === 'high_risk') {
        return item.priority === '高' || item.riskScore >= CONFIG_THRESHOLDS.HIGH_RISK_SCORE_MIN;
      }
      return true;
    });
  }, [risks, filterKey, searchKeyword]);

  // Filter Chips 统计
  const filterChips: FilterChipItem[] = useMemo(() => {
    const totalCount = risks.length;
    const warningCount = risks.filter((r) => r.type === '预警').length;
    const alarmCount = risks.filter((r) => r.type === '告警').length;
    const pendingCount = risks.filter((r) => r.status === '待处理').length;
    const convertedCount = risks.filter((r) => r.status === '已转工单').length;

    return [
      { key: 'all', label: '全部风险', count: totalCount },
      { key: 'warning', label: '预警 (潜在预测)', count: warningCount, badgeColor: 'warning' },
      { key: 'alarm', label: '告警 (已发生)', count: alarmCount, badgeColor: 'danger' },
      { key: 'pending', label: '待转工单', count: pendingCount, badgeColor: 'primary' },
      { key: 'converted', label: '已转工单 (追溯)', count: convertedCount, badgeColor: 'success' },
    ];
  }, [risks]);

  // 文字总结 (模板 mock)
  const summarySentence = useMemo(() => {
    const northWarnings = risks.filter((r) => r.region === '苏北' && r.type === '预警' && r.priority === '高').length;
    return `3 条高风险预警主要集中在苏北区域，建议优先处理宿迁电站电池温差及盐城PCS过温隐患。`;
  }, [risks]);

  const toggleRow = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  return (
    <div className="bg-white rounded-lg border border-[#E8E8E8] shadow-none flex flex-col h-full">
      {/* 模块头部 */}
      <div className="p-3.5 border-b border-[#E8E8E8] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-amber-50 text-[#FA8C16] border border-amber-200">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[#1F1F1F]">风险管理</h2>
                <span className="text-[10px] text-[#FA8C16] font-medium px-1.5 py-0.2 bg-[#FFF7E6] border border-[#FFD591] rounded">
                  核心分析引擎
                </span>
              </div>
              <p className="text-[11px] text-[#8C8C8C]">预警(预测未发)与告警(越限发生)分类管理，支持双向工单追溯</p>
            </div>
          </div>

          {/* 搜索 */}
          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8C8C8C]" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索风险/类别/电站..."
              className="w-full pl-8 pr-2.5 py-1 text-xs rounded bg-[#F5F5F5] border border-[#E8E8E8] text-[#262626] placeholder:text-[#BFBFBF] focus:bg-white focus:outline-hidden focus:border-[#1890FF]"
            />
          </div>
        </div>

        {/* 顶部统计卡 + 区域 Top5 汇总行 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-1">
          {/* 左侧两张分类型卡片 */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-2.5">
            {/* 高风险预警数 (核心产出) */}
            <div 
              onClick={() => setFilterKey('unhandled_warning')}
              className="bg-[#FFFBE6]/80 border border-[#FFE58F] rounded p-2.5 cursor-pointer hover:bg-[#FFFBE6] transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#D46B08] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#FA8C16]" />
                  高风险预警 (预测)
                </span>
                <span className="text-[10px] text-[#FA8C16] bg-white px-1 py-0.2 rounded border border-[#FFD591]">
                  核心
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-[#873800]">{highWarningCount}</span>
                <span className="text-[10px] text-[#D46B08]">项待消缺</span>
              </div>
              <p className="text-[10px] text-[#FA8C16] mt-0.5 truncate">电池温差/IGBT热阻潜伏缺陷</p>
            </div>

            {/* 高风险告警数 (已发生) */}
            <div 
              onClick={() => setFilterKey('alarm')}
              className="bg-[#FFF1F0]/80 border border-[#FFA39E] rounded p-2.5 cursor-pointer hover:bg-[#FFF1F0] transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#CF1322] flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#F5222D]" />
                  高风险告警 (已发)
                </span>
                <span className="text-[10px] text-[#F5222D] bg-white px-1 py-0.2 rounded border border-[#FFA39E]">
                  实时
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-[#820014]">{highAlarmCount}</span>
                <span className="text-[10px] text-[#CF1322]">项越限中</span>
              </div>
              <p className="text-[10px] text-[#F5222D] mt-0.5 truncate">直流绝缘突降/消防压力</p>
            </div>
          </div>

          {/* 右侧：区域分布 Top 5 (横向条形图) */}
          <div className="lg:col-span-6 bg-[#FAFAFA] border border-[#E8E8E8] rounded p-2 flex flex-col justify-between">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold text-[#595959] flex items-center gap-1">
                <BarChart2 className="w-3 h-3 text-[#8C8C8C]" />
                区域风险分布 Top 5
              </span>
              <span className="text-[10px] text-[#8C8C8C]">苏北集中度最高</span>
            </div>
            <div className="h-16 w-full">
              <HorizontalBarChart data={regionalTop5} height={64} />
            </div>
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
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#FFF7E6] border border-[#FFD591] text-[11px] text-[#D46B08]">
          <Sparkles className="w-3.5 h-3.5 text-[#FA8C16] shrink-0" />
          <span className="leading-snug">{summarySentence}</span>
        </div>
      </div>

      {/* 风险表格区 */}
      <div className="overflow-x-auto flex-1 min-h-[360px] max-h-[520px] overflow-y-auto text-xs">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#FAFAFA] text-[#595959] font-medium sticky top-0 z-10 text-[11px] border-b border-[#E8E8E8]">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center">展开</th>
              <th className="py-2.5 px-3">风险编号 / 特征</th>
              <th className="py-2.5 px-2.5">类型</th>
              <th className="py-2.5 px-2.5">风险分</th>
              <th className="py-2.5 px-3">区域 / 电站</th>
              <th className="py-2.5 px-2.5">责任人</th>
              <th className="py-2.5 px-3">状态</th>
              <th className="py-2.5 px-2.5">发现时间</th>
              <th className="py-2.5 px-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0] text-[#262626]">
            {filteredRisks.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-[#8C8C8C]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShieldAlert className="w-8 h-8 text-[#D9D9D9]" />
                    <span>暂无符合条件的风险记录</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRisks.map((item) => {
                const isExpanded = expandedRowId === item.id;
                const isConverted = item.status === '已转工单';

                return (
                  <React.Fragment key={item.id}>
                    <tr 
                      onClick={() => toggleRow(item.id)}
                      className={`transition-colors cursor-pointer group hover:bg-[#FAFAFA] ${
                        isConverted ? 'bg-[#F6FFED]/40' : ''
                      }`}
                    >
                      {/* 展开图标 */}
                      <td className="py-2.5 px-3 text-center text-[#8C8C8C]">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-[#1890FF] inline" />
                        ) : (
                          <ChevronRight className="w-4 h-4 group-hover:text-[#262626] inline" />
                        )}
                      </td>

                      {/* 风险编号与特征 */}
                      <td className="py-2.5 px-3 max-w-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[11px] font-semibold text-[#1F1F1F]">
                            {item.id}
                          </span>
                          <span className="text-[10px] text-[#595959] bg-[#F5F5F5] px-1 py-0.2 rounded border border-[#E8E8E8]">
                            {item.category}
                          </span>
                          {item.confidence && (
                            <span className="text-[10px] text-[#2F54EB] bg-[#F0F5FF] px-1 py-0.2 rounded border border-[#ADC6FF]">
                              置信度 {item.confidence}%
                            </span>
                          )}
                        </div>
                        <div className="font-medium text-[#262626] line-clamp-1 mt-0.5" title={item.title}>
                          {item.title}
                        </div>
                      </td>

                      {/* 类型 */}
                      <td className="py-2.5 px-2.5 whitespace-nowrap">
                        <RiskTypeBadge type={item.type} />
                      </td>

                      {/* 风险分 */}
                      <td className="py-2.5 px-2.5">
                        <RiskScoreBadge score={item.riskScore} />
                      </td>

                      {/* 区域与电站 */}
                      <td className="py-2.5 px-3 max-w-[130px] truncate text-[#595959]">
                        <div className="truncate font-medium text-[#262626]" title={item.stationName}>
                          {item.stationName}
                        </div>
                        <div className="text-[10px] text-[#8C8C8C]">{item.region}区域</div>
                      </td>

                      {/* 责任人 */}
                      <td className="py-2.5 px-2.5 whitespace-nowrap">
                        <span className="text-[#595959]">{item.assignee}</span>
                      </td>

                      {/* 状态 (含转工单标记与双向跳转) */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <RiskStatusBadge
                          status={item.status}
                          linkedTicketId={item.linkedTicketId}
                          onJumpToTicket={onJumpToTicket}
                        />
                      </td>

                      {/* 发现时间 */}
                      <td className="py-2.5 px-2.5 text-[#8C8C8C] text-[11px] whitespace-nowrap">
                        {item.discoveredAt.split(' ')[1]}
                        <span className="text-[10px] text-[#BFBFBF] block">{item.discoveredAt.split(' ')[0]}</span>
                      </td>

                      {/* 操作 */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenRiskDetail(item)}
                            className="px-2 py-1 text-[11px] text-[#595959] hover:text-[#1890FF] hover:bg-[#F5F5F5] rounded transition-colors cursor-pointer"
                          >
                            分析详情
                          </button>

                          {/* 转工单按钮 */}
                          {item.status === '待处理' ? (
                            <button
                              type="button"
                              onClick={() => onConvertToTicket(item)}
                              className="px-2 py-1 text-[11px] font-medium bg-[#FA8C16] hover:bg-[#FFA940] text-white rounded transition-colors flex items-center gap-1 cursor-pointer"
                              title="将主动预测风险生成 pcare 工单派发"
                            >
                              <PlusCircle className="w-3 h-3" />
                              <span>转工单</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => item.linkedTicketId && onJumpToTicket(item.linkedTicketId)}
                              className="px-2 py-1 text-[11px] font-medium text-[#52C41A] bg-[#F6FFED] hover:bg-[#D9F7BE] rounded border border-[#B7EB8F] flex items-center gap-1 cursor-pointer"
                            >
                              <span>查看工单</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* 行内展开证据链与时序数据 */}
                    {isExpanded && (
                      <tr className="bg-[#FAFAFA] text-xs">
                        <td colSpan={9} className="p-3.5 pl-10 border-y border-[#E8E8E8]">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <span className="font-medium text-[#262626]">算法诊断现象详述</span>
                              <p className="text-[#595959] text-[11px] leading-relaxed">
                                {item.symptomDetail ?? '该电站时序遥测特征持续偏离健康基线。'}
                              </p>
                            </div>

                            {item.evidence && (
                              <div className="space-y-1 bg-white p-2.5 rounded border border-[#E8E8E8]">
                                <span className="font-medium text-[#262626] flex items-center justify-between">
                                  <span>量化证据链</span>
                                  <span className="text-[10px] text-[#FA8C16] font-mono">
                                    {item.evidence.trend}
                                  </span>
                                </span>
                                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                                  <div>
                                    <span className="text-[#8C8C8C]">特征指标: </span>
                                    <span className="font-medium text-[#262626]">{item.evidence.metric}</span>
                                  </div>
                                  <div>
                                    <span className="text-[#8C8C8C]">实测特征值: </span>
                                    <span className="font-semibold text-[#F5222D]">{item.evidence.value}</span>
                                  </div>
                                  <div>
                                    <span className="text-[#8C8C8C]">参考安全阈值: </span>
                                    <span className="font-medium text-[#595959]">{item.evidence.threshold}</span>
                                  </div>
                                  <div>
                                    <span className="text-[#8C8C8C]">判定方式: </span>
                                    <span className="font-medium text-[#595959]">模型拟合预测</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="space-y-2 flex flex-col justify-between bg-[#FFFBE6]/60 p-2.5 rounded border border-[#FFE58F]">
                              <div>
                                <span className="font-medium text-[#873800] text-[11px] flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5 text-[#FA8C16]" />
                                  风险生命周期与闭环
                                </span>
                                <p className="text-[11px] text-[#D46B08] mt-1">
                                  {isConverted 
                                    ? `已于 pcare 生成工单 (${item.linkedTicketId})，进入消缺跟踪闭环。`
                                    : '尚未生成工单，可直接点击一键转为 pcare 任务单。'
                                  }
                                </p>
                              </div>

                              <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#FFE58F]">
                                {item.status === '待处理' && (
                                  <button
                                    type="button"
                                    onClick={() => onConvertToTicket(item)}
                                    className="px-2.5 py-1 bg-[#FA8C16] hover:bg-[#FFA940] text-white rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                                  >
                                    <PlusCircle className="w-3 h-3" />
                                    <span>立即转为工单派发</span>
                                  </button>
                                )}
                              </div>
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

      {/* 底部说明 */}
      <div className="p-2.5 px-3.5 bg-[#FAFAFA] border-t border-[#E8E8E8] flex items-center justify-between text-[11px] text-[#8C8C8C]">
        <div>
          共 <span className="font-semibold text-[#262626]">{risks.length}</span> 条风险 (待处理 {unhandledRisks.length} 项，已转工单保留追溯)
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FA8C16]" />
            预警预测
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#52C41A]" />
            双向工单互通
          </span>
        </div>
      </div>
    </div>
  );
};
