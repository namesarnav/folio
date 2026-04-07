import { useEffect, useState } from 'react'
import PageWrapper from '../components/layout/PageWrapper'
import Topbar from '../components/layout/Topbar'
import ResourceGrid from '../components/resources/ResourceGrid'
import Button from '../components/ui/Button'
import { getResources } from '../api/resources'
import { getLabels } from '../api/labels'
import AddResourceModal from '../components/resources/AddResourceModal'
import EditResourceModal from '../components/resources/EditResourceModal'

export default function Dashboard() {
  const [inProgress, setInProgress] = useState([])
  const [recent, setRecent] = useState([])
  const [labels, setLabels] = useState([])
  const [addOpen, setAddOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Edit state
  const [editResource, setEditResource] = useState(null)

  // Label filter
  const [filterLabelId, setFilterLabelId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [ipRes, allRes, labelsRes] = await Promise.all([
        getResources({ status: 'in_progress' }),
        getResources({}),
        getLabels(),
      ])
      setInProgress(ipRes.data)
      setRecent(allRes.data.slice(0, 6))
      setLabels(labelsRes.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filterByLabel = (resources) => {
    if (!filterLabelId) return resources
    return resources.filter(r => r.label_ids?.includes(filterLabelId))
  }

  const handleSaved = (updated) => {
    const patch = (list) => list.map(r => r.id === updated.id ? updated : r)
    setInProgress(patch)
    setRecent(patch)
  }

  const filteredInProgress = filterByLabel(inProgress)
  const filteredRecent = filterByLabel(recent)

  return (
    <PageWrapper>
      <Topbar
        title="Dashboard"
        actions={
          <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
            + Add
          </Button>
        }
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {/* Label filter bar */}
        {labels.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
            <button
              onClick={() => setFilterLabelId(null)}
              style={{
                padding: '3px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                border: `1.5px solid ${!filterLabelId ? 'var(--text-primary)' : 'var(--border-strong)'}`,
                backgroundColor: !filterLabelId ? 'var(--text-primary)' : 'transparent',
                color: !filterLabelId ? 'var(--bg-primary)' : 'var(--text-secondary)',
                transition: 'all 0.12s',
              }}
            >
              All
            </button>
            {labels.map(l => {
              const active = filterLabelId === l.id
              return (
                <button
                  key={l.id}
                  onClick={() => setFilterLabelId(active ? null : l.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: `1.5px solid ${active ? l.color : 'var(--border-strong)'}`,
                    backgroundColor: active ? `${l.color}22` : 'transparent',
                    color: active ? l.color : 'var(--text-secondary)',
                    transition: 'all 0.12s',
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: l.color, flexShrink: 0 }} />
                  {l.name}
                </button>
              )
            })}
          </div>
        )}

        {loading ? (
          <div style={{ color: 'var(--text-tertiary)', fontSize: 13, paddingTop: 40, textAlign: 'center' }}>Loading...</div>
        ) : (
          <>
            {filteredInProgress.length > 0 && (
              <section style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  In Progress
                </div>
                <ResourceGrid resources={filteredInProgress} labels={labels} onEdit={setEditResource} />
              </section>
            )}

            {filteredRecent.length > 0 && (
              <section>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Recently Added
                </div>
                <ResourceGrid resources={filteredRecent} labels={labels} onEdit={setEditResource} />
              </section>
            )}

            {filteredInProgress.length === 0 && filteredRecent.length === 0 && (
              <div style={{ textAlign: 'center', paddingTop: 80, color: 'var(--text-tertiary)' }}>
                {filterLabelId ? (
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No resources with this label.</div>
                ) : (
                  <>
                    <div style={{ fontSize: 14, marginBottom: 8, color: 'var(--text-secondary)' }}>No resources yet</div>
                    <div style={{ fontSize: 13, marginBottom: 20 }}>Add your first YouTube playlist, book, or PDF to get started.</div>
                    <Button variant="primary" onClick={() => setAddOpen(true)}>+ Add resource</Button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <AddResourceModal open={addOpen} onClose={() => setAddOpen(false)} onAdded={load} />

      {editResource && (
        <EditResourceModal
          open={!!editResource}
          onClose={() => setEditResource(null)}
          resource={editResource}
          labels={labels}
          onSaved={handleSaved}
          onLabelsChange={setLabels}
        />
      )}
    </PageWrapper>
  )
}
