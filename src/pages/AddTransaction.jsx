import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import './AddTransaction.css'

const categories = {
  income: ['Salary', 'Freelance', 'Investment', 'Other'],
  expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Other'],
}

function AddTransaction() {
  const { addTransaction } = useTransactions()
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    note: '',
  })
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'type') {
      setForm(prev => ({ ...prev, type: value, category: categories[value][0] }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.amount || form.amount <= 0) return
    addTransaction({ ...form, amount: parseFloat(form.amount) })
    setForm({
      type: 'expense',
      amount: '',
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      note: '',
    })
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
  }

  return (
    <div className="add-page">
      <h1>Add Transaction</h1>
      <p className="add-subtitle">Record a new income or expense</p>

      {success && <div className="success-msg">✅ Transaction added successfully!</div>}

      <form className="add-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Type</label>
          <div className="type-toggle">
            <button type="button" className={form.type === 'expense' ? 'active expense' : ''} onClick={() => handleChange({ target: { name: 'type', value: 'expense' } })}>Expense</button>
            <button type="button" className={form.type === 'income' ? 'active income' : ''} onClick={() => handleChange({ target: { name: 'type', value: 'income' } })}>Income</button>
          </div>
        </div>

        <div className="form-group">
          <label>Amount</label>
          <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="0.00" min="0" required />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select name="category" value={form.category} onChange={handleChange}>
            {categories[form.type].map(cat => <option key={cat}>{cat}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Date</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Note (optional)</label>
          <input type="text" name="note" value={form.note} onChange={handleChange} placeholder="Add a note..." />
        </div>

        <button type="submit" className="submit-btn">Add Transaction</button>
      </form>
    </div>
  )
}

export default AddTransaction