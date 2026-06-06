import { useState, useEffect } from 'react'
import { CURRENCIES, getCurrency, setCurrency } from '../utils/currency'
import { useAuth } from '../hooks/useAuth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const DEFAULT_INCOME = ['Gaji', 'Freelance', 'Bisnis', 'Investasi', 'Lainnya']
const DEFAULT_OUTCOME = ['Makan', 'Transport', 'Belanja', 'Tagihan', 'Kesehatan', 'Hiburan', 'Pendidikan', 'Lainnya']

export default function Settings({ onCurrencyChange }) {
  const { user, logout } = useAuth()
  const [selectedCurrency, setSelectedCurrency] = useState(getCurrency())
  const [saved, setSaved] = useState(false)
  const [incomeCategories, setIncomeCategories] = useState(DEFAULT_INCOME)
  const [outcomeCategories, setOutcomeCategories] = useState(DEFAULT_OUTCOME)
  const [newIncome, setNewIncome] = useState('')
  const [newOutcome, setNewOutcome] = useState('')
  const [catSaved, setCatSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'users', user.uid, 'settings', 'categories')).then(d => {
      if (d.exists()) {
        const data = d.data()
        if (data.income) setIncomeCategories(data.income)
        if (data.outcome) setOutcomeCategories(data.outcome)
      }
    })
  }, [user])

  const saveCategories = async () => {
    await setDoc(doc(db, 'users', user.uid, 'settings', 'categories'), {
      income: incomeCategories,
      outcome: outcomeCategories
    })
    setCatSaved(true)
    setTimeout(() => setCatSaved(false), 2000)
  }

  const addCategory = (type) => {
    if (type === 'income' && newIncome.trim()) {
      setIncomeCategories([...incomeCategories, newIncome.trim()])
      setNewIncome('')
    } else if (type === 'outcome' && newOutcome.trim()) {
      setOutcomeCategories([...outcomeCategories, newOutcome.trim()])
      setNewOutcome('')
    }
  }

  const removeCategory = (type, cat) => {
    if (type === 'income') setIncomeCategories(incomeCategories.filter(c => c !== cat))
    else setOutcomeCategories(outcomeCategories.filter(c => c !== cat))
  }

  const handleSaveCurrency = () => {
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          {CURRENCIES.map(c => (
            <button key={c.code} onClick={() => setSelectedCurrency(c.code)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: selectedCurrency === c.code ? '#0F2040' : 'transparent',
              borderLeft: selectedCurrency === c.code ? '2px solid #C0C8D8' : '2px solid transparent',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 500, color: '#C0C8D8', width: 30 }}>{c.symbol}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 12, color: '#C0C8D8' }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: '#3D5A80' }}>{c.code}</div>
                </div>
              </div>
              {selectedCurrency === c.code && <span style={{ color: '#4ADE80', fontSize: 14 }}>✓</span>}
            </button>
          ))}
        </div>
        <button onClick={handleSaveCurrency} style={{
          width: '100%', background: '#C0C8D8', color: '#0A1628',
          border: 'none', borderRadius: 10, padding: '11px', fontSize: 13,
          fontWeight: 500, cursor: 'pointer'
        }}>{saved ? '✅ Tersimpan!' : 'Simpan Mata Uang'}</button>
      </div>

      {/* Kategori custom */}
      {[
        { type: 'income', label: 'KATEGORI PEMASUKAN', categories: incomeCategories, newVal: newIncome, setNew: setNewIncome },
        { type: 'outcome', label: 'KATEGORI PENGELUARAN', categories: outcomeCategories, newVal: newOutcome, setNew: setNewOutcome },
      ].map(section => (
        <div key={section.type} style={{ background: '#0A1628', border: '0.5px solid #1A3050', borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 1, marginBottom: 12 }}>{section.label}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {section.categories.map(cat => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#0F2040', border: '0.5px solid #1A3050', borderRadius: 8, padding: '4px 10px' }}>
                <span style={{ fontSize: 12, color: '#C0C8D8' }}>{cat}</span>
                <button onClick={() => removeCategory(section.type, cat)} style={{
                  fontSize: 13, color: '#3D5A80', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: '0 2px'
                }}>×</button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text" placeholder="Tambah kategori baru..."
              value={section.newVal} onChange={e => section.setNew(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCategory(section.type)}
              style={{ flex: 1, background: '#0F2040', border: '0.5px solid #1A3050', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#C0C8D8', outline: 'none' }}
            />
            <button onClick={() => addCategory(section.type)} style={{
              background: '#C0C8D8', color: '#0A1628', border: 'none',
              borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer'
            }}>+ Tambah</button>
          </div>
        </div>
      ))}

      <button onClick={saveCategories} style={{
        width: '100%', background: catSaved ? '#052814' : '#0F2040',
        color: catSaved ? '#4ADE80' : '#C0C8D8',
        border: `0.5px solid ${catSaved ? '#0A3020' : '#1A3050'}`,
        borderRadius: 10, padding: '12px', fontSize: 13, fontWeight: 500, cursor: 'pointer'
      }}>{catSaved ? '✅ Kategori tersimpan!' : 'Simpan Kategori'}</button>

      {/* Logout */}
      <div style={{ background: '#0A1628', border: '0.5px solid #1A3050', borderRadius: 14, padding: 16 }}>
        <div style={{ fontSize: 11, color: '#3D5A80', letterSpacing: 1, marginBottom: 12 }}>AKUN</div>
        <button onClick={logout} style={{
          width: '100%', background: '#1A0505', color: '#F87171',
          border: '0.5px solid #4A1515', borderRadius: 10, padding: '12px',
          fontSize: 13, fontWeight: 500, cursor: 'pointer'
        }}>Keluar dari Akun</button>
      </div>
    </div>
  )
}