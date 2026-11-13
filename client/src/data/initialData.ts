import { Assignee, Task } from '../types/task';

export const INITIAL_ASSIGNEES: Assignee[] = [
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

/**
 * Returns formatted date offset from today by `daysDelta`
 */
function getDateOffset(daysDelta: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysDelta);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateInitialTasks(): Task[] {
  return [
    {
      id: 'task-1',
      title: 'Audit and upgrade legacy OAuth2 auth flow',
      description: 'Review security advisories for token refresh rotation and migrate auth middleware to PKCE with HTTP-only cookies.',
      assigneeId: 'user-3', // Marcus Chen
      status: 'todo',
      dueDate: getDateOffset(-2), // 2 days overdue!
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'task-2',
      title: 'Design mobile responsive column navigation',
      description: 'Create Figma components for tabbed mobile headers, swipe gestures, and compact task card states.',
      assigneeId: 'user-1', // Alex Rivera
      status: 'todo',
      dueDate: getDateOffset(3), // In 3 days
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'task-3',
      title: 'Optimize API response payload compression',
      description: 'Enable Brotli/gzip on Express router and benchmark latency across large JSON task datasets.',
      assigneeId: 'user-5', // Harsh Sharma
      status: 'todo',
      dueDate: getDateOffset(5), // In 5 days
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'task-4',
      title: 'Implement smooth drag-and-drop & touch actions',
      description: 'Ensure cards can be dragged across columns on desktop and moved via intuitive touch buttons on mobile viewports.',
      assigneeId: 'user-2', // Priya Patel
      status: 'in_progress',
      dueDate: getDateOffset(0), // Due TODAY!
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'task-5',
      title: 'End-to-end test suite for task lifecycle',
      description: 'Cover creation, editing, status transitions, search filtering, and persistence across browser reloads.',
      assigneeId: 'user-4', // Sofia Davis
      status: 'in_progress',
      dueDate: getDateOffset(2), // In 2 days
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'task-6',
      title: 'Setup repository structure & continuous integration',
      description: 'Configure TypeScript, Vite, Tailwind CSS, linting checks, and automated build pipeline.',
      assigneeId: 'user-5', // Harsh Sharma
      status: 'done',
      dueDate: getDateOffset(-4), // Done in the past
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'task-7',
      title: 'Design system typography & color tokens',
      description: 'Finalize accessible color contrast pairs for light/dark modes and status indicators.',
      assigneeId: 'user-1', // Alex Rivera
      status: 'done',
      dueDate: getDateOffset(-3),
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ];
}
