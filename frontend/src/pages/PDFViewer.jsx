import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import Topbar from '../components/layout/Topbar'
import Button from '../components/ui/Button'
import { getResource } from '../api/resources'
import { getFileUrl, updatePage } from '../api/files'
import { getNotes, createNote, deleteNote } from '../api/notes'

export default function PDFViewer() {
  const { id } = useParams()
  const [resource, setResource] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [notes, setNotes] = useState([])
  const [noteText, setNoteText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const canvasRef = useRef(null)
  const pdfRef = useRef(null)
  const renderingRef = useRef(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [rRes, urlRes, nRes] = await Promise.all([
          getResource(id),
          getFileUrl(id),
          getNotes(id),
        ])
        setResource(rRes.data)
        setPdfUrl(urlRes.data.url)
        setNotes(nRes.data)
        const lastPage = rRes.data.last_page_read || 1
        setCurrentPage(lastPage)
        setTotalPages(rRes.data.total_pages || 0)
      } catch {}
    }
    load()
  }, [id])

  useEffect(() => {
    if (!pdfUrl) return
    loadPdf(pdfUrl)
  }, [pdfUrl])

  useEffect(() => {
    if (pdfRef.current) renderPage(currentPage)
  }, [currentPage])

  const loadPdf = async (url) => {
    try {
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.mjs',
        import.meta.url
      ).toString()
      const pdf = await pdfjsLib.getDocument(url).promise
      pdfRef.current = pdf
      setTotalPages(pdf.numPages)
      renderPage(currentPage)
    } catch (err) {
      console.error('PDF load error', err)
    }
  }

  const renderPage = async (pageNum) => {
    if (!pdfRef.current || renderingRef.current) return
    renderingRef.current = true
    try {
      const page = await pdfRef.current.getPage(pageNum)
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const viewport = page.getViewport({ scale: 1.5 })
      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({ canvasContext: ctx, viewport }).promise
    } catch {}
    renderingRef.current = false
  }

  const changePage = async (newPage) => {
    if (newPage < 1 || newPage > totalPages) return
    setCurrentPage(newPage)
    try {
      await updatePage(id, newPage)
    } catch {}
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

  return (
    <PageWrapper>
      <Topbar title={resource?.title || 'PDF Viewer'} />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* PDF canvas */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Page controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 16px',
            borderBottom: '0.5px solid var(--border-default)',
            backgroundColor: 'var(--bg-primary)',
          }}>
            <Button variant="secondary" size="sm" onClick={() => changePage(currentPage - 1)} disabled={currentPage <= 1}>
              ←
            </Button>
            <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
              {currentPage} / {totalPages}
            </span>
            <Button variant="secondary" size="sm" onClick={() => changePage(currentPage + 1)} disabled={currentPage >= totalPages}>
              →
            </Button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#888', display: 'flex', justifyContent: 'center', padding: 20 }}>
            {pdfUrl ? (
              <canvas ref={canvasRef} style={{ maxWidth: '100%', borderRadius: 4 }} />
            ) : (
              <div style={{ color: '#fff', fontSize: 13, alignSelf: 'center' }}>Loading PDF...</div>
            )}
          </div>
        </div>

        {/* Notes panel */}
        <div style={{
          width: 280,
          borderLeft: '0.5px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '12px 14px', borderBottom: '0.5px solid var(--border-default)' }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Notes
            </span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Add a note..."
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '0.5px solid var(--border-strong)',
                  borderRadius: 6,
                  padding: '7px 10px',
                  fontSize: 12.5,
                  color: 'var(--text-primary)',
                  outline: 'none',
                  resize: 'none',
                  minHeight: 70,
                  fontFamily: 'inherit',
                }}
              />
              <Button variant="primary" size="sm" onClick={handleAddNote}>Add</Button>
            </div>
            {notes.map(note => (
              <div key={note.id} style={{
                backgroundColor: 'var(--bg-card)',
                border: '0.5px solid var(--border-default)',
                borderRadius: 8,
                padding: '8px 10px',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 6,
              }}>
                <div style={{ fontSize: 12.5, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', flex: 1 }}>
                  {note.content}
                </div>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  style={{ color: 'var(--text-tertiary)', cursor: 'pointer', background: 'none', border: 'none', fontSize: 14, flexShrink: 0 }}
                >×</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
