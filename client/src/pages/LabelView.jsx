import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import Topbar from '../components/layout/Topbar'
import ResourceGrid from '../components/resources/ResourceGrid'
import { getLabelResources, getLabels } from '../api/labels'
import { deleteResource } from '../api/resources'

export default function LabelView() {
  const { id } = useParams()
  const [resources, setResources] = useState([])
  const [labels, setLabels] = useState([])
  const [labelName, setLabelName] = useState('Label')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [resRes, allLabels] = await Promise.all([
          getLabelResources(id),
          getLabels(),
        ])
        setResources(resRes.data)
        setLabels(allLabels.data)
        const thisLabel = allLabels.data.find(l => l.id === id)
        if (thisLabel) setLabelName(thisLabel.name)
      } catch {}
      setLoading(false)
    }
    load()
  }, [id])

  const handleDelete = async (resource) => {
    if (!confirm(`Delete "${resource.title}"?`)) return
    await deleteResource(resource.id)
    setResources(prev => prev.filter(r => r.id !== resource.id))
  }

  return (
    <PageWrapper>
      <Topbar title={labelName} />
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {loading ? (
          <div style={{ color: 'var(--text-tertiary)', fontSize: 13, textAlign: 'center', paddingTop: 40 }}>Loading...</div>
        ) : resources.length === 0 ? (
          <div style={{ color: 'var(--text-tertiary)', fontSize: 13, textAlign: 'center', paddingTop: 80 }}>
            No resources with this label
          </div>
        ) : (
          <ResourceGrid resources={resources} labels={labels} onDelete={handleDelete} />
        )}
      </div>
    </PageWrapper>
  )
}
