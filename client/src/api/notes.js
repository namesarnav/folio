import client from './client'

export const getNotes = (resourceId) => client.get('/notes', { params: { resource_id: resourceId } })
export const createNote = (data) => client.post('/notes', data)
export const updateNote = (id, content) => client.patch(`/notes/${id}`, { content })
export const deleteNote = (id) => client.delete(`/notes/${id}`)
