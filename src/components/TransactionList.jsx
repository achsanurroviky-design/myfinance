import { useState } from 'react'

export default function TransactionList({ transactions, deleteTransaction }) {
  const [filterType, setFilterType] = useState('all')
  const [filterMonth, setFilterMonth] = useState('')
  const [search, setSearch] = useState('')

  const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

  const filtered = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false
    if (filterMonth && !t.date.startsWith(filterMonth)) return false
    if (search && !t.category.toLowerCase().includes(search.toLowerCase()) && !t.note?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const months = [...new Set(transactions.map(t => t.date.slice(0, 7)))].sort().reverse()

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Riwayat Transaksi</h2>
        <p className="text-gray-500 text-sm">{filtered.length} transaksi ditemukan</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <input
          type="text"
          placeholder="Cari kategori atau catatan..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
        />
        <div className="flex gap-2 flex-wrap">
          {['all', 'income', 'outcome'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                filterType === t ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {t === 'all' ? 'Semua' : t === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            </button>
          ))}
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs bg-gray-100 text-gray-600 focus:outline-none"
          >
            <option value="">Semua bulan</option>
            {months.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-sm">Tidak ada transaksi</p>
          </div>
        ) : (
          filtered.map(t => (
            <div key={t.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${t.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
                  {t.type === 'income' ? '⬆️' : '⬇️'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{t.category}</p>
                  <p className="text-xs text-gray-400">{t.note || '-'} · {new Date(t.date).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className={`text-sm font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                </p>
                <button
                  onClick={() => deleteTransaction(t.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors text-lg"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}