import { useState } from 'react'
import { formatCurrency } from '../utils/currency'

const CATEGORIES_INCOME = ['Gaji', 'Freelance', 'Bisnis', 'Investasi', 'Lainnya']
const CATEGORIES_OUTCOME = ['Makan', 'Transport', 'Belanja', 'Tagihan', 'Kesehatan', 'Hiburan', 'Pendidikan', 'Lainnya']

export default function TransactionForm({ addTransaction, currency = 'IDR' }) {
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
      type, amount: parseInt(amount), category, note,
      date: new Date(date).toISOString()
    })
    setAmount(''); setCategory(''); setNote('')
    setLoading(false); setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 2, marginBottom: 2 }}>INPUT</div>
        <h2 style={{ fontSize: 20, fontWeight: 500, color: '#C0C8D8', margin: 0 }}>Tambah Transaksi</h2>
        <p style={{ fontSize: 12, color: '#3D5A80', margin: '2px 0 0' }}>Catat pemasukan atau pengeluaran kamu</p>
      </div>

      <div style={{ background: '#0A1628', border: '0.5px solid #1A3050', borderRadius: 14, padding: 16 }}>
        {/* Type toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['income', 'outcome'].map(t => (
            <button key={t} onClick={() => { setType(t); setCategory('') }} style={{
              flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 500,
              background: type === t ? (t === 'income' ? '#052814' : '#280505') : '#0F2040',
              color: type === t ? (t === 'income' ? '#4ADE80' : '#F87171') : '#3D5A80',
              borderBottom: type === t ? `2px solid ${t === 'income' ? '#4ADE80' : '#F87171'}` : '2px solid transparent'
            }}>
              {t === 'income' ? '↑ Pemasukan' : '↓ Pengeluaran'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Amount */}
          <div>
            <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 1, marginBottom: 6 }}>NOMINAL</div>
            <input
              type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0" required
              style={{ width: '100%', background: '#0F2040', border: '0.5px solid #1A3050', borderRadius: 10, padding: '12px 14px', fontSize: 16, color: '#C0C8D8', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Category */}
          <div>
            <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 1, marginBottom: 8 }}>KATEGORI</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {categories.map(c => (
                <button key={c} type="button" onClick={() => setCategory(c)} style={{
                  padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12,
                  background: category === c ? '#C0C8D8' : '#0F2040',
                  color: category === c ? '#0A1628' : '#3D5A80',
                  fontWeight: category === c ? 500 : 400
                }}>{c}</button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 1, marginBottom: 6 }}>TANGGAL</div>
            <input
              type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ width: '100%', background: '#0F2040', border: '0.5px solid #1A3050', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#C0C8D8', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Note */}
          <div>
            <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 1, marginBottom: 6 }}>CATATAN <span style={{ color: '#1A3050' }}>(OPSIONAL)</span></div>
            <input
              type="text" value={note} onChange={e => setNote(e.target.value)}
              placeholder="Contoh: makan siang di warteg"
              style={{ width: '100%', background: '#0F2040', border: '0.5px solid #1A3050', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#C0C8D8', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <button type="submit" disabled={loading || !amount || !category} style={{
            background: loading || !amount || !category ? '#0F2040' : '#C0C8D8',
            color: loading || !amount || !category ? '#3D5A80' : '#0A1628',
            border: 'none', borderRadius: 10, padding: '14px', fontSize: 13,
            fontWeight: 500, cursor: 'pointer', letterSpacing: 0.5
          }}>
            {loading ? 'Menyimpan...' : success ? '✅ Tersimpan!' : 'Simpan Transaksi'}
          </button>
        </form>
      </div>
    </div>
  )
}