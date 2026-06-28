'use client';

import { useState, useEffect } from 'react';
import { UITask } from '@/lib/types';
import { getAnalyticsData } from '@/lib/actions';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface AnalyticsViewProps {
  tasks: UITask[];
}

export default function AnalyticsView({ tasks }: AnalyticsViewProps) {
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<{
    completionRate: number;
    streak: number;
    completedCount: number;
    totalCount: number;
    priorityBreakdown: {
      high: number;
      medium: number;
      low: number;
      highPct: number;
      mediumPct: number;
      lowPct: number;
    };
    workloadData: { day: string; hours: number }[];
  } | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getAnalyticsData();
        setAnalyticsData(res);
      } catch (err) {
        console.error("Failed to load analytics data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [tasks]);

  if (loading || !analyticsData) {
    return (
      <div
        className="glass animate-fade-in-up"
        style={{
          flex: 1,
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-primary)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1"/>
          </svg>
          <span style={{ fontSize: '15px', fontWeight: 600 }}>Analyzing workload metrics...</span>
        </div>
      </div>
    );
  }

  const {
    completionRate,
    streak,
    completedCount,
    totalCount,
    priorityBreakdown,
    workloadData,
  } = analyticsData;

  const donutData = [
    { name: 'High', value: priorityBreakdown.high, color: '#ef4444' },
    { name: 'Medium', value: priorityBreakdown.medium, color: '#f59e0b' },
    { name: 'Low', value: priorityBreakdown.low, color: '#10b981' }
  ].filter(d => d.value > 0);

  const hasBurnout = workloadData.some(d => d.hours > 10);

  return (
    <div
      className="glass animate-fade-in-up"
      style={{
        flex: 1,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>📊 Productivity Analytics</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Real-time workload metrics and cognitive resource performance.
        </p>
      </div>

      <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.06)' }} />

      {/* Row 1: Streak Board & General Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {/* Streak card */}
        <div
          className="glass-hover"
          style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(245,158,11,0.08))',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          {/* Pulsing Flame Icon */}
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(245,158,11,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(245,158,11,0.2)',
              animation: 'float 3s ease-in-out infinite',
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="#f59e0b" stroke="#ef4444" strokeWidth="1.5">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
              Completion Streak
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {streak} Days
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {completedCount > 0 ? '🔥 Keep it burning! Complete a task today.' : 'Complete any task to start a streak!'}
            </div>
          </div>
        </div>

        {/* Completion rate card */}
        <div
          className="glass-hover"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Task Completion Rate</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#34d399' }}>{completionRate}%</span>
          </div>
          <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div
              style={{
                width: `${completionRate}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #7c3aed, #10b981)',
                borderRadius: '4px',
                transition: 'width 1s ease-out',
              }}
            />
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Completed {completedCount} out of {totalCount} total database tasks.
          </div>
        </div>
      </div>

      {/* Row 2: Charts Split */}
      <div
        className="split-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          flex: 1,
        }}
      >
        {/* Priority Donut Chart */}
        <div
          className="glass"
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: 'rgba(0,0,0,0.1)',
            minHeight: '320px',
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', alignSelf: 'flex-start' }}>
            🎯 Tasks by Priority
          </h3>
          
          {totalCount === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '13px' }}>
              No tasks found in database.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, width: '100%' }}>
              <div style={{ position: 'relative', width: '100%', height: '180px' }}>
                {isMounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {donutData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(15, 23, 42, 0.9)',
                          borderColor: 'var(--glass-border)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {/* Center count label */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none'
                  }}
                >
                  <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>{totalCount}</span>
                  <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>Tasks</span>
                </div>
              </div>

              {/* Legends */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>High: <strong>{priorityBreakdown.high}</strong> ({Math.round(priorityBreakdown.highPct)}%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Medium: <strong>{priorityBreakdown.medium}</strong> ({Math.round(priorityBreakdown.mediumPct)}%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Low: <strong>{priorityBreakdown.low}</strong> ({Math.round(priorityBreakdown.lowPct)}%)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Daily Estimated Hours Bar Chart */}
        <div
          className="glass"
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: 'rgba(0,0,0,0.1)',
            minHeight: '320px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              📅 Workload: Est. Hours per Day
            </h3>
          </div>

          {/* Burnout Detection Warning Badge */}
          {hasBurnout && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#ef4444',
              fontWeight: 600,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '6px 12px',
              borderRadius: '8px',
              animation: 'pulse 2s infinite',
            }}>
              ⚠️ Overload detected this week. Consider rescheduling.
            </div>
          )}

          <div style={{ flex: 1, width: '100%', minHeight: '180px' }}>
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWorkload" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    tickFormatter={(tick) => tick.substring(0, 3)}
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.9)',
                      borderColor: 'var(--glass-border)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                    {workloadData.map((entry, idx) => {
                      // Burnout Detection threshold: > 10 hours
                      const fill = entry.hours > 10 ? '#ef4444' : 'url(#colorWorkload)';
                      return <Cell key={`cell-${idx}`} fill={fill} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
