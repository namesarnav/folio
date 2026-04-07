import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getResource } from '../api/resources'
import CourseView from './CourseView'
import PDFViewer from './PDFViewer'
import ResourceDetail from './ResourceDetail'
import PageWrapper from '../components/layout/PageWrapper'

export default function ResourceRouter() {
  const { id } = useParams()
  const [type, setType] = useState(null)

  useEffect(() => {
    getResource(id)
      .then(({ data }) => setType(data.resource_type))
      .catch(() => setType('unknown'))
  }, [id])

  if (!type) return (
    <PageWrapper>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
        Loading...
      </div>
    </PageWrapper>
  )

  if (type === 'youtube_playlist') return <CourseView />
  if (type === 'pdf') return <PDFViewer />
  return <ResourceDetail />
}
