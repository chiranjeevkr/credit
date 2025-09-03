import React from 'react'
import { DollarSign, Shield, BarChart3, Users, CheckCircle, TrendingUp } from 'lucide-react'

const LandingPage = ({ setShowAuth, setIsLogin }) => {
  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="nav-brand">
          <DollarSign size={32} />
          <span>ExpenseTracker Pro</span>
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
          <h1>Track Your Expenses Like a Pro</h1>
          <p>Take control of your finances with our powerful, secure, and user-friendly expense tracking platform. Built for individuals and teams who want to manage their money smartly.</p>
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
              <BarChart3 size={48} />
              <h3>₹2,450</h3>
              <p>Monthly Expenses</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose ExpenseTracker Pro?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <Shield size={40} />
            <h3>Secure & Private</h3>
            <p>Your financial data is protected with enterprise-grade security. Only you can access your information.</p>
          </div>
          <div className="feature-card">
            <BarChart3 size={40} />
            <h3>Smart Analytics</h3>
            <p>Get insights into your spending patterns with detailed reports and visual charts.</p>
          </div>
          <div className="feature-card">
            <Users size={40} />
            <h3>Multi-User Ready</h3>
            <p>Built to scale for thousands of users with reliable cloud infrastructure.</p>
          </div>
          <div className="feature-card">
            <TrendingUp size={40} />
            <h3>Real-time Tracking</h3>
            <p>Add, edit, and delete expenses instantly with automatic calculations and updates.</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="benefits-content">
          <h2>Everything You Need to Manage Your Finances</h2>
          <div className="benefits-list">
            <div className="benefit-item">
              <CheckCircle size={24} />
              <span>Daily expense tracking with categories</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={24} />
              <span>Automatic calculations and totals</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={24} />
              <span>Personal dashboard with statistics</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={24} />
              <span>Secure email verification</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={24} />
              <span>Mobile-responsive design</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={24} />
              <span>Cloud-based data storage</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Take Control of Your Finances?</h2>
        <p>Join thousands of users who trust ExpenseTracker Pro to manage their expenses</p>
        <button 
          className="cta-button"
          onClick={() => {
            setIsLogin(false)
            setShowAuth(true)
          }}
        >
          Start Tracking Today
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; 2024 ExpenseTracker Pro. Built with React & Supabase.</p>
      </footer>
    </div>
  )
}

export default LandingPage