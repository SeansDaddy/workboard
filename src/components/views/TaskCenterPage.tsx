import React from 'react';
import { 
  RoutineTaskItem, 
  CONFIG_THRESHOLDS 
} from '../../types';
import { TaskModule } from '../modules/TaskModule';
import { 
  CheckSquare, 
  ArrowLeft, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar
} from 'lucide-react';

interface TaskCenterPageProps {
  tasks: RoutineTaskItem[];
  onReturnToWorkbench: () => void;
  onOpenTaskProcess: (task: RoutineTaskItem) => void;
  onOpenTaskDetail: (task: RoutineTaskItem) => void;
  onCreateTicketFromTask?: (task: RoutineTaskItem) => void;
  initialFilter?: string;
}

export const TaskCenterPage: React.FC<TaskCenterPageProps> = ({
  tasks,
  onReturnToWorkbench,
  onOpenTaskProcess,
  onOpenTaskDetail,
  onCreateTicketFromTask,
  initialFilter = 'all'
}) => {
  const overdueCount = tasks.filter(t => t.status === '已超期').length;
  const inProgressCount = tasks.filter(t => t.status === '执行中').length;

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
            <div className="p-1 rounded bg-[#FFF1F0] text-[#F5222D] border border-[#FFA39E]">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-[#1F1F1F]">作业管理 · 周期性例行巡检与专项整改台账</h1>
                <span className="text-[10px] text-[#F5222D] bg-[#FFF1F0] px-1.5 py-0.2 rounded border border-[#FFA39E] font-medium">
                  SOP 标准作业
                </span>
              </div>
              <p className="text-[11px] text-[#8C8C8C]">
                涵盖日检、周检、月度及季度电气绝缘测试、消防系统联动试验与消缺整改任务，强化超期预警机制
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-[#595959]">
            <span className="w-2 h-2 rounded-full bg-[#1890FF]" />
            <span>执行中: <strong className="text-[#1F1F1F] font-semibold">{inProgressCount}</strong> 项</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#595959]">
            <span className="w-2 h-2 rounded-full bg-[#F5222D]" />
            <span>已超期督办: <strong className="text-[#F5222D] font-semibold">{overdueCount}</strong> 项</span>
          </div>
        </div>
      </div>

      {/* 完整作业管理模块 */}
      <div className="w-full">
        <TaskModule
          tasks={tasks}
          onOpenTaskProcess={onOpenTaskProcess}
          onOpenTaskDetail={onOpenTaskDetail}
          onCreateTicketFromTask={onCreateTicketFromTask}
          initialFilter={initialFilter}
        />
      </div>
    </div>
  );
};
