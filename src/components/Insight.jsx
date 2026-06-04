import { useMemo } from 'react'
import { formatCurrency } from '../utils/currency'

export default function Insight({ transactions, currency = 'IDR' }) {
  const fmt = (n) => formatCurrency(n, currency)

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

    const categoryMap = {}
    thisMonthTx.filter(t => t.type === 'outcome').forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount
    })
    const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0]

    const dayMap = {}
    thisMonthTx.filter(t => t.type === 'outcome').forEach(t => {
      const day = new Date(t.date).toLocaleDateString('id-ID', { weekday: 'long' })
      dayMap[day] = (dayMap[day] || 0) + t.amount
    })
    const topDay = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0]

    const diffPct = lastOutcome > 0 ? ((thisOutcome - lastOutcome) / lastOutcome * 100).toFixed(0) : null
    const daysInMonth = now.getDate()
    const avgDaily = thisOutcome / daysInMonth
    const savingRate = thisIncome > 0 ? ((thisIncome - thisOutcome) / thisIncome * 100).toFixed(0) : null

    return { thisIncome, thisOutcome, topCategory, topDay, diffPct, avgDaily, savingRate }
  }, [transactions])

  if (transactions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: '#3D5A80' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>💡</div>
        <div style={{ fontSize: 13 }}>Tambah transaksi dulu untuk melihat insight</div>
      </div>
    )
  }

  const cards = [
    insights.savingRate !== null && {
      icon: parseInt(insights.savingRate) >= 20 ? '🎉' : parseInt(insights.savingRate) >= 0 ? '⚠️' : '🚨',
      title: `Saving rate bulan ini: ${insights.savingRate}%`,
      desc: parseInt(insights.savingRate) >= 20 ? 'Bagus! Kamu menabung lebih dari 20% penghasilan.' :
        parseInt(insights.savingRate) >= 0 ? 'Masih bisa ditingkatkan. Target saving rate minimal 20%.' :
        'Pengeluaran melebihi pemasukan bulan ini!',
      bg: parseInt(insights.savingRate) >= 20 ? '#052814' : parseInt(insights.savingRate) >= 0 ? '#1A1005' : '#1A0505',
      border: parseInt(insights.savingRate) >= 20 ? '#0A3020' : parseInt(insights.savingRate) >= 0 ? '#4A3A05' : '#4A1515',
      color: parseInt(insights.savingRate) >= 20 ? '#4ADE80' : parseInt(insights.savingRate) >= 0 ? '#FCD34D' : '#F87171',
    },
    insights.topCategory && {
      icon: '🔥',
      title: `Paling boros: ${insights.topCategory[0]}`,
      desc: `Bulan ini kamu menghabiskan ${fmt(insights.topCategory[1])} untuk ${insights.topCategory[0]}.`,
      bg: '#1A0A05', border: '#4A2A05', color: '#FCA87A',
    },
    insights.diffPct !== null && {
      icon: parseInt(insights.diffPct) > 0 ? '📈' : '📉',
      title: `Pengeluaran ${parseInt(insights.diffPct) > 0 ? 'naik' : 'turun'} ${Math.abs(insights.diffPct)}% dari bulan lalu`,
      desc: parseInt(insights.diffPct) > 0 ? 'Coba kurangi pengeluaran bulan depan.' : 'Pertahankan kebiasaan baik ini!',
      bg: parseInt(insights.diffPct) > 0 ? '#1A0505' : '#052814',
      border: parseInt(insights.diffPct) > 0 ? '#4A1515' : '#0A3020',
      color: parseInt(insights.diffPct) > 0 ? '#F87171' : '#4ADE80',
    },
    insights.topDay && {
      icon: '📅',
      title: `Paling sering boros hari ${insights.topDay[0]}`,
      desc: `Total ${fmt(insights.topDay[1])} keluar di hari ${insights.topDay[0]} bulan ini.`,
      bg: '#0A0A1A', border: '#1A1A3A', color: '#93C5FD',
    },
    {
      icon: '📊',
      title: 'Rata-rata pengeluaran harian',
      desc: `${fmt(Math.round(insights.avgDaily))} per hari bulan ini.`,
      bg: '#0A1628', border: '#1A3050', color: '#C0C8D8',
    },
  ].filter(Boolean)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 2, marginBottom: 2 }}>ANALISIS</div>
        <h2 style={{ fontSize: 20, fontWeight: 500, color: '#C0C8D8', margin: 0 }}>Insight Keuangan</h2>
        <p style={{ fontSize: 12, color: '#3D5A80', margin: '2px 0 0' }}>Analisis otomatis bulan ini</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {cards.map((card, i) => (
          <div key={i} style={{ background: card.bg, border: `0.5px solid ${card.border}`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{card.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: card.color, marginBottom: 4 }}>{card.title}</div>
              <div style={{ fontSize: 12, color: '#3D5A80', lineHeight: 1.5 }}>{card.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}