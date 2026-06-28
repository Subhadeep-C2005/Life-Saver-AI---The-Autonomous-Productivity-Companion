'use client';

import { useState, useEffect } from 'react';

export default function SettingsView() {
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('system');
  const [personality, setPersonality] = useState<'supportive' | 'professional' | 'drill_sergeant'>('supportive');
  const [saved, setSaved] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = (localStorage.getItem('theme') || 'system') as 'dark' | 'light' | 'system';
      setTheme(storedTheme);
      
      const storedPersonality = localStorage.getItem('aiPersonality') || 'supportive';
      if (storedPersonality === 'Supportive Companion') {
        setPersonality('supportive');
        localStorage.setItem('aiPersonality', 'supportive');
      } else if (storedPersonality === 'Professional Assistant') {
        setPersonality('professional');
        localStorage.setItem('aiPersonality', 'professional');
      } else if (storedPersonality === 'Drill Sergeant') {
        setPersonality('drill_sergeant');
        localStorage.setItem('aiPersonality', 'drill_sergeant');
      } else {
        setPersonality(storedPersonality as 'supportive' | 'professional' | 'drill_sergeant');
      }
      
      const storedNotifs = localStorage.getItem('notificationsEnabled') || localStorage.getItem('notifications');
      if (storedNotifs !== null) {
        setNotifications(storedNotifs === 'true');
      }
    }
  }, []);

  const applyTheme = (themeValue: 'dark' | 'light' | 'system') => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    root.classList.remove('light-theme', 'dark-theme', 'dark');
    
    let resolvedTheme = themeValue;
    if (themeValue === 'system') {
      resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    if (resolvedTheme === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.add('dark-theme');
      root.classList.add('dark');
    }
  };

  const selectTheme = (t: 'dark' | 'light' | 'system') => {
    setTheme(t);
    applyTheme(t);
    localStorage.setItem('theme', t);
  };

  const selectPersonality = (p: 'supportive' | 'professional' | 'drill_sergeant') => {
    setPersonality(p);
    localStorage.setItem('aiPersonality', p);
  };

  const handleSave = () => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('aiPersonality', personality);
    localStorage.setItem('notifications', String(notifications));
    localStorage.setItem('notificationsEnabled', String(notifications));
    applyTheme(theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const showErrorToast = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 4000);
  };

  const handleToggleNotifications = async () => {
    const nextState = !notifications;
    
    if (nextState) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            setNotifications(true);
            localStorage.setItem('notificationsEnabled', 'true');
            localStorage.setItem('notifications', 'true');
            new Notification('🚀 Life Saver', {
              body: "Notifications are live! We'll keep you on track.",
            });
          } else {
            setNotifications(false);
            localStorage.setItem('notificationsEnabled', 'false');
            localStorage.setItem('notifications', 'false');
            showErrorToast("Notification permission denied by browser.");
          }
        } catch (err) {
          console.error("Notification request failed:", err);
          setNotifications(false);
          localStorage.setItem('notificationsEnabled', 'false');
          localStorage.setItem('notifications', 'false');
          showErrorToast("Notification request failed or was blocked.");
        }
      } else {
        setNotifications(false);
        showErrorToast("Notifications are not supported in this browser.");
      }
    } else {
      setNotifications(false);
      localStorage.setItem('notificationsEnabled', 'false');
      localStorage.setItem('notifications', 'false');
    }
  };

  return (
    <div
      className="glass animate-fade-in-up"
      style={{
        flex: 1,
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        maxWidth: '800px',
      }}
    >
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>⚙️ Settings</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Configure your personal preferences, workspace theme, and AI companion personality.
        </p>
      </div>

      {/* Preferences Card */}
      <div
        className="glass animate-fade-in-up"
        style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
        }}
      >
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#a78bfa' }}>Preferences</h3>
        
        {/* Toggle Switch notifications */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Push Notifications</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Receive reminders and intelligence reports in your browser.
            </div>
          </div>
          <button
            onClick={handleToggleNotifications}
            style={{
              width: '46px',
              height: '24px',
              borderRadius: '20px',
              background: notifications ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : 'rgba(255,255,255,0.1)',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.3s ease',
            }}
          >
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'white',
                position: 'absolute',
                top: '3px',
                left: notifications ? '25px' : '3px',
                transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
          </button>
        </div>

        {/* Theme Button Group */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Theme Selection</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Choose a custom appearance for your dashboard experience.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            {(['dark', 'light', 'system'] as const).map((t) => {
              const isActive = theme === t;
              return (
                <button
                  key={t}
                  onClick={() => selectTheme(t)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    background: isActive ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : 'rgba(255, 255, 255, 0.04)',
                    border: isActive ? '2px solid var(--accent-purple)' : '2px solid var(--glass-border)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    transition: 'all 0.2s',
                    boxShadow: isActive ? '0 0 12px rgba(124, 58, 237, 0.45)' : 'none',
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Configuration Card */}
      <div
        className="glass animate-fade-in-up"
        style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          animationDelay: '0.1s',
        }}
      >
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#a78bfa' }}>AI Assistant Settings</h3>
        
        {/* AI Personality Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>AI Personality Mode</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Choose how your productivity companion talks to you and structures your tasks.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
            {([
              { key: 'supportive', label: 'Supportive Companion' },
              { key: 'professional', label: 'Professional Assistant' },
              { key: 'drill_sergeant', label: 'Drill Sergeant (Tough Love)' },
            ] as const).map(({ key, label }) => {
              const isActive = personality === key;
              return (
                <button
                  key={key}
                  onClick={() => selectPersonality(key)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: isActive ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : 'rgba(255, 255, 255, 0.04)',
                    border: isActive ? '2px solid var(--accent-purple)' : '2px solid var(--glass-border)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    transition: 'all 0.2s',
                    boxShadow: isActive ? '0 0 12px rgba(124, 58, 237, 0.45)' : 'none',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={handleSave}
          style={{
            padding: '10px 24px',
            borderRadius: '10px',
            fontSize: '13px',
            background: saved ? '#10b981' : 'linear-gradient(135deg, #7c3aed, #2563eb)',
            color: 'white',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: saved ? '0 4px 15px rgba(16, 185, 129, 0.4)' : '0 4px 15px rgba(124, 58, 237, 0.4)',
          }}
        >
          {saved ? '✅ Saved!' : 'Save Changes'}
        </button>
        {saved && (
          <span style={{ fontSize: '13px', color: '#34d399', fontWeight: 500, animation: 'fadeIn 0.2s' }}>
            ✓ Configuration saved successfully!
          </span>
        )}
      </div>

      {errorToast && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(239, 68, 68, 0.9)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          fontSize: '13px',
          fontWeight: 600,
          animation: 'fadeInUp 0.2s ease',
        }}>
          ⚠️ {errorToast}
        </div>
      )}
    </div>
  );
}
