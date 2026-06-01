import { useState } from 'react'
import { CURRENCIES, getCurrency, setCurrency } from '../utils/currency'
import { useAuth } from '../hooks/useAuth'

export default function Settings({ onCurrencyChange }) {
  const { user, logout } = useAuth()
  const [selectedCurrency, setSelectedCurrency] = useState(getCurrency())
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setCurrency(selectedCurrency)
    onCurrencyChange(selectedCurrency)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 2, marginBottom: 2 }}>PREFERENSI</div>
        <h2 style={{ fontSize: 20, fontWeight: 500, color: '#C0C8D8', margin: 0 }}>Pengaturan</h2>
        <p style={{ fontSize: 12, color: '#3D5A80', margin: '2px 0 0' }}>Sesuaikan aplikasi dengan kebutuhanmu</p>
      </div>

      {/* Profil */}
      <div style={{ background: '#0A1628', border: '0.5px solid #1A3050', borderRadius: 14, padding: 16 }}>
        <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 1, marginBottom: 12 }}>PROFIL</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user?.photoURL && <img src={user.photoURL} style={{ width: 48, height: 48, borderRadius: '50%', border: '1px solid #1A3050' }} alt="" />}
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#C0C8D8' }}>{user?.displayName}</div>
            <div style={{ fontSize: 12, color: '#3D5A80' }}>{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Mata uang */}
      <div style={{ background: '#0A1628', border: '0.5px solid #1A3050', borderRadius: 14, padding: 16 }}>
        <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 1, marginBottom: 12 }}>MATA UANG</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {CURRENCIES.map(c => (
            <button key={c.code} onClick={() => setSelectedCurrency(c.code)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: selectedCurrency === c.code ? '#0F2040' : 'transparent',
              borderLeft: selectedCurrency === c.code ? '2px solid #C0C8D8' : '2px solid transparent',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16, fontWeight: 500, color: '#C0C8D8', width: 32 }}>{c.symbol}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, color: '#C0C8D8' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: '#3D5A80' }}>{c.code}</div>
                </div>
              </div>
              {selectedCurrency === c.code && (
                <span style={{ fontSize: 14, color: '#4ADE80' }}>✓</span>
              )}
            </button>
          ))}
        </div>
        <button onClick={handleSave} style={{
          width: '100%', marginTop: 12, background: '#C0C8D8', color: '#0A1628',
          border: 'none', borderRadius: 10, padding: '12px', fontSize: 13,
          fontWeight: 500, cursor: 'pointer'
        }}>
          {saved ? '✅ Tersimpan!' : 'Simpan Pengaturan'}
        </button>
      </div>

      {/* Logout */}
      <div style={{ background: '#0A1628', border: '0.5px solid #1A3050', borderRadius: 14, padding: 16 }}>
        <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 1, marginBottom: 12 }}>AKUN</div>
        <button onClick={logout} style={{
          width: '100%', background: '#1A0505', color: '#F87171',
          border: '0.5px solid #4A1515', borderRadius: 10, padding: '12px',
          fontSize: 13, fontWeight: 500, cursor: 'pointer'
        }}>
          Keluar dari Akun
        </button>
      </div>
    </div>
  )
}