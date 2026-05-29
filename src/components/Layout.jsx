import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'

export default function Layout({ children, activePage, setActivePage }) {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'transaksi', label: 'Transaksi', icon: '💸' },
    { id: 'riwayat', label: 'Riwayat', icon: '📋' },
    { id: 'budget', label: 'Budget', icon: '🎯' },
    { id: 'grafik', label: 'Grafik', icon: '📈' },
    { id: 'rekap', label: 'Rekap', icon: '🗓️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navbar */}
      <nav className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">💰</span>
          <span className="font-bold text-gray-800">MyFinance</span>
        </div>
        <div className="flex items-center gap-3">
          <img src={user?.photoURL} className="w-8 h-8 rounded-full" alt={user?.displayName} />
          <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500 transition-colors">
            Keluar
          </button>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar desktop */}
        <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 min-h-screen p-4 gap-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                activePage === item.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>

      {/* Bottom navbar mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2 flex justify-around z-10">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs transition-colors ${
              activePage === item.id ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}