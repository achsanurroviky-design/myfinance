import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export default function GrafikPage({ transactions }) {
  const fmt = (n) => new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(n)

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
      <div className="text-center py-20 text-gray-400">
        <div className="text-5xl mb-3">📊</div>
        <p>Belum ada data untuk ditampilkan</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Grafik Keuangan</h2>
        <p className="text-gray-500 text-sm">Visualisasi data keuangan kamu</p>
      </div>

      {/* Bar chart income vs outcome */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-700 mb-4 text-sm">Pemasukan vs Pengeluaran (6 bulan)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${Math.round(v/1000)}k`} />
            <Tooltip formatter={v => `Rp ${fmt(v)}`} />
            <Bar dataKey="income" fill="#10b981" radius={[4,4,0,0]} name="Pemasukan" />
            <Bar dataKey="outcome" fill="#ef4444" radius={[4,4,0,0]} name="Pengeluaran" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie chart kategori */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-700 mb-4 text-sm">Pengeluaran per kategori</h3>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => `Rp ${fmt(v)}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 justify-center">
            {categoryData.map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {c.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Line chart saldo */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-700 mb-4 text-sm">Tren saldo</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={balanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${Math.round(v/1000)}k`} />
            <Tooltip formatter={v => `Rp ${fmt(v)}`} />
            <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} dot={false} name="Saldo" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}