import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTransactions } from "../hooks/useTransactions";
import { useBudgets, getExceededCategories } from "../hooks/useBudgets";
import { useLang } from "../contexts/LanguageContext";
import { getAIMessage } from "../lib/ai";
import EmptyState from "../components/EmptyState";
import "./Transactions.css";

const EXPENSE_CATS = ["Food", "House Rent", "Transport", "Bills", "Shopping", "Health", "Education", "Entertainment", "Other"];
const INCOME_CATS  = ["Salary", "Freelance", "Investment", "Gift", "Other"];

const fmt = (n) =>
  Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const csvEscape = (val) => {
  if (val == null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

export default function Transactions() {
  const { transactions, deleteTransaction, editTransaction } = useTransactions();
  const { budgets } = useBudgets();
  const { t, lang } = useLang();

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");

  // ── JSON backup / restore ──
  const importInputRef = useRef(null);
  const [importToast, setImportToast] = useState("");

  const clearDateRange = () => {
    setDateFrom("");
    setDateTo("");
  };

  // ── Edit modal state ──
  const [editingTxn, setEditingTxn]   = useState(null);
  const [editType,    setEditType]    = useState("expense");
  const [editAmount,  setEditAmount]  = useState("");
  const [editCat,     setEditCat]     = useState("Food");
  const [editDate,    setEditDate]    = useState("");
  const [editNote,    setEditNote]    = useState("");
  const [editError,   setEditError]   = useState("");

  // ── AI insight state ──
  const [aiTxnId, setAiTxnId] = useState(null);
  const [aiText, setAiText]   = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const aiAbortRef = useRef(null);
  const aiCache = useRef({});

  const openEdit = (txn) => {
    setEditingTxn(txn);
    setEditType(txn.type);
    setEditAmount(String(txn.amount));
    setEditCat(txn.category);
    setEditDate(txn.date);
    setEditNote(txn.note || "");
    setEditError("");
  };

  const closeEdit = () => {
    setEditingTxn(null);
    setEditError("");
  };

  const handleEditTypeChange = (type) => {
    setEditType(type);
    setEditCat(type === "expense" ? "Food" : "Salary");
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setEditError("");

    const amt = parseFloat(editAmount);
    if (!editAmount || isNaN(amt) || amt <= 0) {
      setEditError(t("txn.invalidAmount"));
      return;
    }
    if (!editDate) {
      setEditError(t("txn.invalidDate"));
      return;
    }

    editTransaction(editingTxn.id, {
      type:     editType,
      amount:   amt,
      category: editCat,
      date:     editDate,
      note:     editNote.trim(),
    });

    closeEdit();
  };

  // ── AI insight handlers ──
  const handleAIClick = async (txn) => {
    // Toggle off if same one
    if (aiTxnId === txn.id) {
      setAiTxnId(null);
      setAiText("");
      setAiLoading(false);
      if (aiAbortRef.current) aiAbortRef.current.abort();
      return;
    }

    setAiTxnId(txn.id);

    // Cache hit
    const cacheKey = `${txn.id}:${lang}`;
    if (aiCache.current[cacheKey]) {
      setAiText(aiCache.current[cacheKey]);
      setAiLoading(false);
      return;
    }

    setAiText("");
    setAiLoading(true);

    if (aiAbortRef.current) aiAbortRef.current.abort();
    const controller = new AbortController();
    aiAbortRef.current = controller;

    const msg = await getAIMessage(
      {
        type: txn.type,
        amount: txn.amount,
        category: txn.category,
        note: txn.note,
        lang,
      },
      { signal: controller.signal }
    );

    if (controller.signal.aborted) return;

    setAiLoading(false);
    if (msg) {
      aiCache.current[cacheKey] = msg;
      setAiText(msg);
    } else {
      // Silently close the popover on failure
      setAiTxnId(null);
    }
  };

  // Close popover when clicking outside
  useEffect(() => {
    if (!aiTxnId) return;
    const onClick = (e) => {
      if (!e.target.closest(".txn-ai-popover") && !e.target.closest(".txn-ai")) {
        setAiTxnId(null);
        setAiText("");
        setAiLoading(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [aiTxnId]);

  // ── CSV export ──
  const handleExportCsv = () => {
    if (transactions.length === 0) {
      // eslint-disable-next-line no-alert
      alert(t("txn.exportEmpty"));
      return;
    }
    const header = ["Date", "Category", "Type", "Amount", "Note"];
    const rows = [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((t) => [t.date, t.category, t.type, t.amount, t.note || ""]);

    const csv = [header, ...rows]
      .map((r) => r.map(csvEscape).join(","))
      .join("\n");

    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fintrack-transactions.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── JSON Export ──
  const handleExportJson = () => {
    const budgetsRaw = localStorage.getItem("fintrack_budgets");
    const budgets = budgetsRaw ? JSON.parse(budgetsRaw) : {};

    const data = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      transactions,
      budgets,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fintrack-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── JSON Import ──
  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data.transactions)) {
          throw new Error("Invalid backup file");
        }
        const confirmed = window.confirm("This will replace all your current data. Continue?");
        if (!confirmed) return;

        localStorage.setItem("fintrack_transactions", JSON.stringify(data.transactions));
        localStorage.setItem("fintrack_budgets", JSON.stringify(data.budgets || {}));
        window.location.reload();
      } catch {
        setImportToast("Invalid backup file. Please select a valid FinTrack JSON export.");
        setTimeout(() => setImportToast(""), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ── Filter + search + sort ──
  const exceeded = getExceededCategories(budgets, transactions);

  const byType =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.type === filter);

  // Apply date range filter (inclusive on both ends)
  const byDateRange = byType.filter((t) => {
    if (!t.date) return true;
    if (dateFrom && t.date < dateFrom) return false;
    if (dateTo   && t.date > dateTo)   return false;
    return true;
  });

  const q = search.trim().toLowerCase();
  const filtered = q
    ? byDateRange.filter((t) => {
        return (
          (t.category || "").toLowerCase().includes(q) ||
          (t.note || "").toLowerCase().includes(q) ||
          (t.date || "").toLowerCase().includes(q) ||
          String(t.amount).includes(q)
        );
      })
    : byDateRange;

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const cats = editType === "expense" ? EXPENSE_CATS : INCOME_CATS;

  return (
    <div className="txn-page">

      {/* ── Import error toast ── */}
      {importToast && (
        <div className="txn-toast txn-toast--error">{importToast}</div>
      )}

      {/* ── Edit Modal ── */}
      {editingTxn && (
        <div className="edit-overlay" onClick={closeEdit}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>

            <div className="edit-modal-header">
              <h2 className="edit-modal-title">{t("txn.editTxn")}</h2>
              <button className="edit-modal-close" onClick={closeEdit} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {editError && <div className="edit-error">{editError}</div>}

            <form onSubmit={handleEditSubmit} className="edit-form">

              {/* Type */}
              <div className="edit-field">
                <label className="edit-label">{t("add.type")}</label>
                <div className="add-toggle">
                  <button
                    type="button"
                    className={`add-toggle-btn ${editType === "expense" ? "add-toggle-btn--expense" : ""}`}
                    onClick={() => handleEditTypeChange("expense")}
                  >{t("add.expense")}</button>
                  <button
                    type="button"
                    className={`add-toggle-btn ${editType === "income" ? "add-toggle-btn--income" : ""}`}
                    onClick={() => handleEditTypeChange("income")}
                  >{t("add.income")}</button>
                </div>
              </div>

              {/* Amount */}
              <div className="edit-field">
                <label className="edit-label" htmlFor="edit-amount">{t("add.amount")}</label>
                <div className="add-input-wrap">
                  <span className="add-input-prefix">$</span>
                  <input
                    id="edit-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="add-input add-input--prefixed"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div className="edit-field">
                <label className="edit-label" htmlFor="edit-category">{t("add.category")}</label>
                <select
                  id="edit-category"
                  value={editCat}
                  onChange={(e) => setEditCat(e.target.value)}
                  className="add-select"
                >
                  {cats.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Date */}
              <div className="edit-field">
                <label className="edit-label" htmlFor="edit-date">{t("add.date")}</label>
                <input
                  id="edit-date"
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="add-input"
                  required
                />
              </div>

              {/* Note */}
              <div className="edit-field">
                <label className="edit-label" htmlFor="edit-note">
                  {t("add.note")} <span className="add-label--opt">{t("add.optional")}</span>
                </label>
                <textarea
                  id="edit-note"
                  rows={3}
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="add-textarea"
                  placeholder={t("add.addNotePlaceholder")}
                />
              </div>

              <div className="edit-actions">
                <button type="button" className="edit-cancel-btn" onClick={closeEdit}>
                  {t("txn.cancel")}
                </button>
                <button type="submit" className="edit-save-btn">
                  {t("txn.save")}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── Budget Banner ── */}
      {exceeded.length > 0 && (
        <div className="budget-banner">
          <svg className="budget-banner__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>
            ⚠️ {t("txn.budgetExceeded", { category: exceeded.map(e => e.category).join(", ") })}
          </span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="txn-header">
        <div>
          <h1 className="txn-title">{t("txn.title")}</h1>
          <p className="txn-sub">{t("txn.subtitle")}</p>
        </div>
        <div className="txn-header-actions">
          <button type="button" className="txn-export-btn" onClick={handleExportCsv}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {t("txn.exportCsv")}
          </button>
          <button type="button" className="txn-export-btn" onClick={handleExportJson}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export JSON
          </button>
          <button type="button" className="txn-export-btn" onClick={handleImportClick}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Import JSON
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            style={{ display: "none" }}
          />
          <Link to="/add" className="txn-add-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {t("txn.addNew")}
          </Link>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="txn-search-wrap">
        <svg className="txn-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("txn.search")}
          className="txn-search-input"
        />
      </div>

      {/* ── Date Range Filter ── */}
      <div className="txn-date-range">
        <div className="txn-date-field">
          <label htmlFor="txn-date-from" className="txn-date-label">{t("txn.from")}</label>
          <input
            id="txn-date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            max={dateTo || undefined}
            className="txn-date-input"
          />
        </div>
        <div className="txn-date-field">
          <label htmlFor="txn-date-to" className="txn-date-label">{t("txn.to")}</label>
          <input
            id="txn-date-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            min={dateFrom || undefined}
            className="txn-date-input"
          />
        </div>
        {(dateFrom || dateTo) && (
          <button
            type="button"
            className="txn-date-clear"
            onClick={clearDateRange}
          >
            {t("txn.clear")}
          </button>
        )}
      </div>

      {/* ── Filter Tabs ── */}
      <div className="txn-filters">
        {["all", "income", "expense"].map((f) => (
          <button
            key={f}
            className={`txn-filter-btn ${filter === f ? "txn-filter-btn--active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {t(`txn.${f}`)}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="txn-table-wrap">
        {sorted.length === 0 ? (
          (q || dateFrom || dateTo) ? (
            <div className="txn-empty">{t("txn.noMatch")}</div>
          ) : (
            <EmptyState
              title="No transactions yet"
              subtitle="Start tracking your finances"
              linkTo="/add"
              linkLabel={t("txn.addOne")}
            />
          )
        ) : (
          <table className="txn-table">
            <thead>
              <tr>
                <th>{t("txn.date")}</th>
                <th>{t("txn.category")}</th>
                <th>{t("txn.note")}</th>
                <th>{t("txn.type")}</th>
                <th style={{ textAlign: "right" }}>{t("txn.amount")}</th>
                <th style={{ width: 110 }}></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((txn) => (
                <tr key={txn.id} className="txn-row">
                  <td className="txn-date">{txn.date}</td>
                  <td className="txn-cat">{txn.category}</td>
                  <td className="txn-note">{txn.note || <span className="txn-dash">—</span>}</td>
                  <td>
                    <span className={`txn-badge txn-badge--${txn.type}`}>
                      {t(`txn.${txn.type}`)}
                    </span>
                  </td>
                  <td className={`txn-amount txn-amount--${txn.type}`}>
                    {txn.type === "income" ? "+" : "-"}${fmt(txn.amount)}
                  </td>
                  <td className="txn-actions-cell">
                    {/* ✨ AI insight */}
                    <div className="txn-ai-wrap">
                      <button
                        className="txn-ai"
                        onClick={() => handleAIClick(txn)}
                        aria-label={t("txn.aiInsight")}
                        title={t("txn.aiInsight")}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 2l2.39 4.84L20 8l-4 3.9.94 5.5L12 14.77 7.06 17.4 8 11.9 4 8l5.61-1.16L12 2z"/>
                        </svg>
                      </button>
                      {aiTxnId === txn.id && (
                        <div className="txn-ai-popover" role="dialog">
                          {aiLoading ? (
                            <div className="txn-ai-loading">
                              <span className="txn-ai-spinner" />
                              {t("txn.thinking")}
                            </div>
                          ) : (
                            <div className="txn-ai-text">{aiText}</div>
                          )}
                        </div>
                      )}
                    </div>
                    {/* ✏️ Edit */}
                    <button
                      className="txn-edit"
                      onClick={() => openEdit(txn)}
                      aria-label="Edit transaction"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    {/* 🗑️ Delete */}
                    <button
                      className="txn-delete"
                      onClick={() => deleteTransaction(txn.id)}
                      aria-label="Delete transaction"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14H6L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/>
                        <path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
