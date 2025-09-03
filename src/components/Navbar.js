import React from 'react'
import { LogOut, DollarSign, Users, BarChart3, PieChart, Target } from 'lucide-react'
import { supabase } from '../utils/supabase'

const Navbar = ({ user, currentPage, setCurrentPage }) => {
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Logout error:', error.message)
      alert('Failed to logout. Please try again.')
    }
  }

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <DollarSign size={24} />
        <span>eSpend</span>
      </div>
      <div className="nav-links">
        <button 
          className={currentPage === 'dashboard' ? 'active' : ''}
          onClick={() => setCurrentPage('dashboard')}
        >
          <BarChart3 size={18} />
          Dashboard
        </button>
        <button 
          className={currentPage === 'expenses' ? 'active' : ''}
          onClick={() => setCurrentPage('expenses')}
        >
          <DollarSign size={18} />
          Expenses
        </button>
        <button 
          className={currentPage === 'friends' ? 'active' : ''}
          onClick={() => setCurrentPage('friends')}
        >
          <Users size={18} />
          Friends
        </button>
        <button 
          className={currentPage === 'statistics' ? 'active' : ''}
          onClick={() => setCurrentPage('statistics')}
        >
          <PieChart size={18} />
          Analytics
        </button>
        <button 
          className={currentPage === 'budget' ? 'active' : ''}
          onClick={() => setCurrentPage('budget')}
        >
          <Target size={18} />
          Budget
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