import { Task, TaskFormData, TaskStatus } from '../types/task';

const TASKS_STORAGE_KEY = 'taskflow_tasks_v2';
const API_BASE = import.meta.env.VITE_API_URL || '/api';

class TaskService {
  private isBackendAvailable: boolean | null = null;

  constructor() {
    // Clean up any legacy dummy cache if present
    try {
      localStorage.removeItem('taskflow_tasks_v1');
      localStorage.removeItem('taskflow_assignees_v1');
    } catch {
      // Ignore if localStorage is not accessible
    }
  }

  /**
   * Probes backend health to see if Express server is reachable
   */
  async checkBackend(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(8000) });
      const contentType = res.headers.get('content-type') || '';
      
      // If deployed statically without a backend, rewrites might return HTML or 404
      if (!res.ok || !contentType.includes('application/json')) {
        this.isBackendAvailable = false;
        return false;
      }

      const data = await res.json();
      this.isBackendAvailable = data?.status === 'ok';
      return this.isBackendAvailable;
    } catch {
      this.isBackendAvailable = false;
      return false;
    }
  }

  getBackendStatus(): boolean | null {
    return this.isBackendAvailable;
  }

  // --- Tasks ---

  async getTasks(): Promise<Task[]> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE}/tasks`);
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn('Backend fetch failed, using local storage fallback', err);
      }
    }

    const cached = localStorage.getItem(TASKS_STORAGE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error('Failed to parse cached tasks', e);
      }
    }

    const empty: Task[] = [];
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(empty));
    return empty;
  }

  async createTask(formData: TaskFormData): Promise<Task> {
    const newTask: Task = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: formData.title.trim(),
      description: formData.description.trim(),
      assignee: formData.assignee.trim(),
      status: formData.status,
      dueDate: formData.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask),
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const serverTask = await res.json();
          this.saveTaskLocally(serverTask);
          return serverTask;
        }
      } catch (err) {
        console.warn('Backend create failed, storing locally', err);
      }
    }

    this.saveTaskLocally(newTask);
    return newTask;
  }

  async updateTask(id: string, updates: Partial<TaskFormData>): Promise<Task> {
    const localTasks = await this.getTasks();
    const existing = localTasks.find((t) => t.id === id);
    if (!existing) {
      throw new Error(`Task with id ${id} not found`);
    }

    const updatedTask: Task = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE}/tasks/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTask),
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const serverTask = await res.json();
          this.updateTaskLocally(serverTask);
          return serverTask;
        }
      } catch (err) {
        console.warn('Backend update failed, updating locally', err);
      }
    }

    this.updateTaskLocally(updatedTask);
    return updatedTask;
  }

  async moveTask(id: string, newStatus: TaskStatus): Promise<Task> {
    return this.updateTask(id, { status: newStatus });
  }

  async deleteTask(id: string): Promise<void> {
    if (this.isBackendAvailable) {
      try {
        await fetch(`${API_BASE}/tasks/${id}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.warn('Backend delete failed, removing locally', err);
      }
    }

    const currentTasks = await this.getTasks();
    const filtered = currentTasks.filter((t) => t.id !== id);
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(filtered));
  }

  async clearAllTasks(): Promise<void> {
    if (this.isBackendAvailable) {
      try {
        await fetch(`${API_BASE}/tasks/clear`, { method: 'POST' });
      } catch (err) {
        console.warn('Backend clear failed', err);
      }
    }
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify([]));
  }

  private saveTaskLocally(task: Task) {
    const cached = localStorage.getItem(TASKS_STORAGE_KEY);
    const tasks: Task[] = cached ? JSON.parse(cached) : [];
    tasks.unshift(task);
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }

  private updateTaskLocally(task: Task) {
    const cached = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!cached) return;
    const tasks: Task[] = JSON.parse(cached);
    const index = tasks.findIndex((t) => t.id === task.id);
    if (index !== -1) {
      tasks[index] = task;
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    }
  }
}

export const taskService = new TaskService();
