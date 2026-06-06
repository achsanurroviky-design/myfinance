import { useState, useEffect } from 'react'
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

export function useTransactions(userId) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    const q = query(collection(db, 'users', userId, 'transactions'), orderBy('date', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setTransactions(snap.docs.map(d => ({ id: d.id, userId, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [userId])

  const addTransaction = async (data) => {
    await addDoc(collection(db, 'users', userId, 'transactions'), {
      ...data,
      date: new Date(data.date).toISOString(),
      createdAt: new Date()
    })
  }

  const updateTransaction = async (id, data) => {
    await updateDoc(doc(db, 'users', userId, 'transactions', id), {
      ...data,
      amount: parseInt(data.amount),
      date: new Date(data.date).toISOString()
    })
  }

  const deleteTransaction = async (id) => {
    await deleteDoc(doc(db, 'users', userId, 'transactions', id))
  }

  return { transactions, loading, addTransaction, updateTransaction, deleteTransaction }
}