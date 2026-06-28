'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <>
      {/* Background Mesh */}
      <div className="mesh-bg" aria-hidden="true" />
      
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          color: '#f1f5f9',
          overflowY: 'auto',
        }}
      >
        {/* Navigation Bar */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 40px',
            maxWidth: '1200px',
            width: '100%',
            margin: '0 auto',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(124,58,237,0.5)',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="gradient-text" style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.5px' }}>
                ⚡ LIFE SAVER AI
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, letterSpacing: '1px' }}>
                AI PRODUCTIVITY
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '80px 20px 40px',
            maxWidth: '900px',
            width: '100%',
            margin: '0 auto',
            gap: '24px',
          }}
        >
          <h1
            className="animate-fade-in-up"
            style={{
              fontSize: 'min(56px, 10vw)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
              color: '#f8fafc',
            }}
          >
            Your Autonomous Agent <br />
            for <span className="gradient-text">Deadlines & Focus</span>
          </h1>

          <p
            className="animate-fade-in-up"
            style={{
              fontSize: 'min(18px, 4.5vw)',
              color: '#94a3b8',
              lineHeight: 1.6,
              maxWidth: '680px',
              animationDelay: '0.1s',
            }}
          >
            Beat deadline stress with our AI Companion. Life Saver AI uses advanced AI to analyze task complexity, build actionable checklists, auto-plan schedules, and host distraction-free focus zones.
          </p>

          <div
            className="animate-fade-in-up"
            style={{
              marginTop: '12px',
              animationDelay: '0.2s',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Link
              id="landing-login-btn"
              href="/login"
              className="btn-gradient"
              style={{
                padding: '16px 40px',
                borderRadius: '14px',
                fontSize: '16px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 20px rgba(124,58,237,0.5)',
              }}
            >
              Launch Live Demo 🚀
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section
          id="features-section"
          style={{
            maxWidth: '1200px',
            width: '100%',
            margin: '60px auto 100px',
            padding: '0 40px',
            scrollMarginTop: '60px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px',
            }}
          >
            {[
              {
                icon: '🗓️',
                title: 'AI Calendar Planner',
                desc: 'Gemini structures subtasks and schedules them into optimal, non-overlapping weekly time slots from 9 AM to 5 PM automatically.',
              },
              {
                icon: '🎙️',
                title: 'Voice Assistant Chat',
                desc: 'Speak naturally to add tasks: "Remind me to finish slides tomorrow at 7 PM" and watch it instantly populate with full checklists.',
              },
              {
                icon: '📊',
                title: 'Workload Analytics',
                desc: 'Beautiful SVG charts break down task priority allocations and daily work estimations so you remain on track to finish.',
              },
              {
                icon: '🧠',
                title: 'Deep Work Focus Mode',
                desc: 'Launch a full-screen distraction-free Pomodoro workspace with an active check-off grid and floating voice unblocking chat.',
              },
            ].map((feat, i) => (
              <div
                key={feat.title}
                className="glass glass-hover animate-fade-in-up"
                style={{
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  animationDelay: `${0.3 + i * 0.1}s`,
                }}
              >
                <div
                  style={{
                    fontSize: '28px',
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {feat.icon}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9' }}>{feat.title}</h3>
                <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            marginTop: 'auto',
            padding: '30px 40px',
            borderTop: '1px solid rgba(255,255,255,0.04)',
            textAlign: 'center',
            fontSize: '12px',
            color: '#475569',
            maxWidth: '1200px',
            width: '100%',
            margin: '0 auto',
          }}
        >
          Created for Next-Gen AI Hackathon presentation.
          <br />
          <span style={{ color: '#334155', fontSize: '11px' }}>© 2026 Life Saver AI. All rights reserved.</span>
        </footer>
      </div>
    </>
  );
}
