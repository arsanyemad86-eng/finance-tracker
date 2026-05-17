import { useEffect, useState } from "react";

const STORAGE_KEY = "fintrack_budgets";

/**
 * useBudgets — manages monthly spending limits per expense category.
 * Shape stored in localStorage: { "Food": 500, "Transport": 200, ... }
 */
export function useBudgets() {
  const [budgets, setBudgets] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
    } catch {
      // ignore
    }
  }, [budgets]);

  const setBudget = (category, amount) => {
    setBudgets((prev) => {
      const next = { ...prev };
      const num = parseFloat(amount);
      if (!amount || isNaN(num) || num <= 0) {
        delete next[category];
      } else {
        next[category] = num;
      }
      return next;
    });
  };

  const setAll = (newBudgets) => setBudgets(newBudgets || {});

  return { budgets, setBudget, setAll };
}

/**
 * Compute spending for the current month grouped by category (expenses only).
 * @param {Array} transactions
 * @returns {Object} { "Food": 123, ... }
 */
export function getCurrentMonthSpendByCategory(transactions) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  return transactions.reduce((acc, t) => {
    if (t.type !== "expense" || !t.date) return acc;
    const d = new Date(t.date);
    if (d.getFullYear() === y && d.getMonth() === m) {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
    }
    return acc;
  }, {});
}

/**
 * Compute which categories are exceeded based on current month spend + budgets.
 * @param {Object} budgets
 * @param {Array} transactions
 * @returns {Array<{ category: string, spent: number, limit: number, over: number }>}
 */
export function getExceededCategories(budgets, transactions) {
  const spend = getCurrentMonthSpendByCategory(transactions);
  const result = [];
  Object.keys(budgets).forEach((cat) => {
    const limit = budgets[cat];
    const spent = spend[cat] || 0;
    if (limit > 0 && spent > limit) {
      result.push({ category: cat, spent, limit, over: spent - limit });
    }
  });
  return result;
}
