import React, { useState } from 'react';
import { Task, TaskStatus } from '../types/task';
import {
  formatFriendlyDate,
  getDueDateStatus,
  isTaskOverdue,
  getInitials,
  getAvatarColor,
} from '../utils/dateUtils';
import {
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  searchQuery: string;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, newStatus: TaskStatus) => void;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  searchQuery,
  onEdit,
  onDelete,
  onMove,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const overdue = isTaskOverdue(task.dueDate, task.status);
  const dueStatus = getDueDateStatus(task.dueDate, task.status);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.setData('application/json', JSON.stringify(task));
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('task-card-dragging');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('task-card-dragging');
  };

  const getMoveTargets = (): { label: string; status: TaskStatus }[] => {
    switch (task.status) {
      case 'todo':
        return [
          { label: 'In progress', status: 'in_progress' },
          { label: 'Done', status: 'done' },
        ];
      case 'in_progress':
        return [
          { label: 'To do', status: 'todo' },
          { label: 'Done', status: 'done' },
        ];
      case 'done':
        return [
          { label: 'To do', status: 'todo' },
          { label: 'In progress', status: 'in_progress' },
        ];
    }
  };

  // Highlight search text in task title
  const renderHighlightedTitle = () => {
    if (!searchQuery.trim()) return task.title;
    const regex = new RegExp(`(${searchQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi');
    const parts = task.title.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-amber-200 dark:bg-amber-800 text-inherit px-0.5 rounded font-bold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const initials = getInitials(task.assignee);
  const avatarBg = getAvatarColor(task.assignee);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMenu(false);
      }}
      className={`group relative bg-white dark:bg-slate-900 rounded-xl p-4 border transition-all duration-200 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing select-none ${
        overdue
          ? 'border-l-4 border-l-rose-500 border-t-rose-200 border-r-rose-200 border-b-rose-200 dark:border-l-rose-500 dark:border-t-rose-900/60 dark:border-r-rose-900/60 dark:border-b-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
          : task.status === 'done'
          ? 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/60'
          : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60'
      }`}
    >
      {/* Overdue Banner if overdue */}
      {overdue && (
        <div className="flex items-center gap-1.5 mb-2.5 px-2 py-1 rounded-lg bg-rose-100/80 dark:bg-rose-950/60 border border-rose-300/80 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 animate-bounce" />
          <span>{dueStatus.label}</span>
        </div>
      )}

      {/* Header: Title & Action Menu */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h2
          className={`font-semibold text-sm leading-snug break-words ${
            task.status === 'done'
              ? 'text-slate-600 dark:text-slate-400 line-through'
              : 'text-slate-900 dark:text-slate-100'
          }`}
        >
          {renderHighlightedTitle()}
        </h2>

        {/* Action Menu (Three dots / buttons) */}
        <div className="relative shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            aria-label="Task options"
            className={`p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-opacity ${
              isHovered || showMenu ? 'opacity-100' : 'opacity-80 sm:opacity-0'
            }`}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs"
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit(task);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-left font-medium"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Edit Task</span>
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

              <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Move to
              </div>
              {getMoveTargets().map((target) => (
                <button
                  key={target.status}
                  onClick={() => {
                    setShowMenu(false);
                    onMove(task.id, target.status);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-left"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{target.label}</span>
                </button>
              ))}

              <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete(task.id);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer: Due date + Assignee */}
      <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
        {/* Due Date Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] border ${dueStatus.colorClass}`}
          title={`Due: ${formatFriendlyDate(task.dueDate)}`}
        >
          {task.status === 'done' ? (
            <CheckCircle2 className="w-3 h-3 shrink-0" />
          ) : overdue ? (
            <AlertTriangle className="w-3 h-3 shrink-0" />
          ) : (
            <Calendar className="w-3 h-3 shrink-0" />
          )}
          <span>{formatFriendlyDate(task.dueDate)}</span>
        </div>

        {/* Assignee Avatar */}
        {task.assignee ? (
          <div
            className="flex items-center gap-1.5"
            title={`Assigned to: ${task.assignee}`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm ${avatarBg}`}
            >
              {initials}
            </div>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
              {task.assignee}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">Unassigned</span>
        )}
      </div>

      {/* Mobile/Accessibility Quick Move Bar */}
      <div className="mt-3 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800/60 flex items-center justify-between gap-1 sm:hidden group-hover:flex">
        <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" /> Move:
        </span>
        <div className="flex items-center gap-1">
          {getMoveTargets().map((target) => (
            <button
              key={target.status}
              onClick={(e) => {
                e.stopPropagation();
                onMove(task.id, target.status);
              }}
              className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              → {target.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
