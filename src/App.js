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
  const [error, setError] = useState(null)

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('Initializing auth...')
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Auth session error:', error)
          setError(error.message)
        } else {
          setUser(session?.user ?? null)
          console.log('Session loaded:', session?.user ? 'User found' : 'No user')
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user ? 'User found' : 'No user')
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Always show something to test if React is working
  console.log('App component loaded successfully')
  
  if (error) {
    return (
      <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px', textAlign: 'center', backgroundColor: '#f0f0f0'}}>
        <h2>Connection Error</h2>
        <p>Unable to connect to the database: {error}</p>
        <button onClick={() => window.location.reload()} style={{padding: '10px 20px', marginTop: '10px', cursor: 'pointer'}}>Retry</button>
      </div>
    )
  }

  if (loading) {
    return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', backgroundColor: '#f9f9f9'}}>Loading Expense Tracker...</div>
  }

  // Debug log
  console.log('App render - User:', user, 'Loading:', loading, 'ShowAuth:', showAuth, 'Error:', error)

  if (!user) {
    if (showAuth) {
      return <Auth isLogin={isLogin} setShowAuth={setShowAuth} />
    }
    return (
      <div>
        <div style={{position: 'fixed', top: 0, left: 0, background: 'red', color: 'white', padding: '5px', zIndex: 9999}}>React App Working!</div>
        <LandingPage setShowAuth={setShowAuth} setIsLogin={setIsLogin} />
      </div>
    )
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