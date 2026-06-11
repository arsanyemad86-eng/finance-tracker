import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import AddTransaction from './pages/AddTransaction'
import Budget from './pages/Budget'
import Goals from './pages/Goals'
import Recurring from './pages/Recurring'
import { useTransactions } from './hooks/useTransactions'
import { useRecurring } from './hooks/useRecurring'
import { useLang } from './contexts/LanguageContext'
import './App.css'

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('fintrack_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fintrack_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return { theme, toggleTheme };
}

function App() {
  const { lang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const { addTransaction } = useTransactions();
  useRecurring(addTransaction);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className={`app-layout app-layout--${dir}`} dir={dir}>
      <Sidebar theme={theme} toggleTheme={toggleTheme} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/add" element={<AddTransaction />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/recurring" element={<Recurring />} />
        </Routes>
      </main>
    </div>
  )
}

export default App