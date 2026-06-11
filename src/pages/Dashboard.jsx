import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Chart,
  BarController, BarElement,
  LineController, LineElement, PointElement,
  DoughnutController, ArcElement,
  CategoryScale, LinearScale,
  Tooltip, Legend,
} from "chart.js";
import { useTransactions } from "../hooks/useTransactions";
import { useBudgets, getExceededCategories } from "../hooks/useBudgets";
import { useLang } from "../contexts/LanguageContext";
import { useState } from "react";
import MonthlyReport from "../components/MonthlyReport";
import EmptyState from "../components/EmptyState";
import "./Dashboard.css";
import "./Budget.css";

Chart.register(
  BarController, BarElement,
  LineController, LineElement, PointElement,
  DoughnutController, ArcElement,
  CategoryScale, LinearScale,
  Tooltip, Legend
);

const BAR_COLORS = [
  "#22c55e","#4ade80","#86efac","#16a34a","#15803d",
  "#bbf7d0","#dcfce7","#a3e635","#84cc16","#65a30d",
];

const fmt = (n) => Math.round(n).toLocaleString("en-US");

export default function Dashboard() {
  const { transactions, totalIncome, totalExpense, balance } = useTransactions();
  const { budgets } = useBudgets();
  const { t, lang } = useLang();

  const barRef     = useRef(null);
  const donutRef   = useRef(null);
  const lineRef    = useRef(null);
  const barChart   = useRef(null);
  const donutChart = useRef(null);
  const lineChart  = useRef(null);

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const expenseByCat = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const sortedCats = Object.entries(expenseByCat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const barLabels = sortedCats.length
    ? sortedCats.map(([k]) => k)
    : ["Repairs","House Rent","Licenses","Transport","Laptop","Net Bill","AC","Dish Bill","School","Plants"];

  const barData = sortedCats.length
    ? sortedCats.map(([, v]) => v)
    : [3519,2800,1500,900,700,500,400,350,300,200];

  const income  = totalIncome  || 0;
  const expense = totalExpense || 0;
  const savings = Math.max(balance, 0);

  const savingsPct = income > 0
    ? Math.min(100, Math.max(0, Math.round((savings / income) * 100)))
    : 0;

  const topCat = sortedCats.length ? sortedCats[0][0] : "—";
  const topAmt = sortedCats.length ? sortedCats[0][1] : 0;

  const exceeded = getExceededCategories(budgets, transactions);
  const [showReport, setShowReport] = useState(false);

  // ── Theme tracking for chart colors ──
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute("data-theme") || "light");

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute("data-theme") || "light");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const localeForDates = lang === "ar" ? "ar-EG" : "en-US";

  const today = new Date();
  const lineLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString(localeForDates, { month: "short", day: "numeric" });
  });
  const lineData = lineLabels.map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toISOString().slice(0, 10);
    return transactions
      .filter((t) => t.type === "expense" && t.date === dayStr)
      .reduce((s, t) => s + t.amount, 0) || 0;
  });

  // ── Bar Chart ──
  useEffect(() => {
    if (!barRef.current) return;
    barChart.current?.destroy();

    const barCount = barLabels.length;
    const isHorizontal = barCount <= 4;
    const maxVal = Math.max(...barData);

    const isDark = theme === "dark";
    const tickColor = isDark ? "#94a3b8" : "#9ca3af";
    const gridColor = isDark ? "#2a2d3e" : "#f3f4f6";
    const yLabelColor = isDark ? "#94a3b8" : "#111827";

    barChart.current = new Chart(barRef.current, {
      type: "bar",
      data: {
        labels: barLabels,
        datasets: [{
          data: barData,
          backgroundColor: barLabels.map((_, i) => BAR_COLORS[i % BAR_COLORS.length]),
          borderRadius: 6,
          borderSkipped: false,
          barThickness: isHorizontal ? 28 : 22,
        }],
      },
      options: {
        indexAxis: isHorizontal ? "y" : "x",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => ` $${fmt(c.raw)}` } },
        },
        scales: {
          x: isHorizontal ? {
            grid: { color: gridColor, drawTicks: false },
            min: 0,
            max: Math.ceil(maxVal * 1.15),
            ticks: {
              color: tickColor,
              font: { family: "Inter", size: 11 },
              callback: (v) => v >= 1000 ? `$${v / 1000}k` : `$${v}`,
              maxTicksLimit: 5,
            },
            border: { display: false },
          } : {
            grid: { display: false },
            ticks: { color: tickColor, font: { family: "Inter", size: 11 } },
            border: { display: false },
          },
          y: isHorizontal ? {
            grid: { display: false },
            ticks: { color: yLabelColor, font: { family: "Inter", size: 12, weight: "600" } },
            border: { display: false },
          } : {
            grid: { color: gridColor, drawTicks: false },
            min: 0,
            max: Math.ceil(maxVal * 1.25),
            ticks: {
              color: tickColor,
              font: { family: "Inter", size: 11 },
              callback: (v) => v >= 1000 ? `$${v / 1000}k` : `$${v}`,
              maxTicksLimit: 5,
            },
            border: { display: false },
          },
        },
        layout: { padding: { left: 4, right: 12, top: 4, bottom: 4 } },
      },
    });
    return () => barChart.current?.destroy();
  }, [transactions, theme]);

  // ── Donut Chart ──
  useEffect(() => {
    if (!donutRef.current) return;
    donutChart.current?.destroy();

    const hasData = income > 0 || expense > 0;
    donutChart.current = new Chart(donutRef.current, {
      type: "doughnut",
      data: {
        labels: [t("dash.income"), t("dash.expense"), t("dash.savings")],
        datasets: [{
          data: hasData
            ? [income, expense, savings > 0 ? savings : 0]
            : [1, 0, 0],
          backgroundColor: hasData
            ? ["#22c55e", "#1a1a2e", "#e2e8f0"]
            : ["#e2e8f0", "#e2e8f0", "#e2e8f0"],
          borderWidth: 0,
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "72%",
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: hasData,
            callbacks: { label: (c) => ` $${fmt(c.raw)}` },
          },
        },
      },
    });
    return () => donutChart.current?.destroy();
  }, [transactions, lang, theme]);

  // ── Line Chart ──
  useEffect(() => {
    if (!lineRef.current) return;
    lineChart.current?.destroy();

    const isDark = theme === "dark";
    const tickColor = isDark ? "#94a3b8" : "#9ca3af";

    lineChart.current = new Chart(lineRef.current, {
      type: "line",
      data: {
        labels: lineLabels,
        datasets: [{
          data: lineData,
          borderColor: "#22c55e",
          backgroundColor: "transparent",
          borderWidth: 2,
          pointBackgroundColor: "#fff",
          pointBorderColor: "#22c55e",
          pointBorderWidth: 2,
          pointRadius: 4,
          tension: 0.4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => ` $${fmt(c.raw)}` } },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: tickColor, font: { family: "Inter", size: 11 } },
            border: { display: false },
          },
          y: { display: false },
        },
      },
    });
    return () => lineChart.current?.destroy();
  }, [transactions, lang, theme]);

  return (
    <div className="dash">
      <div className="dash-topbar">
        <h1 className="dash-heading">{t("dash.title")}</h1>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            className="dash-report-btn"
            onClick={() => setShowReport(true)}
          >
            📊 Monthly Report
          </button>
          <span className="dash-period">{t("dash.period")}</span>
        </div>
      </div>

{showReport && (
  <MonthlyReport
    transactions={transactions}
    onClose={() => setShowReport(false)}
  />
)}

      <div className="dash-cards">
        <div className="dash-card">
          <div className="dash-card__header">
            <span className="dash-card__label">{t("dash.totalIncome")}</span>
            <button className="dash-card__dots" aria-label="More">···</button>
          </div>
          <div className="dash-card__icon dash-card__icon--income">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div className="dash-card__val">${fmt(income)}</div>
          <div className="dash-card__trend up">↑ 6% {t("dash.vsLast30")}</div>
        </div>

        <div className="dash-card dash-card--accent">
          <div className="dash-card__header">
            <span className="dash-card__label">{t("dash.totalExpense")}</span>
            <button className="dash-card__dots" aria-label="More">···</button>
          </div>
          <div className="dash-card__icon dash-card__icon--expense">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          </div>
          <div className="dash-card__val">${fmt(expense)}</div>
          <div className="dash-card__trend down">↓ 2% {t("dash.vsLast30")}</div>
        </div>

        <div className="dash-card">
          <div className="dash-card__header">
            <span className="dash-card__label">{t("dash.totalSavings")}</span>
            <Link to="/transactions" className="dash-card__viewbtn">{t("dash.viewDetails")}</Link>
          </div>
          <div className="dash-card__icon dash-card__icon--savings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="16 12 12 8 8 12"/><line x1="12" y1="16" x2="12" y2="8"/></svg>
          </div>
          <div className="dash-card__val">${fmt(savings)}</div>
          <div className={`dash-card__trend ${savings >= 0 ? "up" : "down"}`}>
            {savings >= 0 ? "↑" : "↓"} 1% {t("dash.vsLast30")}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card__header">
            <span className="dash-card__label">{t("dash.mostSpending")}</span>
            <button className="dash-card__dots" aria-label="More">···</button>
          </div>
          <div className="dash-card__icon dash-card__icon--spending">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          </div>
          <div className="dash-card__val dash-card__val--sm">{topCat}</div>
          <div className="dash-card__trend neutral">${fmt(topAmt)}</div>
        </div>
      </div>

      <div className="dash-charts">
        <div className="dash-panel">
          <div className="dash-panel__head">
            <span className="dash-panel__title">{t("dash.topExpenseSource")}</span>
            <button className="dash-card__dots" aria-label="More">···</button>
          </div>
          <div className="dash-bar-wrap">
            <canvas ref={barRef} />
          </div>
        </div>

        <div className="dash-panel dash-panel--report">
          <div className="dash-panel__head">
            <span className="dash-panel__title">{t("dash.reportOverview")}</span>
            <button className="dash-card__dots" aria-label="More">···</button>
          </div>
          <div className="dash-donut-wrap">
            <canvas ref={donutRef} />
            <div className="dash-donut-center">
              <span className="dash-donut-pct">{savingsPct}%</span>
              <span className="dash-donut-sub">{t("dash.savings")}</span>
            </div>
          </div>
          <div className="dash-legend">
            <div className="dash-legend__row">
              <span className="dash-legend__dot" style={{ background: "#22c55e" }} />
              <div>
                <div className="dash-legend__name">{t("dash.income")}</div>
                <div className="dash-legend__val">${fmt(income)} <span className="up">↑</span></div>
              </div>
            </div>
            <div className="dash-legend__row">
              <span className="dash-legend__dot" style={{ background: "#1a1a2e" }} />
              <div>
                <div className="dash-legend__name">{t("dash.expense")}</div>
                <div className="dash-legend__val">${fmt(expense)} <span className="down">↓</span></div>
              </div>
            </div>
            <div className="dash-legend__row">
              <span className="dash-legend__dot" style={{ background: "#e2e8f0" }} />
              <div>
                <div className="dash-legend__name">{t("dash.savings")}</div>
                <div className="dash-legend__val">${fmt(savings)} <span className="up">↑</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dash-budget-alerts">
        <div className="dash-budget-alerts__title">{t("dash.budgetAlerts")}</div>
        {exceeded.length === 0 ? (
          <div className="dash-budget-alerts__empty">{t("dash.noBudgetAlerts")}</div>
        ) : (
          <ul className="dash-budget-alerts__list">
            {exceeded.map((e) => (
              <li key={e.category} className="dash-budget-alerts__item">
                <span className="dash-budget-alerts__cat">{e.category}</span>
                <span className="dash-budget-alerts__amt">
                  {t("dash.exceededBy")} ${fmt(e.over)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="dash-bottom">
        <div className="dash-panel">
          <div className="dash-panel__head">
            <span className="dash-panel__title">{t("dash.recentExpenses")}</span>
            <Link to="/transactions" className="dash-panel__link">{t("dash.seeAll")}</Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              subtitle="Start tracking your finances"
              linkTo="/add"
              linkLabel={t("dash.addOne")}
            />
          ) : (
            <ul className="dash-txn-list">
              {recent.map((tx) => (
                <li key={tx.id} className="dash-txn">
                  <span className={`dash-txn__dot dash-txn__dot--${tx.type}`} />
                  <div className="dash-txn__info">
                    <div className="dash-txn__cat">{tx.category}</div>
                    <div className="dash-txn__date">
                      {new Date(tx.date).toLocaleDateString(localeForDates, {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </div>
                  </div>
                  <span className={`dash-txn__amt dash-txn__amt--${tx.type}`}>
                    {tx.type === "income" ? "+" : "-"}${fmt(tx.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dash-panel">
          <div className="dash-panel__head">
            <span className="dash-panel__title">{t("dash.expenseActivity")}</span>
            <span className="dash-activity-legend">
              <span className="dash-activity-line" />
              {t("dash.actualExpense")}
            </span>
          </div>
          <div className="dash-line-wrap">
            <canvas ref={lineRef} />
          </div>
        </div>
      </div>
    </div>
  );
}