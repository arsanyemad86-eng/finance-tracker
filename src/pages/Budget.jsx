import { useState, useEffect } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { useBudgets, getCurrentMonthSpendByCategory } from "../hooks/useBudgets";
import { useLang } from "../contexts/LanguageContext";
import "./Budget.css";

const EXPENSE_CATS = [
  "Food",
  "House Rent",
  "Transport",
  "Bills",
  "Shopping",
  "Health",
  "Education",
  "Entertainment",
  "Other",
];

const fmt = (n) =>
  Math.round(n).toLocaleString("en-US");

export default function Budget() {
  const { transactions } = useTransactions();
  const { budgets, setAll } = useBudgets();
  const { t } = useLang();

  // Local form state so the user can edit before saving
  const [draft, setDraft] = useState(() => {
    const init = {};
    EXPENSE_CATS.forEach((c) => {
      init[c] = budgets[c] != null ? String(budgets[c]) : "";
    });
    return init;
  });
  const [savedFlash, setSavedFlash] = useState(false);

  // Sync draft when budgets change externally (e.g. on mount with stored values)
  useEffect(() => {
    const next = {};
    EXPENSE_CATS.forEach((c) => {
      next[c] = budgets[c] != null ? String(budgets[c]) : "";
    });
    setDraft(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spendMap = getCurrentMonthSpendByCategory(transactions);

  const handleChange = (cat, value) => {
    setDraft((prev) => ({ ...prev, [cat]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const next = {};
    EXPENSE_CATS.forEach((c) => {
      const num = parseFloat(draft[c]);
      if (!isNaN(num) && num > 0) next[c] = num;
    });
    setAll(next);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  return (
    <div className="budget-page">
      <div className="budget-header">
        <div>
          <h1 className="budget-title">{t("budget.title")}</h1>
          <p className="budget-sub">{t("budget.subtitle")}</p>
        </div>
        <button
          type="submit"
          form="budget-form"
          className="budget-save-btn"
        >
          {savedFlash ? t("budget.saved") : t("budget.save")}
        </button>
      </div>

      <form id="budget-form" onSubmit={handleSave} className="budget-grid">
        {EXPENSE_CATS.map((cat) => {
          const limit = parseFloat(draft[cat]) || 0;
          const spent = spendMap[cat] || 0;
          const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
          const realPct = limit > 0 ? (spent / limit) * 100 : 0;

          let status = "safe";
          if (limit > 0) {
            if (realPct > 100) status = "over";
            else if (realPct >= 80) status = "warning";
          }

          return (
            <div key={cat} className={`budget-card budget-card--${status}`}>
              <div className="budget-card__row">
                <span className="budget-card__name">{cat}</span>
                <span className={`budget-card__status budget-card__status--${status}`}>
                  {limit > 0 ? t(`budget.status.${status}`) : t("budget.noLimit")}
                </span>
              </div>

              <div className="budget-card__input-wrap">
                <span className="budget-card__currency">$</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder={t("budget.placeholder")}
                  value={draft[cat]}
                  onChange={(e) => handleChange(cat, e.target.value)}
                  className="budget-card__input"
                />
              </div>

              <div className="budget-card__meta">
                <span>
                  {t("budget.spent")}: <strong>${fmt(spent)}</strong>
                </span>
                <span>
                  {limit > 0 ? (
                    <>
                      {t("budget.of")} ${fmt(limit)}
                    </>
                  ) : (
                    t("budget.noLimit")
                  )}
                </span>
              </div>

              <div className="budget-card__bar">
                <div
                  className={`budget-card__fill budget-card__fill--${status}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </form>
    </div>
  );
}
