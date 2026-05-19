import { useState, useEffect } from 'react'

const STORAGE_KEY = 'fintrack_transactions'
const SEED_FLAG_KEY = 'fintrack_seeded_v1'

// ── Sample data seed ──
// Returns 12 realistic transactions with dates spread across the last 30 days.
// Dates are computed at runtime so the demo always looks "recent".
function buildSampleTransactions() {
  const today = new Date()
  const isoDaysAgo = (n) => {
    const d = new Date(today)
    d.setDate(d.getDate() - n)
    return d.toISOString().slice(0, 10)
  }

  // [daysAgo, type, amount, category, note]
  const blueprint = [
    [1,  'expense', 24.5,  'Food',          'Lunch with friends'],
    [2,  'expense', 12.0,  'Transport',     'Uber to office'],
    [3,  'expense', 65.0,  'Shopping',      'New running shoes'],
    [4,  'income',  2500,  'Salary',        'Monthly salary'],
    [5,  'expense', 45.0,  'Food',          'Weekly groceries'],
    [8,  'expense', 30.0,  'Bills',         'Internet bill'],
    [10, 'expense', 18.75, 'Food',          'Coffee + breakfast'],
    [13, 'expense', 120.0, 'Education',     'Online course'],
    [16, 'expense', 50.0,  'Health',        'Pharmacy'],
    [19, 'expense', 22.0,  'Transport',     'Fuel'],
    [23, 'expense', 80.0,  'Bills',         'Electricity'],
    [27, 'expense', 35.0,  'Shopping',      'Book'],
  ]

  return blueprint.map(([daysAgo, type, amount, category, note], i) => ({
    id: Date.now() - i * 1000, // stable, unique
    type,
    amount,
    category,
    date: isoDaysAgo(daysAgo),
    note,
  }))
}

export function useTransactions() {
  const [transactions, setTransactions] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : []

    // Seed only once: first load (no flag) AND empty list.
    // The flag prevents re-seeding if the user intentionally deletes everything.
    const seeded = localStorage.getItem(SEED_FLAG_KEY)
    if (!seeded && parsed.length === 0) {
      const sample = buildSampleTransactions()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sample))
      localStorage.setItem(SEED_FLAG_KEY, '1')
      return sample
    }
    return parsed
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