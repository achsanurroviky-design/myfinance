import { useState, useEffect } from 'react'
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

export default function SavingsGoal({ userId, transactions }) {
  const [goals, setGoals] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [saved, setSaved] = useState('')

  const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

  useEffect(() => {
    if (!userId) return
    const unsub = onSnapshot(collection(db, 'users', userId, 'goals'), snap => {
      setGoals(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [userId])

  const addGoal = async () => {
    if (!name || !target) return
    await addDoc(collection(db, 'users', userId, 'goals'), {
      name, target: parseInt(target), saved: parseInt(saved) || 0, createdAt: new Date().toISOString()
    })
    setName(''); setTarget(''); setSaved(''); setShowForm(false)
  }

  const updateSaved = async (id, amount) => {
    await updateDoc(doc(db, 'users', userId, 'goals', id), { saved: amount })
  }

  const deleteGoal = async (id) => {
    await deleteDoc(doc(db, 'users', userId, 'goals', id))
  }

  const avgMonthlySaving = () => {
    const income = transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0)
    const outcome = transactions.filter(t => t.type === 'outcome').reduce((a, b) => a + b.amount, 0)
    const months = new Set(transactions.map(t => t.date.slice(0, 7))).size || 1
    return (income - outcome) / months
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Tabungan & Target</h2>
          <p className="text-gray-500 text-sm">Rencanakan tujuan keuangan kamu</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors">
          + Tambah Goal
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <input type="text" placeholder="Nama goal (misal: Beli laptop)" value={name} onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
          <input type="number" placeholder="Target nominal (Rp)" value={target} onChange={e => setTarget(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
          <input type="number" placeholder="Sudah terkumpul (Rp)" value={saved} onChange={e => setSaved(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
          <div className="flex gap-2">
            <button onClick={addGoal} className="flex-1 bg-blue-500 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-blue-600">Simpan</button>
            <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 text-gray-600 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-200">Batal</button>
          </div>
        </div>
      )}

      {goals.length === 0 && !showForm ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🎯</div>
          <p className="text-sm">Belum ada goal. Tambah goal pertamamu!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map(g => {
            const pct = Math.min((g.saved / g.target) * 100, 100)
            const remaining = g.target - g.saved
            const avg = avgMonthlySaving()
            const months = avg > 0 ? Math.ceil(remaining / avg) : null

            return (
              <div key={g.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">{g.name}</p>
                    <p className="text-xs text-gray-400">{fmt(g.saved)} / {fmt(g.target)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${pct >= 100 ? 'text-green-500' : 'text-blue-500'}`}>{Math.round(pct)}%</span>
                    <button onClick={() => deleteGoal(g.id)} className="text-gray-300 hover:text-red-400 text-lg">×</button>
                  </div>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                  <div className={`h-2.5 rounded-full transition-all ${pct >= 100 ? 'bg-green-400' : 'bg-blue-400'}`} style={{ width: `${pct}%` }} />
                </div>

                {pct < 100 && (
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <span>Sisa {fmt(remaining)}</span>
                    {months && <span>~{months} bulan lagi</span>}
                  </div>
                )}

                {pct >= 100 && <p className="text-xs text-green-500 font-medium mb-3">🎉 Target tercapai!</p>}

                <div className="flex gap-2">
                  <input type="number" placeholder="Update jumlah tersimpan"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400"
                    onKeyDown={e => e.key === 'Enter' && updateSaved(g.id, parseInt(e.target.value))}
                  />
                  <button onClick={e => updateSaved(g.id, parseInt(e.target.previousSibling.value))}
                    className="bg-blue-50 text-blue-500 px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-blue-100">
                    Update
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}