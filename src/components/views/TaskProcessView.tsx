import React, { useState } from 'react';
import { RoutineTaskItem, CONFIG_THRESHOLDS } from '../../types';
import { TaskStatusBadge } from '../common/Badges';
import { 
  ArrowLeft, 
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
  Clock
} from 'lucide-react';

interface TaskProcessViewProps {
  task: RoutineTaskItem;
  onBack: () => void;
  onUpdateTask: (task: RoutineTaskItem) => void;
  onCreateTicketFromTask?: (task: RoutineTaskItem) => void;
}

export const TaskProcessView: React.FC<TaskProcessViewProps> = ({
  task,
  onBack,
  onUpdateTask,
  onCreateTicketFromTask
}) => {
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
    <div className="space-y-4 max-w-5xl mx-auto pb-12">
      {/* 顶部返回 */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-[#D9D9D9] text-[#595959] hover:text-[#1890FF] hover:border-[#1890FF] text-xs font-medium cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#8C8C8C]" />
          <span>返回工作台</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-[#FAFAFA] border border-[#D9D9D9] text-[#262626] text-xs font-medium flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-[#1890FF]" />
            作业管理 · 例行作业执行与消缺打卡
          </span>
        </div>
      </div>

      {successToast && (
        <div className="p-3 bg-[#F6FFED] border border-[#B7EB8F] rounded text-xs text-[#52C41A] flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#52C41A] shrink-0" />
            <span className="font-medium">{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-[#52C41A] hover:underline text-xs cursor-pointer"
          >
            知道了
          </button>
        </div>
      )}

      {/* 主卡 */}
      <div className="bg-white rounded border border-[#E8E8E8] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#FAFAFA] border-b border-[#E8E8E8] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-medium text-[#1F1F1F] text-sm bg-white px-2 py-0.5 rounded border border-[#D9D9D9]">
                {task.id}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#E6F7FF] text-[#1890FF] border border-[#91D5FF]">
                {task.taskType}作业 ({task.period}度)
              </span>
              <TaskStatusBadge status={task.status} overdueHours={task.overdueHours} />
            </div>
            <h1 className="text-base font-semibold text-[#1F1F1F] leading-tight">
              {task.name}
            </h1>
          </div>

          <div className="flex items-center gap-3 bg-white p-2.5 rounded border border-[#E8E8E8] shrink-0">
            <Calendar className="w-4 h-4 text-[#8C8C8C]" />
            <div className="text-right">
              <div className="text-[11px] text-[#8C8C8C]">截止时限</div>
              <span className={`text-xs font-medium ${task.status === '已超期' ? 'text-[#F5222D]' : 'text-[#1F1F1F]'}`}>
                {task.deadline}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 左侧两列 */}
          <div className="md:col-span-2 space-y-4">
            {/* 基础台账 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-[#FAFAFA] rounded border border-[#E8E8E8] text-xs">
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">关联电站</span>
                <span className="font-medium text-[#1F1F1F]">{task.stationName}</span>
              </div>
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">所属区域</span>
                <span className="text-[#595959]">{task.region}区域</span>
              </div>
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">执行责任人</span>
                <span className="font-medium text-[#1890FF]">{task.assignee}</span>
              </div>
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">当前进度</span>
                <span className="font-medium text-[#1F1F1F]">{task.progress}%</span>
              </div>
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">检查项目进度</span>
                <span className="text-[#595959] font-medium">{task.itemsCompleted} / {task.itemsTotal} 项</span>
              </div>
              <div>
                <span className="text-[#8C8C8C] block text-[11px]">发现异常缺陷</span>
                <span className={`font-medium ${task.defectFound ? 'text-[#FA8C16]' : 'text-[#595959]'}`}>
                  {task.defectFound ?? 0} 处
                </span>
              </div>
            </div>

            {/* Checklist items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-[#1F1F1F] flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-[#1890FF]" />
                  现场标准化巡检检查清单 (SOP Checklist)
                </h3>
                <button
                  type="button"
                  onClick={handleCompleteAll}
                  className="text-[11px] text-[#1890FF] hover:underline font-medium cursor-pointer"
                >
                  一键全部核对通过
                </button>
              </div>

              <div className="space-y-2 bg-[#FAFAFA] p-3 rounded border border-[#E8E8E8]">
                {checklist.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-2.5 rounded border transition-colors cursor-pointer ${
                      item.checked 
                        ? 'bg-[#F6FFED]/60 border-[#B7EB8F] text-[#262626]' 
                        : 'bg-white border-[#E8E8E8] text-[#595959] hover:bg-[#F5F5F5]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleCheck(item.id)}
                      className="mt-0.5 w-4 h-4 rounded text-[#1890FF] border-[#D9D9D9] focus:ring-[#1890FF] cursor-pointer"
                    />
                    <div className="flex-1 text-xs">
                      <span className={item.checked ? 'line-through text-[#8C8C8C]' : 'font-medium'}>
                        {item.title}
                      </span>
                      {item.isDefect && (
                        <div className="mt-1 text-[10px] text-[#D46B08] bg-[#FFF7E6] px-1.5 py-0.5 rounded border border-[#FFD591] inline-block font-medium">
                          ⚠️ 发现轻微渗漏或接触异常 (建议转工单)
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 缺陷转工单快捷通知 */}
            <div className="p-3.5 rounded bg-[#FFF7E6]/70 border border-[#FFD591] flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-medium text-[#D46B08] flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#FA8C16]" />
                  巡检发现隐患一键转工单
                </span>
                <p className="text-[11px] text-[#D46B08]">
                  如现场发现无法即时消缺的重大隐患，可直接联动 pcare 生成维修工单。
                </p>
              </div>
              {onCreateTicketFromTask && (
                <button
                  type="button"
                  onClick={() => onCreateTicketFromTask(task)}
                  className="px-3 py-1.5 bg-[#FA8C16] hover:bg-[#FFA940] text-white rounded text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>生成整改工单</span>
                </button>
              )}
            </div>
          </div>

          {/* 右侧打卡与备注 */}
          <div className="space-y-4 bg-[#FAFAFA] p-4 rounded border border-[#E8E8E8] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="border-b border-[#E8E8E8] pb-2">
                <h3 className="text-xs font-medium text-[#1F1F1F] flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#1890FF]" />
                  现场执行打卡与消缺记录
                </h3>
                <p className="text-[11px] text-[#8C8C8C]">录入实测数据与现场图片凭证</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#595959] block">
                  现场巡检记录 / 消缺反馈说明
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="录入现场测量数值（如绝缘阻抗、气瓶压力、端子温度）..."
                  rows={4}
                  className="w-full p-2.5 text-xs rounded bg-white border border-[#D9D9D9] text-[#262626] focus:outline-hidden focus:border-[#1890FF] focus:ring-1 focus:ring-[#1890FF] resize-none placeholder:text-[#BFBFBF]"
                />
              </div>

              <div className="p-3 bg-white rounded border border-[#E8E8E8] text-center text-xs text-[#8C8C8C]">
                <Camera className="w-5 h-5 mx-auto mb-1 text-[#8C8C8C]" />
                <span>现场拍照水印凭证已同步上传 (2张)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E8E8] space-y-2">
              <button
                type="button"
                onClick={handleCompleteAll}
                className="w-full py-2.5 px-3 bg-[#1890FF] hover:bg-[#40A9FF] text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>提交本期例行作业并验收</span>
              </button>

              <button
                type="button"
                onClick={onBack}
                className="w-full py-1.5 text-center text-xs text-[#8C8C8C] hover:text-[#1890FF] cursor-pointer transition-colors"
              >
                ← 返回工作台
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
