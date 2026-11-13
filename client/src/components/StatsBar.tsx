import React from 'react';
import { Task, Assignee } from '../types/task';
import { isTaskOverdue } from '../utils/dateUtils';
import { CheckCircle2, Clock, AlertTriangle, Layers } from 'lucide-react';

interface StatsBarProps {
  tasks: Task[];
  assignees: Assignee[];
  onlyOverdue: boolean;
  onToggleOverdue: () => void;
  statusFilter: string;
  onSelectStatus: (status: 'all' | 'todo' | 'in_progress' | 'done') => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  tasks,
  onlyOverdue,
  onToggleOverdue,
  statusFilter,
  onSelectStatus,
}) => {
  const total = tasks.length;
  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const overdueCount = tasks.filter((t) => isTaskOverdue(t.dueDate, t.status)).length;
  const completionPercentage = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
      {/* Total Tasks Card */}
      <button
        onClick={() => onSelectStatus('all')}
        className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
          statusFilter === 'all' && !onlyOverdue
            ? 'bg-white dark:bg-slate-900 border-indigo-400 dark:border-indigo-500 shadow-sm ring-2 ring-indigo-500/20'
            : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
          <Layers className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Total Tasks</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{total}</p>
        </div>
      </button>

      {/* To Do Card */}
      <button
        onClick={() => onSelectStatus(statusFilter === 'todo' ? 'all' : 'todo')}
        className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
          statusFilter === 'todo' && !onlyOverdue
            ? 'bg-white dark:bg-slate-900 border-amber-400 dark:border-amber-500 shadow-sm ring-2 ring-amber-500/20'
            : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">To Do</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{todoCount}</p>
        </div>
      </button>

      {/* In Progress Card */}
      <button
        onClick={() => onSelectStatus(statusFilter === 'in_progress' ? 'all' : 'in_progress')}
        className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
          statusFilter === 'in_progress' && !onlyOverdue
            ? 'bg-white dark:bg-slate-900 border-sky-400 dark:border-sky-500 shadow-sm ring-2 ring-sky-500/20'
            : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
          <div className="w-4 h-4 rounded-full border-2 border-sky-600 dark:border-sky-400 border-t-transparent animate-spin" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">In Progress</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{inProgressCount}</p>
        </div>
      </button>

      {/* Done Card */}
      <button
        onClick={() => onSelectStatus(statusFilter === 'done' ? 'all' : 'done')}
        className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
          statusFilter === 'done' && !onlyOverdue
            ? 'bg-white dark:bg-slate-900 border-emerald-400 dark:border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
            : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Done ({completionPercentage}%)</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{doneCount}</p>
        </div>
      </button>

      {/* Overdue Alert Card - Clickable filter! */}
      <button
        onClick={onToggleOverdue}
        className={`col-span-2 sm:col-span-1 flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
          onlyOverdue
            ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-400 dark:border-rose-500 shadow-sm ring-2 ring-rose-500/20'
            : overdueCount > 0
            ? 'bg-white/80 dark:bg-slate-900/80 border-rose-200 dark:border-rose-900/50 hover:border-rose-300'
            : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 opacity-60'
        }`}
        title="Click to toggle filter for overdue tasks"
      >
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            overdueCount > 0
              ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }`}
        >
          <AlertTriangle className={`w-5 h-5 ${overdueCount > 0 ? 'animate-pulse' : ''}`} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 truncate">Overdue</p>
            {onlyOverdue && (
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                Filtered
              </span>
            )}
          </div>
          <p
            className={`text-lg font-bold leading-tight ${
              overdueCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
            }`}
          >
            {overdueCount}
          </p>
        </div>
      </button>
    </div>
  );
};
