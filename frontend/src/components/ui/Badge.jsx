const STATUS_COLORS = {
  not_started: { bg: 'var(--bg-tertiary)', text: 'var(--text-secondary)' },
  in_progress: { bg: 'var(--blue-bg)', text: 'var(--blue-text)' },
  paused: { bg: 'var(--amber-bg)', text: 'var(--amber-text)' },
  completed: { bg: 'var(--green-bg)', text: 'var(--green-text)' },
  dropped: { bg: 'var(--bg-tertiary)', text: 'var(--text-tertiary)' },
}

const STATUS_LABELS = {
  not_started: 'Not started',
  in_progress: 'In progress',
  paused: 'Paused',
  completed: 'Completed',
  dropped: 'Dropped',
}

export function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.not_started
  return (
    <span
      style={{ backgroundColor: colors.bg, color: colors.text }}
      className="px-2 py-0.5 rounded-[20px] text-[10.5px] whitespace-nowrap"
    >
      {STATUS_LABELS[status] || status}
    </span>
  )
}

export function TypeBadge({ type }) {
  const configs = {
    youtube_playlist: { bg: 'var(--blue-bg)', text: 'var(--blue-text)', label: 'YouTube' },
    external_course: { bg: 'var(--purple-bg)', text: 'var(--purple-text)', label: 'Course' },
    pdf: { bg: 'var(--bg-tertiary)', text: 'var(--text-secondary)', label: 'PDF' },
    book: { bg: 'var(--amber-bg)', text: 'var(--amber-text)', label: 'Book' },
    paper: { bg: 'var(--purple-bg)', text: 'var(--purple-text)', label: 'Paper' },
  }
  const c = configs[type] || { bg: 'var(--bg-tertiary)', text: 'var(--text-secondary)', label: type }
  return (
    <span
      style={{ backgroundColor: c.bg, color: c.text }}
      className="px-2 py-0.5 rounded-[20px] text-[10px] uppercase tracking-[0.04em] whitespace-nowrap"
    >
      {c.label}
    </span>
  )
}

export function LabelChip({ name, color }) {
  return (
    <span
      style={{ backgroundColor: color + '22', color }}
      className="px-2 py-0.5 rounded-[20px] text-[10.5px] whitespace-nowrap"
    >
      {name}
    </span>
  )
}
