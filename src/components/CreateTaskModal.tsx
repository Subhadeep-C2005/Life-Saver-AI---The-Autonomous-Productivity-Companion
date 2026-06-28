'use client';

import { useState } from 'react';
import { CreateTaskInput, Priority } from '@/lib/types';

interface CreateTaskModalProps {
  onClose: () => void;
  onCreate: (input: CreateTaskInput) => Promise<void>;
}

const priorityOptions: { value: Priority; score: number; label: string; color: string }[] = [
  { value: 'high', score: 80, label: '🔴 High', color: '#ef4444' },
  { value: 'medium', score: 50, label: '🟡 Medium', color: '#f59e0b' },
  { value: 'low', score: 20, label: '🟢 Low', color: '#10b981' },
];

const tagSuggestions = [
  'Engineering', 'Design', 'Marketing', 'Research',
  'DevOps', 'Business', 'Docs', 'UI', 'General',
];

export default function CreateTaskModal({ onClose, onCreate }: CreateTaskModalProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    priority_score: 50,
    estimated_hours: 1,
    dueDate: '',
    dueTime: '',
    tag: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Task title is required';
    if (!form.dueDate) errs.dueDate = 'Due date is required';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);

    // Build deadline DateTime
    const dateStr = form.dueDate;
    const timeStr = form.dueTime || '00:00';
    const deadline = new Date(`${dateStr}T${timeStr}:00`);

    const input: CreateTaskInput = {
      title: form.title.trim(),
      description: form.description.trim() || 'No description provided.',
      priority_score: form.priority_score,
      estimated_hours: form.estimated_hours,
      deadline,
      tag: form.tag || 'General',
    };

    try {
      await onCreate(input);
    } finally {
      setIsSubmitting(false);
    }
  };

  const setPriority = (p: Priority) => {
    const opt = priorityOptions.find((o) => o.value === p)!;
    setForm((f) => ({ ...f, priority: p, priority_score: opt.score }));
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}
    >
      <div
        id="create-task-modal"
        className="glass animate-fade-in-up"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '28px',
          borderRadius: '20px',
          border: '1px solid rgba(124,58,237,0.3)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(124,58,237,0.15)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              ✨ Create New Task
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
              Persisted to SQLite via Prisma
            </p>
          </div>
          <button
            id="close-modal-btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '7px',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              transition: 'all 0.2s',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Title */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Task Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="task-title-input"
              type="text"
              value={form.title}
              onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); setErrors((er) => ({ ...er, title: '' })); }}
              placeholder="e.g. Write unit tests for API"
              className="glass-input"
              style={{ width: '100%', padding: '10px 14px', fontSize: '14px' }}
              autoFocus
            />
            {errors.title && <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Description
            </label>
            <textarea
              id="task-description-input"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="What needs to be done?"
              rows={2}
              className="glass-input"
              style={{ width: '100%', padding: '10px 14px', fontSize: '13px', resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>

          {/* Priority + Tag Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Priority */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Priority
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {priorityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    id={`priority-${opt.value}`}
                    onClick={() => setPriority(opt.value)}
                    style={{
                      flex: 1,
                      padding: '7px 4px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: `1px solid ${form.priority === opt.value ? opt.color : 'rgba(255,255,255,0.1)'}`,
                      background: form.priority === opt.value ? `${opt.color}22` : 'rgba(255,255,255,0.05)',
                      color: form.priority === opt.value ? opt.color : '#64748b',
                      transition: 'all 0.2s',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Tag
              </label>
              <select
                id="task-tag-select"
                value={form.tag}
                onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
                className="glass-input"
                style={{ width: '100%', padding: '8px 12px', fontSize: '13px', cursor: 'pointer' }}
              >
                <option value="">Select tag...</option>
                {tagSuggestions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority Score + Estimated Hours Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Priority Score slider */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Priority Score: <span style={{ color: '#a78bfa', fontWeight: 700 }}>{form.priority_score}</span>
              </label>
              <input
                id="task-priority-score"
                type="range"
                min={1}
                max={100}
                value={form.priority_score}
                onChange={(e) => setForm((f) => ({ ...f, priority_score: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: '#7c3aed', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#475569', marginTop: '2px' }}>
                <span>Low</span><span>High</span>
              </div>
            </div>

            {/* Estimated Hours */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Estimated Hours
              </label>
              <input
                id="task-estimated-hours"
                type="number"
                min={0.25}
                max={40}
                step={0.25}
                value={form.estimated_hours}
                onChange={(e) => setForm((f) => ({ ...f, estimated_hours: Number(e.target.value) }))}
                className="glass-input"
                style={{ width: '100%', padding: '8px 12px', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Due Date + Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Due Date <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="task-due-date-input"
                type="date"
                value={form.dueDate}
                onChange={(e) => { setForm((f) => ({ ...f, dueDate: e.target.value })); setErrors((er) => ({ ...er, dueDate: '' })); }}
                className="glass-input"
                style={{ width: '100%', padding: '8px 12px', fontSize: '13px', colorScheme: 'dark' }}
              />
              {errors.dueDate && <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>{errors.dueDate}</p>}
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Due Time
              </label>
              <input
                id="task-due-time-input"
                type="time"
                value={form.dueTime}
                onChange={(e) => setForm((f) => ({ ...f, dueTime: e.target.value }))}
                className="glass-input"
                style={{ width: '100%', padding: '8px 12px', fontSize: '13px', colorScheme: 'dark' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '11px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
            >
              Cancel
            </button>
            <button
              id="submit-task-btn"
              type="submit"
              className="btn-gradient"
              disabled={isSubmitting}
              style={{
                flex: 2,
                padding: '11px',
                borderRadius: '10px',
                fontSize: '14px',
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {isSubmitting ? (
                <>
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </>
              ) : (
                '🚀 Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
