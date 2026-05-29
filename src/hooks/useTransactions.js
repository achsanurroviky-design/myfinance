import { useState, useEffect } from 'react'
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'

export function useTransactions(userId) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    const q = query(collection(db, 'users', userId, 'transactions'), orderBy('date', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [userId])

  const addTransaction = async (data) => {
    await addDoc(collection(db, 'users', userId, 'transactions'), {
      ...data,
      date: new Date().toISOString(),
      createdAt: new Date()
    })
  }

  const deleteTransaction = async (id) => {
    await deleteDoc(doc(db, 'users', userId, 'transactions', id))
  }

  return { transactions, loading, addTransaction, deleteTransaction }
}