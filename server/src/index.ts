import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Persistent data directory
const DATA_DIR = path.join(__dirname, '../data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const ASSIGNEES_FILE = path.join(DATA_DIR, 'assignees.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface Assignee {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  avatarColor: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  status: 'todo' | 'in_progress' | 'done';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_ASSIGNEES: Assignee[] = [
  {
    id: 'user-1',
    name: 'Alex Rivera',
    email: 'alex.rivera@team.co',
    role: 'Product Designer',
    initials: 'AR',
    avatarColor: 'bg-indigo-600',
  },
  {
    id: 'user-2',
    name: 'Priya Patel',
    email: 'priya.patel@team.co',
    role: 'Frontend Lead',
    initials: 'PP',
    avatarColor: 'bg-rose-500',
  },
  {
    id: 'user-3',
    name: 'Marcus Chen',
    email: 'marcus.chen@team.co',
    role: 'Backend Architect',
    initials: 'MC',
    avatarColor: 'bg-sky-600',
  },
  {
    id: 'user-4',
    name: 'Sofia Davis',
    email: 'sofia.davis@team.co',
    role: 'QA Engineer',
    initials: 'SD',
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 'user-5',
    name: 'Harsh Sharma',
    email: 'harsh.sharma@team.co',
    role: 'Full Stack Dev',
    initials: 'HS',
    avatarColor: 'bg-amber-600',
  },
];

function getDateOffset(daysDelta: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysDelta);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDefaultTasks(): Task[] {
  return [
    {
      id: 'task-1',
      title: 'Audit and upgrade legacy OAuth2 auth flow',
      description: 'Review security advisories for token refresh rotation and migrate auth middleware to PKCE with HTTP-only cookies.',
      assigneeId: 'user-3',
      status: 'todo',
      dueDate: getDateOffset(-2), // 2 days overdue
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'task-2',
      title: 'Design mobile responsive column navigation',
      description: 'Create Figma components for tabbed mobile headers, swipe gestures, and compact task card states.',
      assigneeId: 'user-1',
      status: 'todo',
      dueDate: getDateOffset(3),
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'task-3',
      title: 'Optimize API response payload compression',
      description: 'Enable Brotli/gzip on Express router and benchmark latency across large JSON task datasets.',
      assigneeId: 'user-5',
      status: 'todo',
      dueDate: getDateOffset(5),
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'task-4',
      title: 'Implement smooth drag-and-drop & touch actions',
      description: 'Ensure cards can be dragged across columns on desktop and moved via intuitive touch buttons on mobile viewports.',
      assigneeId: 'user-2',
      status: 'in_progress',
      dueDate: getDateOffset(0), // Due today!
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'task-5',
      title: 'End-to-end test suite for task lifecycle',
      description: 'Cover creation, editing, status transitions, search filtering, and persistence across browser reloads.',
      assigneeId: 'user-4',
      status: 'in_progress',
      dueDate: getDateOffset(2),
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'task-6',
      title: 'Setup repository structure & continuous integration',
      description: 'Configure TypeScript, Vite, Tailwind CSS, linting checks, and automated build pipeline.',
      assigneeId: 'user-5',
      status: 'done',
      dueDate: getDateOffset(-4),
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'task-7',
      title: 'Design system typography & color tokens',
      description: 'Finalize accessible color contrast pairs for light/dark modes and status indicators.',
      assigneeId: 'user-1',
      status: 'done',
      dueDate: getDateOffset(-3),
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ];
}

function loadTasks(): Task[] {
  if (!fs.existsSync(TASKS_FILE)) {
    const initial = getDefaultTasks();
    saveTasks(initial);
    return initial;
  }
  try {
    const raw = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return getDefaultTasks();
  }
}

function saveTasks(tasks: Task[]): void {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
}

function loadAssignees(): Assignee[] {
  if (!fs.existsSync(ASSIGNEES_FILE)) {
    fs.writeFileSync(ASSIGNEES_FILE, JSON.stringify(DEFAULT_ASSIGNEES, null, 2), 'utf-8');
    return DEFAULT_ASSIGNEES;
  }
  try {
    const raw = fs.readFileSync(ASSIGNEES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ASSIGNEES;
  }
}

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Assignees
app.get('/api/assignees', (_req: Request, res: Response) => {
  res.json(loadAssignees());
});

// Tasks
app.get('/api/tasks', (_req: Request, res: Response) => {
  res.json(loadTasks());
});

app.post('/api/tasks', (req: Request, res: Response) => {
  const { title, description, assigneeId, status, dueDate } = req.body;
  if (!title || !title.trim()) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const tasks = loadTasks();
  const newTask: Task = {
    id: req.body.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: title.trim(),
    description: (description || '').trim(),
    assigneeId: assigneeId || 'user-1',
    status: status || 'todo',
    dueDate: dueDate || getDateOffset(3),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  tasks.unshift(newTask);
  saveTasks(tasks);
  res.status(201).json(newTask);
});

app.get('/api/tasks/:id', (req: Request, res: Response) => {
  const tasks = loadTasks();
  const found = tasks.find((t) => t.id === req.params.id);
  if (!found) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json(found);
});

app.put('/api/tasks/:id', (req: Request, res: Response) => {
  const tasks = loadTasks();
  const index = tasks.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  const updated: Task = {
    ...tasks[index],
    ...req.body,
    id: tasks[index].id, // preserve id
    updatedAt: new Date().toISOString(),
  };

  tasks[index] = updated;
  saveTasks(tasks);
  res.json(updated);
});

app.patch('/api/tasks/:id/move', (req: Request, res: Response) => {
  const { status } = req.body;
  if (!['todo', 'in_progress', 'done'].includes(status)) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  const tasks = loadTasks();
  const task = tasks.find((t) => t.id === req.params.id);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  task.status = status;
  task.updatedAt = new Date().toISOString();
  saveTasks(tasks);
  res.json(task);
});

app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  const tasks = loadTasks();
  const filtered = tasks.filter((t) => t.id !== req.params.id);
  saveTasks(filtered);
  res.status(204).end();
});

app.post('/api/reset', (_req: Request, res: Response) => {
  const resetTasks = getDefaultTasks();
  saveTasks(resetTasks);
  res.json({ message: 'Reset successfully', tasks: resetTasks });
});

// Serve frontend static files if client/dist exists
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
