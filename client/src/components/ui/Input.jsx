export default function Input({ label, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
          {label}
        </label>
      )}
      <input
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '0.5px solid var(--border-strong)',
          borderRadius: 6,
          padding: '7px 10px',
          fontSize: 13,
          color: 'var(--text-primary)',
          outline: 'none',
          width: '100%',
        }}
        {...props}
      />
    </div>
  )
}

export function Textarea({ label, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
          {label}
        </label>
      )}
      <textarea
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '0.5px solid var(--border-strong)',
          borderRadius: 6,
          padding: '7px 10px',
          fontSize: 13,
          color: 'var(--text-primary)',
          outline: 'none',
          width: '100%',
          resize: 'vertical',
          minHeight: 80,
        }}
        {...props}
      />
    </div>
  )
}

export function Select({ label, className = '', children, ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
          {label}
        </label>
      )}
      <select
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '0.5px solid var(--border-strong)',
          borderRadius: 6,
          padding: '7px 10px',
          fontSize: 13,
          color: 'var(--text-primary)',
          outline: 'none',
          width: '100%',
        }}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}
