import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import Topbar from '../components/layout/Topbar'
import ResourceGrid from '../components/resources/ResourceGrid'
import Button from '../components/ui/Button'
import { getFolderResources } from '../api/folders'
import { getLabels } from '../api/labels'

export default function FolderView() {
  const { id } = useParams()
  const [resources, setResources] = useState([])
  const [labels, setLabels] = useState([])
  const [folderName, setFolderName] = useState('Folder')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [resRes, labelsRes] = await Promise.all([
          getFolderResources(id),
          getLabels(),
        ])
        setResources(resRes.data)
        setLabels(labelsRes.data)
      } catch {}
      setLoading(false)
    }
    load()
  }, [id])

  return (
    <PageWrapper>
      <Topbar title={folderName} />
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {loading ? (
          <div style={{ color: 'var(--text-tertiary)', fontSize: 13, textAlign: 'center', paddingTop: 40 }}>Loading...</div>
        ) : resources.length === 0 ? (
          <div style={{ color: 'var(--text-tertiary)', fontSize: 13, textAlign: 'center', paddingTop: 80 }}>
            No resources in this folder
          </div>
        ) : (
          <ResourceGrid resources={resources} labels={labels} />
        )}
      </div>
    </PageWrapper>
  )
}
