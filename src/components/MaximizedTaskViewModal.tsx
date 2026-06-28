'use client';

import { useState, useEffect } from 'react';
import { UITask, UIStatus } from '@/lib/types';
import { toggleSubtask } from '@/lib/actions';
import { playSuccessSound } from '@/lib/audio';

interface MaximizedTaskViewModalProps {
  task: UITask;
  onClose: () => void;
  onEnterFocusMode: (id: string) => void;
  onStatusChange: (id: string, status: UIStatus) => void;
}

const priorityConfig = {
  high: { label: 'High Priority', color: '#ef4444', emoji: '🔴', bg: 'rgba(239,68,68,0.12)' },
  medium: { label: 'Medium Priority', color: '#f59e0b', emoji: '🟡', bg: 'rgba(245,158,11,0.12)' },
  low: { label: 'Low Priority', color: '#10b981', emoji: '🟢', bg: 'rgba(16,185,129,0.12)' },
};

const statusConfig: Record<UIStatus, { label: string; color: string; next: UIStatus }> = {
  todo: { label: 'To Do', color: '#64748b', next: 'in-progress' },
  'in-progress': { label: 'In Progress', color: '#60a5fa', next: 'done' },
  done: { label: 'Done', color: '#34d399', next: 'todo' },
};

export default function MaximizedTaskViewModal({
  task,
  onClose,
  onEnterFocusMode,
  onStatusChange,
}: MaximizedTaskViewModalProps) {
  const [checkedSubtasks, setCheckedSubtasks] = useState<Set<string>>(new Set());
  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  useEffect(() => {
    if (task.subtasks) {
      setCheckedSubtasks(new Set(task.subtasks.filter((st) => st.isDone || st.isCompleted).map((st) => st.id)));
    }
  }, [task]);

  const handleToggleSubtask = async (subtaskId: string) => {
    const isNowChecked = !checkedSubtasks.has(subtaskId);
    if (isNowChecked) {
      playSuccessSound();
    }
    setCheckedSubtasks((prev) => {
      const next = new Set(prev);
      if (next.has(subtaskId)) {
        next.delete(subtaskId);
      } else {
        next.add(subtaskId);
      }
      return next;
    });

    try {
      await toggleSubtask(subtaskId, isNowChecked);
    } catch (err) {
      console.error('Failed to toggle subtask:', err);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 900,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(5, 11, 24, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '20px',
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="glass animate-fade-in-up"
        style={{
          width: '100%',
          maxWidth: '580px',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '24px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div
          style={{
            padding: '24px 28px 12px 28px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="tag-pill" style={{ padding: '4px 10px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {task.tag}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: priority.color,
                  background: priority.bg,
                  border: `1px solid ${priority.color}33`,
                  padding: '3px 10px',
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {priority.emoji} {priority.label}
              </span>
            </div>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1.25,
                letterSpacing: '-0.3px',
                marginTop: '6px',
              }}
            >
              {task.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              flexShrink: 0,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--glass-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--glass-bg)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <hr style={{ border: '0', borderTop: '1px solid var(--glass-border)', margin: '0' }} />

        {/* Body content */}
        <div
          style={{
            padding: '24px 28px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            flex: 1,
          }}
        >
          {/* Metadata Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: '16px',
              padding: '14px 18px',
            }}
          >
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                Status
              </div>
              <button
                onClick={() => {
                  if (status.next === 'done') {
                    playSuccessSound();
                  }
                  onStatusChange(task.id, status.next);
                }}
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: status.color,
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                title="Click to advance status"
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: status.color,
                    boxShadow: `0 0 8px ${status.color}`,
                  }}
                />
                {status.label}
              </button>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                Deadline
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                📅 {task.dueDate} {task.dueTime ? `· ${task.dueTime}` : ''}
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Description
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
              {task.description || 'No description provided.'}
            </p>
          </div>

          {/* Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🤖 Actionable Checklist
              </div>
              <span style={{ fontSize: '11px', color: 'var(--accent-purple)', fontWeight: 600 }}>
                {task.subtasks?.filter(st => checkedSubtasks.has(st.id)).length || 0} / {task.subtasks?.length || 0} completed
              </span>
            </div>

            {hasSubtasks ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {task.subtasks.map((st) => {
                  const isCompleted = checkedSubtasks.has(st.id);
                  return (
                    <div
                      key={st.id}
                      onClick={() => handleToggleSubtask(st.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--glass-hover)';
                        e.currentTarget.style.borderColor = 'var(--glass-border)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--glass-bg)';
                        e.currentTarget.style.borderColor = 'var(--glass-border)';
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleSubtask(st.id);
                        }}
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '4px',
                          accentColor: '#34d399',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: '12.5px',
                          color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                          lineHeight: 1.4,
                          transition: 'color 0.2s',
                        }}
                      >
                        {st.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No subtasks generated for this task.
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <hr style={{ border: '0', borderTop: '1px solid var(--glass-border)', margin: '0' }} />

        {/* Footer actions */}
        <div
          style={{
            padding: '16px 28px 24px 28px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--glass-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--glass-bg)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            Close
          </button>
          <button
            onClick={() => onEnterFocusMode(task.id)}
            className="btn-gradient"
            style={{
              padding: '10px 24px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
            }}
          >
            🎯 Enter Focus Mode
          </button>
        </div>
      </div>
    </div>
  );
}
