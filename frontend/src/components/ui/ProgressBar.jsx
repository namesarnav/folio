export default function ProgressBar({ value = 0 }) {
  const pct = Math.round(value * 100)
  return (
    <div
      style={{ height: '3px', backgroundColor: 'var(--progress-bg)' }}
      className="w-full rounded-full overflow-hidden"
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          backgroundColor: 'var(--progress-fill)',
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  )
}
