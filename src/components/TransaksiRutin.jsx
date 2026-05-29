import { useState, useEffect } from 'react'
import { collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

const CATEGORIES_INCOME = ['Gaji', 'Freelance', 'Bisnis', 'Investasi', 'Lainnya']
const CATEGORIES_OUTCOME = ['Makan', 'Transport', 'Belanja', 'Tagihan', 'Kesehatan', 'Hiburan', 'Pendidikan', 'Lainnya']

export default function TransaksiRutin({ userId, addTransaction }) {
  const [items, setItems] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState('outcome')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [tanggal, setTanggal] = useState('1')

  const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
  const categories = type === 'income' ? CATEGORIES_INCOME : CATEGORIES_OUTCOME

  useEffect(() => {
    if (!userId) return
    const unsub = onSnapshot(collection(db, 'users', userId, 'recurring'), snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [userId])

  const addItem = async () => {
    if (!name || !amount || !category) return
    await addDoc(collection(db, 'users', userId, 'recurring'), {
      type, name, amount: parseInt(amount), category, tanggal: parseInt(tanggal), createdAt: new Date().toISOString()
    })
    setName(''); setAmount(''); setCategory(''); setShowForm(false)
  }

  const deleteItem = async (id) => {
    await deleteDoc(doc(db, 'users', userId, 'recurring', id))
  }

  const applyNow = async (item) => {
    await addTransaction({
      type: item.type, amount: item.amount, category: item.category,
      note: item.name, date: new Date().toISOString()
    })
    alert('Transaksi berhasil ditambahkan!')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Transaksi Rutin</h2>
          <p className="text-gray-500 text-sm">Tagihan & pemasukan bulanan otomatis</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors">
          + Tambah
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <div className="flex gap-2">
            {['income', 'outcome'].map(t => (
              <button key={t} onClick={() => { setType(t); setCategory('') }}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${type === t ? t === 'income' ? 'bg-green-500 text-white' : 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {t === 'income' ? '⬆️ Pemasukan' : '⬇️ Pengeluaran'}
              </button>
            ))}
          </div>
          <input type="text" placeholder="Nama (misal: Bayar kos, Gaji bulanan)" value={name} onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
          <input type="number" placeholder="Jumlah (Rp)" value={amount} onChange={e => setAmount(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
          <div>
            <p className="text-sm text-gray-600 mb-2">Kategori</p>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button key={c} type="button" onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs transition-colors ${category === c ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Tanggal berulang (tiap bulan)</p>
            <select value={tanggal} onChange={e => setTanggal(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none">
              {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>Tanggal {d}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={addItem} className="flex-1 bg-blue-500 text-white rounded-xl py-2.5 text-sm font-medium">Simpan</button>
            <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 text-gray-600 rounded-xl py-2.5 text-sm font-medium">Batal</button>
          </div>
        </div>
      )}

      {items.length === 0 && !showForm ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🔄</div>
          <p className="text-sm">Belum ada transaksi rutin</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${item.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
                  {item.type === 'income' ? '⬆️' : '⬇️'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.category} · tiap tgl {item.tanggal}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold ${item.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>{fmt(item.amount)}</p>
                <button onClick={() => applyNow(item)} className="text-xs bg-blue-50 text-blue-500 px-2 py-1 rounded-lg hover:bg-blue-100">Catat</button>
                <button onClick={() => deleteItem(item.id)} className="text-gray-300 hover:text-red-400 text-lg">×</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}