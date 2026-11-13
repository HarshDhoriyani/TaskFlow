import React, { useState } from 'react';
import { ColumnDefinition, Task, Assignee, TaskStatus } from '../types/task';
import { TaskCard } from './TaskCard';
import { Plus, Inbox, Clock, CheckCircle2, Circle } from 'lucide-react';

interface ColumnProps {
  column: ColumnDefinition;
  tasks: Task[];
  assignees: Assignee[];
  searchQuery: string;
  onAddTaskToColumn: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onMoveTask: (id: string, newStatus: TaskStatus) => void;
}

export const Column: React.FC<ColumnProps> = ({
  column,
  tasks,
  assignees,
  searchQuery,
  onAddTaskToColumn,
  onEditTask,
  onDeleteTask,
  onMoveTask,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const assigneeMap = React.useMemo(() => {
    const map = new Map<string, Assignee>();
    assignees.forEach((a) => map.set(a.id, a));
    return map;
  }, [assignees]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only turn off if leaving column container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onMoveTask(taskId, column.id);
    }
  };

  const getColumnIcon = () => {
    switch (column.id) {
      case 'todo':
        return <Circle className="w-4 h-4 text-amber-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-sky-500 animate-pulse" />;
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col bg-slate-100/70 dark:bg-slate-900/40 rounded-2xl border transition-all duration-200 min-h-[480px] ${
        isDragOver
          ? 'column-drag-over border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-500/20'
          : 'border-slate-200/80 dark:border-slate-800'
      }`}
    >
      {/* Column Header */}
      <div className={`p-3.5 border-b border-slate-200 dark:border-slate-800 rounded-t-2xl ${column.headerBg}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {getColumnIcon()}
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
              {column.title}
            </h2>
            <span
              className={`px-2 py-0.5 text-xs font-bold rounded-full border ${column.badgeColor}`}
            >
              {tasks.length}
            </span>
          </div>

          <button
            onClick={() => onAddTaskToColumn(column.id)}
            aria-label={`Add task to ${column.title}`}
            title={`Add task to ${column.title}`}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          {column.description}
        </p>
      </div>

      {/* Task Cards Container */}
      <div className="flex-1 p-3 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-250px)]">
        {tasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl my-2">
            <Inbox className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              No tasks in {column.title}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Drag tasks here or click + to add one
            </p>
            <button
              onClick={() => onAddTaskToColumn(column.id)}
              className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              assignee={assigneeMap.get(task.assigneeId)}
              searchQuery={searchQuery}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onMove={onMoveTask}
            />
          ))
        )}
      </div>
    </div>
  );
};
