import React, { useState, useEffect } from 'react'
import { supabase } from './utils/supabase'
import LandingPage from './components/LandingPage'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import SplitFriends from './pages/SplitFriends'
import Statistics from './components/Statistics'
import BudgetPlanner from './components/BudgetPlanner'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [showAuth, setShowAuth] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Auth session error:', error)
          setError(error.message)
        } else {
          setUser(session?.user ?? null)
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (error) {
    return (
      <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px', textAlign: 'center'}}>
        <h2>Connection Error</h2>
        <p>Unable to connect to the database: {error}</p>
        <button onClick={() => window.location.reload()} style={{padding: '10px 20px', marginTop: '10px', cursor: 'pointer'}}>Retry</button>
      </div>
    )
  }

  if (loading) {
    return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px'}}>Loading...</div>
  }

  if (!user) {
    return <LandingPage setShowAuth={setShowAuth} setIsLogin={setIsLogin} showAuth={showAuth} isLogin={isLogin} />
  }

  return (
    <div className="App">
      <Navbar user={user} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="main-content">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'expenses' && <Expenses />}
        {currentPage === 'friends' && <SplitFriends />}
        {currentPage === 'statistics' && <Statistics />}
        {currentPage === 'budget' && <BudgetPlanner />}
      </main>
    </div>
  )
}

export default App