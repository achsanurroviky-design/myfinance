import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTransactions } from './hooks/useTransactions'
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

export default function App() {
  const { user, loading } = useAuth()
  const { transactions, addTransaction, deleteTransaction } = useTransactions(user?.uid)
  const [activePage, setActivePage] = useState('dashboard')

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-400 text-sm">Memuat...</div>
    </div>
  )

  if (!user) return <Login />

  const pages = {dashboard: <Dashboard transactions={transactions} setActivePage={setActivePage} userId={user.uid} />,
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
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {pages[activePage]}
    </Layout>
  )
}