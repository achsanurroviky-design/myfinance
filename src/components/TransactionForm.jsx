import { useState } from 'react'

const CATEGORIES_INCOME = ['Gaji', 'Freelance', 'Bisnis', 'Investasi', 'Lainnya']
const CATEGORIES_OUTCOME = ['Makan', 'Transport', 'Belanja', 'Tagihan', 'Kesehatan', 'Hiburan', 'Pendidikan', 'Lainnya']

export default function TransactionForm({ addTransaction }) {
  const [type, setType] = useState('outcome')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const categories = type === 'income' ? CATEGORIES_INCOME : CATEGORIES_OUTCOME

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount || !category) return
    setLoading(true)
    await addTransaction({
      type,
      amount: parseInt(amount),
      category,
      note,
      date: new Date(date).toISOString()
    })
    setAmount('')
    setCategory('')
    setNote('')
    setLoading(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Tambah Transaksi</h2>
        <p className="text-gray-500 text-sm">Catat pemasukan atau pengeluaran kamu</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        {/* Type toggle */}
        <div className="flex gap-2 mb-5">
          {['income', 'outcome'].map(t => (
            <button
              key={t}
              onClick={() => { setType(t); setCategory('') }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                type === t
                  ? t === 'income' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {t === 'income' ? '⬆️ Pemasukan' : '⬇️ Pengeluaran'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Nominal (Rp)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-400"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${
                    category === c
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Note */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Catatan (opsional)</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Contoh: makan siang di warteg"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !amount || !category}
            className="w-full bg-blue-500 text-white rounded-xl py-3 font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : success ? '✅ Tersimpan!' : 'Simpan Transaksi'}
          </button>
        </form>
      </div>
    </div>
  )
}