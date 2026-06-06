import { useMemo, useState, useEffect } from 'react'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { formatCurrency } from '../utils/currency'

const s = {
  card: { background: '#0F2040', border: '0.5px solid #1A3050', borderRadius: 12, padding: '14px 16px' },
  label: { fontSize: 11, color: '#3D5A80', letterSpacing: 1, marginBottom: 4 },
  section: { background: '#0A1628', border: '0.5px solid #1A3050', borderRadius: 14, padding: '16px' },
}

export default function Dashboard({ transactions, setActivePage, userId, currency = 'IDR' }) {
  const [budgets, setBudgets] = useState({})
  const [debts, setDebts] = useState([])
  const now = new Date()
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const fmt = (n) => formatCurrency(n, currency)

  useEffect(() => {
    if (!userId) return
    getDoc(doc(db, 'users', userId, 'budgets', monthKey)).then(d => {
      if (d.exists()) setBudgets(d.data())
    })
    getDocs(collection(db, 'users', userId, 'debts')).then(snap => {
      setDebts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [userId, monthKey])

  const stats = useMemo(() => {
    const thisMonth = transactions.filter(t => {
      const d = new Date(t.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const income = thisMonth.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0)
    const outcome = thisMonth.filter(t => t.type === 'outcome').reduce((a, b) => a + b.amount, 0)
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0)
    const totalOutcome = transactions.filter(t => t.type === 'outcome').reduce((a, b) => a + b.amount, 0)
    return { income, outcome, balance: income - outcome, total: transactions.length, netWorth: totalIncome - totalOutcome }
  }, [transactions])

  const budgetAlerts = useMemo(() => {
    const alerts = []
    const CATEGORIES = ['Makan', 'Transport', 'Belanja', 'Tagihan', 'Kesehatan', 'Hiburan', 'Pendidikan', 'Lainnya']
    CATEGORIES.forEach(cat => {
      const budget = budgets[cat]
      if (!budget) return
      const spent = transactions
        .filter(t => t.type === 'outcome' && t.category === cat && t.date.startsWith(monthKey))
        .reduce((a, b) => a + b.amount, 0)
      const pct = (spent / budget) * 100
      if (pct >= 100) alerts.push({ cat, pct, spent, budget, type: 'over' })
      else if (pct >= 80) alerts.push({ cat, pct, spent, budget, type: 'warning' })
    })
    return alerts
  }, [transactions, budgets, monthKey])

  const debtAlerts = useMemo(() => {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    return debts.filter(d => {
      if (d.settled || !d.dueDate) return false
      const due = new Date(d.dueDate)
      return due <= nextWeek
    })
  }, [debts])

  const recent = transactions.slice(0, 5)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header + Net Worth */}
      <div style={{ background: '#0A1628', border: '0.5px solid #1A3050', borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 2, marginBottom: 8 }}>TOTAL SALDO KESELURUHAN</div>
        <div style={{ fontSize: 32, fontWeight: 500, color: stats.netWorth >= 0 ? '#C0C8D8' : '#F87171', marginBottom: 4 }}>
          {fmt(stats.netWorth)}
        </div>
        <div style={{ fontSize: 11, color: '#3D5A80' }}>Dari {transactions.length} transaksi sejak awal</div>
      </div>

      {/* Stat cards bulan ini */}
      <div>
        <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 2, marginBottom: 10 }}>BULAN INI</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          {[
            { label: 'SALDO', value: fmt(stats.balance), color: stats.balance >= 0 ? '#6EE7B7' : '#F87171' },
            { label: 'PEMASUKAN', value: fmt(stats.income), color: '#4ADE80' },
            { label: 'PENGELUARAN', value: fmt(stats.outcome), color: '#F87171' },
            { label: 'TRANSAKSI', value: stats.total, color: '#93C5FD' },
          ].map(item => (
            <div key={item.label} style={s.card}>
              <div style={s.label}>{item.label}</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget alerts */}
      {budgetAlerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {budgetAlerts.map(alert => (
            <div key={alert.cat} style={{
              background: alert.type === 'over' ? '#1A0505' : '#1A1005',
              border: `0.5px solid ${alert.type === 'over' ? '#4A1515' : '#4A3A05'}`,
              borderRadius: 12, padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 10
            }}>
              <span style={{ fontSize: 18 }}>{alert.type === 'over' ? '🚨' : '⚠️'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: alert.type === 'over' ? '#F87171' : '#FCD34D' }}>
                  {alert.type === 'over' ? 'Budget terlampaui!' : 'Budget hampir habis!'}
                </div>
                <div style={{ fontSize: 11, color: '#3D5A80', marginTop: 2 }}>
                  {alert.cat} — {Math.round(alert.pct)}% terpakai
                  {alert.type === 'over' && ` · lebih ${fmt(alert.spent - alert.budget)}`}
                </div>
              </div>
              <button onClick={() => setActivePage('budget')} style={{
                fontSize: 10, color: '#3D5A80', background: '#0F2040',
                border: '0.5px solid #1A3050', borderRadius: 6, padding: '4px 8px', cursor: 'pointer'
              }}>Lihat →</button>
            </div>
          ))}
        </div>
      )}

      {/* Debt alerts */}
      {debtAlerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {debtAlerts.map(debt => {
            const due = new Date(debt.dueDate)
            const today = new Date()
            const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
            const isOverdue = diffDays < 0
            return (
              <div key={debt.id} style={{
                background: isOverdue ? '#1A0505' : '#1A1005',
                border: `0.5px solid ${isOverdue ? '#4A1515' : '#4A3A05'}`,
                borderRadius: 12, padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 10
              }}>
                <span style={{ fontSize: 18 }}>{isOverdue ? '🚨' : '⏰'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: isOverdue ? '#F87171' : '#FCD34D' }}>
                    {isOverdue ? 'Jatuh tempo terlewat!' : `Jatuh tempo ${diffDays === 0 ? 'hari ini' : `${diffDays} hari lagi`}!`}
                  </div>
                  <div style={{ fontSize: 11, color: '#3D5A80', marginTop: 2 }}>
                    {debt.type === 'hutang' ? 'Hutang ke' : 'Piutang dari'} {debt.name} — {fmt(debt.amount)}
                  </div>
                </div>
                <button onClick={() => setActivePage('hutang')} style={{
                  fontSize: 10, color: '#3D5A80', background: '#0F2040',
                  border: '0.5px solid #1A3050', borderRadius: 6, padding: '4px 8px', cursor: 'pointer'
                }}>Lihat →</button>
              </div>
            )
          })}
        </div>
      )}

      {/* Recent transactions */}
      <div style={s.section}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#C0C8D8', letterSpacing: 0.5 }}>TRANSAKSI TERBARU</div>
          <button onClick={() => setActivePage('riwayat')} style={{ fontSize: 11, color: '#3D5A80', background: 'none', border: 'none', cursor: 'pointer' }}>
            Lihat semua →
          </button>
        </div>
        {recent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#3D5A80' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
            <div style={{ fontSize: 12 }}>Belum ada transaksi</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recent.map(t => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', background: '#0F2040', borderRadius: 10, border: '0.5px solid #1A3050'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: t.type === 'income' ? '#052814' : '#280505',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, color: t.type === 'income' ? '#4ADE80' : '#F87171'
                  }}>{t.type === 'income' ? '↑' : '↓'}</div>
                  <div>
                    <div style={{ fontSize: 13, color: '#C0C8D8', fontWeight: 500 }}>{t.category}</div>
                    <div style={{ fontSize: 11, color: '#3D5A80' }}>{t.note || '—'} · {new Date(t.date).toLocaleDateString('id-ID')}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: t.type === 'income' ? '#4ADE80' : '#F87171' }}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button onClick={() => setActivePage('transaksi')} style={{
          background: '#C0C8D8', color: '#0A1628', border: 'none',
          borderRadius: 12, padding: '14px', fontSize: 13, fontWeight: 500,
          cursor: 'pointer', letterSpacing: 0.5
        }}>+ Tambah Transaksi</button>
        <button onClick={() => setActivePage('grafik')} style={{
          background: '#0F2040', color: '#C0C8D8', border: '0.5px solid #1A3050',
          borderRadius: 12, padding: '14px', fontSize: 13, fontWeight: 500, cursor: 'pointer'
        }}>📈 Lihat Grafik</button>
      </div>
    </div>
  )
}