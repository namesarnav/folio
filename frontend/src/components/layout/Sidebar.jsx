import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getFolders } from '../../api/folders'
import { getLabels } from '../../api/labels'
import { logout } from '../../api/auth'
import useAuthStore from '../../store/authStore'

const FOLDER_DOT_COLORS = [
  'var(--blue-text)',
  'var(--green-text)',
  'var(--purple-text)',
  'var(--amber-text)',
  'var(--pink-text)',
]

function SectionLabel({ children }) {
  return (
    <span style={{
      fontSize: 10,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: 'var(--text-tertiary)',
      fontWeight: 400,
    }}>
      {children}
    </span>
  )
}

function NavItem({ to, icon, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 8px',
        borderRadius: 6,
        fontSize: 13,
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontWeight: isActive ? 500 : 400,
        backgroundColor: isActive ? 'var(--bg-card)' : 'transparent',
        border: isActive ? '0.5px solid var(--border-default)' : '0.5px solid transparent',
        textDecoration: 'none',
        transition: 'all 0.1s',
      })}
    >
      {icon}
      {label}
    </NavLink>
  )
}

// SVG icons
const icons = {
  all: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1"/><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1"/><rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1"/><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1"/></svg>,
  video: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2.5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1"/><path d="M10 5.5L13 7L10 8.5V5.5Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/></svg>,
  pdf: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1"/><path d="M4 5h6M4 7.5h6M4 10h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
  book: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="10" height="12" rx="1" stroke="currentColor" strokeWidth="1"/><path d="M7 1v12" stroke="currentColor" strokeWidth="1"/></svg>,
  paper: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1" width="10" height="12" rx="1" stroke="currentColor" strokeWidth="1"/><path d="M4 4h6M4 6.5h6M4 9h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
}

export default function Sidebar() {
  const [folders, setFolders] = useState([])
  const [labels, setLabels] = useState([])
  const navigate = useNavigate()
  const clearAuth = useAuthStore(s => s.clearAuth)

  useEffect(() => {
    getFolders().then(r => setFolders(r.data)).catch(() => {})
    getLabels().then(r => setLabels(r.data)).catch(() => {})
  }, [])

  const handleSignOut = async () => {
    try { await logout() } catch {}
    clearAuth()
    navigate('/')
  }

  return (
    <aside style={{
      width: 200,
      minWidth: 200,
      height: '100%',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '0.5px solid var(--border-default)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        padding: '14px 12px 12px',
        borderBottom: '0.5px solid var(--border-default)',
      }}>
        <span style={{
          fontSize: 15,
          fontWeight: 500,
          letterSpacing: '-0.3px',
          color: 'var(--text-primary)',
        }}>
          folio
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }} className="flex flex-col gap-4">
        {/* Library */}
        <div className="flex flex-col gap-1">
          <div style={{ padding: '2px 8px 6px' }}>
            <SectionLabel>Library</SectionLabel>
          </div>
          <NavItem to="/dashboard" end icon={icons.all} label="All" />
          <NavItem to="/library/videos" icon={icons.video} label="Videos" />
          <NavItem to="/library/pdfs" icon={icons.pdf} label="PDFs" />
          <NavItem to="/library/books" icon={icons.book} label="Books" />
          <NavItem to="/library/papers" icon={icons.paper} label="Papers" />
        </div>

        {/* Folders */}
        {folders.length > 0 && (
          <div className="flex flex-col gap-1">
            <div style={{ padding: '2px 8px 6px' }}>
              <SectionLabel>Folders</SectionLabel>
            </div>
            {folders.map((folder, i) => (
              <NavLink
                key={folder.id}
                to={`/folders/${folder.id}`}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 8px',
                  borderRadius: 6,
                  fontSize: 13,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 500 : 400,
                  backgroundColor: isActive ? 'var(--bg-card)' : 'transparent',
                  border: isActive ? '0.5px solid var(--border-default)' : '0.5px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.1s',
                })}
              >
                <span style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: folder.color || FOLDER_DOT_COLORS[i % FOLDER_DOT_COLORS.length],
                  flexShrink: 0,
                }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {folder.name}
                </span>
              </NavLink>
            ))}
          </div>
        )}

        {/* Labels */}
        {labels.length > 0 && (
          <div className="flex flex-col gap-1">
            <div style={{ padding: '2px 8px 6px' }}>
              <SectionLabel>Labels</SectionLabel>
            </div>
            {labels.map((label) => (
              <NavLink
                key={label.id}
                to={`/labels/${label.id}`}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  padding: '5px 8px',
                  borderRadius: 6,
                  fontSize: 13,
                  textDecoration: 'none',
                  backgroundColor: isActive ? 'var(--bg-card)' : 'transparent',
                  border: isActive ? '0.5px solid var(--border-default)' : '0.5px solid transparent',
                })}
              >
                <span
                  style={{
                    backgroundColor: label.color + '22',
                    color: label.color,
                    padding: '2px 8px',
                    borderRadius: 20,
                    fontSize: 10.5,
                  }}
                >
                  {label.name}
                </span>
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* Sign out */}
      <div style={{ padding: '8px', borderTop: '0.5px solid var(--border-default)' }}>
        <button
          onClick={handleSignOut}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 8px',
            borderRadius: 6,
            fontSize: 13,
            color: 'var(--text-tertiary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'color 0.1s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2H12C12.6 2 13 2.4 13 3V11C13 11.6 12.6 12 12 12H9" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
            <path d="M6 10L9 7L6 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 7H2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}
