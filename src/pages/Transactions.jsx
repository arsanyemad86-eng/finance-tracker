import { useState } from "react";
import { Link } from "react-router-dom";
import { useTransactions } from "../hooks/useTransactions";
import "./Transactions.css";

const fmt = (n) =>
  Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Transactions() {
  const { transactions, deleteTransaction } = useTransactions();
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.type === filter);

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="txn-page">
      {/* ── Header ── */}
      <div className="txn-header">
        <div>
          <h1 className="txn-title">Transactions</h1>
          <p className="txn-sub">View and manage all your income and expenses</p>
        </div>
        <Link to="/add" className="txn-add-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add New
        </Link>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="txn-filters">
        {["all", "income", "expense"].map((f) => (
          <button
            key={f}
            className={`txn-filter-btn ${filter === f ? "txn-filter-btn--active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="txn-table-wrap">
        {sorted.length === 0 ? (
          <div className="txn-empty">
            No transactions found.{" "}
            <Link to="/add" className="txn-empty__link">Add one</Link>
          </div>
        ) : (
          <table className="txn-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Note</th>
                <th>Type</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((t) => (
                <tr key={t.id} className="txn-row">
                  <td className="txn-date">{t.date}</td>
                  <td className="txn-cat">{t.category}</td>
                  <td className="txn-note">{t.note || <span className="txn-dash">—</span>}</td>
                  <td>
                    <span className={`txn-badge txn-badge--${t.type}`}>
                      {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                    </span>
                  </td>
                  <td className={`txn-amount txn-amount--${t.type}`} style={{ textAlign: "right" }}>
                    {t.type === "income" ? "+" : "-"}${fmt(t.amount)}
                  </td>
                  <td>
                    <button
                      className="txn-delete"
                      onClick={() => deleteTransaction(t.id)}
                      aria-label="Delete transaction"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
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