import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { formatCurrency } from '../utils/currency'

const COLORS = ['#C0C8D8', '#3D5A80', '#4ADE80', '#F87171', '#FCD34D', '#93C5FD', '#FCA87A', '#86EFAC']

export default function GrafikPage({ transactions, currency = 'IDR' }) {
  const fmt = (n) => formatCurrency(n, currency)

  const monthlyData = useMemo(() => {
    const map = {}
    transactions.forEach(t => {
      const m = t.date.slice(0, 7)
      if (!map[m]) map[m] = { month: m, income: 0, outcome: 0 }
      map[m][t.type] += t.amount
    })
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).slice(-6)
  }, [transactions])

  const categoryData = useMemo(() => {
    const map = {}
    transactions.filter(t => t.type === 'outcome').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount
    })
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [transactions])

  const balanceData = useMemo(() => {
    let balance = 0
    return [...transactions].reverse().map(t => {
      balance += t.type === 'income' ? t.amount : -t.amount
      return { date: t.date.slice(0, 10), balance }
    })
  }, [transactions])

  if (transactions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: '#3D5A80' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
        <div style={{ fontSize: 13 }}>Belum ada data untuk ditampilkan</div>
      </div>
    )
  }

  const tooltipStyle = {
    contentStyle: { background: '#0A1628', border: '0.5px solid #1A3050', borderRadius: 8, fontSize: 11 },
    labelStyle: { color: '#C0C8D8' },
    itemStyle: { color: '#C0C8D8' }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 2, marginBottom: 2 }}>VISUALISASI</div>
        <h2 style={{ fontSize: 20, fontWeight: 500, color: '#C0C8D8', margin: 0 }}>Grafik Keuangan</h2>
        <p style={{ fontSize: 12, color: '#3D5A80', margin: '2px 0 0' }}>Visualisasi data keuangan kamu</p>
      </div>

      {/* Bar chart */}
      <div style={{ background: '#0A1628', border: '0.5px solid #1A3050', borderRadius: 14, padding: 16 }}>
        <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 1, marginBottom: 16 }}>PEMASUKAN VS PENGELUARAN (6 BULAN)</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A3050" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#3D5A80' }} />
            <YAxis tick={{ fontSize: 10, fill: '#3D5A80' }} tickFormatter={v => `${Math.round(v / 1000)}k`} />
            <Tooltip formatter={v => fmt(v)} {...tooltipStyle} />
            <Bar dataKey="income" fill="#4ADE80" radius={[4, 4, 0, 0]} name="Pemasukan" />
            <Bar dataKey="outcome" fill="#F87171" radius={[4, 4, 0, 0]} name="Pengeluaran" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie chart */}
      {categoryData.length > 0 && (
        <div style={{ background: '#0A1628', border: '0.5px solid #1A3050', borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 1, marginBottom: 16 }}>PENGELUARAN PER KATEGORI</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => fmt(v)} {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {categoryData.map((c, i) => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#3D5A80' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                  {c.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Line chart */}
      {balanceData.length > 0 && (
        <div style={{ background: '#0A1628', border: '0.5px solid #1A3050', borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 1, marginBottom: 16 }}>TREN SALDO</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={balanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A3050" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#3D5A80' }} />
              <YAxis tick={{ fontSize: 10, fill: '#3D5A80' }} tickFormatter={v => `${Math.round(v / 1000)}k`} />
              <Tooltip formatter={v => fmt(v)} {...tooltipStyle} />
              <Line type="monotone" dataKey="balance" stroke="#C0C8D8" strokeWidth={2} dot={false} name="Saldo" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}