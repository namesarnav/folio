import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import useAuth from './hooks/useAuth'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import LibraryView from './pages/LibraryView'
import FolderView from './pages/FolderView'
import LabelView from './pages/LabelView'
import ResourceRouter from './pages/ResourceRouter'

// Apply saved theme on load
const savedTheme = localStorage.getItem('theme') || 'light'
document.documentElement.setAttribute('data-theme', savedTheme)

function ProtectedRoute({ children }) {
  const { accessToken, checking } = useAuth()
  if (checking) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', color: 'var(--text-tertiary)', fontSize: 13 }}>
      Loading...
    </div>
  )
  if (!accessToken) return <Navigate to="/login" replace />
  return children
}

function HomeRoute() {
  const { accessToken, checking } = useAuth()
  if (checking) return null
  if (accessToken) return <Navigate to="/dashboard" replace />
  return <Landing />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/library/:type" element={<ProtectedRoute><LibraryView /></ProtectedRoute>} />
        <Route path="/folders/:id" element={<ProtectedRoute><FolderView /></ProtectedRoute>} />
        <Route path="/labels/:id" element={<ProtectedRoute><LabelView /></ProtectedRoute>} />
        <Route path="/resources/:id" element={<ProtectedRoute><ResourceRouter /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
