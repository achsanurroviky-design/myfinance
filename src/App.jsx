import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTransactions } from './hooks/useTransactions'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import Layout from './components/Layout'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import BudgetTracker from './components/BudgetTracker'
import GrafikPage from './components/GrafikPage'
import RekapBulanan from './components/RekapBulanan'
import SavingsGoal from './components/SavingsGoal'
import HutangPiutang from './components/HutangPiutang'
import TransaksiRutin from './components/TransaksiRutin'
import Insight from './components/Insight'
import DriveExportPopup from './components/DriveExportPopup'

export default function App() {
  const { user, loading, accessToken } = useAuth()
  const { transactions, addTransaction, deleteTransaction } = useTransactions(user?.uid)
  const [activePage, setActivePage] = useState('dashboard')
  const [showDrivePopup, setShowDrivePopup] = useState(false)
  const [budgets, setBudgets] = useState({})

  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
  const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`

  useEffect(() => {
    if (!user) return
    const isFirstOfMonth = now.getDate() === 1
    if (!isFirstOfMonth) return

    const checkPopup = async () => {
      const ref = doc(db, 'users', user.uid, 'exports', lastMonthKey)
      const snap = await getDoc(ref)
      if (!snap.exists()) setShowDrivePopup(true)

      const budgetRef = doc(db, 'users', user.uid, 'budgets', lastMonthKey)
      const budgetSnap = await getDoc(budgetRef)
      if (budgetSnap.exists()) setBudgets(budgetSnap.data())
    }
    checkPopup()
  }, [user])

  const handleExportSuccess = async () => {
    await setDoc(doc(db, 'users', user.uid, 'exports', lastMonthKey), {
      exported: true,
      date: new Date().toISOString()
    })
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070F1E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 12, color: '#3D5A80' }}>Memuat...</div>
    </div>
  )

  if (!user) return <Login />

  const pages = {
    dashboard: <Dashboard transactions={transactions} setActivePage={setActivePage} userId={user.uid} />,
    transaksi: <TransactionForm addTransaction={addTransaction} />,
    riwayat: <TransactionList transactions={transactions} deleteTransaction={deleteTransaction} />,
    budget: <BudgetTracker transactions={transactions} userId={user.uid} />,
    grafik: <GrafikPage transactions={transactions} />,
    rekap: <RekapBulanan transactions={transactions} />,
    tabungan: <SavingsGoal userId={user.uid} transactions={transactions} />,
    hutang: <HutangPiutang userId={user.uid} />,
    rutin: <TransaksiRutin userId={user.uid} addTransaction={addTransaction} />,
    insight: <Insight transactions={transactions} />,
  }

  return (
    <>
      <Layout activePage={activePage} setActivePage={setActivePage}>
        {pages[activePage]}
      </Layout>

      {showDrivePopup && accessToken && (
        <DriveExportPopup
          transactions={transactions}
          budgets={budgets}
          monthKey={lastMonthKey}
          userName={user.displayName}
          accessToken={accessToken}
          onClose={() => setShowDrivePopup(false)}
          onSuccess={handleExportSuccess}
        />
      )}
    </>
  )
}