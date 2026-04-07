import client from './client'

export const getResources = (params) => client.get('/resources', { params })
export const createResource = (data) => client.post('/resources', data)
export const getResource = (id) => client.get(`/resources/${id}`)
export const updateResource = (id, data) => client.patch(`/resources/${id}`, data)
export const deleteResource = (id) => client.delete(`/resources/${id}`)
export const reorderResource = (id, order) => client.patch(`/resources/${id}/reorder`, { order })
