import Button from '../ui/Button'

export default function Topbar({ title, actions }) {
  return (
    <div style={{
      height: 44,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      borderBottom: '0.5px solid var(--border-default)',
      backgroundColor: 'var(--bg-primary)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
        {title}
      </span>
      <div className="flex items-center gap-2">
        {actions}
        <ThemeToggle />
      </div>
    </div>
  )
}

function ThemeToggle() {
  const toggle = () => {
    const current = document.documentElement.getAttribute('data-theme')
    const next = current === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
  }

  return (
    <button
      onClick={toggle}
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        border: '0.5px solid var(--border-strong)',
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      title="Toggle theme"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1"/>
        <path d="M7 1v1M7 12v1M1 7h1M12 7h1M3 3l.7.7M10.3 10.3l.7.7M3 11l.7-.7M10.3 3.7l.7-.7" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    </button>
  )
}
