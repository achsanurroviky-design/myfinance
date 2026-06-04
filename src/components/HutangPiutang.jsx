import { useState, useEffect } from 'react'
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { formatCurrency } from '../utils/currency'

export default function HutangPiutang({ userId, currency = 'IDR' }) {
  const [items, setItems] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState('piutang')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [dueDate, setDueDate] = useState('')

  const fmt = (n) => formatCurrency(n, currency)

  useEffect(() => {
    if (!userId) return
    const unsub = onSnapshot(collection(db, 'users', userId, 'debts'), snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [userId])

  const addItem = async () => {
    if (!name || !amount) return
    await addDoc(collection(db, 'users', userId, 'debts'), {
      type, name, amount: parseInt(amount), note, dueDate,
      settled: false, createdAt: new Date().toISOString()
    })
    setName(''); setAmount(''); setNote(''); setDueDate(''); setShowForm(false)
  }

  const toggleSettle = async (id, settled) => {
    await updateDoc(doc(db, 'users', userId, 'debts', id), { settled: !settled })
  }

  const deleteItem = async (id) => {
    await deleteDoc(doc(db, 'users', userId, 'debts', id))
  }

  const piutang = items.filter(i => i.type === 'piutang' && !i.settled)
  const hutang = items.filter(i => i.type === 'hutang' && !i.settled)
  const settled = items.filter(i => i.settled)
  const totalPiutang = piutang.reduce((a, b) => a + b.amount, 0)
  const totalHutang = hutang.reduce((a, b) => a + b.amount, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 2, marginBottom: 2 }}>CATATAN</div>
          <h2 style={{ fontSize: 20, fontWeight: 500, color: '#C0C8D8', margin: 0 }}>Hutang & Piutang</h2>
          <p style={{ fontSize: 12, color: '#3D5A80', margin: '2px 0 0' }}>Catat hutang dan tagihan ke orang lain</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: '#C0C8D8', color: '#0A1628', border: 'none',
          borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer'
        }}>+ Tambah</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ background: '#052814', border: '0.5px solid #0A3020', borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ fontSize: 10, color: '#3D5A80', letterSpacing: 1, marginBottom: 4 }}>PIUTANG</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#4ADE80' }}>{fmt(totalPiutang)}</div>
          <div style={{ fontSize: 10, color: '#3D5A80', marginTop: 2 }}>orang hutang ke kamu</div>
        </div>
        <div style={{ background: '#280505', border: '0.5px solid #3A0A0A', borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ fontSize: 10, color: '#3D5A80', letterSpacing: 1, marginBottom: 4 }}>HUTANG</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#F87171' }}>{fmt(totalHutang)}</div>
          <div style={{ fontSize: 10, color: '#3D5A80', marginTop: 2 }}>kamu hutang ke orang</div>
        </div>
      </div>

      {showForm && (
        <div style={{ background: '#0A1628', border: '0.5px solid #1A3050', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 1 }}>TAMBAH BARU</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['piutang', 'hutang'].map(t => (
              <button key={t} onClick={() => setType(t)} style={{
                flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                background: type === t ? (t === 'piutang' ? '#052814' : '#280505') : '#0F2040',
                color: type === t ? (t === 'piutang' ? '#4ADE80' : '#F87171') : '#3D5A80',
              }}>{t === 'piutang' ? '💰 Piutang' : '💸 Hutang'}</button>
            ))}
          </div>
          {[
            { placeholder: 'Nama orang', value: name, onChange: setName, type: 'text' },
            { placeholder: 'Jumlah', value: amount, onChange: setAmount, type: 'number' },
            { placeholder: 'Catatan (opsional)', value: note, onChange: setNote, type: 'text' },
          ].map((f, i) => (
            <input key={i} type={f.type} placeholder={f.placeholder} value={f.value}
              onChange={e => f.onChange(e.target.value)}
              style={{ background: '#0F2040', border: '0.5px solid #1A3050', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#C0C8D8', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
          ))}
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
            style={{ background: '#0F2040', border: '0.5px solid #1A3050', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#C0C8D8', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addItem} style={{ flex: 1, background: '#C0C8D8', color: '#0A1628', border: 'none', borderRadius: 8, padding: '10px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Simpan</button>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, background: '#0F2040', color: '#3D5A80', border: '0.5px solid #1A3050', borderRadius: 8, padding: '10px', fontSize: 12, cursor: 'pointer' }}>Batal</button>
          </div>
        </div>
      )}

      {[{ label: 'Piutang', data: piutang, color: '#4ADE80' }, { label: 'Hutang', data: hutang, color: '#F87171' }].map(section => (
        section.data.length > 0 && (
          <div key={section.label} style={{ background: '#0A1628', border: '0.5px solid #1A3050', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #1A3050' }}>
              <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 1 }}>{section.label.toUpperCase()}</div>
            </div>
            {section.data.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '0.5px solid #0F2040' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#C0C8D8' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: '#3D5A80', marginTop: 2 }}>
                    {item.note || '—'}{item.dueDate && ` · jatuh tempo ${item.dueDate}`}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: section.color }}>{fmt(item.amount)}</span>
                  <button onClick={() => toggleSettle(item.id, item.settled)} style={{
                    fontSize: 11, background: '#0F2040', color: '#4ADE80',
                    border: '0.5px solid #1A3050', borderRadius: 6, padding: '4px 8px', cursor: 'pointer'
                  }}>Lunas</button>
                  <button onClick={() => deleteItem(item.id)} style={{ fontSize: 16, color: '#3D5A80', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                </div>
              </div>
            ))}
          </div>
        )
      ))}

      {settled.length > 0 && (
        <div style={{ background: '#0A1628', border: '0.5px solid #1A3050', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #1A3050' }}>
            <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 1 }}>SUDAH LUNAS</div>
          </div>
          {settled.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '0.5px solid #0F2040', opacity: 0.5 }}>
              <div>
                <div style={{ fontSize: 13, color: '#C0C8D8', textDecoration: 'line-through' }}>{item.name}</div>
                <div style={{ fontSize: 11, color: '#3D5A80' }}>{fmt(item.amount)}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => toggleSettle(item.id, item.settled)} style={{
                  fontSize: 11, color: '#3D5A80', background: 'none', border: 'none', cursor: 'pointer'
                }}>Batalkan</button>
                <button onClick={() => deleteItem(item.id)} style={{ fontSize: 16, color: '#3D5A80', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#3D5A80' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🤝</div>
          <div style={{ fontSize: 13 }}>Belum ada catatan hutang/piutang</div>
        </div>
      )}
    </div>
  )
}