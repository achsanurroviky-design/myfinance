import { useState } from 'react'
import { generateAndUploadPDF } from '../utils/exportToDrive'

export default function DriveExportPopup({ transactions, budgets, monthKey, userName, accessToken, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  const monthName = new Date(monthKey.split('-')[0], monthKey.split('-')[1] - 1)
    .toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  const handleExport = async () => {
    setLoading(true)
    setError(null)
    try {
      await generateAndUploadPDF({ transactions, budgets, monthKey, userName, accessToken })
      setDone(true)
      onSuccess && onSuccess()
    } catch (e) {
      setError('Gagal upload ke Drive. Coba login ulang.')
    }
    setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
      <div style={{ background: '#0A1628', border: '0.5px solid #1A3050', borderRadius: 16, padding: 24, maxWidth: 360, width: '100%' }}>
        <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 2, marginBottom: 8 }}>LAPORAN BULANAN</div>
        {!done ? (
          <>
            <div style={{ fontSize: 18, fontWeight: 500, color: '#C0C8D8', marginBottom: 8 }}>📄 Rekap {monthName} siap!</div>
            <div style={{ fontSize: 12, color: '#3D5A80', marginBottom: 20, lineHeight: 1.6 }}>
              Laporan keuangan bulan lalu sudah bisa disimpan ke Google Drive kamu — lengkap dengan ringkasan, status budget, dan daftar transaksi.
            </div>
            {error && <div style={{ fontSize: 11, color: '#F87171', marginBottom: 12 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleExport} disabled={loading} style={{ flex: 1, background: '#C0C8D8', color: '#0A1628', border: 'none', borderRadius: 10, padding: '12px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                {loading ? 'Menyimpan...' : '☁️ Simpan ke Drive'}
              </button>
              <button onClick={onClose} style={{ flex: 1, background: '#0F2040', color: '#3D5A80', border: '0.5px solid #1A3050', borderRadius: 10, padding: '12px', fontSize: 13, cursor: 'pointer' }}>
                Nanti saja
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 18, fontWeight: 500, color: '#4ADE80', marginBottom: 8 }}>✅ Berhasil disimpan!</div>
            <div style={{ fontSize: 12, color: '#3D5A80', marginBottom: 20 }}>
              File <strong style={{ color: '#C0C8D8' }}>MyFinance_{monthKey}.pdf</strong> sudah tersimpan di folder <strong style={{ color: '#C0C8D8' }}>MyFinance</strong> di Google Drive kamu.
            </div>
            <button onClick={onClose} style={{ width: '100%', background: '#0F2040', color: '#C0C8D8', border: '0.5px solid #1A3050', borderRadius: 10, padding: '12px', fontSize: 13, cursor: 'pointer' }}>
              Tutup
            </button>
          </>
        )}
      </div>
    </div>
  )
}