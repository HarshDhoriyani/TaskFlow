import React from 'react';
import { COLUMNS, Task, TaskStatus } from '../types/task';
import { LayoutGrid } from 'lucide-react';

interface MobileColumnTabsProps {
  activeTab: TaskStatus | 'all';
  onSelectTab: (tab: TaskStatus | 'all') => void;
  tasks: Task[];
}

export const MobileColumnTabs: React.FC<MobileColumnTabsProps> = ({
  activeTab,
  onSelectTab,
  tasks,
}) => {
  const getCount = (status: TaskStatus) => tasks.filter((t) => t.status === status).length;

  return (
    <div className="lg:hidden flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl mb-4 overflow-x-auto">
      {/* Show All option */}
      <button
        onClick={() => onSelectTab('all')}
        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all shrink-0 ${
          activeTab === 'all'
            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span>All ({tasks.length})</span>
      </button>

      {COLUMNS.map((col) => {
        const count = getCount(col.id);
        const isActive = activeTab === col.id;

        return (
          <button
            key={col.id}
            onClick={() => onSelectTab(col.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all shrink-0 ${
              isActive
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{col.title}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isActive
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  : 'bg-slate-300/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
