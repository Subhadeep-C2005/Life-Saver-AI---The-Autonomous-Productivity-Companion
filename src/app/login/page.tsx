'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    let displayName = cleanName;
    if (cleanName.includes('@')) {
      const part = cleanName.split('@')[0];
      displayName = part.charAt(0).toUpperCase() + part.slice(1);
    }

    localStorage.setItem('userSession', displayName);
    window.location.href = '/dashboard';
  };

  return (
    <>
      <div className="mesh-bg" aria-hidden="true" />
      
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          gap: '20px',
        }}
      >
        <div
          className="glass animate-fade-in-up"
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '40px 30px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          {/* Brand Logo Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div style={{ marginTop: '4px' }}>
              <div className="gradient-text" style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.5px' }}>
                ⚡ LIFE SAVER AI
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, letterSpacing: '1px', marginTop: '2px' }}>
                AI PRODUCTIVITY COMPANION
              </div>
            </div>
          </div>

          <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.06)' }} />

          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9' }}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              {isSignUp ? 'Sign up to start saving time.' : 'Enter credentials to start your autonomous focus session.'}
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="login-username" style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>
                {isSignUp ? 'Your Name or Email' : 'Email or Username'}
              </label>
              <input
                id="login-username"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isSignUp ? 'e.g. Alex Johnson' : 'judge@demo.com'}
                className="glass-input"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="login-password" style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="glass-input"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: '13px',
                }}
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn-gradient"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                fontSize: '13px',
                marginTop: '8px',
              }}
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: '13px' }}>
            <span style={{ color: '#64748b' }}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              style={{
                background: 'none',
                border: 'none',
                color: '#a78bfa',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline',
              }}
            >
              {isSignUp ? 'Sign In' : 'Create Account'}
            </button>
          </div>

        </div>

        {/* Quick Test Card */}
        <div
          className="glass animate-fade-in-up"
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            animationDelay: '0.1s',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.5px' }}>
            ⚡ QUICK TEST
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>
            Click one of the credentials below to auto-fill the demo login details instantly:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { email: 'judge@demo.com', pass: 'hackathon' },
              { email: 'test@user.com', pass: '123456' },
            ].map((cred, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setName(cred.email);
                  setPassword(cred.pass);
                  setIsSignUp(false);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: '#e2e8f0',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                }}
              >
                <span style={{ color: '#c4b5fd', fontWeight: 600 }}>Email: {cred.email}</span>
                <span style={{ color: '#94a3b8', marginTop: '2px' }}>Pass: {cred.pass}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
