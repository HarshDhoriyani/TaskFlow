import { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, TaskStatus, TaskFormData, COLUMNS } from './types/task';
import { taskService } from './services/taskService';
import { isTaskOverdue } from './utils/dateUtils';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { Column } from './components/Column';
import { TaskModal } from './components/TaskModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { MobileColumnTabs } from './components/MobileColumnTabs';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Sparkles, AlertCircle, RefreshCw, PlusCircle } from 'lucide-react';

export function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [onlyOverdue, setOnlyOverdue] = useState(false);

  // Mobile layout state
  const [mobileActiveTab, setMobileActiveTab] = useState<TaskStatus | 'all'>('all');

  // Dark mode
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('taskflow_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Modals
  const [taskModalState, setTaskModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    initialTask: Task | null;
    defaultStatus: TaskStatus;
  }>({
    isOpen: false,
    mode: 'create',
    initialTask: null,
    defaultStatus: 'todo',
  });

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    task: Task | null;
  }>({
    isOpen: false,
    task: null,
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const newToast: ToastMessage = {
      id: 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      message,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync dark mode class with <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('taskflow_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('taskflow_theme', 'light');
    }
  }, [darkMode]);

  // Initial data loading and backend check
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const isConnected = await taskService.checkBackend();
        setBackendConnected(isConnected);

        const loadedTasks = await taskService.getTasks();
        setTasks(loadedTasks);
      } catch (err) {
        console.error('Initialization error:', err);
        addToast('Failed to load tasks', 'error');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [addToast]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setTaskModalState({
          isOpen: true,
          mode: 'create',
          initialTask: null,
          defaultStatus: 'todo',
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Dynamically extract all unique assignees from existing tasks
  const assigneesList = useMemo(() => {
    const names = new Set<string>();
    tasks.forEach((t) => {
      if (t.assignee && t.assignee.trim()) {
        names.add(t.assignee.trim());
      }
    });
    return Array.from(names).sort();
  }, [tasks]);

  // Filtered tasks computation
  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      // Search by title
      if (query && !task.title.toLowerCase().includes(query)) {
        return false;
      }

      // Filter by assignee
      if (selectedAssignee !== 'all' && task.assignee !== selectedAssignee) {
        return false;
      }

      // Filter by overdue
      if (onlyOverdue && !isTaskOverdue(task.dueDate, task.status)) {
        return false;
      }

      // Filter by status (from stats bar)
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, selectedAssignee, onlyOverdue, statusFilter]);

  // Group tasks by status
  const tasksByColumn = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      done: [],
    };
    filteredTasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });
    return grouped;
  }, [filteredTasks]);

  // --- CRUD Handlers ---

  const handleCreateOrUpdateTask = async (formData: TaskFormData) => {
    try {
      if (taskModalState.mode === 'create') {
        const newTask = await taskService.createTask(formData);
        setTasks((prev) => [newTask, ...prev]);
        addToast(`Task "${newTask.title}" created successfully!`, 'success');
      } else if (taskModalState.mode === 'edit' && taskModalState.initialTask) {
        const updatedTask = await taskService.updateTask(taskModalState.initialTask.id, formData);
        setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
        addToast(`Task updated successfully!`, 'success');
      }
      setTaskModalState((prev) => ({ ...prev, isOpen: false }));
    } catch (err) {
      console.error('Error saving task:', err);
      addToast('Failed to save task. Please try again.', 'error');
    }
  };

  const handleMoveTask = async (id: string, newStatus: TaskStatus) => {
    const currentTask = tasks.find((t) => t.id === id);
    if (!currentTask || currentTask.status === newStatus) return;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
      )
    );

    const targetColName = COLUMNS.find((c) => c.id === newStatus)?.title || newStatus;
    addToast(`Moved to ${targetColName}`, 'info');

    try {
      await taskService.moveTask(id, newStatus);
    } catch (err) {
      console.error('Error moving task:', err);
      addToast('Failed to update task position', 'error');
    }
  };

  const handleDeleteTaskConfirm = async () => {
    if (!deleteModalState.task) return;
    const taskToDelete = deleteModalState.task;
    try {
      await taskService.deleteTask(taskToDelete.id);
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      addToast(`Task deleted`, 'info');
      setDeleteModalState({ isOpen: false, task: null });
    } catch (err) {
      console.error('Error deleting task:', err);
      addToast('Failed to delete task', 'error');
    }
  };

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedAssignee !== 'all' ||
    statusFilter !== 'all' ||
    onlyOverdue;

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedAssignee('all');
    setStatusFilter('all');
    setOnlyOverdue(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-200">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Top Navigation */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedAssignee={selectedAssignee}
        onAssigneeChange={setSelectedAssignee}
        assignees={assigneesList}
        onOpenNewTaskModal={() =>
          setTaskModalState({
            isOpen: true,
            mode: 'create',
            initialTask: null,
            defaultStatus: 'todo',
          })
        }
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        backendConnected={backendConnected}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Main Board Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Stats Bar & Clickable Overdue Filter */}
        <StatsBar
          tasks={tasks}
          onlyOverdue={onlyOverdue}
          onToggleOverdue={() => setOnlyOverdue(!onlyOverdue)}
          statusFilter={statusFilter}
          onSelectStatus={(status) => setStatusFilter(status)}
        />

        {/* Active Filter Indicators Banner */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 mb-5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 rounded-xl text-xs text-indigo-900 dark:text-indigo-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Active filters:
              </span>
              {searchQuery && (
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 font-medium">
                  Title: "{searchQuery}"
                </span>
              )}
              {selectedAssignee !== 'all' && (
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 font-medium">
                  Assignee: {selectedAssignee}
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 font-medium">
                  Status: {COLUMNS.find((c) => c.id === statusFilter)?.title}
                </span>
              )}
              {onlyOverdue && (
                <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Only Overdue Tasks
                </span>
              )}
              <span className="text-slate-500 dark:text-slate-400">
                ({filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found)
              </span>
            </div>
            <button
              onClick={handleClearFilters}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* Mobile Viewport Tabs Switcher */}
        <MobileColumnTabs
          activeTab={mobileActiveTab}
          onSelectTab={setMobileActiveTab}
          tasks={filteredTasks}
        />

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
            <p className="text-sm font-medium">Loading your team board...</p>
          </div>
        ) : tasks.length === 0 ? (
          /* Empty Board Welcome Banner */
          <div className="flex flex-col items-center justify-center text-center p-12 bg-white/60 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl mb-8">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <PlusCircle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
              Your board is ready!
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-5 leading-relaxed">
              No tasks yet. Create your first task to start organizing work across To do, In progress, and Done.
            </p>
            <button
              onClick={() =>
                setTaskModalState({
                  isOpen: true,
                  mode: 'create',
                  initialTask: null,
                  defaultStatus: 'todo',
                })
              }
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/25 transition-all"
            >
              <span>+ Create First Task</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-indigo-700/80 rounded border border-indigo-400/30">
                N
              </kbd>
            </button>
          </div>
        ) : null}

        {/* Three Columns Board Grid */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {COLUMNS.map((column) => {
              if (mobileActiveTab !== 'all' && mobileActiveTab !== column.id) {
                return null;
              }

              return (
                <Column
                  key={column.id}
                  column={column}
                  tasks={tasksByColumn[column.id]}
                  searchQuery={searchQuery}
                  onAddTaskToColumn={(status) =>
                    setTaskModalState({
                      isOpen: true,
                      mode: 'create',
                      initialTask: null,
                      defaultStatus: status,
                    })
                  }
                  onEditTask={(task) =>
                    setTaskModalState({
                      isOpen: true,
                      mode: 'edit',
                      initialTask: task,
                      defaultStatus: task.status,
                    })
                  }
                  onDeleteTask={(id) => {
                    const taskToDelete = tasks.find((t) => t.id === id);
                    if (taskToDelete) {
                      setDeleteModalState({ isOpen: true, task: taskToDelete });
                    }
                  }}
                  onMoveTask={handleMoveTask}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Task Creation / Edit Modal */}
      <TaskModal
        isOpen={taskModalState.isOpen}
        mode={taskModalState.mode}
        initialTask={taskModalState.initialTask}
        defaultStatus={taskModalState.defaultStatus}
        existingAssignees={assigneesList}
        onClose={() => setTaskModalState((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={handleCreateOrUpdateTask}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        task={deleteModalState.task}
        onClose={() => setDeleteModalState({ isOpen: false, task: null })}
        onConfirm={handleDeleteTaskConfirm}
      />
    </div>
  );
}

export default App;
