export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string; // Assignee name (e.g. "Harsh", "Priya")
  status: TaskStatus;
  dueDate: string; // Format: YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  assignee: string;
  status: TaskStatus;
  dueDate: string;
}

export interface ColumnDefinition {
  id: TaskStatus;
  title: string;
  description: string;
  badgeColor: string;
  borderColor: string;
  headerBg: string;
}

export const COLUMNS: ColumnDefinition[] = [
  {
    id: 'todo',
    title: 'To do',
    description: 'Tasks ready to be started',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300 dark:border-amber-700/60',
    borderColor: 'border-amber-200 dark:border-amber-800/40',
    headerBg: 'bg-gradient-to-r from-amber-500/10 to-orange-500/5 dark:from-amber-500/20 dark:to-orange-500/10'
  },
  {
    id: 'in_progress',
    title: 'In progress',
    description: 'Work actively underway',
    badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border-sky-300 dark:border-sky-700/60',
    borderColor: 'border-sky-200 dark:border-sky-800/40',
    headerBg: 'bg-gradient-to-r from-sky-500/10 to-blue-500/5 dark:from-sky-500/20 dark:to-blue-500/10'
  },
  {
    id: 'done',
    title: 'Done',
    description: 'Completed successfully',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60',
    borderColor: 'border-emerald-200 dark:border-emerald-800/40',
    headerBg: 'bg-gradient-to-r from-emerald-500/10 to-teal-500/5 dark:from-emerald-500/20 dark:to-teal-500/10'
  }
];
