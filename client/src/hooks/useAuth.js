import axios from 'axios'
import { useEffect, useState } from 'react'
import useAuthStore from '../store/authStore'

export default function useAuth() {
  const { accessToken, setAccessToken } = useAuthStore()
  const [checking, setChecking] = useState(!accessToken)

  useEffect(() => {
    if (accessToken) { setChecking(false); return }
    // Use raw axios (not the intercepted client) so a failed refresh
    // doesn't trigger the interceptor's window.location.href = '/login'
    axios.post('/api/v1/auth/refresh', {}, { withCredentials: true })
      .then(({ data }) => setAccessToken(data.access_token))
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [accessToken])

  return { accessToken, checking }
}
