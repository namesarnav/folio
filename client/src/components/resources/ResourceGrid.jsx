import ResourceCard from './ResourceCard'

export default function ResourceGrid({ resources, labels = [], onEdit, onDelete }) {
  if (!resources.length) return null
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 10,
    }}
      className="resource-grid"
    >
      {resources.map(r => (
        <ResourceCard key={r.id} resource={r} labels={labels} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
