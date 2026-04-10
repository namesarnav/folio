import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import Topbar from '../components/layout/Topbar'
import Button from '../components/ui/Button'
import { Select, Textarea } from '../components/ui/Input'
import Input from '../components/ui/Input'
import ProgressBar from '../components/ui/ProgressBar'
import { StatusBadge } from '../components/ui/Badge'
import { getResource, updateResource, deleteResource } from '../api/resources'
import { getNotes, createNote, deleteNote } from '../api/notes'
import { getLabels } from '../api/labels'
import { getFolders } from '../api/folders'

const STATUS_OPTIONS = ['not_started', 'in_progress', 'paused', 'completed', 'dropped']
const STATUS_LABELS = {
  not_started: 'Not started',
  in_progress: 'In progress',
  paused: 'Paused',
  completed: 'Completed',
  dropped: 'Dropped',
}

export default function ResourceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [resource, setResource] = useState(null)
  const [notes, setNotes] = useState([])
  const [labels, setLabels] = useState([])
  const [folders, setFolders] = useState([])
  const [noteText, setNoteText] = useState('')
  const [saving, setSaving] = useState(false)

  // Editable fields
  const [status, setStatus] = useState('not_started')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [notesMd, setNotesMd] = useState('')

  const load = async () => {
    try {
      const [rRes, nRes, lRes, fRes] = await Promise.all([
        getResource(id),
        getNotes(id),
        getLabels(),
        getFolders(),
      ])
      const r = rRes.data
      setResource(r)
      setStatus(r.status)
      setCurrentPage(r.current_page || 0)
      setTotalPages(r.total_pages || 0)
      setNotesMd(r.notes || '')
      setNotes(nRes.data)
      setLabels(lRes.data)
      setFolders(fRes.data)
    } catch {}
  }

  useEffect(() => { load() }, [id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updates = { status, notes: notesMd }
      if (resource.resource_type === 'book') {
        updates.current_page = Number(currentPage)
        updates.total_pages = Number(totalPages)
      }
      await updateResource(id, updates)
      await load()
    } catch {}
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this resource?')) return
    await deleteResource(id)
    navigate('/')
  }

  const handleAddNote = async () => {
    if (!noteText.trim()) return
    try {
      await createNote({ resource_id: id, content: noteText.trim() })
      setNoteText('')
      const { data } = await getNotes(id)
      setNotes(data)
    } catch {}
  }

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId)
      const { data } = await getNotes(id)
      setNotes(data)
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

  const folder = folders.find(f => f.id === resource.folder_id)
  const resourceLabels = labels.filter(l => resource.label_ids.includes(l.id))

  return (
    <PageWrapper>
      <Topbar
        title={resource.title}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
          </div>
        }
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, maxWidth: 720 }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-tertiary)', marginBottom: 6 }}>
            {resource.resource_type.replace('_', ' ')}
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 6 }}>
            {resource.title}
          </h1>
          {resource.description && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {resource.description}
            </p>
          )}
          {resource.source_url && (
            <a
              href={resource.source_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12.5, color: 'var(--blue-text)', marginTop: 8, display: 'inline-block' }}
            >
              Open source →
            </a>
          )}
        </div>

        {/* Metadata */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '0.5px solid var(--border-default)',
          borderRadius: 10,
          padding: '14px 16px',
          marginBottom: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {resource.author && <MetaField label="Author" value={resource.author} />}
            {resource.platform && <MetaField label="Platform" value={resource.platform} />}
            {resource.authors?.length > 0 && <MetaField label="Authors" value={resource.authors.join(', ')} />}
            {resource.venue && <MetaField label="Venue" value={resource.venue} />}
            {resource.year && <MetaField label="Year" value={resource.year} />}
            {resource.doi && <MetaField label="DOI" value={resource.doi} />}
            {folder && <MetaField label="Folder" value={folder.name} />}
          </div>
          {resourceLabels.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {resourceLabels.map(l => (
                <span key={l.id} style={{ backgroundColor: l.color + '22', color: l.color, padding: '2px 8px', borderRadius: 20, fontSize: 10.5 }}>
                  {l.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Progress
          </div>
          <ProgressBar value={resource.progress} />
          <div style={{ marginTop: 10, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {resource.resource_type === 'book' && (
              <>
                <Input
                  label="Current page"
                  type="number"
                  value={currentPage}
                  onChange={e => setCurrentPage(e.target.value)}
                  style={{ width: 120 }}
                />
                <Input
                  label="Total pages"
                  type="number"
                  value={totalPages}
                  onChange={e => setTotalPages(e.target.value)}
                  style={{ width: 120 }}
                />
              </>
            )}
            <Select
              label="Status"
              value={status}
              onChange={e => setStatus(e.target.value)}
              style={{ width: 160 }}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </Select>
          </div>
        </div>

        {/* Notes editor */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Notes (markdown)
          </div>
          <Textarea
            value={notesMd}
            onChange={e => setNotesMd(e.target.value)}
            placeholder="Write notes in markdown..."
            style={{ minHeight: 120 }}
          />
        </div>

        {/* Quick notes */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Quick Notes
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Add a note..."
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notes.map(note => (
              <div key={note.id} style={{
                backgroundColor: 'var(--bg-card)',
                border: '0.5px solid var(--border-default)',
                borderRadius: 8,
                padding: '10px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 8,
              }}>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                  {note.content}
                </div>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  style={{ color: 'var(--text-tertiary)', cursor: 'pointer', background: 'none', border: 'none', fontSize: 14, flexShrink: 0 }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

function MetaField({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{value}</div>
    </div>
  )
}
