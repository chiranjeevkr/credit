import React, { useState } from 'react'
import { supabase } from '../utils/supabase'

const Auth = ({ isLogin: initialIsLogin = true, setShowAuth }) => {
  const [isLogin, setIsLogin] = useState(initialIsLogin)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaValue, setCaptchaValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    const result = num1 + num2
    setCaptchaValue(`${num1} + ${num2} = ?`)
    return result
  }

  const [captchaAnswer, setCaptchaAnswer] = useState(() => generateCaptcha())

  const refreshCaptcha = () => {
    setCaptchaAnswer(generateCaptcha())
    setCaptchaInput('')
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (!validateEmail(email)) {
      setMessage('Please enter a valid email address')
      setLoading(false)
      return
    }

    if (!isLogin) {
      if (password !== confirmPassword) {
        setMessage('Passwords do not match')
        setLoading(false)
        return
      }

      if (parseInt(captchaInput) !== captchaAnswer) {
        setMessage('Incorrect captcha. Please try again.')
        refreshCaptcha()
        setLoading(false)
        return
      }
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password
        })
        if (error) throw error
        setMessage('Registration successful! You can now login.')
        setTimeout(() => {
          setIsLogin(true)
          setMessage('')
          setEmail('')
          setPassword('')
          setConfirmPassword('')
          setCaptchaInput('')
          refreshCaptcha()
        }, 2000)
      }
    } catch (error) {
      setMessage(error.message)
      if (!isLogin) refreshCaptcha()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        
        <form onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email (example@domain.com)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
            />
          )}
          {!isLogin && (
            <div className="captcha-container">
              <div className="captcha-display">
                <span>{captchaValue}</span>
                <button type="button" onClick={refreshCaptcha} className="refresh-btn">
                  ↻
                </button>
              </div>
              <input
                type="number"
                placeholder="Enter answer"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                required
              />
            </div>
          )}
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>
        
        {message && <p className="message">{message}</p>}
        
        <p>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            className="link-btn"
            onClick={() => {
              setIsLogin(!isLogin)
              setMessage('')
              setConfirmPassword('')
              setCaptchaInput('')
              refreshCaptcha()
            }}
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
        {setShowAuth && (
          <p>
            <button 
              type="button" 
              className="link-btn"
              onClick={() => setShowAuth(false)}
            >
              ← Back to Home
            </button>
          </p>
        )}
      </div>
    </div>
  )
}

export default Auth