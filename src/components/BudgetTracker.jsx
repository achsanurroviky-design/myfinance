import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const CATEGORIES = ['Makan', 'Transport', 'Belanja', 'Tagihan', 'Kesehatan', 'Hiburan', 'Pendidikan', 'Lainnya']

export default function BudgetTracker({ transactions, userId }) {
  const [budgets, setBudgets] = useState({})
  const [editing, setEditing] = useState({})

  const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

  const now = new Date()
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  useEffect(() => {
    if (!userId) return
    getDoc(doc(db, 'users', userId, 'budgets', monthKey)).then(d => {
      if (d.exists()) setBudgets(d.data())
    })
  }, [userId, monthKey])

  const saveBudget = async (category, value) => {
    const updated = { ...budgets, [category]: parseInt(value) || 0 }
    setBudgets(updated)
    await setDoc(doc(db, 'users', userId, 'budgets', monthKey), updated)
    setEditing({})
  }

  const spent = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = transactions
      .filter(t => t.type === 'outcome' && t.category === cat && t.date.startsWith(monthKey))
      .reduce((a, b) => a + b.amount, 0)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Budget Bulanan</h2>
        <p className="text-gray-500 text-sm">Set batas pengeluaran per kategori</p>
      </div>

      <div className="space-y-3">
        {CATEGORIES.map(cat => {
          const budget = budgets[cat] || 0
          const use = spent[cat] || 0
          const pct = budget > 0 ? Math.min((use / budget) * 100, 100) : 0
          const over = budget > 0 && use > budget

          return (
            <div key={cat} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{cat}</span>
                {editing[cat] ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue={budget}
                      className="w-32 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-blue-400"
                      onKeyDown={e => e.key === 'Enter' && saveBudget(cat, e.target.value)}
                      autoFocus
                    />
                    <button
                      onClick={e => saveBudget(cat, e.target.previousSibling.value)}
                      className="text-blue-500 text-sm font-medium"
                    >
                      Simpan
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditing({ [cat]: true })}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    {budget > 0 ? fmt(budget) : 'Set budget'}
                  </button>
                )}
              </div>

              {budget > 0 && (
                <>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                    <div
                      className={`h-2 rounded-full transition-all ${over ? 'bg-red-500' : pct > 80 ? 'bg-yellow-400' : 'bg-green-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{fmt(use)} terpakai</span>
                    <span className={over ? 'text-red-500 font-medium' : ''}>
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