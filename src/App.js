import React, { useState, useEffect } from 'react'
import { supabase } from './utils/supabase'
import LandingPage from './components/LandingPage'
import Auth from './components/Auth'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import SplitFriends from './pages/SplitFriends'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [showAuth, setShowAuth] = useState(false)
  const [isLogin, setIsLogin] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!user) {
    if (showAuth) {
      return <Auth isLogin={isLogin} setShowAuth={setShowAuth} />
    }
    return <LandingPage setShowAuth={setShowAuth} setIsLogin={setIsLogin} />
  }

  return (
    <div className="App">
      <Navbar user={user} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="main-content">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'expenses' && <Expenses />}
        {currentPage === 'friends' && <SplitFriends />}
      </main>
    </div>
  )
}

export default App