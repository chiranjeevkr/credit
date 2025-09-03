import React from 'react'
import { LogOut, DollarSign } from 'lucide-react'
import { supabase } from '../utils/supabase'

const Navbar = ({ user, currentPage, setCurrentPage }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <DollarSign size={24} />
        <span>Expense Tracker</span>
      </div>
      <div className="nav-links">
        <button 
          className={currentPage === 'dashboard' ? 'active' : ''}
          onClick={() => setCurrentPage('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={currentPage === 'expenses' ? 'active' : ''}
          onClick={() => setCurrentPage('expenses')}
        >
          Daily Expenses
        </button>
        <button 
          className={currentPage === 'friends' ? 'active' : ''}
          onClick={() => setCurrentPage('friends')}
        >
          Split Friends
        </button>
      </div>
      <div className="nav-user">
        <span>{user?.email}</span>
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  )
}

export default Navbar