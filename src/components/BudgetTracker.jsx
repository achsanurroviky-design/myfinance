import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { formatCurrency } from '../utils/currency'

const DEFAULT_CATEGORIES = ['Makan', 'Transport', 'Belanja', 'Tagihan', 'Kesehatan', 'Hiburan', 'Pendidikan', 'Lainnya']

export default function BudgetTracker({ transactions, userId, currency = 'IDR' }) {
  const [budgets, setBudgets] = useState({})
  const [editing, setEditing] = useState({})
  const [inputValues, setInputValues] = useState({})
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)

  const fmt = (n) => formatCurrency(n, currency)
  const now = new Date()
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  useEffect(() => {
    if (!userId) return
    // Load budget
    getDoc(doc(db, 'users', userId, 'budgets', monthKey)).then(d => {
      if (d.exists()) setBudgets(d.data())
    })
    // Load kategori custom
    getDoc(doc(db, 'users', userId, 'settings', 'categories')).then(d => {
      if (d.exists() && d.data().outcome) {
        setCategories(d.data().outcome)
      }
    })
  }, [userId, monthKey])

  const saveBudget = async (category, value) => {
    const parsed = parseInt(value)
    if (!parsed || parsed <= 0) return
    const updated = { ...budgets, [category]: parsed }
    setBudgets(updated)
    await setDoc(doc(db, 'users', userId, 'budgets', monthKey), updated)
    setEditing({})
    setInputValues({})
  }

  const deleteBudget = async (category) => {
    const updated = { ...budgets }
    delete updated[category]
    setBudgets(updated)
    await setDoc(doc(db, 'users', userId, 'budgets', monthKey), updated)
  }

  const spent = categories.reduce((acc, cat) => {
    acc[cat] = transactions
      .filter(t => {
        const tDate = new Date(t.date)
        return t.type === 'outcome' &&
          t.category === cat &&
          tDate.getMonth() === now.getMonth() &&
          tDate.getFullYear() === now.getFullYear()
      })
      .reduce((a, b) => a + b.amount, 0)
    return acc
  }, {})

  const totalBudget = Object.values(budgets).reduce((a, b) => a + b, 0)
  const totalSpent = categories.reduce((a, cat) => a + (spent[cat] || 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 2, marginBottom: 2 }}>PENGELOLAAN</div>
        <h2 style={{ fontSize: 20, fontWeight: 500, color: '#C0C8D8', margin: 0 }}>Budget Bulanan</h2>
        <p style={{ fontSize: 12, color: '#3D5A80', margin: '2px 0 0' }}>Set batas pengeluaran per kategori — {monthKey}</p>
      </div>

      {totalBudget > 0 && (
        <div style={{ background: '#0A1628', border: '0.5px solid #1A3050', borderRadius: 14, padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: 'TOTAL BUDGET', value: fmt(totalBudget), color: '#C0C8D8' },
              { label: 'TERPAKAI', value: fmt(totalSpent), color: '#F87171' },
              { label: 'SISA', value: fmt(totalBudget - totalSpent), color: totalBudget - totalSpent >= 0 ? '#4ADE80' : '#F87171' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: 10, color: '#3D5A80', letterSpacing: 1, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ background: '#0F2040', borderRadius: 4, height: 6, overflow: 'hidden' }}>
              <div style={{
                height: 6, borderRadius: 4,
                width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%`,
                background: totalSpent > totalBudget ? '#F87171' : totalSpent / totalBudget > 0.8 ? '#FCD34D' : '#4ADE80',
                transition: 'width 0.3s'
              }} />
            </div>
            <div style={{ fontSize: 10, color: '#3D5A80', marginTop: 4 }}>
              {Math.round((totalSpent / totalBudget) * 100)}% dari total budget terpakai
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {categories.map(cat => {
          const budget = budgets[cat] || 0
          const use = spent[cat] || 0
          const pct = budget > 0 ? Math.min((use / budget) * 100, 100) : 0
          const over = budget > 0 && use > budget
          const warning = budget > 0 && !over && (use / budget) >= 0.8

          return (
            <div key={cat} style={{
              background: '#0A1628',
              border: `0.5px solid ${over ? '#4A1515' : warning ? '#4A3A05' : '#1A3050'}`,
              borderRadius: 12, padding: '14px 16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: budget > 0 ? 10 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>{over ? '🚨' : warning ? '⚠️' : '✅'}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#C0C8D8' }}>{cat}</span>
                </div>

                {editing[cat] ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="number"
                      value={inputValues[cat] || ''}
                      onChange={e => setInputValues({ ...inputValues, [cat]: e.target.value })}
                      placeholder="Nominal"
                      style={{ width: 110, background: '#0F2040', border: '0.5px solid #1A3050', borderRadius: 6, padding: '4px 8px', fontSize: 12, color: '#C0C8D8', outline: 'none' }}
                      onKeyDown={e => e.key === 'Enter' && saveBudget(cat, inputValues[cat])}
                      autoFocus
                    />
                    <button onClick={() => saveBudget(cat, inputValues[cat])} style={{
                      fontSize: 11, color: '#0A1628', background: '#C0C8D8',
                      border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer'
                    }}>Simpan</button>
                    <button onClick={() => setEditing({})} style={{
                      fontSize: 11, color: '#3D5A80', background: '#0F2040',
                      border: '0.5px solid #1A3050', borderRadius: 6, padding: '4px 8px', cursor: 'pointer'
                    }}>✕</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {budget > 0 && (
                      <span style={{ fontSize: 11, color: '#3D5A80' }}>{fmt(use)} / {fmt(budget)}</span>
                    )}
                    <button onClick={() => setEditing({ [cat]: true })} style={{
                      fontSize: 11, color: '#3D5A80', background: '#0F2040',
                      border: '0.5px solid #1A3050', borderRadius: 6, padding: '4px 8px', cursor: 'pointer'
                    }}>{budget > 0 ? 'Edit' : '+ Set'}</button>
                    {budget > 0 && (
                      <button onClick={() => deleteBudget(cat)} style={{
                        fontSize: 11, color: '#F87171', background: '#1A0505',
                        border: '0.5px solid #4A1515', borderRadius: 6, padding: '4px 8px', cursor: 'pointer'
                      }}>Hapus</button>
                    )}
                  </div>
                )}
              </div>

              {budget > 0 && (
                <>
                  <div style={{ background: '#0F2040', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                    <div style={{
                      height: 5, borderRadius: 4, width: `${pct}%`,
                      background: over ? '#F87171' : warning ? '#FCD34D' : '#4ADE80',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#3D5A80' }}>
                    <span>{Math.round(pct)}% terpakai</span>
                    <span style={{ color: over ? '#F87171' : warning ? '#FCD34D' : '#4ADE80' }}>
                      {over ? `Lebih ${fmt(use - budget)}` : `Sisa ${fmt(budget - use)}`}
                    </span>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}