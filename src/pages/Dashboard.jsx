import { useTransactions } from '../hooks/useTransactions'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import './Dashboard.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

function Dashboard() {
  const { transactions, totalIncome, totalExpense, balance } = useTransactions()

  const recent = transactions.slice(0, 5)

  // Bar chart — expenses by category
  const expenseCategories = {}
  transactions.filter(t => t.type === 'expense').forEach(t => {
    expenseCategories[t.category] = (expenseCategories[t.category] || 0) + t.amount
  })

  const barData = {
    labels: Object.keys(expenseCategories),
    datasets: [{
      label: 'Expenses',
      data: Object.values(expenseCategories),
      backgroundColor: '#4f46e5',
      borderRadius: 8,
    }],
  }

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  }

  // Donut chart — income vs expense
  const donutData = {
    labels: ['Income', 'Expense'],
    datasets: [{
      data: [totalIncome, totalExpense],
      backgroundColor: ['#10b981', '#ef4444'],
      borderWidth: 0,
    }],
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p className="page-subtitle">Welcome back — here's your financial overview</p>

      <div className="summary-cards">
        <div className="card balance">
          <span className="card-label">Total Balance</span>
          <span className="card-amount">${balance.toFixed(2)}</span>
        </div>
        <div className="card income">
          <span className="card-label">Total Income</span>
          <span className="card-amount">+${totalIncome.toFixed(2)}</span>
        </div>
        <div className="card expense">
          <span className="card-label">Total Expenses</span>
          <span className="card-amount">-${totalExpense.toFixed(2)}</span>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-box bar-chart">
          <h3>Expenses by Category</h3>
          {Object.keys(expenseCategories).length === 0
            ? <p className="no-data">No expense data yet.</p>
            : <Bar data={barData} options={barOptions} />}
        </div>
        <div className="chart-box donut-chart">
          <h3>Income vs Expense</h3>
          {totalIncome === 0 && totalExpense === 0
            ? <p className="no-data">No data yet.</p>
            : <Doughnut data={donutData} />}
        </div>
      </div>

      <div className="recent-box">
        <h3>Recent Transactions</h3>
        {recent.length === 0 ? (
          <p className="no-data">No transactions yet.</p>
        ) : (
          recent.map(t => (
            <div key={t.id} className="recent-row">
              <span className="recent-category">{t.category}</span>
              <span className="recent-date">{t.date}</span>
              <span className={`recent-amount ${t.type}`}>
                {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Dashboard