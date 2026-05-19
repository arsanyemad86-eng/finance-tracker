# FinTrack — Personal Finance Tracker

A clean, responsive personal finance web app built with React. Track your income, expenses, and savings with real-time charts, budget alerts, and multi-language support.

🔗 **Live Demo:** [finance-tracker-gamma-ashen.vercel.app](https://finance-tracker-gamma-ashen.vercel.app)

---

## Features

- **Dashboard Overview** — Total income, expenses, and savings at a glance
- **Transaction Management** — Add, view, and categorize transactions
- **Visual Reports** — Bar charts and donut charts powered by Recharts
- **Budget Tracking** — Set budgets per category with live alerts
- **Expense Search & Filter** — Filter transactions by category and date
- **CSV Export** — Download your transaction history
- **Multi-language Support** — Arabic and English (i18n with RTL layout)
- **Persistent Storage** — Data saved locally across sessions

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool |
| React Router v6 | Client-side routing |
| Recharts | Data visualization |
| i18next | Internationalization (AR / EN) |
| CSS Modules | Component-scoped styling |
| Vercel | Deployment |

---

## Project Structure

```
src/
├── components/       # Reusable UI components
├── contexts/         # Global state (language, transactions)
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── locales/          # AR / EN translation files
└── pages/
    ├── Dashboard/    # Overview stats and charts
    ├── Transactions/ # Transaction list with search
    ├── AddTransaction/ # Add income or expense
    └── Budget/       # Budget goals and alerts
```

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/arsanyemad86-eng/finance-tracker.git

# Install dependencies
cd finance-tracker
npm install

# Run locally
npm run dev
```

---

## Screenshots

> Dashboard with expense breakdown and savings overview

*(Add screenshot here)*

---

## What I Learned

- Managing global state with React Context across multiple pages
- Building dynamic charts with Recharts
- Implementing RTL/LTR layout switching with i18next
- Structuring a multi-page React app with React Router v6

---

Built by [Arsany Emad](https://github.com/arsanyemad86-eng)
