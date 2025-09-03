import React from 'react'
import './App.css'

function App() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="nav-brand">
          <span>eSpend</span>
        </div>
        <div className="auth-buttons">
          <button className="login-btn">Login</button>
          <button className="signup-btn">Sign Up</button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1>Smart Expense Tracking</h1>
          <p>Track expenses, split with friends, and manage your budget effortlessly</p>
          <button className="cta-button">Get Started Free</button>
        </div>
      </section>

      <section className="features">
        <h2>Simple. Smart. Secure.</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Track Expenses</h3>
            <p>Log daily expenses with smart categorization</p>
          </div>
          <div className="feature-card">
            <h3>Split Bills</h3>
            <p>Share expenses with friends seamlessly</p>
          </div>
          <div className="feature-card">
            <h3>Analytics</h3>
            <p>Beautiful insights into your spending</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>&copy; 2025 eSpend. Built with React & Supabase.</p>
      </footer>
    </div>
  )
}

export default App