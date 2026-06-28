import type { Task as PrismaTask } from '@prisma/client';

// ─── DB types (straight from Prisma) ────────────────────────────────────────
export type DbTask = PrismaTask;

// ─── UI types (used by all components) ───────────────────────────────────────
export type Priority = 'high' | 'medium' | 'low';
export type UIStatus = 'todo' | 'in-progress' | 'done';

export interface UISubtask {
  id: string;
  title: string;
  isDone: boolean;
  isCompleted?: boolean;
  scheduledStart?: string; // ISO String
  scheduledEnd?: string;   // ISO String
}

export interface UITask {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  priority_score: number;
  status: UIStatus;
  estimated_hours: number;
  deadline: string;       // ISO string (Date serialized)
  dueDate: string;        // human-readable, e.g. "Today", "Jun 25"
  dueTime?: string;       // e.g. "11:59 PM"
  tag: string;
  urgent: boolean;
  subtasks: UISubtask[];
}

// ─── Input type for creating a new task ──────────────────────────────────────
export interface CreateTaskInput {
  title: string;
  description: string;
  priority_score: number;
  estimated_hours: number;
  deadline: Date;
  tag: string;
}

// ─── Adapter: DbTask → UITask ────────────────────────────────────────────────
export function toUITask(t: DbTask & { subtasks?: any[] }): UITask {
  const priority = scoreToPriority(t.priority_score);
  const statusUI = dbStatusToUI(t.status);
  const deadline = new Date(t.deadline);
  const isUrgent =
    t.priority_score >= 80 &&
    t.status !== 'completed' &&
    deadline.getTime() - Date.now() <= 24 * 60 * 60 * 1000;

  return {
    id: t.id,
    title: t.title,
    description: t.description,
    priority,
    priority_score: t.priority_score,
    status: statusUI,
    estimated_hours: t.estimated_hours,
    deadline: deadline.toISOString(),
    dueDate: formatDueDate(deadline),
    dueTime: formatDueTime(deadline),
    tag: t.tag,
    urgent: isUrgent,
    subtasks: t.subtasks ? t.subtasks.map(st => ({
      id: st.id,
      title: st.title,
      isDone: st.isDone,
      isCompleted: st.isDone,
      scheduledStart: st.scheduledStart ? new Date(st.scheduledStart).toISOString() : undefined,
      scheduledEnd: st.scheduledEnd ? new Date(st.scheduledEnd).toISOString() : undefined,
    })) : [],
  };
}

// ─── Adapter: UI status → DB status ──────────────────────────────────────────
export function uiStatusToDb(s: UIStatus): string {
  if (s === 'todo') return 'pending';
  if (s === 'done') return 'completed';
  return 'in-progress';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function scoreToPriority(score: number): Priority {
  if (score >= 67) return 'high';
  if (score >= 34) return 'medium';
  return 'low';
}

function dbStatusToUI(s: string): UIStatus {
  if (s === 'completed') return 'done';
  if (s === 'in-progress') return 'in-progress';
  return 'todo';
}

function formatDueDate(d: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 86400000);
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (target.getTime() === today.getTime()) return 'Today';
  if (target.getTime() === tomorrow.getTime()) return 'Tomorrow';

  const month = d.toLocaleString('en-US', { month: 'short' });
  return `${month} ${d.getDate()}`;
}

function formatDueTime(d: Date): string | undefined {
  const h = d.getHours();
  const m = d.getMinutes();
  if (h === 0 && m === 0) return undefined;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
}
