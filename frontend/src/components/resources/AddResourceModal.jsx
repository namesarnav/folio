import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { Select } from '../ui/Input'
import { createResource } from '../../api/resources'
import { importPlaylist } from '../../api/playlists'
import { uploadFile } from '../../api/files'
import { getFolders } from '../../api/folders'
import { getLabels } from '../../api/labels'

const TYPES = [
  { value: 'youtube_playlist', label: 'YouTube Playlist' },
  { value: 'book', label: 'Book' },
  { value: 'paper', label: 'Paper' },
  { value: 'external_course', label: 'External Course' },
  { value: 'pdf', label: 'PDF Upload' },
]

export default function AddResourceModal({ open, onClose, onAdded }) {
  const [type, setType] = useState('youtube_playlist')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [folders, setFolders] = useState([])
  const [labels, setLabels] = useState([])

  // Common
  const [title, setTitle] = useState('')
  const [folderId, setFolderId] = useState('')
  const [selectedLabels, setSelectedLabels] = useState([])

  // YouTube
  const [playlistUrl, setPlaylistUrl] = useState('')

  // Book
  const [author, setAuthor] = useState('')
  const [totalPages, setTotalPages] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')

  // Paper
  const [authors, setAuthors] = useState('')
  const [venue, setVenue] = useState('')
  const [year, setYear] = useState('')
  const [doi, setDoi] = useState('')

  // Course
  const [platform, setPlatform] = useState('')

  // PDF
  const [file, setFile] = useState(null)

  useEffect(() => {
    if (!open) return
    getFolders().then(r => setFolders(r.data)).catch(() => {})
    getLabels().then(r => setLabels(r.data)).catch(() => {})
  }, [open])

  const reset = () => {
    setTitle(''); setPlaylistUrl(''); setAuthor(''); setTotalPages(''); setSourceUrl('')
    setAuthors(''); setVenue(''); setYear(''); setDoi(''); setPlatform(''); setFile(null)
    setFolderId(''); setSelectedLabels([]); setError('')
  }

  const handleClose = () => { reset(); onClose() }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (type === 'youtube_playlist') {
        await importPlaylist(playlistUrl, folderId || null, selectedLabels)
      } else if (type === 'pdf') {
        if (!file) throw new Error('Select a PDF file')
        await uploadFile(file)
      } else {
        const body = {
          resource_type: type,
          title,
          folder_id: folderId || null,
          label_ids: selectedLabels,
          source_url: sourceUrl || null,
        }
        if (type === 'book') {
          body.author = author
          body.total_pages = totalPages ? Number(totalPages) : null
        } else if (type === 'paper') {
          body.authors = authors.split(',').map(a => a.trim()).filter(Boolean)
          body.venue = venue || null
          body.year = year ? Number(year) : null
          body.doi = doi || null
        } else if (type === 'external_course') {
          body.platform = platform || null
        }
        await createResource(body)
      }
      onAdded?.()
      handleClose()
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Something went wrong')
    }
    setLoading(false)
  }

  const toggleLabel = (id) => {
    setSelectedLabels(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id])
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add resource" width={500}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Select label="Type" value={type} onChange={e => { setType(e.target.value); reset() }}>
          {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>

        {type === 'youtube_playlist' && (
          <Input
            label="Playlist URL or ID"
            value={playlistUrl}
            onChange={e => setPlaylistUrl(e.target.value)}
            placeholder="https://youtube.com/playlist?list=..."
            required
          />
        )}

        {type === 'pdf' && (
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>PDF File</label>
            <input
              type="file"
              accept=".pdf"
              onChange={e => setFile(e.target.files[0])}
              required
              style={{ fontSize: 12.5, color: 'var(--text-primary)' }}
            />
          </div>
        )}

        {type !== 'youtube_playlist' && type !== 'pdf' && (
          <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} required />
        )}

        {type === 'book' && (
          <>
            <Input label="Author" value={author} onChange={e => setAuthor(e.target.value)} />
            <Input label="Total pages" type="number" value={totalPages} onChange={e => setTotalPages(e.target.value)} />
            <Input label="URL (optional)" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} />
          </>
        )}

        {type === 'paper' && (
          <>
            <Input label="Authors (comma-separated)" value={authors} onChange={e => setAuthors(e.target.value)} />
            <Input label="Venue" value={venue} onChange={e => setVenue(e.target.value)} />
            <Input label="Year" type="number" value={year} onChange={e => setYear(e.target.value)} />
            <Input label="DOI (optional)" value={doi} onChange={e => setDoi(e.target.value)} />
            <Input label="URL (optional)" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} />
          </>
        )}

        {type === 'external_course' && (
          <>
            <Input label="Platform (e.g. Coursera)" value={platform} onChange={e => setPlatform(e.target.value)} />
            <Input label="URL" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} />
          </>
        )}

        {/* Folder */}
        <Select label="Folder (optional)" value={folderId} onChange={e => setFolderId(e.target.value)}>
          <option value="">None</option>
          {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </Select>

        {/* Labels */}
        {labels.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Labels</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {labels.map(l => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => toggleLabel(l.id)}
                  style={{
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontSize: 11,
                    cursor: 'pointer',
                    border: `0.5px solid ${selectedLabels.includes(l.id) ? l.color : 'var(--border-default)'}`,
                    backgroundColor: selectedLabels.includes(l.id) ? l.color + '22' : 'transparent',
                    color: selectedLabels.includes(l.id) ? l.color : 'var(--text-secondary)',
                  }}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <div style={{ fontSize: 12, color: 'red' }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <Button type="button" variant="secondary" size="sm" onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" disabled={loading}>
            {loading ? 'Adding...' : 'Add'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
