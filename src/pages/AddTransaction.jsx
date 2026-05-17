import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTransactions } from "../hooks/useTransactions";
import { useLang } from "../contexts/LanguageContext";
import { getAIMessage } from "../lib/ai";
import "./AddTransaction.css";

const EXPENSE_CATS = ["Food", "House Rent", "Transport", "Bills", "Shopping", "Health", "Education", "Entertainment", "Other"];
const INCOME_CATS  = ["Salary", "Freelance", "Investment", "Gift", "Other"];

export default function AddTransaction() {
  const { addTransaction } = useTransactions();
  const { t, lang } = useLang();
  const navigate = useNavigate();

  const today = new Date().toISOString().slice(0, 10);

  const [type,     setType]     = useState("expense");
  const [amount,   setAmount]   = useState("");
  const [category, setCategory] = useState("Food");
  const [date,     setDate]     = useState(today);
  const [note,     setNote]     = useState("");
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");

  const [aiMsg, setAiMsg] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const cats = type === "expense" ? EXPENSE_CATS : INCOME_CATS;

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(newType === "expense" ? "Food" : "Salary");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      setError(t("add.invalidAmount"));
      return;
    }
    if (!date) {
      setError(t("add.invalidDate"));
      return;
    }

    addTransaction({ type, amount: amt, category, date, note: note.trim() });
    setSuccess(true);
    setAiLoading(true);

    // Fire AI request in parallel — don't block UI on it
    getAIMessage({ type, amount: amt, category, note: note.trim(), lang })
      .then((msg) => {
        setAiLoading(false);
        if (msg) setAiMsg(msg);
      })
      .catch(() => setAiLoading(false));

    // Always redirect after 3 seconds (regardless of AI success/failure)
    setTimeout(() => {
      navigate("/transactions");
    }, 3000);
  };

  return (
    <div className="add-page">
      <div className="add-header">
        <div>
          <h1 className="add-title">{t("add.title")}</h1>
          <p className="add-sub">{t("add.subtitle")}</p>
        </div>
      </div>

      <div className="add-card">
        {success && (
          <div className="add-success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            {t("add.success")}
          </div>
        )}

        {success && (aiLoading || aiMsg) && (
          <div className="add-ai-msg">
            {aiLoading ? (
              <div className="add-ai-loading">
                <span className="add-ai-spinner" />
                {t("add.aiThinking")}
              </div>
            ) : (
              <div className="add-ai-text">{aiMsg}</div>
            )}
          </div>
        )}

        {error && (
          <div className="add-error">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="add-form">
          {/* Type toggle */}
          <div className="add-field">
            <label className="add-label">{t("add.type")}</label>
            <div className="add-toggle">
              <button
                type="button"
                className={`add-toggle-btn ${type === "expense" ? "add-toggle-btn--expense" : ""}`}
                onClick={() => handleTypeChange("expense")}
              >
                {t("add.expense")}
              </button>
              <button
                type="button"
                className={`add-toggle-btn ${type === "income" ? "add-toggle-btn--income" : ""}`}
                onClick={() => handleTypeChange("income")}
              >
                {t("add.income")}
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="add-field">
            <label className="add-label" htmlFor="amount">{t("add.amount")}</label>
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
            <label className="add-label" htmlFor="category">{t("add.category")}</label>
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
            <label className="add-label" htmlFor="date">{t("add.date")}</label>
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
            <label className="add-label" htmlFor="note">
              {t("add.note")} <span className="add-label--opt">{t("add.optional")}</span>
            </label>
            <textarea
              id="note"
              rows={3}
              placeholder={t("add.addNotePlaceholder")}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="add-textarea"
            />
          </div>

          <button type="submit" className="add-submit" disabled={success}>
            {success ? t("add.added") : t("add.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
