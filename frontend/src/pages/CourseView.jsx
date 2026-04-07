import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import Topbar from '../components/layout/Topbar'
import Button from '../components/ui/Button'
import ProgressBar from '../components/ui/ProgressBar'
import { LabelChip } from '../components/ui/Badge'
import { getResource } from '../api/resources'
import { toggleVideoComplete } from '../api/playlists'
import { getNotes, createNote, deleteNote } from '../api/notes'
import { getLabels } from '../api/labels'

// Strip playlist title prefix from video title if it appears at the start.
// Handles separators like " - ", ": ", " | ", " — " after the prefix.
function cleanTitle(videoTitle, playlistTitle) {
  if (!playlistTitle || !videoTitle) return videoTitle
  const sep = /^[\s\-–—:|,]+/
  const escaped = playlistTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const stripped = videoTitle.replace(new RegExp(`^${escaped}`, 'i'), '').replace(sep, '').trim()
  // Only use stripped version if something meaningful remains
  return stripped.length > 2 ? stripped : videoTitle
}

function formatDuration(secs) {
  if (!secs) return '0:00'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatHours(secs) {
  const h = secs / 3600
  return h < 1 ? `${Math.round(h * 60)}m` : `${h.toFixed(1)}h`
}

function Checkbox({ checked, onChange }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onChange() }}
      style={{
        width: 16,
        height: 16,
        borderRadius: '50%',
        border: checked ? 'none' : '1.5px solid var(--border-strong)',
        backgroundColor: checked ? 'var(--progress-fill)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {checked && (
        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
          <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  )
}

