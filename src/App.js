import React, { useState, useEffect } from 'react'
import LandingPage from './components/LandingPage'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [isLogin, setIsLogin] = useState(true)

  useEffect(() => {
    // Simulate loading for now
    setTimeout(() => setLoading(false), 1000)
  }, [])

  if (loading) {
    return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px'}}>Loading eSpend...</div>
  }

  if (!user) {
    return <LandingPage setShowAuth={setShowAuth} setIsLogin={setIsLogin} showAuth={showAuth} isLogin={isLogin} />
  }

  return (
    <div className="App">
      <Navbar user={user} currentPage="dashboard" setCurrentPage={() => {}} />
      <main className="main-content">
        <Dashboard />
      </main>
    </div>
  )
}

export default App