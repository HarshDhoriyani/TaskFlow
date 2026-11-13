/**
 * Formats a date string (YYYY-MM-DD) into a human readable format.
 */
export function formatFriendlyDate(dateString: string): string {
  if (!dateString) return 'No due date';
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Returns today's date formatted as YYYY-MM-DD in local time.
 */
export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates days relative to today.
 * Negative number means past/overdue.
 * 0 means today.
 * Positive number means future.
 */
export function getDaysRemaining(dueDateString: string): number {
  if (!dueDateString) return 0;
  
  const [year, month, day] = dueDateString.split('-').map(Number);
  const dueDate = new Date(year, month - 1, day);
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = dueDate.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determines whether a task is overdue.
 * Completed (status === 'done') tasks are NEVER marked overdue.
 */
export function isTaskOverdue(dueDateString: string, status: string): boolean {
  if (status === 'done') return false;
  if (!dueDateString) return false;
  return getDaysRemaining(dueDateString) < 0;
}

/**
 * Returns a human-friendly due date badge information.
 */
export function getDueDateStatus(dueDateString: string, status: string) {
  if (status === 'done') {
    return {
      label: 'Completed',
      isOverdue: false,
      colorClass: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
    };
  }

  const days = getDaysRemaining(dueDateString);

  if (days < 0) {
    const absDays = Math.abs(days);
    const dayText = absDays === 1 ? '1 day' : `${absDays} days`;
    return {
      label: `Overdue by ${dayText}`,
      isOverdue: true,
      colorClass: 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-semibold',
    };
  }

  if (days === 0) {
    return {
      label: 'Due today',
      isOverdue: false,
      isDueToday: true,
      colorClass: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-medium',
    };
  }

  if (days === 1) {
    return {
      label: 'Due tomorrow',
      isOverdue: false,
      colorClass: 'text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    };
  }

  return {
    label: `Due in ${days} days`,
    isOverdue: false,
    colorClass: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };
}
