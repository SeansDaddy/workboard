import React, { useState, useMemo } from 'react';
import { 
  RoutineTaskItem, 
  CONFIG_THRESHOLDS 
} from '../../types';
import { TaskStatusBadge } from '../common/Badges';
import { FilterChips, FilterChipItem } from '../common/FilterChips';
import { 
  CheckSquare, 
  AlertTriangle, 
  ChevronDown, 
  ChevronRight, 
  ArrowUpRight, 
  Calendar, 
  Sparkles, 
  Search, 
  Clock, 
  CheckCircle2, 
  PlusCircle,
  FileCheck2,
  Wrench
} from 'lucide-react';

interface TaskModuleProps {
  tasks: RoutineTaskItem[];
  onOpenTaskProcess: (task: RoutineTaskItem) => void;
  onOpenTaskDetail: (task: RoutineTaskItem) => void;
  onCreateTicketFromTask?: (task: RoutineTaskItem) => void;
  initialFilter?: string;
}

export const TaskModule: React.FC<TaskModuleProps> = ({
  tasks,
  onOpenTaskProcess,
  onOpenTaskDetail,
  onCreateTicketFromTask,
  initialFilter = 'all'
}) => {
  const [filterKey, setFilterKey] = useState<string>(initialFilter);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // 排序规则: 已超期首要置顶 (红色核心信号) -> 执行中 -> 待执行 -> 已完成
  const sortedTasks = useMemo(() => {
    const statusWeight: Record<string, number> = {
      '已超期': 4,
      '执行中': 3,
      '待执行': 2,
      '已完成': 1
    };

    return [...tasks].sort((a, b) => {
      const wa = statusWeight[a.status] ?? 0;
      const wb = statusWeight[b.status] ?? 0;
      if (wb !== wa) return wb - wa;
      return a.deadline.localeCompare(b.deadline);
    });
  }, [tasks]);

  // 筛选过滤
  const filteredTasks = useMemo(() => {
    return sortedTasks.filter((item) => {
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const match = 
          item.id.toLowerCase().includes(kw) ||
          item.name.toLowerCase().includes(kw) ||
          item.stationName.toLowerCase().includes(kw) ||
          item.assignee.toLowerCase().includes(kw);
        if (!match) return false;
      }

      if (filterKey === 'overdue') {
        return item.status === '已超期';
      }
      if (filterKey === 'overdue_or_today') {
        return item.status === '已超期' || item.deadline.startsWith('2026-08-25');
      }
      if (filterKey === 'inspection') {
        return item.taskType === '巡检';
      }
      if (filterKey === 'rectification') {
        return item.taskType === '整改';
      }
      if (filterKey === 'in_progress') {
        return item.status === '执行中';
      }
      if (filterKey === 'mine') {
        return item.assignee === CONFIG_THRESHOLDS.CURRENT_USER_NAME;
      }
      return true;
    });
  }, [sortedTasks, filterKey, searchKeyword]);

  // Stat chips 数据
  const filterChips: FilterChipItem[] = useMemo(() => {
    const total = tasks.length;
    const overdueCount = tasks.filter((t) => t.status === '已超期').length;
    const inspectionCount = tasks.filter((t) => t.taskType === '巡检').length;
    const rectCount = tasks.filter((t) => t.taskType === '整改').length;
    const inProgressCount = tasks.filter((t) => t.status === '执行中').length;

    return [
      { key: 'all', label: '全部作业', count: total },
      { key: 'overdue', label: '已超期 (首要信号)', count: overdueCount, badgeColor: 'danger' },
      { key: 'in_progress', label: '执行中', count: inProgressCount, badgeColor: 'primary' },
      { key: 'inspection', label: '巡检任务', count: inspectionCount },
      { key: 'rectification', label: '整改任务', count: rectCount, badgeColor: 'warning' },
    ];
  }, [tasks]);

  // 文字总结
  const summarySentence = useMemo(() => {
    const overdueCount = tasks.filter((t) => t.status === '已超期').length;
    if (overdueCount > 0) {
      return `当前存在 ${overdueCount} 项例行作业已超期（宿迁高压巡检与盐城液冷整改），运维场景中"该做没做"是首要隐患，建议立即督办！`;
    }
    return `当前例行作业整体按计划推进，今日需执行 3 项巡检任务。`;
  }, [tasks]);

  const toggleRow = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  return (
    <div className="bg-white rounded-lg border border-[#E8E8E8] shadow-none flex flex-col">
      {/* 模块头部 */}
      <div className="p-3.5 border-b border-[#E8E8E8] space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-rose-50 text-[#F5222D] border border-rose-100">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[#1F1F1F]">作业跟踪 · 例行作业</h2>
                <span className="text-[10px] text-[#8C8C8C] font-normal px-1.5 py-0.2 bg-[#F5F5F5] rounded border border-[#E8E8E8]">
                  巡检 / 整改闭环
                </span>
              </div>
              <p className="text-[11px] text-[#8C8C8C]">周期性运维计划执行情况，“该做没做 (超期)”为首要警示信号</p>
            </div>
          </div>

          {/* 搜索 */}
          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8C8C8C]" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索作业名称/电站..."
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
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#FFF1F0] border border-[#FFA39E] text-[11px] text-[#CF1322]">
          <Sparkles className="w-3.5 h-3.5 text-[#F5222D] shrink-0" />
          <span className="leading-snug">{summarySentence}</span>
        </div>
      </div>

      {/* 作业表格 */}
      <div className="overflow-x-auto text-xs">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#FAFAFA] text-[#595959] font-medium sticky top-0 z-10 text-[11px] border-b border-[#E8E8E8]">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center">展开</th>
              <th className="py-2.5 px-3">作业任务名称</th>
              <th className="py-2.5 px-2.5">作业类型</th>
              <th className="py-2.5 px-2.5 text-center">周期</th>
              <th className="py-2.5 px-3">关联电站</th>
              <th className="py-2.5 px-2.5">责任人</th>
              <th className="py-2.5 px-3">截止时间</th>
              <th className="py-2.5 px-3">进度</th>
              <th className="py-2.5 px-2.5 text-center">状态</th>
              <th className="py-2.5 px-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0] text-[#262626]">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-[#8C8C8C]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CheckSquare className="w-8 h-8 text-[#D9D9D9]" />
                    <span>暂无符合条件的例行作业</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTasks.map((item) => {
                const isOverdue = item.status === '已超期';
                const isExpanded = expandedRowId === item.id;

                // 超期红色高亮
                let rowBgClass = 'hover:bg-[#FAFAFA]';
                if (isOverdue) {
                  rowBgClass = 'bg-[#FFF1F0]/40 hover:bg-[#FFF1F0] border-l-2 border-l-[#F5222D]';
                }

                return (
                  <React.Fragment key={item.id}>
                    <tr 
                      onClick={() => toggleRow(item.id)}
                      className={`transition-colors cursor-pointer group ${rowBgClass}`}
                    >
                      {/* 展开 */}
                      <td className="py-2.5 px-3 text-center text-[#8C8C8C]">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-[#1890FF] inline" />
                        ) : (
                          <ChevronRight className="w-4 h-4 group-hover:text-[#262626] inline" />
                        )}
                      </td>

                      {/* 任务名称 */}
                      <td className="py-2.5 px-3 max-w-sm">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[11px] font-semibold text-[#1F1F1F]">
                            {item.id}
                          </span>
                          {isOverdue && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#F5222D] bg-[#FFF1F0] px-1 py-0.2 rounded border border-[#FFA39E]">
                              <AlertTriangle className="w-2.5 h-2.5 fill-current" />
                              超期预警
                            </span>
                          )}
                          {item.defectFound && item.defectFound > 0 ? (
                            <span className="text-[10px] text-[#FA8C16] bg-[#FFF7E6] px-1 py-0.2 rounded border border-[#FFD591]">
                              发现缺陷 {item.defectFound}
                            </span>
                          ) : null}
                        </div>
                        <div className="font-medium text-[#262626] line-clamp-1 mt-0.5" title={item.name}>
                          {item.name}
                        </div>
                      </td>

                      {/* 类型 */}
                      <td className="py-2.5 px-2.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[11px] font-medium border ${
                          item.taskType === '巡检'
                            ? 'bg-[#E6F7FF] text-[#1890FF] border-[#91D5FF]'
                            : 'bg-[#FFF7E6] text-[#FA8C16] border-[#FFD591]'
                        }`}>
                          {item.taskType === '巡检' ? <FileCheck2 className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
                          {item.taskType}
                        </span>
                      </td>

                      {/* 周期 */}
                      <td className="py-2.5 px-2.5 text-center whitespace-nowrap">
                        <span className="text-[#595959] bg-[#F5F5F5] px-1.5 py-0.2 rounded text-[11px] border border-[#E8E8E8]">
                          {item.period}度
                        </span>
                      </td>

                      {/* 电站 */}
                      <td className="py-2.5 px-3 max-w-[140px] truncate text-[#595959]">
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

                      {/* 截止时间 */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`tabular-nums text-xs ${isOverdue ? 'text-[#F5222D] font-semibold' : 'text-[#595959]'}`}>
                          {item.deadline}
                        </span>
                      </td>

                      {/* 进度 */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="w-24">
                          <div className="flex items-center justify-between text-[10px] text-[#8C8C8C] mb-0.5">
                            <span>{item.itemsCompleted}/{item.itemsTotal}项</span>
                            <span className="font-medium">{item.progress}%</span>
                          </div>
                          <div className="w-full bg-[#F0F0F0] h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                item.progress === 100 
                                  ? 'bg-[#52C41A]' 
                                  : isOverdue 
                                    ? 'bg-[#F5222D]' 
                                    : 'bg-[#1890FF]'
                              }`} 
                              style={{ width: `${item.progress}%` }} 
                            />
                          </div>
                        </div>
                      </td>

                      {/* 状态 */}
                      <td className="py-2.5 px-2.5 text-center whitespace-nowrap">
                        <TaskStatusBadge status={item.status} overdueHours={item.overdueHours} />
                      </td>

                      {/* 操作 */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenTaskDetail(item)}
                            className="px-2 py-1 text-[11px] text-[#595959] hover:text-[#1890FF] hover:bg-[#F5F5F5] rounded transition-colors cursor-pointer"
                          >
                            详情
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenTaskProcess(item)}
                            className="px-2.5 py-1 text-[11px] font-medium bg-[#1890FF] text-white hover:bg-[#40A9FF] rounded transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>去执行</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* 行内展开详情 */}
                    {isExpanded && (
                      <tr className="bg-[#FAFAFA] text-xs">
                        <td colSpan={10} className="p-3.5 pl-10 border-y border-[#E8E8E8]">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <span className="font-medium text-[#262626]">作业内容与要求</span>
                              <p className="text-[#595959] text-[11px] leading-relaxed">
                                {item.description ?? '按照标准例行作业指导书(SOP)开展全面检查。'}
                              </p>
                            </div>

                            <div className="space-y-1 bg-white p-2.5 rounded border border-[#E8E8E8]">
                              <span className="font-medium text-[#262626]">检查项目执行明细</span>
                              <p className="text-[11px] text-[#595959]">
                                计划检查项: <span className="font-semibold text-[#1F1F1F]">{item.itemsTotal}</span> 项 | 
                                已核验: <span className="font-semibold text-[#52C41A]">{item.itemsCompleted}</span> 项
                              </p>
                              {item.defectFound && item.defectFound > 0 ? (
                                <div className="mt-1 text-[11px] text-[#D46B08] bg-[#FFF7E6] p-1.5 rounded border border-[#FFD591]">
                                  ⚠️ 发现缺陷 {item.defectFound} 处，可一键转为工单派发整改。
                                </div>
                              ) : (
                                <p className="text-[10px] text-[#52C41A] mt-1">目前暂无未转工单缺陷。</p>
                              )}
                            </div>

                            <div className="space-y-1.5 flex flex-col justify-between bg-[#FFF1F0]/50 p-2.5 rounded border border-[#FFA39E]">
                              <div>
                                <span className="font-medium text-[#CF1322] text-[11px]">
                                  {isOverdue ? '超期督办处理' : '消缺协同'}
                                </span>
                                <p className="text-[11px] text-[#A8071A] mt-0.5">
                                  {isOverdue 
                                    ? `该任务已超过要求时限 ${item.overdueHours} 小时，请立即联系统辖班组。`
                                    : '巡检发现的隐患可快速生成 pcare 维修工单。'
                                  }
                                </p>
                              </div>

                              <div className="flex items-center justify-end gap-2 pt-1">
                                {onCreateTicketFromTask && (
                                  <button
                                    type="button"
                                    onClick={() => onCreateTicketFromTask(item)}
                                    className="px-2.5 py-1 bg-[#262626] hover:bg-[#434343] text-white rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <PlusCircle className="w-3 h-3 text-[#FFA940]" />
                                    <span>从作业生成工单</span>
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

      {/* 底部信息 */}
      <div className="p-2.5 px-3.5 bg-[#FAFAFA] border-t border-[#E8E8E8] flex items-center justify-between text-[11px] text-[#8C8C8C]">
        <div>
          当前共 <span className="font-semibold text-[#262626]">{tasks.length}</span> 项例行作业 (超期未做 {tasks.filter(t => t.status === '已超期').length} 项)
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5222D]" />
            超期红色高亮
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1890FF]" />
            巡检/整改标准化闭环
          </span>
        </div>
      </div>
    </div>
  );
};
