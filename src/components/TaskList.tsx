'use client';

import { useState } from 'react';
import { UITask, UIStatus, Priority } from '@/lib/types';
import { playSuccessSound } from '@/lib/audio';

interface TaskListProps {
  tasks: UITask[];
  onStatusChange: (id: string, status: UIStatus) => void;
  onDelete: (id: string) => void;
  onTaskClick?: (task: UITask) => void;
}

const priorityConfig = {
  high: {
    label: 'High Priority',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.25)',
    emoji: '🔴',
  },
  medium: {
    label: 'Medium Priority',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.25)',
    emoji: '🟡',
  },
  low: {
    label: 'Low Priority',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.25)',
    emoji: '🟢',
  },
};

const statusConfig: Record<UIStatus, { label: string; color: string; next: UIStatus }> = {
  todo: { label: 'To Do', color: '#475569', next: 'in-progress' },
  'in-progress': { label: 'In Progress', color: '#60a5fa', next: 'done' },
  done: { label: 'Done', color: '#34d399', next: 'todo' },
};

function TaskCard({
  task,
  onStatusChange,
  onDelete,
  onTaskClick,
}: {
  task: UITask;
  onStatusChange: (id: string, status: UIStatus) => void;
  onDelete: (id: string) => void;
  onTaskClick?: (task: UITask) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  return (
    <div
      id={`task-${task.id}`}
      className="glass glass-hover animate-fade-in-up"
      onClick={() => onTaskClick && onTaskClick(task)}
      style={{
        padding: '12px 14px',
        opacity: task.status === 'done' ? 0.6 : task.id.startsWith('optimistic-') ? 0.75 : 1,
        transition: 'opacity 0.3s',
        position: 'relative',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        {/* Checkbox */}
        <button
          aria-label={`Mark ${task.title} as done`}
          onClick={(e) => {
            e.stopPropagation();
            const nextStatus: UIStatus = task.status === 'done' ? 'todo' : 'done';
            if (nextStatus === 'done') {
              playSuccessSound();
            }
            onStatusChange(task.id, nextStatus);
          }}
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '5px',
            border: `2px solid ${task.status === 'done' ? '#34d399' : 'rgba(255,255,255,0.2)'}`,
            background:
              task.status === 'done' ? 'rgba(52,211,153,0.2)' : 'transparent',
            cursor: task.id.startsWith('optimistic-') ? 'not-allowed' : 'pointer',
            flexShrink: 0,
            marginTop: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >
          {task.status === 'done' && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: task.status === 'done' ? '#475569' : 'var(--text-primary)',
                textDecoration: task.status === 'done' ? 'line-through' : 'none',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}
            >
              {task.title}
            </span>
            {task.id.startsWith('optimistic-') && (
              <span style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic', flexShrink: 0 }}>
                saving…
              </span>
            )}
          </div>
          <p
            style={{
              fontSize: '11px',
              color: '#64748b',
              lineHeight: 1.5,
              marginBottom: '8px',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {task.description}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="tag-pill">{task.tag}</span>
            {/* Cycle status button */}
            <button
              id={`status-${task.id}`}
              onClick={(e) => {
                e.stopPropagation();
                if (status.next === 'done') {
                  playSuccessSound();
                }
                onStatusChange(task.id, status.next);
              }}
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: task.id.startsWith('optimistic-') ? 'not-allowed' : 'pointer',
                border: `1px solid ${status.color}44`,
                background: `${status.color}18`,
                color: status.color,
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="Click to advance status"
            >
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: status.color,
                  display: 'inline-block',
                }}
              />
              {status.label}
            </button>
            <span style={{ fontSize: '11px', color: '#475569', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '3px' }}>
              📅 {task.dueDate}
              {task.dueTime && ` · ${task.dueTime}`}
            </span>
            {/* Est. hours badge */}
            {task.estimated_hours > 0 && (
              <span style={{ fontSize: '10px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '2px' }}>
                ⏱ {task.estimated_hours}h
              </span>
            )}
            
            {/* AI Subtasks Toggle Button */}
            {hasSubtasks && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                }}
              >
                🤖 {task.subtasks.length} Subtasks
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Delete button */}
        <button
          aria-label="Delete task"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#334155',
            padding: '2px',
            display: 'flex',
            flexShrink: 0,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#334155')}
          title="Delete task"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
        </button>
      </div>

      {/* Accordion content for subtasks */}
      {hasSubtasks && isExpanded && (
        <div 
          style={{ 
            marginTop: '12px', 
            paddingTop: '10px', 
            borderTop: '1px dashed rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {task.subtasks.map((st, i) => (
            <div key={st.id || i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ color: '#60a5fa', fontSize: '10px', marginTop: '2px' }}>✦</div>
              <span style={{ fontSize: '11.5px', color: '#cbd5e1', lineHeight: 1.4 }}>{st.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TaskList({ tasks, onStatusChange, onDelete, onTaskClick }: TaskListProps) {
  const [openGroups, setOpenGroups] = useState<Set<Priority>>(new Set(['high', 'medium', 'low']));
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const toggleGroup = (priority: Priority) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(priority) ? next.delete(priority) : next.add(priority);
      return next;
    });
  };

  const filteredTasks =
    filterStatus === 'all' ? tasks : tasks.filter((t) => t.status === filterStatus);

  const priorities: Priority[] = ['high', 'medium', 'low'];

  return (
    <div
      className="glass"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: '20px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
          📋 Task List
        </h2>
        <select
          id="task-filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="glass-input"
          style={{ fontSize: '12px', padding: '5px 10px', cursor: 'pointer' }}
        >
          <option value="all">All Tasks</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* Groups */}
      <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {priorities.map((priority) => {
          const config = priorityConfig[priority];
          const groupTasks = filteredTasks.filter((t) => t.priority === priority);
          const isOpen = openGroups.has(priority);

          return (
            <div key={priority}>
              {/* Group Header */}
              <button
                id={`group-${priority}`}
                onClick={() => toggleGroup(priority)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: '10px',
                  background: config.bg,
                  border: `1px solid ${config.border}`,
                  cursor: 'pointer',
                  marginBottom: '8px',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '12px' }}>{config.emoji}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: config.color }}>
                  {config.label}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '1px 7px',
                    borderRadius: '20px',
                    background: config.bg,
                    border: `1px solid ${config.border}`,
                    color: config.color,
                    fontWeight: 700,
                  }}
                >
                  {groupTasks.length}
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={config.color}
                  strokeWidth="2"
                  style={{
                    marginLeft: 'auto',
                    transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform 0.25s',
                  }}
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Tasks */}
              {isOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {groupTasks.length === 0 ? (
                    <div
                      style={{
                        padding: '12px',
                        textAlign: 'center',
                        fontSize: '12px',
                        color: '#475569',
                        fontStyle: 'italic',
                      }}
                    >
                      No tasks in this group
                    </div>
                  ) : (
                    groupTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onStatusChange={onStatusChange}
                        onDelete={onDelete}
                        onTaskClick={onTaskClick}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
