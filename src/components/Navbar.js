import React, { useState } from 'react'
import { LogOut, DollarSign, Users, BarChart3, PieChart, Target, Menu, X } from 'lucide-react'
import { supabase } from '../utils/supabase'

const Navbar = ({ user, currentPage, setCurrentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Logout error:', error.message)
      alert('Failed to logout. Please try again.')
    }
  }

  const handleNavClick = (page) => {
    setCurrentPage(page)
    setIsMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <DollarSign size={24} />
        <span>eSpend</span>
      </div>
      
      <button 
        className="nav-toggle"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`nav-menu ${isMenuOpen ? 'nav-menu-open' : ''}`}>
        <div className="nav-links">
          <button 
            className={currentPage === 'dashboard' ? 'active' : ''}
            onClick={() => handleNavClick('dashboard')}
          >
            <BarChart3 size={18} />
            Dashboard
          </button>
          <button 
            className={currentPage === 'expenses' ? 'active' : ''}
            onClick={() => handleNavClick('expenses')}
          >
            <DollarSign size={18} />
            Expenses
          </button>
          <button 
            className={currentPage === 'friends' ? 'active' : ''}
            onClick={() => handleNavClick('friends')}
          >
            <Users size={18} />
            Friends
          </button>
          <button 
            className={currentPage === 'statistics' ? 'active' : ''}
            onClick={() => handleNavClick('statistics')}
          >
            <PieChart size={18} />
            Analytics
          </button>
          <button 
            className={currentPage === 'budget' ? 'active' : ''}
            onClick={() => handleNavClick('budget')}
          >
            <Target size={18} />
            Budget
          </button>
        </div>
        <div className="nav-user">
          <span>{user?.email}</span>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar