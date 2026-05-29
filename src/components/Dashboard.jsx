import { useMemo } from 'react'

export default function Dashboard({ transactions, setActivePage }) {
  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = transactions.filter(t => {
      const d = new Date(t.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const income = thisMonth.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0)
    const outcome = thisMonth.filter(t => t.type === 'outcome').reduce((a, b) => a + b.amount, 0)
    return { income, outcome, balance: income - outcome, total: transactions.length }
  }, [transactions])

  const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

  const recent = transactions.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 text-sm">Ringkasan keuangan bulan ini</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Saldo', value: stats.balance, color: stats.balance >= 0 ? 'text-blue-600' : 'text-red-500', bg: 'bg-blue-50' },
          { label: 'Pemasukan', value: stats.income, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Pengeluaran', value: stats.outcome, color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'Transaksi', value: stats.total, color: 'text-purple-600', bg: 'bg-purple-50', isCount: true },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`font-bold text-sm md:text-base ${s.color}`}>
              {s.isCount ? s.value : fmt(s.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Transaksi terbaru */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Transaksi terbaru</h3>
          <button onClick={() => setActivePage('riwayat')} className="text-blue-500 text-sm hover:underline">
            Lihat semua
          </button>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-sm">Belum ada transaksi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map(t => (
              <div key={t.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${t.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
                    {t.type === 'income' ? '⬆️' : '⬇️'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{t.category}</p>
                    <p className="text-xs text-gray-400">{t.note || '-'}</p>
                  </div>
                </div>
                <p className={`text-sm font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setActivePage('transaksi')} className="bg-blue-500 text-white rounded-2xl p-4 text-sm font-medium hover:bg-blue-600 transition-colors">
          + Tambah Transaksi
        </button>
        <button onClick={() => setActivePage('grafik')} className="bg-white border border-gray-100 text-gray-700 rounded-2xl p-4 text-sm font-medium hover:bg-gray-50 transition-colors">
          📈 Lihat Grafik
        </button>
      </div>
    </div>
  )
}