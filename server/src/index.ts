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

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  status: 'todo' | 'in_progress' | 'done';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

function loadTasks(): Task[] {
  if (!fs.existsSync(TASKS_FILE)) {
    saveTasks([]);
    return [];
  }
  try {
    const raw = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]): void {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
}

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Assignees (derived dynamically from tasks)
app.get('/api/assignees', (_req: Request, res: Response) => {
  const tasks = loadTasks();
  const assignees = Array.from(new Set(tasks.map((t) => t.assignee).filter(Boolean)));
  res.json(assignees);
});

// Tasks
app.get('/api/tasks', (_req: Request, res: Response) => {
  res.json(loadTasks());
});

app.post('/api/tasks', (req: Request, res: Response) => {
  const { title, description, assignee, status, dueDate } = req.body;
  if (!title || !title.trim()) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const tasks = loadTasks();
  const newTask: Task = {
    id: req.body.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: title.trim(),
    description: (description || '').trim(),
    assignee: (assignee || '').trim(),
    status: status || 'todo',
    dueDate: dueDate || new Date().toISOString().split('T')[0],
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

app.post('/api/tasks/clear', (_req: Request, res: Response) => {
  saveTasks([]);
  res.json({ message: 'All tasks cleared successfully', tasks: [] });
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
