import { useMemo } from 'react'

export default function Insight({ transactions }) {
  const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

  const insights = useMemo(() => {
    const now = new Date()
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
    const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`

    const thisMonthTx = transactions.filter(t => t.date.startsWith(thisMonth))
    const lastMonthTx = transactions.filter(t => t.date.startsWith(lastMonthKey))

    const thisIncome = thisMonthTx.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0)
    const thisOutcome = thisMonthTx.filter(t => t.type === 'outcome').reduce((a, b) => a + b.amount, 0)
    const lastOutcome = lastMonthTx.filter(t => t.type === 'outcome').reduce((a, b) => a + b.amount, 0)

    // Kategori paling boros
    const categoryMap = {}
    thisMonthTx.filter(t => t.type === 'outcome').forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount
    })
    const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0]

    // Hari paling boros
    const dayMap = {}
    thisMonthTx.filter(t => t.type === 'outcome').forEach(t => {
      const day = new Date(t.date).toLocaleDateString('id-ID', { weekday: 'long' })
      dayMap[day] = (dayMap[day] || 0) + t.amount
    })
    const topDay = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0]

    // Perbandingan bulan lalu
    const diffPct = lastOutcome > 0 ? ((thisOutcome - lastOutcome) / lastOutcome * 100).toFixed(0) : null

    // Rata-rata pengeluaran harian
    const daysInMonth = now.getDate()
    const avgDaily = thisOutcome / daysInMonth

    // Saving rate
    const savingRate = thisIncome > 0 ? ((thisIncome - thisOutcome) / thisIncome * 100).toFixed(0) : null

    return { thisIncome, thisOutcome, topCategory, topDay, diffPct, avgDaily, savingRate, thisMonth, lastMonthKey }
  }, [transactions])

  if (transactions.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <div className="text-5xl mb-3">💡</div>
        <p>Tambah transaksi dulu untuk melihat insight</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Insight Keuangan</h2>
        <p className="text-gray-500 text-sm">Analisis otomatis bulan ini</p>
      </div>

      <div className="space-y-3">

        {/* Saving rate */}
        {insights.savingRate !== null && (
          <div className={`rounded-2xl p-4 ${parseInt(insights.savingRate) >= 20 ? 'bg-green-50' : parseInt(insights.savingRate) >= 0 ? 'bg-yellow-50' : 'bg-red-50'}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{parseInt(insights.savingRate) >= 20 ? '🎉' : parseInt(insights.savingRate) >= 0 ? '⚠️' : '🚨'}</span>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Saving rate bulan ini: {insights.savingRate}%</p>
                <p className="text-xs text-gray-500">
                  {parseInt(insights.savingRate) >= 20 ? 'Bagus! Kamu menabung lebih dari 20% penghasilan.' :
                   parseInt(insights.savingRate) >= 0 ? 'Masih bisa ditingkatkan. Target saving rate minimal 20%.' :
                   'Pengeluaran melebihi pemasukan bulan ini!'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Kategori paling boros */}
        {insights.topCategory && (
          <div className="bg-orange-50 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Paling boros: {insights.topCategory[0]}</p>
                <p className="text-xs text-gray-500">Bulan ini kamu menghabiskan {fmt(insights.topCategory[1])} untuk {insights.topCategory[0]}.</p>
              </div>
            </div>
          </div>
        )}

        {/* Perbandingan bulan lalu */}
        {insights.diffPct !== null && (
          <div className={`rounded-2xl p-4 ${parseInt(insights.diffPct) > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{parseInt(insights.diffPct) > 0 ? '📈' : '📉'}</span>
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  Pengeluaran {parseInt(insights.diffPct) > 0 ? 'naik' : 'turun'} {Math.abs(insights.diffPct)}% dari bulan lalu
                </p>
                <p className="text-xs text-gray-500">
                  {parseInt(insights.diffPct) > 0 ? 'Coba kurangi pengeluaran bulan depan.' : 'Pertahankan kebiasaan baik ini!'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hari paling boros */}
        {insights.topDay && (
          <div className="bg-purple-50 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Paling sering boros hari {insights.topDay[0]}</p>
                <p className="text-xs text-gray-500">Total {fmt(insights.topDay[1])} keluar di hari {insights.topDay[0]} bulan ini.</p>
              </div>
            </div>
          </div>
        )}

        {/* Rata-rata harian */}
        <div className="bg-blue-50 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Rata-rata pengeluaran harian</p>
              <p className="text-xs text-gray-500">{fmt(Math.round(insights.avgDaily))} per hari bulan ini.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}