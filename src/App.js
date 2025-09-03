import React, { useState, useEffect } from 'react'
import { supabase } from './utils/supabase'
import { OfflineStorage } from './utils/offline'
import LandingPage from './components/LandingPage'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import SplitFriends from './pages/SplitFriends'
import Statistics from './components/Statistics'
import BudgetPlanner from './components/BudgetPlanner'
import InstallPrompt from './components/InstallPrompt'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [showAuth, setShowAuth] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('Service Worker registered'))
        .catch(err => console.log('Service Worker registration failed'))
    }

    // Online/offline detection
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

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

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
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
    return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px'}}>Loading eSpend...</div>
  }

  if (!user) {
    return <LandingPage setShowAuth={setShowAuth} setIsLogin={setIsLogin} showAuth={showAuth} isLogin={isLogin} />
  }

  return (
    <div className="App">
      {!isOnline && (
        <div style={{background: '#ff6b6b', color: 'white', padding: '10px', textAlign: 'center'}}>
          📱 Offline Mode - Changes will sync when online
        </div>
      )}
      <Navbar user={user} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="main-content">
        {currentPage === 'dashboard' && <Dashboard isOnline={isOnline} />}
        {currentPage === 'expenses' && <Expenses isOnline={isOnline} />}
        {currentPage === 'friends' && <SplitFriends isOnline={isOnline} />}
        {currentPage === 'statistics' && <Statistics isOnline={isOnline} />}
        {currentPage === 'budget' && <BudgetPlanner isOnline={isOnline} />}
      </main>
      <InstallPrompt />
    </div>
  )
}

export default App