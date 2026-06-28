'use client';

import { useState, useOptimistic, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import UrgentActionCenter from '@/components/UrgentActionCenter';
import TaskList from '@/components/TaskList';
import AIChat from '@/components/AIChat';
import CreateTaskModal from '@/components/CreateTaskModal';
import CalendarView from '@/components/CalendarView';
import SettingsView from '@/components/SettingsView';
import AnalyticsView from '@/components/AnalyticsView';
import FocusModeOverlay from '@/components/FocusModeOverlay';
import { UITask, UIStatus, CreateTaskInput } from '@/lib/types';
import { createTask, updateTaskStatus, deleteTask, seedDummyTasksWithAI, autoPlanWeek, getTasks } from '@/lib/actions';
import MaximizedTaskViewModal from '@/components/MaximizedTaskViewModal';

interface DashboardClientProps {
  initialTasks: UITask[];
}

type OptimisticAction =
  | { type: 'add'; task: UITask }
  | { type: 'updateStatus'; id: string; status: UIStatus }
  | { type: 'delete'; id: string };

function applyOptimistic(state: UITask[], action: OptimisticAction): UITask[] {
  switch (action.type) {
    case 'add':
      return [action.task, ...state];
    case 'updateStatus':
      return state.map((t) =>
        t.id === action.id ? { ...t, status: action.status } : t
      );
    case 'delete':
      return state.filter((t) => t.id !== action.id);
  }
}

// ─── Daily Snapshot Widget ────────────────────────────────────────────────────
function DailySnapshot({
  tasks,
  onNavChange,
}: {
  tasks: UITask[];
  onNavChange: (nav: string) => void;
}) {
  const today = new Date();
  const isToday = (d: Date) =>
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();

  const totalToday = tasks.filter(t => isToday(new Date(t.deadline))).length;
  const doneTasksCount = tasks.filter(t => t.status && t.status.toLowerCase() === 'done').length;
  const pendingHigh = tasks.filter(
    t => t.status !== 'done' && t.priority_score >= 80
  ).length;
  const overallDone = tasks.filter(t => t.status === 'done').length;
  const overallTotal = tasks.length;
  const overallPct = overallTotal === 0 ? 0 : Math.round((overallDone / overallTotal) * 100);

  return (
    <div
      className="glass"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
          📊 Today&apos;s Overview
        </h2>
      </div>

      {/* Stat rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Tasks done today */}
        <div
          style={{
            background: 'rgba(52,211,153,0.07)',
            border: '1px solid rgba(52,211,153,0.2)',
            borderRadius: '12px',
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
            Tasks Done Today
          </div>
          <div className="text-5xl font-bold text-white" style={{ lineHeight: 1 }}>
            {doneTasksCount}
            <span style={{ fontSize: '15px', fontWeight: 500, color: '#94a3b8', marginLeft: '6px' }}>tasks</span>
          </div>
        </div>

        {/* Pending High Priority */}
        <div
          style={{
            background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '12px',
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
            Pending High Priority
          </div>
          <div className="text-3xl font-bold text-white" style={{ lineHeight: 1 }}>
            {pendingHigh}
            <span style={{ fontSize: '15px', fontWeight: 500, color: '#94a3b8', marginLeft: '4px' }}>task{pendingHigh !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Overall Progress</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#a78bfa' }}>{overallPct}%</span>
          </div>
          <div
            style={{
              height: '8px',
              borderRadius: '99px',
              background: 'rgba(255,255,255,0.06)',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div
              style={{
                width: `${overallPct}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #7c3aed, #4f46e5)',
                borderRadius: '99px',
                transition: 'width 1s ease-out',
              }}
            />
          </div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '5px' }}>
            {overallDone} of {overallTotal} total tasks completed
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* View Full Analytics link */}
      <button
        onClick={() => onNavChange('analytics')}
        style={{
          background: 'none',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: '10px',
          padding: '8px 14px',
          color: '#a78bfa',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          transition: 'all 0.2s',
          width: '100%',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
      >
        View Full Analytics
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

export default function DashboardClient({ initialTasks }: DashboardClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [, startTransition] = useTransition();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [selectedTaskForView, setSelectedTaskForView] = useState<UITask | null>(null);

  const [userName, setUserName] = useState('Alex');
  const [greetingTime, setGreetingTime] = useState('Good evening');
  const [currentDateStr, setCurrentDateStr] = useState('Monday, June 23');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('userSession');
      if (!session) {
        window.location.href = '/login';
      } else {
        setIsAuthenticated(true);
        const firstName = session.trim().split(' ')[0];
        setUserName(firstName);
      }

      // Time of day greeting
      const hour = new Date().getHours();
      if (hour < 12) {
        setGreetingTime('Good morning');
      } else if (hour < 18) {
        setGreetingTime('Good afternoon');
      } else {
        setGreetingTime('Good evening');
      }

      // Current Date
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
      setCurrentDateStr(now.toLocaleDateString('en-US', options));
    }
  }, []);

  // Live tasks state — starts from server-rendered initialTasks, can be
  // explicitly refreshed after mutations to reflect DB changes immediately.
  const [liveTasks, setLiveTasks] = useState<UITask[]>(initialTasks);

  // Keep liveTasks in sync whenever Next.js re-renders the server component
  // (i.e. after router.refresh() resolves and initialTasks updates).
  useEffect(() => {
    setLiveTasks(initialTasks);
  }, [initialTasks]);

  const [optimisticTasks, addOptimistic] = useOptimistic(
    liveTasks,
    applyOptimistic
  );

  // Helper: fetch fresh tasks from DB and push them into local state
  const refreshTasks = async () => {
    try {
      const fresh = await getTasks();
      setLiveTasks(fresh);
    } catch (e) {
      console.warn('refreshTasks failed:', e);
      router.refresh(); // fallback to server re-render
    }
  };

  // Sync selected task details on modifications
  useEffect(() => {
    if (selectedTaskForView) {
      const updated = optimisticTasks.find((t) => t.id === selectedTaskForView.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedTaskForView)) {
        setSelectedTaskForView(updated);
      }
    }
  }, [optimisticTasks, selectedTaskForView]);

  // Proactive Deadline Notifications
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkDeadlines = () => {
      if (Notification.permission !== 'granted') return;

      const now = Date.now();
      const twoHours = 2 * 60 * 60 * 1000;
      
      let notifiedTasks: string[] = [];
      try {
        const stored = localStorage.getItem('deadlineNotifiedTasks');
        if (stored) notifiedTasks = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse deadlineNotifiedTasks:', e);
      }

      const updatedNotified = [...notifiedTasks];
      let didNotify = false;

      optimisticTasks.forEach((task) => {
        if (task.status === 'done') return;
        
        const deadlineTime = new Date(task.deadline).getTime();
        const diff = deadlineTime - now;

        if (diff > -30 * 60 * 1000 && diff < twoHours) {
          if (!notifiedTasks.includes(task.id)) {
            new Notification(`🚨 Approaching Deadline`, {
              body: `"${task.title}" is due soon!`,
            });
            updatedNotified.push(task.id);
            didNotify = true;
          }
        }
      });

      if (didNotify) {
        localStorage.setItem('deadlineNotifiedTasks', JSON.stringify(updatedNotified));
      }
    };

    // Check on mount/update
    checkDeadlines();

    const interval = setInterval(checkDeadlines, 60000);
    return () => clearInterval(interval);
  }, [optimisticTasks]);


  // Derive urgent tasks from optimistic state: not done AND (priority_score >= 80 OR deadline is today)
  const urgentTasks = optimisticTasks.filter((t) => {
    const isNotDone = t.status !== 'done';
    const isHighPriority = t.priority_score >= 80;
    
    const deadlineDate = new Date(t.deadline);
    const today = new Date();
    const isDueToday =
      t.dueDate === 'Today' ||
      (deadlineDate.getFullYear() === today.getFullYear() &&
       deadlineDate.getMonth() === today.getMonth() &&
       deadlineDate.getDate() === today.getDate());

    return isNotDone && (isHighPriority || isDueToday);
  });
  const regularTasks = optimisticTasks.filter((t) => !urgentTasks.some((ut) => ut.id === t.id));

  // Stats
  const total = optimisticTasks.length;
  const inProgress = optimisticTasks.filter((t) => t.status === 'in-progress').length;
  const done = optimisticTasks.filter((t) => t.status === 'done').length;

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleStatusChange = (id: string, status: UIStatus) => {
    if (status === 'done') {
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 }
        });
      }).catch((err) => console.error("Confetti error:", err));
    }

    setLiveTasks(prevTasks => prevTasks.map(t => t.id === id ? { ...t, status: status } : t));

    startTransition(async () => {
      addOptimistic({ type: 'updateStatus', id, status });
      await updateTaskStatus(id, status);
      await refreshTasks();
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    setLiveTasks(prevTasks => prevTasks.filter(t => t.id !== id));
    startTransition(async () => {
      addOptimistic({ type: 'delete', id });
      await deleteTask(id);
      await refreshTasks();
      router.refresh();
    });
  };

  const handleCreate = async (input: CreateTaskInput): Promise<void> => {
    // Optimistic placeholder (temp id)
    const now = new Date();
    const tempTask: UITask = {
      id: `optimistic-${Date.now()}`,
      title: input.title,
      description: input.description,
      priority: input.priority_score >= 67 ? 'high' : input.priority_score >= 34 ? 'medium' : 'low',
      priority_score: input.priority_score,
      status: 'todo',
      estimated_hours: input.estimated_hours,
      deadline: input.deadline.toISOString(),
      dueDate: formatDueDateClient(input.deadline),
      dueTime: formatDueTimeClient(input.deadline),
      tag: input.tag,
      subtasks: [],
      urgent:
        input.priority_score >= 80 &&
        input.deadline.getTime() - now.getTime() <= 24 * 60 * 60 * 1000,
    };

    startTransition(async () => {
      addOptimistic({ type: 'add', task: tempTask });
      const personality = typeof window !== 'undefined' ? localStorage.getItem('aiPersonality') || 'Supportive Companion' : 'Supportive Companion';
      await createTask(input, personality);
      // Re-fetch after planning so calendar blocks appear immediately
      try {
        await autoPlanWeek();
        await refreshTasks();
        router.refresh();
      } catch (e) { console.warn('autoPlanWeek failed:', e); }
    });

    setIsModalOpen(false);
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <div className="mesh-bg" aria-hidden="true" />
      <div
        className="dashboard-layout"
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar */}
        <Sidebar
          activeNav={activeNav}
          onNavChange={setActiveNav}
          onCreateTask={() => setIsModalOpen(true)}
          tasks={optimisticTasks}
        />

        {/* Main Content */}
        <main
          className="main-content"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '28px 28px 28px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Header */}
          <header
            className="glass"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderBottom: '1px solid var(--glass-border)',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.3px' }}>
                  {greetingTime}, {userName} 👋
                </h1>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 500 }}>
                  {currentDateStr} · You have{' '}
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>
                    {urgentTasks.length} urgent task{urgentTasks.length !== 1 ? 's' : ''}
                  </span>{' '}
                  pending
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Stats Pills */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { label: 'Total', value: total, color: '#a78bfa' },
                  { label: 'In Progress', value: inProgress, color: '#60a5fa' },
                  { label: 'Done', value: done, color: '#34d399' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="glass"
                    style={{ padding: '8px 14px', textAlign: 'center' }}
                  >
                    <div style={{ fontSize: '18px', fontWeight: 700, color: stat.color }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Auto-Generate Button */}
              <button
                id="auto-generate-btn"
                disabled={isSeeding}
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#e2e8f0',
                  cursor: isSeeding ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isSeeding) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.09)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSeeding) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onClick={async () => {
                  setIsSeeding(true);
                  try {
                    await seedDummyTasksWithAI();
                    await autoPlanWeek();
                    await refreshTasks(); // pull fresh scheduled data into local state
                    router.refresh();    // also update server component cache
                  } catch (e) {
                    console.error("Auto-generate failed:", e);
                  } finally {
                    setIsSeeding(false);
                  }
                }}
              >
                {isSeeding ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  '✨ Auto-Generate'
                )}
              </button>

              {/* Create Task Button */}
              <button
                id="create-task-btn"
                className="btn-gradient"
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onClick={() => setIsModalOpen(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create Task
              </button>
            </div>
          </header>

          {activeNav === 'dashboard' ? (
            <>
              <UrgentActionCenter 
                tasks={urgentTasks} 
                onStartTask={(id) => handleStatusChange(id, 'in-progress')} 
                onEnterFocusMode={(id) => {
                  if (id) setFocusTaskId(id);
                  setIsFocusMode(true);
                }}
                onCompleteTask={(id) => handleStatusChange(id, 'done')}
              />

              {/* Bottom Grid: Task List (2/3) + Daily Snapshot (1/3) */}
              <div
                className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0"
              >
                {/* Task List — spans 2 columns */}
                <div className="lg:col-span-2 flex flex-col min-h-0">
                  <TaskList
                    tasks={optimisticTasks}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    onTaskClick={setSelectedTaskForView}
                  />
                </div>

                {/* Daily Snapshot Widget */}
                <div className="flex flex-col min-h-0">
                  <DailySnapshot
                    tasks={optimisticTasks}
                    onNavChange={setActiveNav}
                  />
                </div>
              </div>
            </>
          ) : activeNav === 'calendar' ? (
            <CalendarView tasks={optimisticTasks} onTaskClick={setSelectedTaskForView} />
          ) : activeNav === 'analytics' ? (
            <AnalyticsView tasks={optimisticTasks} />
          ) : activeNav === 'ai-assistant' ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <AIChat />
            </div>
          ) : activeNav === 'settings' ? (
            <SettingsView />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              Select an option from the sidebar.
            </div>
          )}
        </main>
      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <CreateTaskModal
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreate}
        />
      )}

      {/* Focus Mode Overlay */}
      {isFocusMode && (
        <FocusModeOverlay
          task={
            optimisticTasks.find((t) => t.id === focusTaskId) ||
            optimisticTasks.find((t) => t.status === 'in-progress') ||
            optimisticTasks.find((t) => t.status === 'todo') ||
            optimisticTasks[0]
          }
          onClose={() => {
            setIsFocusMode(false);
            setFocusTaskId(null);
          }}
        />
      )}

      {/* Maximized Task View Modal */}
      {selectedTaskForView && (
        <MaximizedTaskViewModal
          task={selectedTaskForView}
          onClose={() => setSelectedTaskForView(null)}
          onEnterFocusMode={(id) => {
            setSelectedTaskForView(null);
            setFocusTaskId(id);
            setIsFocusMode(true);
          }}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}

// Client-side date helpers (mirrors types.ts, but needed here without server imports)
function formatDueDateClient(d: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 86400000);
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (target.getTime() === today.getTime()) return 'Today';
  if (target.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric' });
}

function formatDueTimeClient(d: Date): string | undefined {
  const h = d.getHours();
  const m = d.getMinutes();
  if (h === 0 && m === 0) return undefined;
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
}
