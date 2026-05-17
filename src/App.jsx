import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import AddTransaction from './pages/AddTransaction'
import Budget from './pages/Budget'
import { useLang } from './contexts/LanguageContext'
import './App.css'

function App() {
  const { lang } = useLang();
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className={`app-layout app-layout--${dir}`} dir={dir}>
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/add" element={<AddTransaction />} />
          <Route path="/budget" element={<Budget />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
