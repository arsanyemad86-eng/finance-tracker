import { useState, useEffect } from 'react'

const STORAGE_KEY = 'fintrack_transactions'

export function useTransactions() {
  const [transactions, setTransactions] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  }, [transactions])

  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now(),
    }
    setTransactions(prev => [newTransaction, ...prev])
  }

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  // ✏️ Edit: استبدل الـ transaction القديمة بالبيانات الجديدة
  const editTransaction = (id, updatedData) => {
    setTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updatedData } : t))
    )
  }

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    editTransaction,
    totalIncome,
    totalExpense,
    balance,
  }
}