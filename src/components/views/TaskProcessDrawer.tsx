import React, { useState } from 'react';
import { RoutineTaskItem } from '../../types';
import { TaskStatusBadge } from '../common/Badges';
import { 
  X, 
  CheckSquare, 
  CheckCircle2, 
  AlertTriangle, 
  PlusCircle, 
  FileCheck2, 
  Wrench, 
  Camera, 
  Send,
  Building2,
  Calendar,
  Clock,
  ExternalLink
} from 'lucide-react';

interface TaskProcessDrawerProps {
  task: RoutineTaskItem | null;
  onClose: () => void;
  onUpdateTask: (task: RoutineTaskItem) => void;
  onCreateTicketFromTask?: (task: RoutineTaskItem) => void;
}

export const TaskProcessDrawer: React.FC<TaskProcessDrawerProps> = ({
  task,
  onClose,
  onUpdateTask,
  onCreateTicketFromTask
}) => {
  if (!task) return null;

  // Mock inspection checklist items
  const [checklist, setChecklist] = useState<Array<{ id: number; title: string; checked: boolean; isDefect?: boolean }>>([
    { id: 1, title: '电站进出通道密闭性及防鼠挡板安装核查', checked: true },
    { id: 2, title: '高低压成套开关柜二次回路接线紧固度检查', checked: task.itemsCompleted >= 2 },
    { id: 3, title: '直流侧汇流箱熔断器及防雷器指示窗口状态', checked: task.itemsCompleted >= 4 },
    { id: 4, title: '储能电池舱空调/液冷管路接头微渗漏及压力检测', checked: task.itemsCompleted >= 6, isDefect: task.defectFound ? task.defectFound > 0 : false },
    { id: 5, title: '七氟丙烷灭火装置储气瓶压力表针位核对', checked: task.itemsCompleted >= 8 },
    { id: 6, title: '站用变压器绝缘油位与温度计读数巡视', checked: task.progress === 100 },
  ]);

  const [notes, setNotes] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const toggleCheck = (id: number) => {
    const nextList = checklist.map((item) => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setChecklist(nextList);

    const completed = nextList.filter((i) => i.checked).length;
    const progress = Math.round((completed / nextList.length) * 100);
    const newStatus = progress === 100 ? '已完成' : (task.status === '已超期' ? '已超期' : '执行中');

    onUpdateTask({
      ...task,
      itemsCompleted: completed,
      progress,
      status: newStatus
    });
  };

  const handleCompleteAll = () => {
    const nextList = checklist.map((item) => ({ ...item, checked: true }));
    setChecklist(nextList);
    onUpdateTask({
      ...task,
      itemsCompleted: nextList.length,
      progress: 100,
      status: '已完成'
    });
    setSuccessToast('例行作业各项检查完毕，已完成整体验收并归档！');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none animate-in fade-in duration-200">
      {/* 遮罩背景 */}
      <div 
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px] transition-opacity" 
        onClick={onClose} 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col border-l border-[#D9D9D9] animate-in slide-in-from-right duration-300">
          
          {/* 抽屉头部 */}
          <div className="px-5 py-4 border-b border-[#E8E8E8] bg-[#FAFAFA] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-red-50 text-[#F5222D] border border-red-100">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#1F1F1F]">{task.id}</span>
                  <span className="text-xs text-[#1890FF] bg-[#E6F7FF] px-1.5 py-0.2 rounded border border-[#91D5FF]">
                    {task.taskType} ({task.period})
                  </span>
                  <TaskStatusBadge status={task.status} />
                </div>
                <h3 className="text-sm font-semibold text-[#262626] truncate max-w-md mt-0.5" title={task.name}>
                  {task.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-[#8C8C8C] hover:text-[#262626] hover:bg-[#E8E8E8] rounded-md transition-colors cursor-pointer"
                title="收起抽屉"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 成功操作提示 */}
          {successToast && (
            <div className="p-3 bg-[#F6FFED] border-b border-[#B7EB8F] text-xs text-[#52C41A] flex items-center justify-between animate-in fade-in duration-200 shrink-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#52C41A] shrink-0" />
                <span className="font-medium">{successToast}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessToast(null)}
                className="text-[#52C41A] hover:underline text-xs cursor-pointer"
              >
                关闭
              </button>
            </div>
          )}

          {/* 抽屉滚动内容主体 */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            
            {/* 顶栏作业信息 */}
            <div className="bg-[#FAFAFA] p-3.5 rounded-lg border border-[#E8E8E8] grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">电站站点</span>
                <span className="font-semibold text-[#1F1F1F] truncate block mt-0.5">{task.stationName}</span>
              </div>
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">责任人</span>
                <span className="font-semibold text-[#1890FF] block mt-0.5">{task.assignee}</span>
              </div>
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">计划截止时间</span>
                <span className="font-semibold text-[#262626] block mt-0.5">{task.deadline}</span>
              </div>
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">巡检进度</span>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <div className="w-16 bg-[#E8E8E8] rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${task.progress === 100 ? 'bg-[#52C41A]' : 'bg-[#1890FF]'}`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <span className="font-bold text-[#1F1F1F]">{task.progress}%</span>
                </div>
              </div>
            </div>

            {/* 超期预警提示 */}
            {task.status === '已超期' && (
              <div className="p-3 bg-[#FFF1F0] border border-[#FFA39E] rounded-lg flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#F5222D] shrink-0" />
                  <div>
                    <span className="font-semibold text-[#CF1322]">本项例行作业已发生超期 ({task.overdueHours || 14} 小时)</span>
                    <span className="text-[11px] text-[#8C8C8C] block">“该做没做”属于高危失职信号，需优先完成现场巡检与消缺。</span>
                  </div>
                </div>
                {onCreateTicketFromTask && (
                  <button
                    type="button"
                    onClick={() => {
                      onCreateTicketFromTask(task);
                    }}
                    className="px-2.5 py-1 bg-[#F5222D] hover:bg-[#FF4D4F] text-white rounded text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>转整改工单</span>
                  </button>
                )}
              </div>
            )}

            {/* 标准化巡检 SOP 执行清单 */}
            <div className="bg-white rounded-lg border border-[#E8E8E8] p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0F0F0]">
                <div className="flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-[#1890FF]" />
                  <span className="font-semibold text-xs text-[#1F1F1F]">
                    标准作业 SOP 检查项 ({checklist.filter(i => i.checked).length}/{checklist.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCompleteAll}
                  className="text-xs text-[#1890FF] hover:underline cursor-pointer"
                >
                  一键全部打勾
                </button>
              </div>

              <div className="space-y-2">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className={`p-2.5 rounded-md border flex items-start gap-2.5 cursor-pointer transition-colors ${
                      item.checked 
                        ? 'bg-[#F6FFED]/40 border-[#B7EB8F]' 
                        : 'bg-[#FAFAFA] border-[#E8E8E8] hover:bg-white hover:border-[#1890FF]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => {}}
                      className="mt-0.5 h-3.5 w-3.5 text-[#1890FF] rounded border-[#D9D9D9] focus:ring-[#1890FF] cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className={`text-xs ${item.checked ? 'text-[#262626]' : 'text-[#595959]'}`}>
                        {item.id}. {item.title}
                      </span>
                      {item.isDefect && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-[#FA8C16]">
                          <AlertTriangle className="w-3 h-3" />
                          <span>发现管路微渗漏缺陷，已标定需二次复紧</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 巡检结论与备注填报 */}
            <div className="bg-white rounded-lg border border-[#E8E8E8] p-4 space-y-3">
              <div className="flex items-center gap-1.5 pb-2 border-b border-[#F0F0F0]">
                <Wrench className="w-4 h-4 text-[#52C41A]" />
                <span className="font-semibold text-xs text-[#1F1F1F]">巡检结论记录与照片存证</span>
              </div>

              <div>
                <label className="text-[11px] text-[#595959] block mb-1 font-medium">
                  现场巡视记录 / 缺陷复核情况:
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="填写现场设备工况、仪表读数记录或缺陷消除说明..."
                  className="w-full h-20 p-2.5 text-xs border border-[#D9D9D9] rounded-md focus:border-[#1890FF] focus:outline-hidden focus:ring-1 focus:ring-[#1890FF] resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => alert('已调用移动端现场打卡相机（演示模拟）')}
                  className="px-3 py-1.5 border border-[#D9D9D9] bg-[#FAFAFA] hover:bg-white text-[#595959] rounded text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-[#1890FF]" />
                  <span>上传现场核验照片 (0/4)</span>
                </button>

                <button
                  type="button"
                  onClick={handleCompleteAll}
                  className="px-4 py-1.5 bg-[#52C41A] hover:bg-[#73D13D] text-white rounded text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>完成作业验收并归档</span>
                </button>
              </div>
            </div>

          </div>

          {/* 抽屉底部操作栏 */}
          <div className="px-5 py-3 border-t border-[#E8E8E8] bg-[#FAFAFA] flex items-center justify-between shrink-0">
            <span className="text-[11px] text-[#8C8C8C]">
              例行巡检与专项作业 · 处理完成可一键收回抽屉
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 border border-[#D9D9D9] hover:bg-white text-[#595959] rounded text-xs font-medium cursor-pointer transition-colors"
              >
                收回抽屉
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
