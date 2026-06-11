import { useState } from "react";
import { useGoals } from "../hooks/useGoals";
import "./Goals.css";

const fmt = (n) =>
  Math.round(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

function daysRemaining(deadline) {
  if (!deadline) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(deadline);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function Goals() {
  const { goals, addGoal, deleteGoal, addFunds } = useGoals();

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("0");
  const [deadline, setDeadline] = useState("");
  const [emoji, setEmoji] = useState("");
  const [error, setError] = useState("");

  const [fundingId, setFundingId] = useState(null);
  const [fundAmount, setFundAmount] = useState("");

  const totalGoals = goals.length;
  const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  const closeModal = () => {
    setShowModal(false);
    setTitle("");
    setTargetAmount("");
    setSavedAmount("0");
    setDeadline("");
    setEmoji("");
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const target = parseFloat(targetAmount);
    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }
    if (!targetAmount || isNaN(target) || target <= 0) {
      setError("Please enter a valid target amount.");
      return;
    }
    const saved = parseFloat(savedAmount) || 0;

    addGoal({
      title: title.trim(),
      targetAmount: target,
      savedAmount: saved,
      deadline: deadline || null,
      emoji: emoji.trim() || "🎯",
    });

    closeModal();
  };

  const openFunding = (id) => {
    setFundingId(fundingId === id ? null : id);
    setFundAmount("");
  };

  const handleAddFunds = (id) => {
    const amt = parseFloat(fundAmount);
    if (!fundAmount || isNaN(amt) || amt <= 0) return;
    addFunds(id, amt);
    setFundingId(null);
    setFundAmount("");
  };

  return (
    <div className="goals-page">
      <div className="goals-header">
        <div>
          <h1 className="goals-title">Goals</h1>
          <p className="goals-sub">Set savings targets and track your progress</p>
        </div>
        <button type="button" className="goals-new-btn" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Goal
        </button>
      </div>

      <div className="goals-summary">
        <div className="goals-summary__item">
          <span className="goals-summary__label">Total Goals</span>
          <span className="goals-summary__val">{totalGoals}</span>
        </div>
        <div className="goals-summary__item">
          <span className="goals-summary__label">Total Saved</span>
          <span className="goals-summary__val">${fmt(totalSaved)}</span>
        </div>
        <div className="goals-summary__item">
          <span className="goals-summary__label">Total Target</span>
          <span className="goals-summary__val">${fmt(totalTarget)}</span>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="goals-empty">
          <div className="goals-empty__icon">🎯</div>
          <h3 className="goals-empty__title">No goals yet</h3>
          <p className="goals-empty__subtitle">Create your first savings target to get started</p>
          <button type="button" className="goals-new-btn" onClick={() => setShowModal(true)}>
            New Goal
          </button>
        </div>
      ) : (
        <div className="goals-grid">
          {goals.map((g) => {
            const pct = g.targetAmount > 0
              ? Math.min(100, Math.round((g.savedAmount / g.targetAmount) * 100))
              : 0;
            const days = daysRemaining(g.deadline);

            return (
              <div key={g.id} className="goal-card">
                <div className="goal-card__head">
                  <span className="goal-card__emoji">{g.emoji}</span>
                  <h3 className="goal-card__title">{g.title}</h3>
                </div>

                <div className="goal-card__bar">
                  <div className="goal-card__bar-fill" style={{ width: `${pct}%` }} />
                </div>

                <div className="goal-card__meta">
                  <span className="goal-card__pct">{pct}%</span>
                  <span className="goal-card__amounts">
                    ${fmt(g.savedAmount)} saved of ${fmt(g.targetAmount)}
                  </span>
                </div>

                {g.deadline && (
                  <div className="goal-card__deadline">
                    {days >= 0 ? `${days} day${days === 1 ? "" : "s"} remaining` : "Deadline passed"}
                  </div>
                )}

                {fundingId === g.id && (
                  <div className="goal-card__fund-form">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Amount"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      className="goal-card__fund-input"
                      autoFocus
                    />
                    <button type="button" className="goal-card__fund-confirm" onClick={() => handleAddFunds(g.id)}>
                      Add
                    </button>
                  </div>
                )}

                <div className="goal-card__actions">
                  <button type="button" className="goal-card__btn goal-card__btn--add" onClick={() => openFunding(g.id)}>
                    Add Funds
                  </button>
                  <button type="button" className="goal-card__btn goal-card__btn--delete" onClick={() => deleteGoal(g.id)}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="goals-overlay" onClick={closeModal}>
          <div className="goals-modal" onClick={(e) => e.stopPropagation()}>
            <div className="goals-modal__header">
              <h2 className="goals-modal__title">New Goal</h2>
              <button className="goals-modal__close" onClick={closeModal} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {error && <div className="goals-modal__error">{error}</div>}

            <form onSubmit={handleSubmit} className="goals-modal__form">
              <div className="goals-modal__field">
                <label className="goals-modal__label" htmlFor="goal-title">Title</label>
                <input
                  id="goal-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="goals-modal__input"
                  placeholder="e.g. New Laptop"
                  required
                />
              </div>

              <div className="goals-modal__row">
                <div className="goals-modal__field">
                  <label className="goals-modal__label" htmlFor="goal-target">Target Amount</label>
                  <input
                    id="goal-target"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="goals-modal__input"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="goals-modal__field">
                  <label className="goals-modal__label" htmlFor="goal-saved">Saved Amount</label>
                  <input
                    id="goal-saved"
                    type="number"
                    min="0"
                    step="0.01"
                    value={savedAmount}
                    onChange={(e) => setSavedAmount(e.target.value)}
                    className="goals-modal__input"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="goals-modal__row">
                <div className="goals-modal__field">
                  <label className="goals-modal__label" htmlFor="goal-deadline">
                    Deadline <span className="goals-modal__optional">(optional)</span>
                  </label>
                  <input
                    id="goal-deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="goals-modal__input"
                  />
                </div>
                <div className="goals-modal__field">
                  <label className="goals-modal__label" htmlFor="goal-emoji">
                    Emoji <span className="goals-modal__optional">(optional)</span>
                  </label>
                  <input
                    id="goal-emoji"
                    type="text"
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    className="goals-modal__input"
                    placeholder="🎯"
                    maxLength={4}
                  />
                </div>
              </div>

              <div className="goals-modal__actions">
                <button type="button" className="goals-modal__cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="goals-modal__save">
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
