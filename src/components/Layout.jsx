import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'

export default function Layout({ children, activePage, setActivePage }) {
  const { user, logout } = useAuth()

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'transaksi', label: 'Transaksi', icon: '💸' },
    { id: 'riwayat', label: 'Riwayat', icon: '📋' },
    { id: 'budget', label: 'Budget', icon: '🎯' },
    { id: 'grafik', label: 'Grafik', icon: '📈' },
    { id: 'rekap', label: 'Rekap', icon: '🗓️' },
    { id: 'tabungan', label: 'Tabungan', icon: '🏦' },
    { id: 'hutang', label: 'Hutang', icon: '🤝' },
    { id: 'rutin', label: 'Rutin', icon: '🔄' },
    { id: 'insight', label: 'Insight', icon: '💡' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
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
        <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 min-h-screen p-4 gap-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                activePage === item.id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </aside>

        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-10">
        <div className="flex overflow-x-auto px-2 py-2 gap-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs transition-colors flex-shrink-0 ${
                activePage === item.id ? 'text-blue-600 bg-blue-50' : 'text-gray-400'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}