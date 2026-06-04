import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { formatCurrency } from '../utils/currency'

const CATEGORIES_INCOME = ['Gaji', 'Freelance', 'Bisnis', 'Investasi', 'Lainnya']
const CATEGORIES_OUTCOME = ['Makan', 'Transport', 'Belanja', 'Tagihan', 'Kesehatan', 'Hiburan', 'Pendidikan', 'Lainnya']

export default function TransactionList({ transactions, deleteTransaction, currency = 'IDR' }) {
  const [filterType, setFilterType] = useState('all')
  const [filterMonth, setFilterMonth] = useState('')
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [editForm, setEditForm] = useState({})

  const fmt = (n) => formatCurrency(n, currency)

  const filtered = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false
    if (filterMonth && !t.date.startsWith(filterMonth)) return false
    if (search && !t.category.toLowerCase().includes(search.toLowerCase()) && !t.note?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const months = [...new Set(transactions.map(t => t.date.slice(0, 7)))].sort().reverse()

  const handleEdit = (t) => {
    setEditItem(t.id)
    setEditForm({ type: t.type, amount: t.amount, category: t.category, note: t.note || '', date: t.date.slice(0, 10) })
  }

  const handleSaveEdit = async (userId) => {
    if (!editItem) return
    const txRef = transactions.find(t => t.id === editItem)
    if (!txRef) return
    await updateDoc(doc(db, 'users', userId, 'transactions', editItem), {
      type: editForm.type,
      amount: parseInt(editForm.amount),
      category: editForm.category,
      note: editForm.note,
      date: new Date(editForm.date).toISOString()
    })
    setEditItem(null)
  }

  const userId = transactions[0]?.userId || transactions.find(t => t)?.userId
  const categories = editForm.type === 'income' ? CATEGORIES_INCOME : CATEGORIES_OUTCOME

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 2, marginBottom: 2 }}>HISTORI</div>
        <h2 style={{ fontSize: 20, fontWeight: 500, color: '#C0C8D8', margin: 0 }}>Riwayat Transaksi</h2>
        <p style={{ fontSize: 12, color: '#3D5A80', margin: '2px 0 0' }}>{filtered.length} transaksi ditemukan</p>
      </div>

      <div style={{ background: '#0A1628', border: '0.5px solid #1A3050', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input type="text" placeholder="Cari kategori atau catatan..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ background: '#0F2040', border: '0.5px solid #1A3050', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#C0C8D8', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', 'income', 'outcome'].map(t => (
            <button key={t} onClick={() => setFilterType(t)} style={{
              padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11,
              background: filterType === t ? '#C0C8D8' : '#0F2040',
              color: filterType === t ? '#0A1628' : '#3D5A80',
            }}>
              {t === 'all' ? 'Semua' : t === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            </button>
          ))}
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{
            padding: '5px 10px', borderRadius: 6, fontSize: 11,
            background: '#0F2040', color: '#3D5A80', border: '0.5px solid #1A3050', outline: 'none'
          }}>
            <option value="">Semua bulan</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#3D5A80' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
            <div style={{ fontSize: 12 }}>Tidak ada transaksi</div>
          </div>
        ) : filtered.map(t => (
          <div key={t.id} style={{ background: '#0A1628', border: '0.5px solid #1A3050', borderRadius: 12, overflow: 'hidden' }}>
            {editItem === t.id ? (
              <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 1 }}>EDIT TRANSAKSI</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['income', 'outcome'].map(tp => (
                    <button key={tp} onClick={() => setEditForm({ ...editForm, type: tp, category: '' })} style={{
                      flex: 1, padding: '6px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11,
                      background: editForm.type === tp ? (tp === 'income' ? '#052814' : '#280505') : '#0F2040',
                      color: editForm.type === tp ? (tp === 'income' ? '#4ADE80' : '#F87171') : '#3D5A80',
                    }}>{tp === 'income' ? '↑ Pemasukan' : '↓ Pengeluaran'}</button>
                  ))}
                </div>
                <input type="number" value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: e.target.value })}
                  placeholder="Nominal" style={{ background: '#0F2040', border: '0.5px solid #1A3050', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#C0C8D8', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {categories.map(c => (
                    <button key={c} onClick={() => setEditForm({ ...editForm, category: c })} style={{
                      padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11,
                      background: editForm.category === c ? '#C0C8D8' : '#0F2040',
                      color: editForm.category === c ? '#0A1628' : '#3D5A80',
                    }}>{c}</button>
                  ))}
                </div>
                <input type="date" value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                  style={{ background: '#0F2040', border: '0.5px solid #1A3050', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#C0C8D8', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                <input type="text" value={editForm.note} onChange={e => setEditForm({ ...editForm, note: e.target.value })}
                  placeholder="Catatan (opsional)" style={{ background: '#0F2040', border: '0.5px solid #1A3050', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#C0C8D8', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleSaveEdit(t.userId)} style={{ flex: 1, background: '#C0C8D8', color: '#0A1628', border: 'none', borderRadius: 8, padding: '8px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Simpan</button>
                  <button onClick={() => setEditItem(null)} style={{ flex: 1, background: '#0F2040', color: '#3D5A80', border: '0.5px solid #1A3050', borderRadius: 8, padding: '8px', fontSize: 12, cursor: 'pointer' }}>Batal</button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                    background: t.type === 'income' ? '#052814' : '#280505',
                    color: t.type === 'income' ? '#4ADE80' : '#F87171'
                  }}>{t.type === 'income' ? '↑' : '↓'}</div>
                  <div>
                    <div style={{ fontSize: 13, color: '#C0C8D8', fontWeight: 500 }}>{t.category}</div>
                    <div style={{ fontSize: 11, color: '#3D5A80' }}>{t.note || '—'} · {new Date(t.date).toLocaleDateString('id-ID')}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: t.type === 'income' ? '#4ADE80' : '#F87171' }}>
                    {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                  </div>
                  <button onClick={() => handleEdit(t)} style={{
                    fontSize: 11, color: '#3D5A80', background: '#0F2040',
                    border: '0.5px solid #1A3050', borderRadius: 6, padding: '4px 8px', cursor: 'pointer'
                  }}>Edit</button>
                  <button onClick={() => setConfirmDelete(t.id)} style={{
                    fontSize: 14, color: '#3D5A80', background: 'none', border: 'none', cursor: 'pointer'
                  }}>×</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
          <div style={{ background: '#0A1628', border: '0.5px solid #1A3050', borderRadius: 16, padding: 24, maxWidth: 320, width: '100%' }}>
            <div style={{ fontSize: 18, marginBottom: 8 }}>🗑️</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#C0C8D8', marginBottom: 8 }}>Hapus transaksi ini?</div>
            <div style={{ fontSize: 12, color: '#3D5A80', marginBottom: 20 }}>Transaksi yang dihapus tidak bisa dikembalikan.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { deleteTransaction(confirmDelete); setConfirmDelete(null) }} style={{
                flex: 1, background: '#F87171', color: '#fff', border: 'none', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 500, cursor: 'pointer'
              }}>Hapus</button>
              <button onClick={() => setConfirmDelete(null)} style={{
                flex: 1, background: '#0F2040', color: '#3D5A80', border: '0.5px solid #1A3050', borderRadius: 10, padding: '10px', fontSize: 13, cursor: 'pointer'
              }}>Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}