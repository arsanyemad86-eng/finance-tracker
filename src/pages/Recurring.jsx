import { useState } from "react";
import { useRecurring } from "../hooks/useRecurring";
import "./Recurring.css";

const EXPENSE_CATS = ["Food", "House Rent", "Transport", "Bills", "Shopping", "Health", "Education", "Entertainment", "Other"];
const INCOME_CATS  = ["Salary", "Freelance", "Investment", "Gift", "Other"];

const fmt = (n) =>
  Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Recurring() {
  const { rules, addRule, deleteRule, toggleRule, firedToday } = useRecurring();

  const today = new Date().toISOString().slice(0, 10);

  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [note, setNote] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [startDate, setStartDate] = useState(today);
  const [error, setError] = useState("");

  const cats = type === "expense" ? EXPENSE_CATS : INCOME_CATS;

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(newType === "expense" ? "Food" : "Salary");
  };

  const closeModal = () => {
    setShowModal(false);
    setType("expense");
    setAmount("");
    setCategory("Food");
    setNote("");
    setFrequency("monthly");
    setStartDate(today);
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (!startDate) {
      setError("Please select a start date.");
      return;
    }

    addRule({
      type,
      amount: amt,
      category,
      note: note.trim(),
      frequency,
      nextDate: startDate,
    });

    closeModal();
  };

  return (
    <div className="recurring-page">
      <div className="recurring-header">
        <div>
          <h1 className="recurring-title">Recurring Transactions</h1>
          <p className="recurring-sub">Automate transactions that repeat on a schedule</p>
        </div>
        <button type="button" className="recurring-new-btn" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Rule
        </button>
      </div>

      {firedToday > 0 && (
        <div className="recurring-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {firedToday} transaction{firedToday === 1 ? "" : "s"} added automatically
        </div>
      )}

      {rules.length === 0 ? (
        <div className="recurring-empty">
          <h3 className="recurring-empty__title">No recurring rules yet</h3>
          <p className="recurring-empty__subtitle">Set up a rule to automate regular income or expenses</p>
          <button type="button" className="recurring-new-btn" onClick={() => setShowModal(true)}>
            New Rule
          </button>
        </div>
      ) : (
        <div className="recurring-list">
          {rules.map((r) => (
            <div key={r.id} className="recurring-row">
              <div className="recurring-row__main">
                <span className={`recurring-row__cat recurring-row__cat--${r.type}`}>{r.category}</span>
                <span className={`recurring-row__amount recurring-row__amount--${r.type}`}>
                  {r.type === "income" ? "+" : "-"}${fmt(r.amount)}
                </span>
              </div>
              <span className={`recurring-badge recurring-badge--${r.frequency}`}>{r.frequency}</span>
              <span className="recurring-row__next">Next: {r.nextDate}</span>
              <label className="recurring-toggle">
                <input
                  type="checkbox"
                  checked={r.active}
                  onChange={() => toggleRule(r.id)}
                />
                <span className="recurring-toggle__slider" />
              </label>
              <button
                type="button"
                className="recurring-delete"
                onClick={() => deleteRule(r.id)}
                aria-label="Delete rule"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                  <path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="recurring-overlay" onClick={closeModal}>
          <div className="recurring-modal" onClick={(e) => e.stopPropagation()}>
            <div className="recurring-modal__header">
              <h2 className="recurring-modal__title">New Recurring Rule</h2>
              <button className="recurring-modal__close" onClick={closeModal} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {error && <div className="recurring-modal__error">{error}</div>}

            <form onSubmit={handleSubmit} className="recurring-modal__form">
              <div className="recurring-modal__field">
                <label className="recurring-modal__label">Type</label>
                <div className="add-toggle">
                  <button
                    type="button"
                    className={`add-toggle-btn ${type === "expense" ? "add-toggle-btn--expense" : ""}`}
                    onClick={() => handleTypeChange("expense")}
                  >Expense</button>
                  <button
                    type="button"
                    className={`add-toggle-btn ${type === "income" ? "add-toggle-btn--income" : ""}`}
                    onClick={() => handleTypeChange("income")}
                  >Income</button>
                </div>
              </div>

              <div className="recurring-modal__row">
                <div className="recurring-modal__field">
                  <label className="recurring-modal__label" htmlFor="rec-amount">Amount</label>
                  <input
                    id="rec-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="recurring-modal__input"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="recurring-modal__field">
                  <label className="recurring-modal__label" htmlFor="rec-category">Category</label>
                  <select
                    id="rec-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="recurring-modal__input"
                  >
                    {cats.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="recurring-modal__field">
                <label className="recurring-modal__label" htmlFor="rec-note">
                  Note <span className="recurring-modal__optional">(optional)</span>
                </label>
                <input
                  id="rec-note"
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="recurring-modal__input"
                  placeholder="Add a note..."
                />
              </div>

              <div className="recurring-modal__row">
                <div className="recurring-modal__field">
                  <label className="recurring-modal__label" htmlFor="rec-frequency">Frequency</label>
                  <select
                    id="rec-frequency"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="recurring-modal__input"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="recurring-modal__field">
                  <label className="recurring-modal__label" htmlFor="rec-start">Start Date</label>
                  <input
                    id="rec-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="recurring-modal__input"
                    required
                  />
                </div>
              </div>

              <div className="recurring-modal__actions">
                <button type="button" className="recurring-modal__cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="recurring-modal__save">
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
