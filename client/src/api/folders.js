import client from './client'

export const getFolders = () => client.get('/folders')
export const createFolder = (data) => client.post('/folders', data)
export const updateFolder = (id, data) => client.patch(`/folders/${id}`, data)
export const deleteFolder = (id) => client.delete(`/folders/${id}`)
export const getFolderResources = (id) => client.get(`/folders/${id}/resources`)