export default function CourseView() {
  const { id } = useParams()
  const [resource, setResource] = useState(null)
  const [activeVideoId, setActiveVideoId] = useState(null)
  const [notes, setNotes] = useState([])
  const [allLabels, setAllLabels] = useState([])
  const [noteText, setNoteText] = useState('')
  const [playerSeconds, setPlayerSeconds] = useState(0)
  const videoRefs = useRef({})
  const playerRef = useRef(null)

  const load = async () => {
    try {
      const { data } = await getResource(id)
      setResource(data)
      if (!activeVideoId && data.videos?.length) {
        const next = data.videos.find(v => !v.completed) || data.videos[0]
        setActiveVideoId(next.video_id)
      }
    } catch {}
  }

  const loadNotes = async () => {
    try {
      const { data } = await getNotes(id)
      setNotes(data)
    } catch {}
  }

  useEffect(() => {
    load()
    loadNotes()
    getLabels().then(r => setAllLabels(r.data)).catch(() => {})
  }, [id])

  const handleToggle = async (videoId) => {
    try {
      const { data } = await toggleVideoComplete(id, videoId)
      setResource(data)
    } catch {}
  }

  const handleContinue = () => {
    if (!resource?.videos) return
    const next = resource.videos.find(v => !v.completed)
    if (next) {
      setActiveVideoId(next.video_id)
      videoRefs.current[next.video_id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleAddNote = async () => {
    if (!noteText.trim()) return
    try {
      await createNote({
        resource_id: id,
        video_id: activeVideoId,
        timestamp_seconds: playerSeconds || null,
        content: noteText.trim(),
      })
      setNoteText('')
      loadNotes()
    } catch {}
  }

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId)
      loadNotes()
    } catch {}
  }

  if (!resource) {
    return (
      <PageWrapper>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
          Loading...
        </div>
      </PageWrapper>
    )
  }

  const videos = resource.videos || []
  const completedCount = videos.filter(v => v.completed).length
  const totalDuration = videos.reduce((s, v) => s + v.duration_seconds, 0)
  const remainingDuration = videos.filter(v => !v.completed).reduce((s, v) => s + v.duration_seconds, 0)

  // Group by section
  const sections = []
  const sectionMap = {}
  for (const v of videos) {
    const sec = v.section || '__default__'
    if (!sectionMap[sec]) {
      sectionMap[sec] = { name: sec === '__default__' ? null : sec, videos: [] }
      sections.push(sectionMap[sec])
    }
    sectionMap[sec].videos.push(v)
  }

  const activeVideo = videos.find(v => v.video_id === activeVideoId)

  return (
    <PageWrapper>
      <Topbar
        title={resource.title}
        actions={
          <Button variant="primary" size="sm" onClick={handleContinue}>
            Continue →
          </Button>
        }
      />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left panel — video list */}
        <div style={{
          width: 320,
          minWidth: 320,
          borderRight: '0.5px solid var(--border-default)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Stats */}
          <div style={{ padding: '12px 14px', borderBottom: '0.5px solid var(--border-default)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              {completedCount} / {videos.length} videos · {formatHours(remainingDuration)} remaining
            </div>
            <div style={{ marginTop: 8 }}>
              <ProgressBar value={resource.progress} />
            </div>
            {resource.label_ids?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                {allLabels.filter(l => resource.label_ids.includes(l.id)).map(l => (
                  <LabelChip key={l.id} name={l.name} color={l.color} />
                ))}
              </div>
            )}
          </div>

          {/* Sections */}
          <div style={{ flex: 1, padding: '8px 8px' }}>
            {sections.map((section, si) => {
              const secCompleted = section.videos.filter(v => v.completed).length
              const secTotal = section.videos.length
              const secProgress = secTotal ? secCompleted / secTotal : 0
              return (
                <div key={si} style={{ marginBottom: 12 }}>
                  {section.name && (
                    <div style={{ padding: '6px 6px 4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)' }}>
                          {section.name}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                          {secCompleted} / {secTotal} done
                        </span>
                      </div>
                      <ProgressBar value={secProgress} />
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                    {section.videos.map(video => {
                      const isActive = video.video_id === activeVideoId
                      return (
                        <div
                          key={video.video_id}
                          ref={el => videoRefs.current[video.video_id] = el}
                          onClick={() => setActiveVideoId(video.video_id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 14px',
                            borderRadius: 8,
                            backgroundColor: 'var(--bg-card)',
                            border: isActive ? '0.5px solid var(--border-strong)' : '0.5px solid var(--border-default)',
                            cursor: 'pointer',
                            transition: 'border-color 0.1s',
                          }}
                        >
                          <Checkbox
                            checked={video.completed}
                            onChange={() => handleToggle(video.video_id)}
                          />
                          <span style={{
                            flex: 1,
                            fontSize: 12.5,
                            fontWeight: isActive ? 500 : 400,
                            color: video.completed ? 'var(--text-tertiary)' : 'var(--text-primary)',
                            textDecoration: video.completed ? 'line-through' : 'none',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {cleanTitle(video.title, resource.title)}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', flexShrink: 0 }}>
                            {formatDuration(video.duration_seconds)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right panel — player + notes */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* YouTube player */}
          <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', backgroundColor: '#000' }}>
            {activeVideoId && (
              <iframe
                ref={playerRef}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                src={`https://www.youtube.com/embed/${activeVideoId}?enablejsapi=1`}
                title={activeVideo?.title || ''}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
          {/* Open in YouTube fallback */}
          {activeVideoId && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '7px 14px',
              borderBottom: '0.5px solid var(--border-default)',
              backgroundColor: 'var(--bg-secondary)',
            }}>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                {activeVideo?.title || ''}
              </span>
              <a
                href={`https://www.youtube.com/watch?v=${activeVideoId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 12, color: 'var(--blue-text)',
                  textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
                }}
              >
                Open in YouTube ↗
              </a>
            </div>
          )}

          {/* Notes panel */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Notes
            </div>

            {/* Add note */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Add a note..."
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleAddNote() }}
                style={{
                  flex: 1,
                  backgroundColor: 'var(--bg-secondary)',
                  border: '0.5px solid var(--border-strong)',
                  borderRadius: 6,
                  padding: '7px 10px',
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  outline: 'none',
                  resize: 'none',
                  minHeight: 60,
                  fontFamily: 'inherit',
                }}
              />
              <Button variant="primary" size="sm" onClick={handleAddNote} style={{ alignSelf: 'flex-end' }}>
                Add
              </Button>
            </div>

            {/* Notes list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {notes.map(note => (
                <div key={note.id} style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '0.5px solid var(--border-default)',
                  borderRadius: 8,
                  padding: '10px 12px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      {note.timestamp_seconds != null && (
                        <span style={{ fontSize: 10.5, color: 'var(--blue-text)', marginBottom: 4, display: 'block' }}>
                          {formatDuration(note.timestamp_seconds)}
                        </span>
                      )}
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                        {note.content}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      style={{ color: 'var(--text-tertiary)', cursor: 'pointer', background: 'none', border: 'none', fontSize: 14, flexShrink: 0 }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
