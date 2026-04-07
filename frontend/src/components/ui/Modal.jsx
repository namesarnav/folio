import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, width = 480 }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        style={{
          width,
          backgroundColor: 'var(--bg-card)',
          border: '0.5px solid var(--border-default)',
          borderRadius: '10px',
          padding: '20px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{title}</span>
            <button
              onClick={onClose}
              style={{ color: 'var(--text-tertiary)', fontSize: 18, lineHeight: 1 }}
              className="cursor-pointer hover:opacity-70"
            >
              ×
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
