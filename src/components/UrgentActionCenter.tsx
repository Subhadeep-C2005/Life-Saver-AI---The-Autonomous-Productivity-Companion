'use client';

import { useState } from 'react';
import { UITask as Task } from '@/lib/types';

interface UrgentActionCenterProps {
  tasks: Task[];
  onStartTask: (id: string) => void;
  onEnterFocusMode: (id?: string) => void;
  onCompleteTask?: (id: string) => void;
}

const priorityColors: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981',
};

export default function UrgentActionCenter({ tasks, onStartTask, onEnterFocusMode, onCompleteTask }: UrgentActionCenterProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [startingIds, setStartingIds] = useState<Set<string>>(new Set());

  const visibleTasks = tasks
    .filter((t) => !dismissed.has(t.id))
    .sort((a, b) => {
      if (b.priority_score !== a.priority_score) {
        return b.priority_score - a.priority_score;
      }
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

  const handleStart = async (id: string) => {
    setStartingIds((prev) => new Set([...prev, id]));
    // Wire up server action status update
    onStartTask(id);
    // Smooth transition delay to let loading state animate
    await new Promise((resolve) => setTimeout(resolve, 600));
    setDismissed((prev) => new Set([...prev, id]));
    setStartingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  return (
    <section aria-label="Urgent Action Center">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        {/* Pulsing red dot */}
        <div
          className="pulse-urgent"
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#ef4444',
            flexShrink: 0,
          }}
        />
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Urgent Action Center
        </h2>
        <span
          style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '20px',
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.35)',
            color: '#ef4444',
            fontWeight: 600,
          }}
        >
          {visibleTasks.length} URGENT
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => onEnterFocusMode()}
            className="btn-gradient"
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 700,
              boxShadow: '0 0 12px rgba(124,58,237,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            🎯 Enter Focus Mode
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '16px',
          paddingBottom: '16px',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'thin',
        }}
      >
        {visibleTasks.map((task, i) => {
          const isStarting = startingIds.has(task.id);
          return (
            <div
              key={task.id}
              id={`urgent-task-${task.id}`}
              className="glass glass-hover animate-fade-in-up"
              style={{
                padding: '16px',
                borderColor: 'rgba(239,68,68,0.25)',
                position: 'relative',
                animationDelay: `${i * 0.08}s`,
                flex: '0 0 320px',
                scrollSnapAlign: 'start',
              }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: priorityColors[task.priority],
                      boxShadow: `0 0 8px ${priorityColors[task.priority]}`,
                      flexShrink: 0,
                    }}
                  />
                  <span className="tag-pill">{task.tag}</span>
                </div>
                <button
                  aria-label="Dismiss urgent task"
                  onClick={() => setDismissed((prev) => new Set([...prev, task.id]))}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#475569',
                    padding: '2px',
                    display: 'flex',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#94a3b8')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', lineHeight: 1.3 }}>
                {task.title}
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, marginBottom: '14px' }}>
                {task.description}
              </p>

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '12px',
                    color: '#ef4444',
                    fontWeight: 500,
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  Due {task.dueDate} · {task.dueTime}
                </div>
                {task.status === 'in-progress' ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => onEnterFocusMode(task.id)}
                      className="btn-gradient"
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      🎯 Focus
                    </button>
                    <button
                      onClick={() => {
                        if (onCompleteTask) onCompleteTask(task.id);
                        setDismissed((prev) => new Set([...prev, task.id]));
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(52,211,153,0.15)',
                        border: '1px solid rgba(52,211,153,0.3)',
                        color: '#34d399',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(52,211,153,0.25)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(52,211,153,0.15)'; }}
                    >
                      ✓ Done
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn-gradient"
                    onClick={() => handleStart(task.id)}
                    disabled={isStarting}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      opacity: isStarting ? 0.75 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {isStarting ? (
                      <>
                        <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                          <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
                        </svg>
                        Starting...
                      </>
                    ) : (
                      'Start Now'
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {visibleTasks.length === 0 && (
          <div
            className="glass"
            style={{
              width: '100%',
              padding: '28px',
              textAlign: 'center',
              color: '#34d399',
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎉</div>
            <div style={{ fontWeight: 600, fontSize: '15px' }}>All urgent tasks cleared!</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              You&apos;re crushing it today.
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

