import Sidebar from './Sidebar'

export default function PageWrapper({ children }) {
  return (
    <div style={{ display: 'flex', height: '100%', backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  )
}
