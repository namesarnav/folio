import client from './client'

export const uploadFile = (file) => {
  const form = new FormData()
  form.append('file', file)
  return client.post('/files/upload', form)
}

export const getFileUrl = (id) => client.get(`/files/${id}/url`)
export const updatePage = (id, page) => client.patch(`/files/${id}/page`, { page })
export const deleteFile = (id) => client.delete(`/files/${id}`)
