import client from './client'

export const getLabels = () => client.get('/labels')
export const createLabel = (data) => client.post('/labels', data)
export const updateLabel = (id, data) => client.patch(`/labels/${id}`, data)
export const deleteLabel = (id) => client.delete(`/labels/${id}`)
export const getLabelResources = (id) => client.get(`/labels/${id}/resources`)
