import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { updateResource } from '../../api/resources'
import { createLabel } from '../../api/labels'

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#64748b',
]

export default function EditResourceModal({ open, onClose, resource, labels, onSaved, onLabelsChange }) {
  const [title, setTitle] = useState(resource?.title || '')
  const [selectedLabelIds, setSelectedLabelIds] = useState(resource?.label_ids || [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // New label form
  const [showNewLabel, setShowNewLabel] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState(PRESET_COLORS[0])
  const [creatingLabel, setCreatingLabel] = useState(false)

  // Sync state when resource changes
  const [lastResourceId, setLastResourceId] = useState(null)
  if (resource && resource.id !== lastResourceId) {
    setLastResourceId(resource.id)
    setTitle(resource.title)
    setSelectedLabelIds(resource.label_ids || [])
    setShowNewLabel(false)
    setNewLabelName('')
    setError('')
  }

  const toggleLabel = (id) => {
    setSelectedLabelIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return
    setCreatingLabel(true)
    try {
      const res = await createLabel({ name: newLabelName.trim(), color: newLabelColor })
      const created = res.data
      onLabelsChange([...labels, created])
      setSelectedLabelIds(prev => [...prev, created.id])
      setNewLabelName('')
      setNewLabelColor(PRESET_COLORS[0])
      setShowNewLabel(false)
    } catch {
      setError('Failed to create label')
    }
    setCreatingLabel(false)
  }

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError('')
    try {
      const res = await updateResource(resource.id, { title: title.trim(), label_ids: selectedLabelIds })
      onSaved(res.data)
      onClose()
    } catch {
      setError('Failed to save changes')
    }
    setSaving(false)
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit resource" width={440}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
        />

        {/* Labels */}
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 8 }}>
            Labels
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {labels.map(l => {
              const active = selectedLabelIds.includes(l.id)
              return (
                <button
                  key={l.id}
                  onClick={() => toggleLabel(l.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '3px 9px',
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
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    backgroundColor: l.color, flexShrink: 0,
                  }} />
                  {l.name}
                </button>
              )
            })}
            <button
              onClick={() => setShowNewLabel(v => !v)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 9px',
                borderRadius: 20,
                fontSize: 12,
                cursor: 'pointer',
                border: '1.5px dashed var(--border-strong)',
                backgroundColor: 'transparent',
                color: 'var(--text-tertiary)',
              }}
            >
              + new label
            </button>
          </div>

          {/* Inline new label form */}
          {showNewLabel && (
            <div style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: '0.5px solid var(--border-default)',
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}>
              <input
                placeholder="Label name"
                value={newLabelName}
                onChange={e => setNewLabelName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateLabel()}
                autoFocus
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '0.5px solid var(--border-strong)',
                  borderRadius: 6,
                  padding: '6px 9px',
                  fontSize: 12,
                  color: 'var(--text-primary)',
                  outline: 'none',
                  width: '100%',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)', flexShrink: 0 }}>Color</span>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setNewLabelColor(c)}
                      style={{
                        width: 18, height: 18,
                        borderRadius: '50%',
                        backgroundColor: c,
                        border: newLabelColor === c ? '2px solid var(--text-primary)' : '2px solid transparent',
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Button size="sm" variant="primary" onClick={handleCreateLabel} disabled={creatingLabel || !newLabelName.trim()}>
                  {creatingLabel ? 'Creating…' : 'Create'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setShowNewLabel(false); setNewLabelName('') }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {error && <div style={{ fontSize: 12, color: 'var(--red-text, #ef4444)' }}>{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
