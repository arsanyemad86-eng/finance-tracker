import { NavLink } from 'react-router-dom'
import './Sidebar.css'

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span>💰</span>
        <h2>FinTrack</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <span>📊</span> Dashboard
        </NavLink>
        <NavLink to="/transactions" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <span>💳</span> Transactions
        </NavLink>
        <NavLink to="/add" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <span>➕</span> Add New
        </NavLink>
      </nav>
    </aside>
  )
}

export default Sidebar