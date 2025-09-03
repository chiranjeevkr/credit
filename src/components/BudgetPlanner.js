import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { Target, AlertCircle, CheckCircle } from 'lucide-react'

function BudgetPlanner() {
  const [budgets, setBudgets] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly'
  })
  const [expenses, setExpenses] = useState([])

  useEffect(() => {
    fetchBudgets()
    fetchExpenses()
  }, [])

  const fetchBudgets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setBudgets(data || [])
    } catch (error) {
      console.error('Error fetching budgets:', error)
    }
  }

  const fetchExpenses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const currentMonth = new Date()
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      
      const { data } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', firstDay.toISOString().split('T')[0])

      setExpenses(data || [])
    } catch (error) {
      console.error('Error fetching expenses:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('budgets')
        .insert([{
          user_id: user.id,
          category: formData.category,
          amount: parseFloat(formData.amount),
          period: formData.period
        }])

      if (error) throw error

      setFormData({ category: '', amount: '', period: 'monthly' })
      setShowForm(false)
      fetchBudgets()
    } catch (error) {
      console.error('Error creating budget:', error)
    }
  }

  const deleteBudget = async (id) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchBudgets()
    } catch (error) {
      console.error('Error deleting budget:', error)
    }
  }

  const calculateSpent = (category) => {
    return expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0)
  }

  const getProgressColor = (percentage) => {
    if (percentage <= 50) return '#28a745'
    if (percentage <= 80) return '#ffc107'
    return '#dc3545'
  }

  return (
    <div className="budget-planner animate-slide-in">
      <div className="budget-header">
        <h1>🎯 Budget Planner</h1>
        <button 
          className="add-btn"
          onClick={() => setShowForm(!showForm)}
        >
          <Target size={20} />
          Set Budget
        </button>
      </div>

      {showForm && (
        <div className="budget-form">
          <h3>Create New Budget</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Category (e.g., Food, Transport)"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            />
            <input
              type="number"
              placeholder="Budget Amount"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
            <select
              value={formData.period}
              onChange={(e) => setFormData({...formData, period: e.target.value})}
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
            <div className="form-actions">
              <button type="submit">Create Budget</button>
              <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="budgets-grid">
        {budgets.map(budget => {
          const spent = calculateSpent(budget.category)
          const percentage = (spent / budget.amount) * 100
          const remaining = budget.amount - spent

          return (
            <div key={budget.id} className="budget-card">
              <div className="budget-header-card">
                <h3>{budget.category}</h3>
                <button 
                  className="delete-btn"
                  onClick={() => deleteBudget(budget.id)}
                >
                  ×
                </button>
              </div>
              
              <div className="budget-amounts">
                <div className="amount-item">
                  <span>Budget</span>
                  <span className="amount">₹{budget.amount}</span>
                </div>
                <div className="amount-item">
                  <span>Spent</span>
                  <span className="amount spent">₹{spent.toFixed(2)}</span>
                </div>
                <div className="amount-item">
                  <span>Remaining</span>
                  <span className={`amount ${remaining >= 0 ? 'positive' : 'negative'}`}>
                    ₹{remaining.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: getProgressColor(percentage)
                  }}
                ></div>
              </div>

              <div className="budget-status">
                {percentage <= 80 ? (
                  <div className="status-good">
                    <CheckCircle size={16} />
                    On track ({percentage.toFixed(1)}%)
                  </div>
                ) : percentage <= 100 ? (
                  <div className="status-warning">
                    <AlertCircle size={16} />
                    Almost over ({percentage.toFixed(1)}%)
                  </div>
                ) : (
                  <div className="status-over">
                    <AlertCircle size={16} />
                    Over budget ({percentage.toFixed(1)}%)
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {budgets.length === 0 && (
        <div className="empty-state">
          <Target size={48} />
          <h3>No budgets set</h3>
          <p>Create your first budget to start tracking your spending goals</p>
        </div>
      )}
    </div>
  )
}

export default BudgetPlanner