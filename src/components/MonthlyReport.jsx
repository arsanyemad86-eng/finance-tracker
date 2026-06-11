import { useState, useEffect, useRef } from "react";
import { getAIMessage } from "../lib/ai";
import "./MonthlyReport.css";

const fmt = (n) => Math.round(n).toLocaleString("en-US");

function getMonthData(transactions, year, month) {
  const filtered = transactions.filter((t) => {
    if (!t.date) return false;
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const income  = filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const savings = Math.max(income - expense, 0);
  const savingsPct = income > 0 ? Math.round((savings / income) * 100) : 0;

  const catMap = filtered
    .filter(t => t.type === "expense")
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {});

  const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0] || null;
  const txnCount = filtered.length;

  return { income, expense, savings, savingsPct, topCat, txnCount };
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function MonthlyReport({ transactions, onClose }) {
  const now = new Date();
  const curYear  = now.getFullYear();
  const curMonth = now.getMonth();
  const prevMonth = curMonth === 0 ? 11 : curMonth - 1;
  const prevYear  = curMonth === 0 ? curYear - 1 : curYear;

  const cur  = getMonthData(transactions, curYear, curMonth);
  const prev = getMonthData(transactions, prevYear, prevMonth);

  const [aiText, setAiText]     = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    setAiLoading(true);
    getAIMessage({
      type: "summary",
      amount: cur.expense,
      category: cur.topCat?.[0] || "N/A",
      note: `Income: $${fmt(cur.income)}, Expense: $${fmt(cur.expense)}, Savings: $${fmt(cur.savings)} (${cur.savingsPct}%). Top spending: ${cur.topCat ? cur.topCat[0] + " $" + fmt(cur.topCat[1]) : "none"}.`,
      lang: "en",
    }).then((msg) => {
      setAiLoading(false);
      setAiText(msg || "");
    });
  }, []);

  const diff = (cur, prev) => {
    if (prev === 0) return null;
    const pct = Math.round(((cur - prev) / prev) * 100);
    return pct;
  };

  const incomeDiff  = diff(cur.income,  prev.income);
  const expenseDiff = diff(cur.expense, prev.expense);
  const savingsDiff = diff(cur.savings, prev.savings);

  const Arrow = ({ val, invert = false }) => {
    if (val === null) return null;
    const positive = invert ? val < 0 : val > 0;
    return (
      <span className={`mr-arrow ${positive ? "mr-arrow--up" : "mr-arrow--down"}`}>
        {val > 0 ? "↑" : "↓"} {Math.abs(val)}%
      </span>
    );
  };

  return (
    <div className="mr-overlay" onClick={onClose}>
      <div className="mr-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="mr-header">
          <div>
            <h2 className="mr-title">📊 {MONTH_NAMES[curMonth]} {curYear}</h2>
            <p className="mr-sub">Monthly Financial Summary</p>
          </div>
          <button className="mr-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="mr-stats">
          <div className="mr-stat">
            <span className="mr-stat__label">Income</span>
            <span className="mr-stat__val mr-stat__val--income">${fmt(cur.income)}</span>
            <Arrow val={incomeDiff} />
          </div>
          <div className="mr-stat">
            <span className="mr-stat__label">Expenses</span>
            <span className="mr-stat__val mr-stat__val--expense">${fmt(cur.expense)}</span>
            <Arrow val={expenseDiff} invert />
          </div>
          <div className="mr-stat">
            <span className="mr-stat__label">Saved</span>
            <span className="mr-stat__val mr-stat__val--savings">${fmt(cur.savings)}</span>
            <Arrow val={savingsDiff} />
          </div>
        </div>

        {/* Savings bar */}
        <div className="mr-savings-wrap">
          <div className="mr-savings-label">
            <span>Savings rate</span>
            <span className="mr-savings-pct">{cur.savingsPct}%</span>
          </div>
          <div className="mr-savings-bar">
            <div
              className="mr-savings-fill"
              style={{ width: `${Math.min(cur.savingsPct, 100)}%` }}
            />
          </div>
        </div>

        {/* Details */}
        <div className="mr-details">
          {cur.topCat && (
            <div className="mr-detail-row">
              <span className="mr-detail-label">🏆 Top spending</span>
              <span className="mr-detail-val">{cur.topCat[0]} — ${fmt(cur.topCat[1])}</span>
            </div>
          )}
          <div className="mr-detail-row">
            <span className="mr-detail-label">📝 Transactions</span>
            <span className="mr-detail-val">{cur.txnCount} this month</span>
          </div>
          <div className="mr-detail-row">
            <span className="mr-detail-label">📅 vs {MONTH_NAMES[prevMonth]}</span>
            <span className="mr-detail-val">
              {prev.expense > 0
                ? `Spent $${fmt(Math.abs(cur.expense - prev.expense))} ${cur.expense > prev.expense ? "more" : "less"}`
                : "No data for last month"}
            </span>
          </div>
        </div>

        {/* AI Insight */}
        <div className="mr-ai">
          <div className="mr-ai__header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l2.39 4.84L20 8l-4 3.9.94 5.5L12 14.77 7.06 17.4 8 11.9 4 8l5.61-1.16L12 2z"/>
            </svg>
            AI Insight
          </div>
          {aiLoading ? (
            <div className="mr-ai__loading">
              <span className="mr-ai__spinner" />
              Analyzing your finances...
            </div>
          ) : (
            <p className="mr-ai__text">{aiText || "No insight available."}</p>
          )}
        </div>

      </div>
    </div>
  );
}