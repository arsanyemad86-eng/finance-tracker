import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import './Transactions.css'

function Transactions() {
  const { transactions, deleteTransaction } = useTransactions()
  const [filter, setFilter] = useState('all')

  const filtered = transactions.filter(t => {
    if (filter === 'all') return true
    return t.type === filter
  })

  return (
    <div className="transactions-page">
      <h1>Transactions</h1>
      <p className="page-subtitle">View and manage all your income and expenses</p>

      <div className="filter-bar">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
        <button className={filter === 'income' ? 'active' : ''} onClick={() => setFilter('income')}>Income</button>
        <button className={filter === 'expense' ? 'active' : ''} onClick={() => setFilter('expense')}>Expense</button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No transactions found.</div>
      ) : (
        <div className="transactions-table">
          <div className="table-header">
            <span>Date</span>
            <span>Category</span>
            <span>Note</span>
            <span>Type</span>
            <span>Amount</span>
            <span></span>
          </div>
          {filtered.map(t => (
            <div key={t.id} className="table-row">
              <span>{t.date}</span>
              <span>{t.category}</span>
              <span className="note">{t.note || '—'}</span>
              <span className={`badge ${t.type}`}>{t.type}</span>
              <span className={`amount ${t.type}`}>
                {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
              </span>
              <button className="delete-btn" onClick={() => deleteTransaction(t.id)}>🗑</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Transactions