'use client';

import { useState, useEffect, useRef } from 'react';
import { UITask } from '@/lib/types';
import AIChat from '@/components/AIChat';

interface FocusModeOverlayProps {
  task: UITask | undefined;
  onClose: () => void;
}

export default function FocusModeOverlay({ task, onClose }: FocusModeOverlayProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [checkedSubtasks, setCheckedSubtasks] = useState<Set<string>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync subtask states from task prop
  useEffect(() => {
    if (task && task.subtasks) {
      setCheckedSubtasks(new Set(task.subtasks.filter((st) => st.isDone).map((st) => st.id)));
    }
  }, [task]);

  // 1. Timer Logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            // Simple visual/audio alert
            alert("⏰ Pomodoro session complete! Take a break.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 2. SVG Timer Progress (Radius = 70, Circ = 2 * PI * R = 439.8)
  const radius = 70;
  const circ = 2 * Math.PI * radius;
  const progressOffset = circ - (timeLeft / (25 * 60)) * circ;

  // 3. Subtask checkbox toggling
  const handleToggleSubtask = async (id: string) => {
    const isNowChecked = !checkedSubtasks.has(id);
    setCheckedSubtasks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    try {
      const { toggleSubtask } = await import('@/lib/actions');
      await toggleSubtask(id, isNowChecked);
    } catch (err) {
      console.error('Failed to toggle subtask status:', err);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(5, 11, 24, 0.96)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        display: 'flex',
        flexDirection: 'column',
        padding: '30px 40px',
        animation: 'fadeInUp 0.3s ease',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes timerPulse {
          0% {
            filter: drop-shadow(0 0 2px rgba(124, 58, 237, 0.4));
            stroke-width: 8px;
          }
          50% {
            filter: drop-shadow(0 0 10px rgba(124, 58, 237, 0.8)) drop-shadow(0 0 16px rgba(37, 99, 235, 0.5));
            stroke-width: 9.5px;
          }
          100% {
            filter: drop-shadow(0 0 2px rgba(124, 58, 237, 0.4));
            stroke-width: 8px;
          }
        }
        .timer-pulse-active {
          animation: timerPulse 2s infinite ease-in-out;
        }
      `}} />
      {/* Top Bar Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(124, 58, 237, 0.2)',
              border: '1px solid rgba(124, 58, 237, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '15px' }}>🎯</span>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#f1f5f9' }}>DEEP WORK FOCUS MODE</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Distraction-Free Workspace</div>
          </div>
        </div>

        {/* Exit Focus button */}
        <button
          onClick={onClose}
          style={{
            padding: '8px 18px',
            borderRadius: '10px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
          }}
        >
          Exit Focus
        </button>
      </header>

      {/* Main Split Grid */}
      <div
        className="split-grid"
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '30px',
          minHeight: 0,
          alignItems: 'stretch',
        }}
      >
        {/* Left Side: Active Task & Checklist */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            overflowY: 'auto',
          }}
        >
          {task ? (
            <div
              className="glass"
              style={{
                padding: '30px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div>
                <span className="tag-pill" style={{ borderColor: 'rgba(124, 58, 237, 0.4)', color: '#a78bfa' }}>
                  {task.tag}
                </span>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#f1f5f9', marginTop: '10px' }}>
                  {task.title}
                </h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px', lineHeight: 1.5 }}>
                  {task.description || 'No description provided.'}
                </p>
              </div>

              <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.06)' }} />

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#a78bfa', marginBottom: '12px' }}>
                  📋 Action Checklist
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {task.subtasks.map((st) => {
                    const isChecked = checkedSubtasks.has(st.id);
                    return (
                      <div
                        key={st.id}
                        onClick={() => handleToggleSubtask(st.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          background: isChecked ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)',
                          border: isChecked ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.06)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {/* Custom Checkbox */}
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '4px',
                            border: isChecked ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.3)',
                            background: isChecked ? '#10b981' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {isChecked && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          )}
                        </div>
                        <span
                          className={`text-lg transition-all duration-300 ${isChecked ? 'line-through text-slate-500' : ''}`}
                          style={{
                            color: isChecked ? undefined : '#e2e8f0',
                          }}
                        >
                          {st.title}
                        </span>
                      </div>
                    );
                  })}
                  {task.subtasks.length === 0 && (
                    <div style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '10px' }}>
                      No subtasks generated for this task.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="glass"
              style={{
                padding: '40px',
                textAlign: 'center',
                color: '#64748b',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div style={{ fontSize: '32px' }}>💤</div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', marginTop: '10px' }}>
                No Active Task Selection
              </h2>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>
                Please select a task on the dashboard to focus on, or exit focus mode.
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Pomodoro Timer & Floating Chat */}
        <div
          className="overflow-y-auto custom-scrollbar"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            gap: '24px',
            alignItems: 'stretch',
            position: 'relative',
            minHeight: 0,
          }}
        >
          {/* Pomodoro Timer Widget */}
          <div
            className="glass"
            style={{
              padding: '24px 40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              width: '100%',
              background: 'rgba(0,0,0,0.15)',
            }}
          >
            {/* SVG Ring Timer */}
            <div className="shadow-[0_0_40px_rgba(99,102,241,0.4)]" style={{ position: 'relative', width: '280px', height: '280px', borderRadius: '50%' }}>
              <svg width="100%" height="100%" viewBox="0 0 160 160">
                {/* Background Ring */}
                <circle cx="80" cy="80" r="70" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                
                {/* Progress Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="transparent"
                  stroke="url(#timer-gradient)"
                  strokeWidth="8"
                  strokeDasharray={circ}
                  strokeDashoffset={progressOffset}
                  strokeLinecap="round"
                  className={isRunning ? 'timer-pulse-active' : ''}
                  style={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%',
                    transition: isRunning ? 'none' : 'stroke-dashoffset 0.3s ease',
                  }}
                />
                
                <defs>
                  <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Time display text */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  className="text-7xl font-mono font-bold tracking-tight"
                  style={{
                    color: '#f1f5f9',
                    lineHeight: 1,
                  }}
                >
                  {formatTime(timeLeft)}
                </span>
                <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', marginTop: '2px' }}>
                  {isRunning ? 'Focusing' : 'Paused'}
                </span>
              </div>
            </div>

            {/* Timer Controls */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={toggleTimer}
                className="btn-gradient"
                style={{
                  padding: '8px 24px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  boxShadow: isRunning ? 'none' : '0 4px 12px rgba(124,58,237,0.3)',
                  background: isRunning ? 'rgba(255,255,255,0.06)' : undefined,
                  border: isRunning ? '1px solid rgba(255,255,255,0.1)' : undefined,
                  color: isRunning ? '#e2e8f0' : undefined,
                }}
              >
                {isRunning ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={resetTimer}
                style={{
                  padding: '8px 24px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#94a3b8',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Floating AI Chat Bubble */}
          <div
            style={{
              width: '100%',
              flexShrink: 0,
              minHeight: '450px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              borderRadius: '16px',
              overflow: 'visible',
            }}
          >
            <AIChat />
          </div>
        </div>
      </div>
    </div>
  );
}
