import { useState, useEffect } from 'react'
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { formatCurrency } from '../utils/currency'

export default function SavingsGoal({ userId, transactions, currency = 'IDR' }) {
  const [goals, setGoals] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [saved, setSaved] = useState('')
  const [updateValues, setUpdateValues] = useState({})

  const fmt = (n) => formatCurrency(n, currency)

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
      name, target: parseInt(target), saved: parseInt(saved) || 0,
      createdAt: new Date().toISOString()
    })
    setName(''); setTarget(''); setSaved(''); setShowForm(false)
  }

  const updateSaved = async (id, value) => {
    const parsed = parseInt(value)
    if (isNaN(parsed)) return
    await updateDoc(doc(db, 'users', userId, 'goals', id), { saved: parsed })
    setUpdateValues({})
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 2, marginBottom: 2 }}>GOALS</div>
          <h2 style={{ fontSize: 20, fontWeight: 500, color: '#C0C8D8', margin: 0 }}>Tabungan & Target</h2>
          <p style={{ fontSize: 12, color: '#3D5A80', margin: '2px 0 0' }}>Rencanakan tujuan keuangan kamu</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: '#C0C8D8', color: '#0A1628', border: 'none',
          borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer'
        }}>+ Tambah Goal</button>
      </div>

      {showForm && (
        <div style={{ background: '#0A1628', border: '0.5px solid #1A3050', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 1 }}>TAMBAH GOAL BARU</div>
          {[
            { placeholder: 'Nama goal (misal: Beli laptop)', value: name, onChange: setName, type: 'text' },
            { placeholder: 'Target nominal', value: target, onChange: setTarget, type: 'number' },
            { placeholder: 'Sudah terkumpul (opsional)', value: saved, onChange: setSaved, type: 'number' },
          ].map((f, i) => (
            <input key={i} type={f.type} placeholder={f.placeholder} value={f.value}
              onChange={e => f.onChange(e.target.value)}
              style={{ background: '#0F2040', border: '0.5px solid #1A3050', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#C0C8D8', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
          ))}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addGoal} style={{ flex: 1, background: '#C0C8D8', color: '#0A1628', border: 'none', borderRadius: 8, padding: '10px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Simpan</button>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, background: '#0F2040', color: '#3D5A80', border: '0.5px solid #1A3050', borderRadius: 8, padding: '10px', fontSize: 12, cursor: 'pointer' }}>Batal</button>
          </div>
        </div>
      )}

      {goals.length === 0 && !showForm ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#3D5A80' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
          <div style={{ fontSize: 13 }}>Belum ada goal. Tambah goal pertamamu!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {goals.map(g => {
            const pct = Math.min((g.saved / g.target) * 100, 100)
            const remaining = g.target - g.saved
            const avg = avgMonthlySaving()
            const months = avg > 0 ? Math.ceil(remaining / avg) : null

            return (
              <div key={g.id} style={{ background: '#0A1628', border: '0.5px solid #1A3050', borderRadius: 14, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#C0C8D8' }}>{g.name}</div>
                    <div style={{ fontSize: 11, color: '#3D5A80', marginTop: 2 }}>{fmt(g.saved)} / {fmt(g.target)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: pct >= 100 ? '#4ADE80' : '#C0C8D8' }}>{Math.round(pct)}%</span>
                    <button onClick={() => deleteGoal(g.id)} style={{ fontSize: 16, color: '#3D5A80', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                  </div>
                </div>

                <div style={{ background: '#0F2040', borderRadius: 4, height: 6, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{
                    height: 6, borderRadius: 4,
                    width: `${pct}%`,
                    background: pct >= 100 ? '#4ADE80' : '#C0C8D8',
                    transition: 'width 0.3s'
                  }} />
                </div>

                {pct < 100 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#3D5A80', marginBottom: 10 }}>
                    <span>Sisa {fmt(remaining)}</span>
                    {months && <span>~{months} bulan lagi</span>}
                  </div>
                )}

                {pct >= 100 && (
                  <div style={{ fontSize: 12, color: '#4ADE80', fontWeight: 500, marginBottom: 10 }}>🎉 Target tercapai!</div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="number"
                    placeholder="Update jumlah tersimpan"
                    value={updateValues[g.id] || ''}
                    onChange={e => setUpdateValues({ ...updateValues, [g.id]: e.target.value })}
                    style={{ flex: 1, background: '#0F2040', border: '0.5px solid #1A3050', borderRadius: 8, padding: '7px 10px', fontSize: 12, color: '#C0C8D8', outline: 'none' }}
                    onKeyDown={e => e.key === 'Enter' && updateSaved(g.id, updateValues[g.id])}
                  />
                  <button onClick={() => updateSaved(g.id, updateValues[g.id])} style={{
                    background: '#0F2040', color: '#C0C8D8', border: '0.5px solid #1A3050',
                    borderRadius: 8, padding: '7px 12px', fontSize: 12, cursor: 'pointer'
                  }}>Update</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}