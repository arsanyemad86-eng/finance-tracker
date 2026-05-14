import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTransactions } from "../hooks/useTransactions";
import "./AddTransaction.css";

const EXPENSE_CATS = ["Food", "House Rent", "Transport", "Bills", "Shopping", "Health", "Education", "Entertainment", "Other"];
const INCOME_CATS  = ["Salary", "Freelance", "Investment", "Gift", "Other"];

export default function AddTransaction() {
  const { addTransaction } = useTransactions();
  const navigate = useNavigate();

  const today = new Date().toISOString().slice(0, 10);

  const [type,     setType]     = useState("expense");
  const [amount,   setAmount]   = useState("");
  const [category, setCategory] = useState("Food");
  const [date,     setDate]     = useState(today);
  const [note,     setNote]     = useState("");
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");

  const cats = type === "expense" ? EXPENSE_CATS : INCOME_CATS;

  const handleTypeChange = (t) => {
    setType(t);
    setCategory(t === "expense" ? "Food" : "Salary");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (!date) {
      setError("Please select a date.");
      return;
    }

    addTransaction({ type, amount: amt, category, date, note: note.trim() });
    setSuccess(true);

    setTimeout(() => {
      navigate("/transactions");
    }, 1200);
  };

  return (
    <div className="add-page">
      <div className="add-header">
        <div>
          <h1 className="add-title">Add Transaction</h1>
          <p className="add-sub">Record a new income or expense</p>
        </div>
      </div>

      <div className="add-card">
        {success && (
          <div className="add-success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            Transaction added! Redirecting…
          </div>
        )}

        {error && (
          <div className="add-error">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="add-form">
          {/* Type toggle */}
          <div className="add-field">
            <label className="add-label">Type</label>
            <div className="add-toggle">
              <button
                type="button"
                className={`add-toggle-btn ${type === "expense" ? "add-toggle-btn--expense" : ""}`}
                onClick={() => handleTypeChange("expense")}
              >
                Expense
              </button>
              <button
                type="button"
                className={`add-toggle-btn ${type === "income" ? "add-toggle-btn--income" : ""}`}
                onClick={() => handleTypeChange("income")}
              >
                Income
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="add-field">
            <label className="add-label" htmlFor="amount">Amount</label>
            <div className="add-input-wrap">
              <span className="add-input-prefix">$</span>
              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="add-input add-input--prefixed"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="add-field">
            <label className="add-label" htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="add-select"
            >
              {cats.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="add-field">
            <label className="add-label" htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="add-input"
              required
            />
          </div>

          {/* Note */}
          <div className="add-field">
            <label className="add-label" htmlFor="note">Note <span className="add-label--opt">(optional)</span></label>
            <textarea
              id="note"
              rows={3}
              placeholder="Add a note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="add-textarea"
            />
          </div>

          <button type="submit" className="add-submit" disabled={success}>
            {success ? "Added!" : "Add Transaction"}
          </button>
        </form>
      </div>
    </div>
  );
}