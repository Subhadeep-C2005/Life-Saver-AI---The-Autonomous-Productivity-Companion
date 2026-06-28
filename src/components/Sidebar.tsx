'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UITask } from '@/lib/types';

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
};


const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
  },
  {
    id: 'ai-assistant',
    label: 'AI Assistant',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a7 7 0 0 1 7 7c0 3.5-2 6-5 7v2H10v-2c-3-1-5-3.5-5-7a7 7 0 0 1 7-7z" />
        <path d="M9 21h6" />
      </svg>
    ),
  },
];

interface SidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
  onCreateTask: () => void;
  tasks: UITask[];
}

export default function Sidebar({ activeNav, onNavChange, onCreateTask, tasks }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState('Alex Johnson');
  const router = useRouter();

  const handleSignOut = () => {
    localStorage.removeItem('userSession');
    router.push('/login');
  };

  const getAIInsight = () => {
    const completedCount = tasks.filter((t) => t.status === 'done').length;
    if (completedCount > 0) {
      return `You have completed ${completedCount} task${completedCount > 1 ? 's' : ''} today. Keep the momentum!`;
    }
    
    // Find most active category of pending/in-progress tasks
    const activeTasks = tasks.filter((t) => t.status !== 'done');
    if (activeTasks.length > 0) {
      const categories: Record<string, number> = {};
      activeTasks.forEach((t) => {
        const cat = t.tag || 'General';
        categories[cat] = (categories[cat] || 0) + 1;
      });
      let mostActiveCat = 'General';
      let maxCount = 0;
      Object.entries(categories).forEach(([cat, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostActiveCat = cat;
        }
      });
      return `Most of your focus is on ${mostActiveCat} today. You can do this!`;
    }
    
    return "All tasks cleared! Take a moment to celebrate or plan your next goals.";
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('userSession');
      if (session) {
        setUserName(session);
      }
    }
  }, []);



  return (
    <aside
      className="glass sidebar-aside"
      style={{
        width: collapsed ? '72px' : '220px',
        minWidth: collapsed ? '72px' : '220px',
        margin: '20px 0 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 12px',
        gap: '6px',
        transition: 'width 0.3s ease, min-width 0.3s ease',
        borderRadius: '20px',
        overflowX: 'hidden',
      }}
    >
      {/* Logo */}
      <div
        className="logo-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '4px 4px 16px',
          borderBottom: '1px solid var(--glass-border)',
          marginBottom: '8px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        {!collapsed && (
          <div>
            <div className="gradient-text" style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '0.5px', lineHeight: 1.2 }}>
              ⚡ LIFE SAVER AI
            </div>
            <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>
              AI Companion
            </div>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
            style={{
              width: '100%',
              background: 'none',
              border: activeNav === item.id ? '1px solid rgba(124,58,237,0.35)' : '1px solid transparent',
              justifyContent: collapsed ? 'center' : 'flex-start',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
            onClick={() => onNavChange(item.id)}
            title={collapsed ? item.label : undefined}
          >
            <span style={{ flexShrink: 0 }}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Quick Action */}
      {!collapsed && (
        <div
          className="glass-hover quick-action"
          style={{
            marginTop: '8px',
            padding: '12px',
            borderRadius: '12px',
            cursor: 'pointer',
            border: '1px dashed rgba(124,58,237,0.35)',
          }}
          onClick={onCreateTask}
        >
          <div style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 600, marginBottom: '2px' }}>
            🧠 AI Insight
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.5 }}>
            {getAIInsight()}
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        id="sidebar-toggle"
        className="toggle-button"
        onClick={() => setCollapsed(!collapsed)}
        style={{
          marginTop: '8px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          padding: '8px',
          cursor: 'pointer',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s',
          }}
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* User Avatar */}
      <div
        className="user-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: '10px',
          padding: '10px 4px 0',
          borderTop: '1px solid var(--glass-border)',
          marginTop: '4px',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 700,
              color: 'white',
              flexShrink: 0,
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                {userName}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Pro Plan</div>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={handleSignOut}
            className="signout-button"
            title="Sign Out"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#64748b';
              e.currentTarget.style.background = 'none';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        )}
      </div>

      {/* Settings Link — pinned below user profile */}
      <button
        id="nav-settings"
        className={`nav-item ${activeNav === 'settings' ? 'active' : ''}`}
        style={{
          width: '100%',
          background: 'none',
          border: activeNav === 'settings' ? '1px solid rgba(124,58,237,0.35)' : '1px solid transparent',
          justifyContent: collapsed ? 'center' : 'flex-start',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          marginTop: '6px',
        }}
        onClick={() => onNavChange('settings')}
        title={collapsed ? 'Settings' : undefined}
      >
        <span style={{ flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </span>
        {!collapsed && <span>Settings</span>}
      </button>

      {/* Sign Out Button in Collapsed Mode */}
      {collapsed && (
        <button
          onClick={handleSignOut}
          title="Sign Out"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#64748b',
            padding: '8px',
            marginTop: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            width: '100%',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ef4444';
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#64748b';
            e.currentTarget.style.background = 'none';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
        </button>
      )}
    </aside>
  );
}
