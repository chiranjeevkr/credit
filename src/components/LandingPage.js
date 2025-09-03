import React from 'react'
import { DollarSign, BarChart3, Users } from 'lucide-react'
import Auth from './Auth'

const LandingPage = ({ setShowAuth, setIsLogin, showAuth, isLogin }) => {
  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="nav-brand">
          <DollarSign size={32} />
          <span>eSpend</span>
        </div>
        <div className="auth-buttons">
          <button 
            className="login-btn"
            onClick={() => {
              setIsLogin(true)
              setShowAuth(true)
            }}
          >
            Login
          </button>
          <button 
            className="signup-btn"
            onClick={() => {
              setIsLogin(false)
              setShowAuth(true)
            }}
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Smart Expense Tracking</h1>
          <p>Track expenses, split with friends, and manage your budget effortlessly</p>
          <button 
            className="cta-button"
            onClick={() => {
              setIsLogin(false)
              setShowAuth(true)
            }}
          >
            Get Started Free
          </button>
        </div>
        <div className="hero-image">
          <div className="dashboard-preview">
            <div className="preview-card">
              <DollarSign size={48} />
              <h3>₹2,450</h3>
              <p>This Month</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Simple. Smart. Secure.</h2>
        <div className="features-grid">
          <div className="feature-card">
            <DollarSign size={40} />
            <h3>Track Expenses</h3>
            <p>Log daily expenses with smart categorization</p>
          </div>
          <div className="feature-card">
            <Users size={40} />
            <h3>Split Bills</h3>
            <p>Share expenses with friends seamlessly</p>
          </div>
          <div className="feature-card">
            <BarChart3 size={40} />
            <h3>Analytics</h3>
            <p>Beautiful insights into your spending</p>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Start?</h2>
        <p>Join thousands managing expenses with eSpend</p>
        <button 
          className="cta-button"
          onClick={() => {
            setIsLogin(false)
            setShowAuth(true)
          }}
        >
          Get Started Free
        </button>
      </section>

      {/* Auth Modal */}
      {showAuth && (
        <div className="auth-modal-overlay" onClick={() => setShowAuth(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="auth-close" onClick={() => setShowAuth(false)}>×</button>
            <Auth isLogin={isLogin} setShowAuth={setShowAuth} />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; 2025 eSpend. Built with React & Supabase.</p>
      </footer>
    </div>
  )
}

export default LandingPage