import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

/* ─── inline design tokens — works without CSS vars on this page ─── */
const light = {
  bgPrimary: '#FAFAF8',
  bgSecondary: '#F4F3EF',
  bgTertiary: '#EEECEA',
  bgCard: '#FFFFFF',
  textPrimary: '#1A1A18',
  textSecondary: '#6B6B66',
  textTertiary: '#A8A8A2',
  border: 'rgba(0,0,0,0.08)',
  borderStrong: 'rgba(0,0,0,0.14)',
  blue: { bg: '#D6E4F7', text: '#2563A8' },
  green: { bg: '#D4EDD8', text: '#2D6E38' },
  amber: { bg: '#F5E6C8', text: '#8A5C0A' },
  pink: { bg: '#F5DDE8', text: '#8A2D54' },
  purple: { bg: '#E5E0F8', text: '#4A3DAA' },
}

/* ─── nav ─── */
function Nav({ onLogin, onStart, onDashboard, isLoggedIn, sessionChecked }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 52,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px',
      backgroundColor: scrolled ? 'rgba(250,250,248,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? `0.5px solid ${light.border}` : '0.5px solid transparent',
      transition: 'all 0.2s',
    }}>
      <span style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.3px', color: light.textPrimary }}>
        folio
      </span>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {!sessionChecked ? null : isLoggedIn ? (
          <button onClick={onDashboard} style={{
            fontSize: 13, padding: '6px 14px', borderRadius: 6,
            border: 'none',
            backgroundColor: light.textPrimary, color: light.bgPrimary,
            cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
          }}>
            Dashboard →
          </button>
        ) : (
          <>
            <button onClick={onLogin} style={{
              fontSize: 13, padding: '6px 14px', borderRadius: 6,
              border: `0.5px solid ${light.borderStrong}`,
              backgroundColor: light.bgCard, color: light.textPrimary,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Log in
            </button>
            <button onClick={onStart} style={{
              fontSize: 13, padding: '6px 14px', borderRadius: 6,
              border: 'none',
              backgroundColor: light.textPrimary, color: light.bgPrimary,
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
            }}>
              Get started
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

/* ─── hero ─── */
function Hero({ onStart, onLogin, onDashboard, isLoggedIn, sessionChecked }) {
  return (
    <section style={{
      padding: '140px 32px 80px',
      textAlign: 'center',
      maxWidth: 680,
      margin: '0 auto',
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 12px', borderRadius: 20,
        backgroundColor: light.blue.bg, color: light.blue.text,
        fontSize: 11.5, marginBottom: 24, letterSpacing: '0.02em',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: light.blue.text, display: 'inline-block' }} />
        Personal learning tracker
      </div>

      <h1 style={{
        fontSize: 48, fontWeight: 500, color: light.textPrimary,
        lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 20,
      }}>
        One place for<br />everything you learn
      </h1>

      <p style={{
        fontSize: 16, color: light.textSecondary, lineHeight: 1.65,
        marginBottom: 36, maxWidth: 500, margin: '0 auto 36px',
      }}>
        Track YouTube courses, PDFs, books, and papers in a single workspace.
        Never lose your place or forget where you left off.
      </p>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {!sessionChecked ? null : isLoggedIn ? (
          <button onClick={onDashboard} style={{
            fontSize: 14, padding: '10px 22px', borderRadius: 6,
            border: 'none', backgroundColor: light.textPrimary, color: light.bgPrimary,
            cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
          }}>
            Go to Dashboard →
          </button>
        ) : (
          <>
            <button onClick={onStart} style={{
              fontSize: 14, padding: '10px 22px', borderRadius: 6,
              border: 'none', backgroundColor: light.textPrimary, color: light.bgPrimary,
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
            }}>
              Get started — it's free
            </button>
            <button onClick={onLogin} style={{
              fontSize: 14, padding: '10px 22px', borderRadius: 6,
              border: `0.5px solid ${light.borderStrong}`, backgroundColor: light.bgCard,
              color: light.textSecondary, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Log in →
            </button>
          </>
        )}
      </div>

      {!isLoggedIn && (
        <p style={{ fontSize: 12, color: light.textTertiary, marginTop: 16 }}>
          No credit card required
        </p>
      )}
    </section>
  )
}

/* ─── demo mockup ─── */
function DemoMockup() {
  const [checked, setChecked] = useState({ v1: true, v2: true, v3: true, v4: false, v5: false })
  const toggle = (k) => setChecked(p => ({ ...p, [k]: !p[k] }))

  return (
    <section style={{ padding: '0 24px 80px', maxWidth: 960, margin: '0 auto' }}>
      {/* browser chrome */}
      <div style={{
        border: `0.5px solid ${light.borderStrong}`,
        borderRadius: 12, overflow: 'hidden',
        backgroundColor: light.bgPrimary,
      }}>
        {/* chrome bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '10px 14px',
          backgroundColor: light.bgSecondary,
          borderBottom: `0.5px solid ${light.border}`,
        }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FC635D', display: 'inline-block' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FDBC40', display: 'inline-block' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#34C749', display: 'inline-block' }} />
          <div style={{
            flex: 1, marginLeft: 8,
            backgroundColor: light.bgCard,
            border: `0.5px solid ${light.border}`,
            borderRadius: 5, padding: '4px 10px',
            fontSize: 11, color: light.textTertiary,
            maxWidth: 260,
          }}>
            folio.app / resources / deep-learning
          </div>
        </div>

        {/* app shell */}
        <div style={{ display: 'flex', height: 480 }}>
          {/* sidebar */}
          <div style={{
            width: 180, backgroundColor: light.bgSecondary,
            borderRight: `0.5px solid ${light.border}`,
            flexShrink: 0, display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ padding: '14px 12px 12px', borderBottom: `0.5px solid ${light.border}`, fontSize: 14, fontWeight: 500, letterSpacing: '-0.3px' }}>
              folio
            </div>
            <div style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
              <SidebarSection label="Library" />
              {[
                { label: 'All', active: false },
                { label: 'Videos', active: true },
                { label: 'PDFs', active: false },
                { label: 'Books', active: false },
              ].map(item => (
                <div key={item.label} style={{
                  padding: '5px 8px', borderRadius: 6, fontSize: 12.5,
                  color: item.active ? light.textPrimary : light.textSecondary,
                  fontWeight: item.active ? 500 : 400,
                  backgroundColor: item.active ? light.bgCard : 'transparent',
                  border: item.active ? `0.5px solid ${light.border}` : '0.5px solid transparent',
                }}>
                  {item.label}
                </div>
              ))}
              <SidebarSection label="Folders" />
              {[
                { label: 'ML & AI', color: light.blue.text },
                { label: 'Systems', color: light.purple.text },
                { label: 'Finance', color: light.green.text },
              ].map(f => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 8px', fontSize: 12.5, color: light.textSecondary }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: f.color, flexShrink: 0 }} />
                  {f.label}
                </div>
              ))}
              <SidebarSection label="Labels" />
              {[
                { name: '#priority', ...light.pink },
                { name: '#NLP', ...light.green },
              ].map(l => (
                <div key={l.name} style={{ padding: '4px 8px' }}>
                  <span style={{ backgroundColor: l.bg, color: l.text, padding: '2px 8px', borderRadius: 20, fontSize: 10.5 }}>{l.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* two-panel course view */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* video list */}
            <div style={{ width: 240, borderRight: `0.5px solid ${light.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* topbar */}
              <div style={{ padding: '9px 12px', borderBottom: `0.5px solid ${light.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Deep Learning Spec.</span>
                <span style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 6,
                  backgroundColor: light.textPrimary, color: light.bgPrimary,
                  cursor: 'default', fontWeight: 500,
                }}>continue →</span>
              </div>
              <div style={{ padding: '8px 8px', borderBottom: `0.5px solid ${light.border}` }}>
                <div style={{ fontSize: 11, color: light.textTertiary, marginBottom: 6 }}>3 / 5 videos · 16 min remaining</div>
                <MiniProgress value={0.6} />
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                <SectionHeader label="Week 2 — Neural Networks" done={3} total={5} />
                {[
                  { id: 'v1', title: 'Logistic Regression as a NN', dur: '12:04' },
                  { id: 'v2', title: 'Computation Graphs', dur: '6:43' },
                  { id: 'v3', title: 'Derivatives with Comp. Graphs', dur: '8:51' },
                  { id: 'v4', title: 'Gradient Descent on m Examples', dur: '4:29', active: true },
                  { id: 'v5', title: 'Vectorization', dur: '11:22' },
                ].map(v => (
                  <VideoRow
                    key={v.id}
                    title={v.title}
                    dur={v.dur}
                    done={checked[v.id]}
                    active={v.active && !checked[v.id]}
                    onToggle={() => toggle(v.id)}
                  />
                ))}
              </div>
            </div>

            {/* player area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: light.bgPrimary }}>
              {/* fake video player */}
              <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', backgroundColor: '#1A1A18', flexShrink: 0 }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 10,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    border: '1.5px solid rgba(255,255,255,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M4 3l8 4-8 4V3Z" fill="rgba(255,255,255,0.7)" />
                    </svg>
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Gradient Descent on m Examples</span>
                </div>
              </div>
              {/* notes preview */}
              <div style={{ flex: 1, padding: '10px 12px', overflowY: 'auto' }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: light.textTertiary, marginBottom: 8 }}>Notes</div>
                {[
                  { ts: '2:14', text: 'Key insight: vectorize across examples to avoid explicit for-loops' },
                  { ts: '4:01', text: 'dz for logistic: a - y, simple form thanks to log-likelihood' },
                ].map((n, i) => (
                  <div key={i} style={{
                    backgroundColor: light.bgCard, border: `0.5px solid ${light.border}`,
                    borderRadius: 7, padding: '7px 9px', marginBottom: 6,
                  }}>
                    <div style={{ fontSize: 10, color: light.blue.text, marginBottom: 3 }}>{n.ts}</div>
                    <div style={{ fontSize: 11.5, color: light.textPrimary }}>{n.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SidebarSection({ label }) {
  return (
    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: light.textTertiary, padding: '10px 8px 4px' }}>
      {label}
    </div>
  )
}

function MiniProgress({ value }) {
  return (
    <div style={{ height: 3, backgroundColor: light.bgTertiary, borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ width: `${value * 100}%`, height: '100%', backgroundColor: light.blue.text, borderRadius: 2 }} />
    </div>
  )
}

function SectionHeader({ label, done, total }) {
  return (
    <div style={{ padding: '4px 6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 10.5, fontWeight: 500, color: light.textSecondary }}>{label}</span>
        <span style={{ fontSize: 10, color: light.textTertiary }}>{done}/{total} done</span>
      </div>
      <MiniProgress value={done / total} />
    </div>
  )
}

function VideoRow({ title, dur, done, active, onToggle }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      padding: '8px 10px', borderRadius: 7,
      backgroundColor: light.bgCard,
      border: `0.5px solid ${active ? light.borderStrong : light.border}`,
      cursor: 'pointer',
    }} onClick={onToggle}>
      <div style={{
        width: 15, height: 15, borderRadius: '50%', flexShrink: 0,
        border: done ? 'none' : `1.5px solid ${light.borderStrong}`,
        backgroundColor: done ? light.blue.text : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {done && (
          <svg width="7" height="5" viewBox="0 0 7 5" fill="none">
            <path d="M1 2.5L2.8 4.3L6 1" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{
        flex: 1, fontSize: 11.5,
        color: done ? light.textTertiary : light.textPrimary,
        fontWeight: active ? 500 : 400,
        textDecoration: done ? 'line-through' : 'none',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{title}</span>
      <span style={{ fontSize: 10.5, color: light.textTertiary, flexShrink: 0 }}>{dur}</span>
    </div>
  )
}

/* ─── problem section ─── */
function Problem() {
  const pains = [
    { icon: '📂', text: '47 browser tabs you keep meaning to get back to' },
    { icon: '📺', text: 'YouTube courses half-finished across multiple playlists' },
    { icon: '📚', text: 'Books you started, forgot, and bought again' },
    { icon: '📄', text: 'Papers saved to Zotero, Notion, Drive — all in different places' },
  ]

  return (
    <section style={{ padding: '0 32px 96px', maxWidth: 720, margin: '0 auto' }}>
      <Label>The problem</Label>
      <h2 style={{ fontSize: 34, fontWeight: 500, letterSpacing: '-1px', color: light.textPrimary, lineHeight: 1.2, marginBottom: 16 }}>
        Learning is scattered.<br />Progress gets lost.
      </h2>
      <p style={{ fontSize: 15, color: light.textSecondary, lineHeight: 1.65, marginBottom: 40, maxWidth: 540 }}>
        You're serious about learning, but your resources are spread across dozens of apps,
        tabs, and notebooks. There's no single view of what you're actually working on.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {pains.map((p, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 16px', borderRadius: 10,
            backgroundColor: light.bgCard,
            border: `0.5px solid ${light.border}`,
          }}>
            <span style={{ fontSize: 18 }}>{p.icon}</span>
            <span style={{ fontSize: 13.5, color: light.textSecondary }}>{p.text}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── features ─── */
function Features() {
  const features = [
    {
      accent: light.blue,
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="1" y="4" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.2" />
          <path d="M9 8.5l5 2.5-5 2.5V8.5Z" fill="currentColor" />
        </svg>
      ),
      title: 'YouTube course tracker',
      desc: 'Import any playlist. Get a Udemy-style video list with section grouping, checkboxes, and per-section progress. Hit Continue to jump straight to the next video.',
    },
    {
      accent: light.amber,
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3" y="2" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <rect x="5" y="2" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
          <path d="M7 8h7M7 11h5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      ),
      title: 'Books & page tracking',
      desc: 'Log your current page, see progress fill up. Works for textbooks, novels, anything with pages. No friction — just update a number.',
    },
    {
      accent: light.purple,
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3" y="2" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M6 7h10M6 10.5h10M6 14h7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      ),
      title: 'Papers & research',
      desc: 'Track papers by venue, authors, year. Attach PDFs. Keep notes alongside. Never forget which transformer paper you were halfway through.',
    },
    {
      accent: { bg: '#EEECEA', text: '#6B6B66' },
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3" y="2" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M7 8h8M7 11.5h8M7 15h5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      ),
      title: 'PDF viewer with memory',
      desc: 'Upload PDFs and read them in-app. Folio remembers your last page — every revisit picks up exactly where you left off.',
    },
    {
      accent: light.green,
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M3 6h16M3 10h12M3 14h10M3 18h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
      title: 'Timestamped notes',
      desc: 'Add notes to any resource. For videos, notes capture the current timestamp automatically — so you can find that key insight exactly when you need it.',
    },
    {
      accent: light.pink,
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="14" cy="14" r="5" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
        </svg>
      ),
      title: 'Folders & labels',
      desc: 'Organize with flat folders (ML & AI, Finance, Systems) and cross-cutting labels (#priority, #revisit, #NLP). Simple, fast, no hierarchy overhead.',
    },
  ]

  return (
    <section style={{ padding: '0 32px 96px', maxWidth: 960, margin: '0 auto' }}>
      <Label>Features</Label>
      <h2 style={{ fontSize: 34, fontWeight: 500, letterSpacing: '-1px', color: light.textPrimary, marginBottom: 40 }}>
        Everything learning, nothing else
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10,
      }} className="features-grid">
        {features.map((f, i) => (
          <div key={i} style={{
            backgroundColor: light.bgCard,
            border: `0.5px solid ${light.border}`,
            borderRadius: 10,
            padding: '20px 20px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 8,
              backgroundColor: f.accent.bg,
              color: f.accent.text,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {f.icon}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: light.textPrimary, marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: light.textSecondary, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── use cases ─── */
function UseCases() {
  const cases = [
    {
      label: 'Self-taught developers',
      accent: light.blue,
      items: [
        'Track Udemy and YouTube courses in one place',
        'See exactly which videos remain',
        'Notes on tricky concepts with timestamps',
      ],
    },
    {
      label: 'Researchers & grad students',
      accent: light.purple,
      items: [
        'Catalog papers by venue and year',
        'Attach and read PDFs in-app',
        'Tag papers with labels like #must-cite or #background',
      ],
    },
    {
      label: 'Lifelong learners',
      accent: light.amber,
      items: [
        'Track books alongside videos and courses',
        'Organize by topic with folders',
        'See everything in-progress at a glance on the dashboard',
      ],
    },
  ]

  return (
    <section style={{
      padding: '80px 32px 96px',
      backgroundColor: light.bgSecondary,
      borderTop: `0.5px solid ${light.border}`,
      borderBottom: `0.5px solid ${light.border}`,
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <Label>Who it's for</Label>
        <h2 style={{ fontSize: 34, fontWeight: 500, letterSpacing: '-1px', color: light.textPrimary, marginBottom: 40 }}>
          Built for people who take learning seriously
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }} className="features-grid">
          {cases.map((c, i) => (
            <div key={i} style={{
              backgroundColor: light.bgCard,
              border: `0.5px solid ${light.border}`,
              borderRadius: 10,
              padding: '20px 20px 22px',
            }}>
              <div style={{
                fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em',
                color: c.accent.text, marginBottom: 10,
                backgroundColor: c.accent.bg, padding: '3px 8px',
                borderRadius: 20, display: 'inline-block',
              }}>
                {c.label}
              </div>
              <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {c.items.map((item, j) => (
                  <li key={j} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13, color: light.textSecondary, lineHeight: 1.5 }}>
                    <span style={{
                      width: 14, height: 14, borderRadius: '50%',
                      backgroundColor: c.accent.bg, color: c.accent.text,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: 1,
                      fontSize: 9, fontWeight: 500,
                    }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── pricing ─── */
function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      desc: 'For individuals just getting started.',
      accent: { bg: light.bgTertiary, text: light.textSecondary },
      cta: 'Get started',
      ctaPrimary: false,
      features: [
        'Up to 20 resources',
        'YouTube playlist import',
        'Folders & labels',
        'Timestamped notes',
        '500 MB PDF storage',
      ],
    },
    {
      name: 'Pro',
      price: '$7',
      period: 'per month',
      desc: 'For serious learners with a large library.',
      accent: light.blue,
      cta: 'Start free trial',
      ctaPrimary: true,
      badge: 'Most popular',
      features: [
        'Unlimited resources',
        'Everything in Free',
        '20 GB PDF storage',
        'Full-text search',
        'Priority support',
        'Early access to new features',
      ],
    },
    {
      name: 'Lifetime',
      price: '$79',
      period: 'one-time',
      desc: 'Pay once, use forever.',
      accent: light.purple,
      cta: 'Get lifetime access',
      ctaPrimary: false,
      features: [
        'Everything in Pro',
        'No recurring fees',
        '50 GB PDF storage',
        'Lifetime updates',
      ],
    },
  ]

  return (
    <section style={{ padding: '80px 32px 96px', maxWidth: 960, margin: '0 auto' }}>
      <Label>Pricing</Label>
      <h2 style={{ fontSize: 34, fontWeight: 500, letterSpacing: '-1px', color: light.textPrimary, marginBottom: 10 }}>
        Simple, honest pricing
      </h2>
      <p style={{ fontSize: 15, color: light.textSecondary, marginBottom: 48 }}>
        Start free. Upgrade when your library grows.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, alignItems: 'start' }} className="features-grid">
        {plans.map((plan, i) => (
          <div key={i} style={{
            backgroundColor: light.bgCard,
            border: `0.5px solid ${plan.ctaPrimary ? light.blue.text + '44' : light.border}`,
            borderRadius: 10,
            padding: '24px 22px',
            position: 'relative',
          }}>
            {plan.badge && (
              <div style={{
                position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                backgroundColor: light.blue.text, color: '#fff',
                fontSize: 10.5, padding: '3px 10px', borderRadius: 20,
                fontWeight: 500, whiteSpace: 'nowrap',
              }}>
                {plan.badge}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <div style={{
                display: 'inline-block',
                backgroundColor: plan.accent.bg, color: plan.accent.text,
                fontSize: 11, padding: '2px 8px', borderRadius: 20, marginBottom: 12,
              }}>
                {plan.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 36, fontWeight: 500, color: light.textPrimary, letterSpacing: '-1px' }}>
                  {plan.price}
                </span>
                <span style={{ fontSize: 12.5, color: light.textTertiary }}>{plan.period}</span>
              </div>
              <p style={{ fontSize: 12.5, color: light.textSecondary, marginTop: 6, lineHeight: 1.5 }}>{plan.desc}</p>
            </div>

            <button style={{
              width: '100%', padding: '9px 0', borderRadius: 6,
              border: plan.ctaPrimary ? 'none' : `0.5px solid ${light.borderStrong}`,
              backgroundColor: plan.ctaPrimary ? light.textPrimary : 'transparent',
              color: plan.ctaPrimary ? light.bgPrimary : light.textPrimary,
              fontSize: 13, fontFamily: 'inherit', fontWeight: plan.ctaPrimary ? 500 : 400,
              cursor: 'pointer', marginBottom: 20,
            }}>
              {plan.cta}
            </button>

            <div style={{ borderTop: `0.5px solid ${light.border}`, paddingTop: 16 }}>
              <div style={{ fontSize: 11, color: light.textTertiary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Includes
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ display: 'flex', gap: 8, fontSize: 12.5, color: light.textSecondary, alignItems: 'flex-start' }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                      <circle cx="6.5" cy="6.5" r="6" stroke={plan.accent.text || light.textTertiary} strokeWidth="0.8" opacity="0.5" />
                      <path d="M4 6.5l2 2 3-3" stroke={plan.accent.text || light.textTertiary} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── CTA ─── */
function CTA({ onStart }) {
  return (
    <section style={{
      padding: '80px 32px 96px',
      backgroundColor: light.bgSecondary,
      borderTop: `0.5px solid ${light.border}`,
      textAlign: 'center',
    }}>
      <h2 style={{ fontSize: 36, fontWeight: 500, letterSpacing: '-1.2px', color: light.textPrimary, marginBottom: 14 }}>
        Start tracking your learning today
      </h2>
      <p style={{ fontSize: 15, color: light.textSecondary, marginBottom: 32 }}>
        Free forever. No card required. Takes 30 seconds to set up.
      </p>
      <button onClick={onStart} style={{
        fontSize: 14, padding: '11px 28px', borderRadius: 6,
        border: 'none', backgroundColor: light.textPrimary, color: light.bgPrimary,
        cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
      }}>
        Get started free
      </button>
    </section>
  )
}

/* ─── footer ─── */
function Footer() {
  return (
    <footer style={{
      padding: '24px 32px',
      borderTop: `0.5px solid ${light.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 12,
    }}>
      <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: '-0.3px', color: light.textPrimary }}>folio</span>
      <div style={{ display: 'flex', gap: 24 }}>
        {['Privacy', 'Terms', 'Contact'].map(link => (
          <span key={link} style={{ fontSize: 12.5, color: light.textTertiary, cursor: 'pointer' }}>{link}</span>
        ))}
      </div>
      <span style={{ fontSize: 12, color: light.textTertiary }}>© 2025 Folio</span>
    </footer>
  )
}

/* ─── shared label ─── */
function Label({ children }) {
  return (
    <div style={{
      fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em',
      color: light.textTertiary, marginBottom: 12,
    }}>
      {children}
    </div>
  )
}

/* ─── main export ─── */
export default function Landing() {
  const navigate = useNavigate()
  const { accessToken, checking } = useAuth()
  const sessionChecked = !checking
  const isLoggedIn = !!accessToken

  const onLogin = () => navigate('/login')
  const onStart = () => navigate('/login')
  const onDashboard = () => navigate('/dashboard')

  return (
    <div style={{
      fontFamily: 'Helvetica, Arial, sans-serif',
      backgroundColor: light.bgPrimary,
      color: light.textPrimary,
      minHeight: '100vh',
    }}>
      <style>{`
        @media (max-width: 720px) {
          .features-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 960px) and (min-width: 721px) {
          .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      <Nav onLogin={onLogin} onStart={onStart} onDashboard={onDashboard} isLoggedIn={isLoggedIn} sessionChecked={sessionChecked} />
      <Hero onStart={onStart} onLogin={onLogin} onDashboard={onDashboard} isLoggedIn={isLoggedIn} sessionChecked={sessionChecked} />
      <DemoMockup />
      <Problem />
      <Features />
      <UseCases />
      <Pricing />
      <CTA onStart={onStart} />
      <Footer />
    </div>
  )
}
