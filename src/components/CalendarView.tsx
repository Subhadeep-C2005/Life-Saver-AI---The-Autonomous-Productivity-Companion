'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { UITask } from '@/lib/types';
import { autoPlanWeek } from '@/lib/actions';

interface CalendarViewProps {
  tasks: UITask[];
  onTaskClick: (task: UITask) => void;
}

export default function CalendarView({ tasks, onTaskClick }: CalendarViewProps) {
  const [isPending, startTransition] = useTransition();
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const router = useRouter();

  const handleAutoPlan = () => {
    startTransition(async () => {
      await autoPlanWeek();
      router.refresh();
    });
  };

  // Calculate dynamic week dates starting from Monday shifted by weekOffset
  const getWeekDates = (offset: number) => {
    const currentDate = new Date();
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1) + (offset * 7);
    const monday = new Date(currentDate);
    monday.setDate(diff);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(monday);
      nextDate.setDate(monday.getDate() + i);
      dates.push(nextDate);
    }
    return dates;
  };

  const weekDates = getWeekDates(weekOffset);

  const startOfWeek = new Date(weekDates[0]);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(weekDates[6]);
  endOfWeek.setHours(23, 59, 59, 999);

  // Exclude completed tasks
  const activeTasks = tasks.filter(t => t.status?.toLowerCase() !== 'done');

  // Filter displayed scheduled blocks to only show tasks whose deadlines fall within the currently viewed week
  const tasksInCurrentWeek = activeTasks.filter(t => {
    const deadlineDate = safeParseDate(t.deadline);
    return deadlineDate >= startOfWeek && deadlineDate <= endOfWeek;
  });

  // Build the grid blocks from subtasks with layout positioning for overlaps
  const scheduledSubtasks = getPositionedBlocks(tasksInCurrentWeek);

  const isToday = (date: Date) => {
    const now = new Date();
    return date.toDateString() === now.toDateString();
  };

  const hours = Array.from({ length: 9 }, (_, i) => i + 9); // 9 to 17 (5 PM)

  const middleDate = weekDates[3];
  const monthYearLabel = middleDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="glass" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>🗓 Weekly Schedule</h2>
        <button 
          onClick={handleAutoPlan}
          disabled={isPending}
          className="btn-gradient"
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: isPending ? 0.7 : 1,
            cursor: isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {isPending ? (
            <>
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1"/>
              </svg>
              Planning...
            </>
          ) : (
            <>✨ Auto-Plan My Week</>
          )}
        </button>
      </div>

      {/* Sleek Week Navigation Control Header */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '16px',
          background: 'rgba(255,255,255,0.02)',
          padding: '8px 16px',
          borderRadius: '12px',
          border: '1px solid var(--glass-border)',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setWeekOffset(prev => prev - 1)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--glass-bg)'; }}
          >
            &lt; Previous
          </button>
          <button
            onClick={() => setWeekOffset(prev => prev + 1)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--glass-bg)'; }}
          >
            Next &gt;
          </button>
        </div>
        
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
          {monthYearLabel}
        </span>
        
        {weekOffset !== 0 ? (
          <button
            onClick={() => setWeekOffset(0)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'none',
              border: 'none',
              color: 'var(--accent-purple)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Today
          </button>
        ) : (
          <div style={{ width: '56px' }} />
        )}
      </div>

      <div className="w-full overflow-x-auto custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', background: 'rgba(0,0,0,0.15)', position: 'relative', overflowY: 'auto' }}>
          <div className="min-w-[800px]" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {/* Calendar header row */}
          <div
            style={{
              display: 'flex',
              flexShrink: 0,
              position: 'sticky',
              top: 0,
              zIndex: 30,
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--glass-border)',
            }}
          >
            <div style={{ width: '60px', padding: '10px', flexShrink: 0 }} /> {/* Time column */}
            {weekDates.map((date, index) => {
              const todayFlag = isToday(date);
              const dayShort = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              return (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    padding: '10px',
                    textAlign: 'center',
                    borderLeft: '1px solid var(--glass-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    background: todayFlag ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
                  }}
                >
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: todayFlag ? 'var(--accent-purple)' : 'var(--text-primary)',
                    }}
                  >
                    {dayShort}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      color: todayFlag ? 'var(--accent-purple)' : 'var(--text-secondary)',
                      opacity: todayFlag ? 0.9 : 0.7,
                    }}
                  >
                    {dateStr}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Grid body: time labels + day columns */}
          <div style={{ display: 'flex', position: 'relative' }}>
            {/* Time labels column */}
            <div style={{ width: '60px', flexShrink: 0 }}>
              {hours.map(hour => (
                <div key={hour} style={{ height: '100px', padding: '10px 6px 0', fontSize: '10px', color: '#64748b', textAlign: 'right', boxSizing: 'border-box' }}>
                  {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDates.map((date, dayColIndex) => {
              const todayFlag = isToday(date);
              // collect blocks for this day
              const dayBlocks = scheduledSubtasks.filter(block => {
                const taskDate = block.start;
                const dayIndex = (taskDate.getDay() + 6) % 7;
                return dayIndex === dayColIndex;
              });
              return (
                <div
                  key={dayColIndex}
                  style={{
                    flex: 1,
                    borderLeft: '1px solid rgba(255,255,255,0.1)',
                    position: 'relative',
                    height: '900px',
                    background: todayFlag ? 'rgba(124, 58, 237, 0.025)' : 'transparent',
                  }}
                >
                  {/* Hour grid lines */}
                  {hours.map(hour => (
                    <div key={hour} style={{ position: 'absolute', top: `${(hour - 9) * 100}px`, left: 0, right: 0, height: '100px', borderBottom: '1px solid rgba(255,255,255,0.04)' }} />
                  ))}
                  {/* Render blocks for this day */}
                  {dayBlocks.map((block) => {
                    const startHour = block.start.getHours();
                    const startMin = block.start.getMinutes();
                    const endHour = block.end.getHours();
                    const endMin = block.end.getMinutes();

                    // Clamp to visible 9-17 window — don't silently drop, just pin to top
                    const clampedStartHour = Math.min(Math.max(startHour, 9), 16);
                    const clampedStartMin = startHour < 9 ? 0 : startMin;

                    const TOTAL_HEIGHT = 900;
                    const PX_PER_HOUR = TOTAL_HEIGHT / 9; // 100px

                    const startMinFromNine = (clampedStartHour - 9) * 60 + clampedStartMin;
                    const rawDurationMin = (endHour - startHour) * 60 + (endMin - startMin);
                    const durationMin = Math.max(60, isNaN(rawDurationMin) ? 90 : rawDurationMin);

                    const rawTop = (startMinFromNine / 60) * PX_PER_HOUR;
                    const rawHeight = (durationMin / 60) * PX_PER_HOUR;

                    const topPx = isNaN(rawTop) ? 20 : rawTop;
                    const heightPx = Math.max(48, isNaN(rawHeight) ? 96 : rawHeight);

                    const cols = block.totalColumns || 1;
                    const colIdx = block.colIndex || 0;
                    const colWidth = 100 / cols;

                    return (
                      <div
                        key={block.id}
                        className={`calendar-block ${block.priority === 'high' ? 'high-priority' : block.priority === 'medium' ? 'medium-priority' : 'low-priority'}`}
                        onClick={() => onTaskClick(block.task)}
                        title={`${block.parentTitle}: ${block.title}`}
                        style={{
                          position: 'absolute',
                          top: `${topPx}px`,
                          height: `${heightPx}px`,
                          minHeight: '48px',
                          left: `${colIdx * colWidth + 1}%`,
                          width: `${colWidth - 2}%`,
                          padding: '5px 7px',
                          zIndex: 10,
                          animation: 'fadeIn 0.3s ease-out',
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden',
                          gap: '1px',
                          cursor: 'pointer',
                          isolation: 'isolate',
                          borderRadius: '5px',
                        }}
                      >
                        <div style={{
                          fontWeight: 700,
                          fontSize: '10px',
                          lineHeight: 1.1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          color: 'inherit',
                        }}>
                          {block.title}
                        </div>
                        <div style={{
                          fontSize: '9px',
                          lineHeight: 1.1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          opacity: 0.85,
                          flexShrink: 0,
                          color: 'inherit',
                        }}>
                          {block.parentTitle}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {isPending && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
              <div className="animate-pulse" style={{ color: '#a78bfa', fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1"/>
                </svg>
                Calculating Optimal Schedule...
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

interface CalendarBlock {
  id: string;
  title: string;
  parentTitle: string;
  start: Date;
  end: Date;
  color: string;
  priority: string;
  colIndex: number;
  totalColumns: number;
  task: UITask;
}

function getPositionedBlocks(tasks: UITask[]): CalendarBlock[] {
  // Build a fallback date based on parent deadline date for tasks with no scheduled subtasks
  const buildFallbackSlot = (index: number, baseDate?: Date): { start: Date; end: Date } => {
    const d = baseDate ? new Date(baseDate) : new Date();
    d.setHours(10 + (index % 4) * 2, 0, 0, 0); // 10, 12, 14, 16 AM cycling
    const e = new Date(d);
    e.setHours(d.getHours() + 1, 30, 0, 0);
    return { start: d, end: e };
  };

  // Extract all scheduled subtasks, injecting a fallback block for tasks
  // whose subtasks have no scheduledStart (so they always appear on the grid).
  let fallbackIndex = 0;
  const rawBlocks = tasks.flatMap(t => {
    const taskDeadline = safeParseDate(t.deadline);
    const scheduledSubtasks = t.subtasks.filter(st => st.scheduledStart && st.scheduledEnd);

    if (scheduledSubtasks.length > 0) {
      return scheduledSubtasks.map(st => {
        const start = safeParseDate(st.scheduledStart);
        const end = safeParseDate(st.scheduledEnd);
        // Guard against invalid dates
        const safeStart = isNaN(start.getTime()) || !st.scheduledStart ? buildFallbackSlot(fallbackIndex++, taskDeadline).start : start;
        const safeEnd = isNaN(end.getTime()) || !st.scheduledEnd ? new Date(safeStart.getTime() + 90 * 60000) : end;
        return {
          id: st.id,
          title: st.title,
          parentTitle: t.title,
          start: safeStart,
          end: safeEnd,
          color: t.priority === 'high' ? '#ef4444' : t.priority === 'medium' ? '#f59e0b' : '#10b981',
          priority: t.priority,
          task: t,
          colIndex: 0,
          totalColumns: 1,
        };
      });
    } else {
      // No scheduled subtasks: show the task itself as a fallback block
      const slot = buildFallbackSlot(fallbackIndex++, taskDeadline);
      return [{
        id: `task-fallback-${t.id}`,
        title: t.title,
        parentTitle: t.tag || 'Task',
        start: slot.start,
        end: slot.end,
        color: t.priority === 'high' ? '#ef4444' : t.priority === 'medium' ? '#f59e0b' : '#10b981',
        priority: t.priority,
        task: t,
        colIndex: 0,
        totalColumns: 1,
      }];
    }
  });

  const positionedBlocks: CalendarBlock[] = [];

  // Group by day of week (0 to 6: Monday to Sunday)
  for (let adjustedDay = 0; adjustedDay < 7; adjustedDay++) {
    const dayBlocks = rawBlocks.filter(block => {
      const taskDate = block.start;
      const dayIndex = (taskDate.getDay() + 6) % 7;
      return dayIndex === adjustedDay;
    });

    if (dayBlocks.length === 0) continue;

    // Sort: earliest start time first. If equal start time, longer duration first.
    dayBlocks.sort((a, b) => {
      const startDiff = a.start.getTime() - b.start.getTime();
      if (startDiff !== 0) return startDiff;
      return b.end.getTime() - a.end.getTime(); // longer first
    });

    // 1. Assign columns to each block
    const columns: (typeof dayBlocks)[] = [];
    const blockPositions = dayBlocks.map(block => {
      let colIndex = 0;
      let placed = false;

      // Find first column where this block doesn't overlap with the last block in that column
      for (let i = 0; i < columns.length; i++) {
        const lastBlockInCol = columns[i][columns[i].length - 1];
        if (block.start.getTime() >= lastBlockInCol.end.getTime()) {
          columns[i].push(block);
          colIndex = i;
          placed = true;
          break;
        }
      }

      if (!placed) {
        columns.push([block]);
        colIndex = columns.length - 1;
      }

      return {
        ...block,
        colIndex,
        totalColumns: 1
      };
    });

    // 2. Group overlapping sets to calculate max column count per overlapping cluster
    let groupMaxEnd = 0;
    let currentGroup: typeof blockPositions = [];

    for (const b of blockPositions) {
      if (currentGroup.length === 0 || b.start.getTime() < groupMaxEnd) {
        currentGroup.push(b);
        groupMaxEnd = Math.max(groupMaxEnd, b.end.getTime());
      } else {
        // Resolve previous group
        const groupCols = Math.max(...currentGroup.map(x => x.colIndex)) + 1;
        for (const x of currentGroup) {
          x.totalColumns = groupCols;
        }
        // Start new group
        currentGroup = [b];
        groupMaxEnd = b.end.getTime();
      }
    }

    if (currentGroup.length > 0) {
      const groupCols = Math.max(...currentGroup.map(x => x.colIndex)) + 1;
      for (const x of currentGroup) {
        x.totalColumns = groupCols;
      }
    }

    positionedBlocks.push(...blockPositions);
  }

  return positionedBlocks;
}

function safeParseDate(dateStr: string | Date | undefined | null): Date {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  
  if (typeof dateStr === 'string') {
    let sanitized = dateStr.trim();
    if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/.test(sanitized)) {
      sanitized = sanitized.replace(' ', 'T');
    }
    const d = new Date(sanitized);
    if (!isNaN(d.getTime())) return d;
  }
  
  const fallback = new Date(dateStr);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

