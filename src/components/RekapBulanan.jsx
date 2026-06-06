import { useMemo, useState } from 'react'
import { formatCurrency } from '../utils/currency'
import { generateAndUploadPDF } from '../utils/exportToDrive'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

export default function RekapBulanan({ transactions, currency = 'IDR', userId, accessToken, goals, debts, userName }) {
  const fmt = (n) => formatCurrency(n, currency)
  const [exporting, setExporting] = useState(null)
  const [exported, setExported] = useState({})

  const rekap = useMemo(() => {
    const map = {}
    transactions.forEach(t => {
      const m = t.date.slice(0, 7)
      if (!map[m]) map[m] = { month: m, income: 0, outcome: 0, transactions: [] }
      map[m][t.type] += t.amount
      map[m].transactions.push(t)
    })
    return Object.values(map).sort((a, b) => b.month.localeCompare(a.month))
  }, [transactions])

  const exportCSV = () => {
    const rows = [['Tanggal', 'Tipe', 'Kategori', 'Catatan', 'Nominal']]
    transactions.forEach(t => {
      rows.push([
        new Date(t.date).toLocaleDateString('id-ID'),
        t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        t.category, t.note || '', t.amount
      ])
    })
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `myfinance-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  const exportToDrive = async (monthKey, budgets) => {
    if (!accessToken) {
      alert('Silakan login ulang untuk menggunakan fitur export ke Drive.')
      return
    }
    setExporting(monthKey)
    try {
      await generateAndUploadPDF({
        transactions, budgets: budgets || {}, goals: goals || [],
        debts: debts || [], monthKey, userName, accessToken
      })
      await setDoc(doc(db, 'users', userId, 'exports', monthKey), {
        exported: true, date: new Date().toISOString()
      })
      setExported(prev => ({ ...prev, [monthKey]: true }))
    } catch (e) {
      alert('Gagal export ke Drive. Coba login ulang.')
    }
    setExporting(null)
  }

  if (rekap.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: '#3D5A80' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🗓️</div>
        <div style={{ fontSize: 13 }}>Belum ada data rekap</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 2, marginBottom: 2 }}>LAPORAN</div>
          <h2 style={{ fontSize: 20, fontWeight: 500, color: '#C0C8D8', margin: 0 }}>Rekap Bulanan</h2>
          <p style={{ fontSize: 12, color: '#3D5A80', margin: '2px 0 0' }}>Ringkasan per bulan</p>
        </div>
        <button onClick={exportCSV} style={{
          background: '#0F2040', color: '#C0C8D8', border: '0.5px solid #1A3050',
          borderRadius: 10, padding: '10px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer'
        }}>📥 Export CSV</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rekap.map(r => {
          const balance = r.income - r.outcome
          const savingRate = r.income > 0 ? Math.round((balance / r.income) * 100) : 0
          const isExporting = exporting === r.month
          const isDone = exported[r.month]

          return (
            <div key={r.month} style={{ background: '#0A1628', border: '0.5px solid #1A3050', borderRadius: 14, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#C0C8D8' }}>{r.month}</div>
                  <div style={{ fontSize: 11, color: '#3D5A80', marginTop: 2 }}>{r.transactions.length} transaksi</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: balance >= 0 ? '#4ADE80' : '#F87171' }}>{fmt(balance)}</div>
                  <div style={{ fontSize: 10, color: '#3D5A80', marginTop: 2 }}>Saving rate {savingRate}%</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                <div style={{ background: '#052814', borderRadius: 10, padding: '10px 12px', border: '0.5px solid #0A3020' }}>
                  <div style={{ fontSize: 10, color: '#3D5A80', letterSpacing: 1, marginBottom: 4 }}>PEMASUKAN</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#4ADE80' }}>{fmt(r.income)}</div>
                </div>
                <div style={{ background: '#280505', borderRadius: 10, padding: '10px 12px', border: '0.5px solid #3A0A0A' }}>
                  <div style={{ fontSize: 10, color: '#3D5A80', letterSpacing: 1, marginBottom: 4 }}>PENGELUARAN</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#F87171' }}>{fmt(r.outcome)}</div>
                </div>
              </div>

              <button
                onClick={() => exportToDrive(r.month)}
                disabled={isExporting}
                style={{
                  width: '100%', padding: '9px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: isDone ? '#052814' : '#0F2040',
                  color: isDone ? '#4ADE80' : '#C0C8D8',
                  fontSize: 12, fontWeight: 500,
                  border: `0.5px solid ${isDone ? '#0A3020' : '#1A3050'}`
                }}>
                {isExporting ? 'Mengupload ke Drive...' : isDone ? '✅ Sudah di-export ke Drive' : '☁️ Export ke Google Drive'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}