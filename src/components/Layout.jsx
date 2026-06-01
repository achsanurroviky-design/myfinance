import { useAuth } from '../hooks/useAuth'

export default function Layout({ children, activePage, setActivePage }) {
  const { user, logout } = useAuth()

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'transaksi', label: 'Transaksi', icon: '➕' },
    { id: 'riwayat', label: 'Riwayat', icon: '📋' },
    { id: 'budget', label: 'Budget', icon: '🎯' },
    { id: 'grafik', label: 'Grafik', icon: '📈' },
    { id: 'rekap', label: 'Rekap', icon: '🗓️' },
    { id: 'tabungan', label: 'Tabungan', icon: '🏦' },
    { id: 'hutang', label: 'Hutang', icon: '🤝' },
    { id: 'rutin', label: 'Rutin', icon: '🔄' },
    { id: 'insight', label: 'Insight', icon: '💡' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#070F1E' }}>
      <style>{`
        .sidebar { display: none; }
        .mobile-nav { display: flex; }
        @media (min-width: 768px) {
          .sidebar { display: flex !important; }
          .mobile-nav { display: none !important; }
        }
        .nav-btn:hover { background: #0F2040 !important; color: #C0C8D8 !important; }
      `}</style>

      {/* Top navbar */}
      <nav style={{
        background: '#0A1628', borderBottom: '0.5px solid #1A3050',
        padding: '12px 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: '#0F2040', border: '0.5px solid #1A3050',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
          }}>💎</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#C0C8D8', letterSpacing: 2 }}>MYFINANCE</div>
            <div style={{ fontSize: 9, color: '#3D5A80', letterSpacing: 1 }}>WEALTH TRACKER</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user?.photoURL && (
            <img src={user.photoURL} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #1A3050' }} alt="" />
          )}
          <div style={{ fontSize: 11, color: '#3D5A80' }}>{user?.displayName?.split(' ')[0]}</div>
          <button onClick={() => setActivePage('settings')} style={{
            fontSize: 11, color: '#3D5A80', background: 'none',
            border: '0.5px solid #1A3050', cursor: 'pointer',
            padding: '4px 10px', borderRadius: 6
          }}>⚙️</button>
        </div>
      </nav>

      <div style={{ display: 'flex' }}>
        {/* Sidebar desktop */}
        <aside className="sidebar" style={{
          width: 200, background: '#0A1628', borderRight: '0.5px solid #1A3050',
          minHeight: 'calc(100vh - 57px)', padding: '12px 10px',
          flexDirection: 'column', gap: 2, position: 'sticky', top: 57,
          alignSelf: 'flex-start', height: 'calc(100vh - 57px)', overflowY: 'auto'
        }}>
          {navItems.map(item => (
            <button key={item.id} className="nav-btn" onClick={() => setActivePage(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, border: 'none',
              cursor: 'pointer', textAlign: 'left', width: '100%',
              background: activePage === item.id ? '#0F2040' : 'transparent',
              color: activePage === item.id ? '#C0C8D8' : '#3D5A80',
              fontSize: 13, fontWeight: activePage === item.id ? 500 : 400,
              borderLeft: activePage === item.id ? '2px solid #C0C8D8' : '2px solid transparent',
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '0.5px solid #1A3050' }}>
            <div style={{ fontSize: 10, color: '#3D5A80', letterSpacing: 0.5 }}>Logged in as</div>
            <div style={{ fontSize: 11, color: '#C0C8D8', marginTop: 2 }}>{user?.displayName}</div>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '20px 16px', paddingBottom: 88, minHeight: 'calc(100vh - 57px)' }}>
          {children}
        </main>
      </div>

      {/* Bottom navbar mobile */}
      <nav className="mobile-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#0A1628', borderTop: '0.5px solid #1A3050',
        zIndex: 10, overflowX: 'auto', padding: '6px 8px', gap: 2
      }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => setActivePage(item.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            padding: '4px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: activePage === item.id ? '#0F2040' : 'transparent',
            color: activePage === item.id ? '#C0C8D8' : '#3D5A80',
            fontSize: 10, flexShrink: 0, whiteSpace: 'nowrap',
          }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}