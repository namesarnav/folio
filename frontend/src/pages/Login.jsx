import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../api/auth'
import useAuthStore from '../store/authStore'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const setAccessToken = useAuthStore(s => s.setAccessToken)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const fn = mode === 'login' ? login : register
      const { data } = await fn(email, password)
      setAccessToken(data.access_token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
    }}>
      <div style={{
        width: 360,
        backgroundColor: 'var(--bg-card)',
        border: '0.5px solid var(--border-default)',
        borderRadius: 10,
        padding: 28,
      }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            folio
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          {error && (
            <div style={{ fontSize: 12, color: 'red', padding: '4px 0' }}>{error}</div>
          )}
          <Button variant="primary" size="lg" type="submit" disabled={loading} className="w-full justify-center mt-1">
            {loading ? 'Loading...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <div style={{ marginTop: 16, fontSize: 12.5, color: 'var(--text-secondary)', textAlign: 'center' }}>
          {mode === 'login' ? (
            <>Don't have an account?{' '}
              <button onClick={() => setMode('register')} style={{ color: 'var(--blue-text)', cursor: 'pointer', background: 'none', border: 'none', fontSize: 'inherit' }}>
                Sign up
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button onClick={() => setMode('login')} style={{ color: 'var(--blue-text)', cursor: 'pointer', background: 'none', border: 'none', fontSize: 'inherit' }}>
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
