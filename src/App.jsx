import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTransactions } from './hooks/useTransactions'
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'
import { getCurrency } from './utils/currency'
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
import Settings from './components/Settings'

export default function App() {
  const { user, loading, accessToken } = useAuth()
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions(user?.uid)
  const [activePage, setActivePage] = useState('dashboard')
  const [showDrivePopup, setShowDrivePopup] = useState(false)
  const [budgets, setBudgets] = useState({})
  const [goals, setGoals] = useState([])
  const [debts, setDebts] = useState([])
  const [currency, setCurrencyState] = useState(getCurrency())

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

      const goalsSnap = await getDocs(collection(db, 'users', user.uid, 'goals'))
      setGoals(goalsSnap.docs.map(d => ({ id: d.id, ...d.data() })))

      const debtsSnap = await getDocs(collection(db, 'users', user.uid, 'debts'))
      setDebts(debtsSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    checkPopup()
  }, [user])

  const handleExportSuccess = async () => {
    await setDoc(doc(db, 'users', user.uid, 'exports', lastMonthKey), {
      exported: true, date: new Date().toISOString()
    })
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070F1E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 12, color: '#3D5A80' }}>Memuat...</div>
    </div>
  )

  if (!user) return <Login />

  const pages = {
    dashboard: <Dashboard transactions={transactions} setActivePage={setActivePage} userId={user.uid} currency={currency} />,
    transaksi: <TransactionForm addTransaction={addTransaction} currency={currency} />,
    riwayat: <TransactionList transactions={transactions} deleteTransaction={deleteTransaction} updateTransaction={updateTransaction} currency={currency} />,
    budget: <BudgetTracker transactions={transactions} userId={user.uid} currency={currency} />,
    grafik: <GrafikPage transactions={transactions} currency={currency} />,
    rekap: <RekapBulanan transactions={transactions} currency={currency} userId={user.uid} accessToken={accessToken} goals={goals} debts={debts} userName={user.displayName} />,
    tabungan: <SavingsGoal userId={user.uid} transactions={transactions} currency={currency} />,
    hutang: <HutangPiutang userId={user.uid} currency={currency} />,
    rutin: <TransaksiRutin userId={user.uid} addTransaction={addTransaction} currency={currency} />,
    insight: <Insight transactions={transactions} currency={currency} />,
    settings: <Settings onCurrencyChange={setCurrencyState} />,
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
          goals={goals}
          debts={debts}
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