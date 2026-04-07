import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import Topbar from '../components/layout/Topbar'
import ResourceGrid from '../components/resources/ResourceGrid'
import Button from '../components/ui/Button'
import { getResources } from '../api/resources'
import { getLabels } from '../api/labels'
import AddResourceModal from '../components/resources/AddResourceModal'

const TYPE_MAP = {
  videos: 'youtube_playlist',
  pdfs: 'pdf',
  books: 'book',
  papers: 'paper',
}

const TITLE_MAP = {
  videos: 'Videos',
  pdfs: 'PDFs',
  books: 'Books',
  papers: 'Papers',
}

export default function LibraryView() {
  const { type } = useParams()
  const [resources, setResources] = useState([])
  const [labels, setLabels] = useState([])
  const [addOpen, setAddOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (type && TYPE_MAP[type]) params.type = TYPE_MAP[type]
      const [rRes, lRes] = await Promise.all([
        getResources(params),
        getLabels(),
      ])
      setResources(rRes.data)
      setLabels(lRes.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [type])

  const title = TITLE_MAP[type] || 'Library'

  return (
    <PageWrapper>
      <Topbar
        title={title}
        actions={
          <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>+ Add</Button>
        }
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {loading ? (
          <div style={{ color: 'var(--text-tertiary)', fontSize: 13, textAlign: 'center', paddingTop: 40 }}>Loading...</div>
        ) : resources.length === 0 ? (
          <div style={{ color: 'var(--text-tertiary)', fontSize: 13, textAlign: 'center', paddingTop: 80 }}>
            No {title.toLowerCase()} yet
          </div>
        ) : (
          <ResourceGrid resources={resources} labels={labels} />
        )}
      </div>
      <AddResourceModal open={addOpen} onClose={() => setAddOpen(false)} onAdded={load} />
    </PageWrapper>
  )
}
