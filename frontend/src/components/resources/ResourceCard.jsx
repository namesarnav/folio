import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProgressBar from '../ui/ProgressBar'
import { StatusBadge, TypeBadge, LabelChip } from '../ui/Badge'

const TYPE_COLORS = {
  youtube_playlist: 'var(--blue-bg)',
  external_course: 'var(--purple-bg)',
  pdf: 'var(--bg-tertiary)',
  book: 'var(--amber-bg)',
  paper: 'var(--purple-bg)',
}

function TypeIcon({ type }) {
  const color = {
    youtube_playlist: 'var(--blue-text)',
    external_course: 'var(--purple-text)',
    pdf: 'var(--text-secondary)',
    book: 'var(--amber-text)',
    paper: 'var(--purple-text)',
  }[type] || 'var(--text-secondary)'

  const icons = {
    youtube_playlist: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="2" y="6" width="24" height="16" rx="4" stroke={color} strokeWidth="1.5"/>
        <path d="M11 10.5l7 3.5-7 3.5V10.5Z" fill={color}/>
      </svg>
    ),
    external_course: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="4" width="22" height="16" rx="2" stroke={color} strokeWidth="1.5"/>
        <path d="M9 24h10M14 20v4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10 11l4 2.5L18 11" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    pdf: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="5" y="2" width="18" height="24" rx="2" stroke={color} strokeWidth="1.5"/>
        <path d="M9 9h10M9 13h10M9 17h7" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    book: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="3" width="20" height="22" rx="2" stroke={color} strokeWidth="1.5"/>
        <path d="M14 3v22" stroke={color} strokeWidth="1.5"/>
      </svg>
    ),
    paper: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="5" y="2" width="18" height="24" rx="2" stroke={color} strokeWidth="1.5"/>
        <path d="M9 8h10M9 12h10M9 16h7M9 20h5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  }

  return icons[type] || null
}

function progressLabel(resource) {
  const { resource_type, progress, total_videos, videos, total_pages, current_page, last_page_read } = resource
  if (resource_type === 'youtube_playlist' && total_videos) {
    const done = videos ? videos.filter(v => v.completed).length : Math.round(progress * total_videos)
    return `${done} / ${total_videos} videos`
  }
  if (resource_type === 'book' && total_pages) {
    return `${current_page || 0} / ${total_pages} pages`
  }
  if (resource_type === 'pdf' && total_pages) {
    return `${last_page_read || 0} / ${total_pages} pages`
  }
  return `${Math.round(progress * 100)}%`
}

export default function ResourceCard({ resource, labels = [], onEdit }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)

  const resourceLabels = labels.filter(l => resource.label_ids.includes(l.id))

  const handleClick = () => {
    navigate(`/resources/${resource.id}`)
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    onEdit?.(resource)
  }

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: 'var(--bg-card)',
        border: `0.5px solid ${hovered ? 'var(--border-strong)' : 'var(--border-default)'}`,
        borderRadius: 10,
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.1s',
        position: 'relative',
      }}
    >
      {/* Edit button */}
      {hovered && onEdit && (
        <button
          onClick={handleEdit}
          style={{
            position: 'absolute',
            top: 7,
            right: 7,
            zIndex: 2,
            width: 26,
            height: 26,
            borderRadius: 6,
            backgroundColor: 'rgba(0,0,0,0.55)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
          title="Edit"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M9.5 1.5l2 2-7 7H2.5v-2l7-7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Thumbnail */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingBottom: '100%',
        backgroundColor: TYPE_COLORS[resource.resource_type] || 'var(--bg-tertiary)',
        flexShrink: 0,
      }}>
        {resource.thumbnail_url ? (
          <img src={resource.thumbnail_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TypeIcon type={resource.resource_type} />
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {/* Type label */}
        <span style={{
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: {
            youtube_playlist: 'var(--blue-text)',
            external_course: 'var(--purple-text)',
            pdf: 'var(--text-secondary)',
            book: 'var(--amber-text)',
            paper: 'var(--purple-text)',
          }[resource.resource_type] || 'var(--text-secondary)',
        }}>
          {resource.resource_type.replace('_', ' ')}
        </span>

        {/* Title */}
        <div style={{
          fontSize: 12.5,
          fontWeight: 500,
          color: 'var(--text-primary)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.4,
        }}>
          {resource.title}
        </div>

        {/* Progress bar */}
        <ProgressBar value={resource.progress} />

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <span style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>
            {progressLabel(resource)}
          </span>
          <StatusBadge status={resource.status} />
        </div>

        {/* Labels */}
        {resourceLabels.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {resourceLabels.map(l => (
              <LabelChip key={l.id} name={l.name} color={l.color} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
