import client from './client'

export const importPlaylist = (url, folder_id, label_ids) =>
  client.post('/playlists/import', { url, folder_id, label_ids })

export const toggleVideoComplete = (resourceId, videoId) =>
  client.patch(`/playlists/${resourceId}/videos/${videoId}/complete`)
