import { useMemo } from 'react'

export default function RekapBulanan({ transactions }) {
  const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

  const rekap = useMemo(() => {
    const map = {}
    transactions.forEach(t => {
      const m = t.date.slice(0, 7)
      if (!map[m]) map[m] = { month: m, income: 0, outcome: 0, transactions: [] }
      map[m][t.type] += t.amount
      map[m].transactions.push(t)
    })
    return Object.values(map).sort((a, b) => b.month.localeCompare(a.month))
  }, [transactions])

  const exportCSV = () => {
    const rows = [['Tanggal', 'Tipe', 'Kategori', 'Catatan', 'Nominal']]
    transactions.forEach(t => {
      rows.push([
        new Date(t.date).toLocaleDateString('id-ID'),
        t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        t.category,
        t.note || '',
        t.amount
      ])
    })
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `myfinance-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }

  if (rekap.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <div className="text-5xl mb-3">🗓️</div>
        <p>Belum ada data rekap</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Rekap Bulanan</h2>
          <p className="text-gray-500 text-sm">Ringkasan per bulan</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-600 transition-colors"
        >
          📥 Export CSV
        </button>
      </div>

      <div className="space-y-3">
        {rekap.map(r => (
          <div key={r.month} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">{r.month}</h3>
              <span className={`text-sm font-bold ${r.income - r.outcome >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {fmt(r.income - r.outcome)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Pemasukan</p>
                <p className="text-sm font-semibold text-green-600">{fmt(r.income)}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Pengeluaran</p>
                <p className="text-sm font-semibold text-red-500">{fmt(r.outcome)}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{r.transactions.length} transaksi</p>
          </div>
        ))}
      </div>
    </div>
  )
}