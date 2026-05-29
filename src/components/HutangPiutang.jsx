import { useState, useEffect } from 'react'
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

export default function HutangPiutang({ userId }) {
  const [items, setItems] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState('piutang')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [dueDate, setDueDate] = useState('')

  const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

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
      type, name, amount: parseInt(amount), note, dueDate, settled: false, createdAt: new Date().toISOString()
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Hutang & Piutang</h2>
          <p className="text-gray-500 text-sm">Catat hutang dan tagihan ke orang lain</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors">
          + Tambah
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 rounded-2xl p-4">
          <p className="text-xs text-gray-500 mb-1">Piutang (orang hutang ke kamu)</p>
          <p className="font-bold text-green-600 text-sm">{fmt(totalPiutang)}</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-4">
          <p className="text-xs text-gray-500 mb-1">Hutang (kamu hutang ke orang)</p>
          <p className="font-bold text-red-500 text-sm">{fmt(totalHutang)}</p>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <div className="flex gap-2">
            {['piutang', 'hutang'].map(t => (
              <button key={t} onClick={() => setType(t)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${type === t ? t === 'piutang' ? 'bg-green-500 text-white' : 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {t === 'piutang' ? '💰 Piutang' : '💸 Hutang'}
              </button>
            ))}
          </div>
          <input type="text" placeholder="Nama orang" value={name} onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
          <input type="number" placeholder="Jumlah (Rp)" value={amount} onChange={e => setAmount(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
          <input type="text" placeholder="Catatan (opsional)" value={note} onChange={e => setNote(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
          <div className="flex gap-2">
            <button onClick={addItem} className="flex-1 bg-blue-500 text-white rounded-xl py-2.5 text-sm font-medium">Simpan</button>
            <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 text-gray-600 rounded-xl py-2.5 text-sm font-medium">Batal</button>
          </div>
        </div>
      )}

      {[{ label: 'Piutang', data: piutang, color: 'green' }, { label: 'Hutang', data: hutang, color: 'red' }].map(section => (
        section.data.length > 0 && (
          <div key={section.label} className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            <div className="px-4 py-3">
              <p className="text-sm font-semibold text-gray-700">{section.label}</p>
            </div>
            {section.data.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.note || '-'} {item.dueDate && `· jatuh tempo ${item.dueDate}`}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold ${section.color === 'green' ? 'text-green-600' : 'text-red-500'}`}>{fmt(item.amount)}</p>
                  <button onClick={() => toggleSettle(item.id, item.settled)} className="text-xs bg-gray-100 hover:bg-green-100 text-gray-500 hover:text-green-600 px-2 py-1 rounded-lg transition-colors">Lunas</button>
                  <button onClick={() => deleteItem(item.id)} className="text-gray-300 hover:text-red-400 text-lg">×</button>
                </div>
              </div>
            ))}
          </div>
        )
      ))}

      {settled.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          <div className="px-4 py-3">
            <p className="text-sm font-semibold text-gray-400">Sudah Lunas</p>
          </div>
          {settled.map(item => (
            <div key={item.id} className="flex items-center justify-between p-4 opacity-50">
              <div>
                <p className="text-sm font-medium text-gray-700 line-through">{item.name}</p>
                <p className="text-xs text-gray-400">{fmt(item.amount)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleSettle(item.id, item.settled)} className="text-xs text-blue-400 hover:underline">Batalkan</button>
                <button onClick={() => deleteItem(item.id)} className="text-gray-300 hover:text-red-400 text-lg">×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && !showForm && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🤝</div>
          <p className="text-sm">Belum ada catatan hutang/piutang</p>
        </div>
      )}
    </div>
  )
}