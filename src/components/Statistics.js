import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { BarChart3, TrendingUp, Calendar, PieChart } from 'lucide-react'

function Statistics() {
  const [stats, setStats] = useState({
    monthlyExpenses: [],
    categoryBreakdown: [],
    weeklyTrend: [],
    totalThisMonth: 0,
    avgDaily: 0,
    topCategory: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchStatistics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get expenses for last 6 months
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', sixMonthsAgo.toISOString().split('T')[0])
        .order('date', { ascending: true })

      // Get friend transactions for last 6 months
      const { data: friendTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'credit')
        .neq('status', 'deleted')
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true })

      if (expenses || friendTransactions) {
        calculateStatistics(expenses || [], friendTransactions || [])
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStatistics = (expenses, friendTransactions) => {
    // Monthly expenses
    const monthlyData = {}
    const categoryData = {}
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    let monthlyTotal = 0

    // Process personal expenses
    expenses.forEach(expense => {
      const date = new Date(expense.date)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      const amount = parseFloat(expense.amount)

      // Monthly breakdown
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0
      }
      monthlyData[monthKey] += amount

      // Category breakdown
      const category = expense.category || 'Other'
      if (!categoryData[category]) {
        categoryData[category] = 0
      }
      categoryData[category] += amount

      // Current month total
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        monthlyTotal += amount
      }
    })

    // Process friend transactions
    friendTransactions.forEach(transaction => {
      const date = new Date(transaction.created_at)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      const amount = parseFloat(transaction.amount)

      // Monthly breakdown
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0
      }
      monthlyData[monthKey] += amount

      // Category breakdown (add to Friends category)
      if (!categoryData['Friends']) {
        categoryData['Friends'] = 0
      }
      categoryData['Friends'] += amount

      // Current month total
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        monthlyTotal += amount
      }
    })

    // Convert to arrays for charts
    const monthlyExpenses = Object.entries(monthlyData).map(([key, value]) => {
      const [, month] = key.split('-')
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return {
        month: monthNames[parseInt(month)],
        amount: value
      }
    })

    const categoryBreakdown = Object.entries(categoryData)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)

    const topCategory = categoryBreakdown[0]?.category || 'None'
    const avgDaily = monthlyTotal / new Date().getDate()

    setStats({
      monthlyExpenses,
      categoryBreakdown,
      totalThisMonth: monthlyTotal,
      avgDaily,
      topCategory
    })
  }

  if (loading) {
    return <div className="loading">Loading statistics...</div>
  }

  return (
    <div className="statistics animate-slide-in">
      <div className="stats-header">
        <h1>📊 Expense Analytics</h1>
        <p>Insights into your spending patterns</p>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar />
          </div>
          <div className="stat-info">
            <h3>This Month</h3>
            <div className="stat-value">₹{stats.totalThisMonth.toFixed(2)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp />
          </div>
          <div className="stat-info">
            <h3>Daily Average</h3>
            <div className="stat-value">₹{stats.avgDaily.toFixed(2)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <PieChart />
          </div>
          <div className="stat-info">
            <h3>Top Category</h3>
            <div className="stat-value">{stats.topCategory}</div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3><BarChart3 size={20} /> Monthly Expenses</h3>
          <div className="bar-chart">
            {stats.monthlyExpenses.map((item, index) => (
              <div key={index} className="bar-item">
                <div 
                  className="bar" 
                  style={{ 
                    height: `${(item.amount / Math.max(...stats.monthlyExpenses.map(m => m.amount))) * 100}%` 
                  }}
                ></div>
                <span className="bar-label">{item.month}</span>
                <span className="bar-value">₹{item.amount.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3><PieChart size={20} /> Category Breakdown</h3>
          <div className="category-list">
            {stats.categoryBreakdown.slice(0, 5).map((item, index) => (
              <div key={index} className="category-item">
                <div className="category-info">
                  <span className="category-name">{item.category}</span>
                  <span className="category-amount">₹{item.amount.toFixed(2)}</span>
                </div>
                <div className="category-bar">
                  <div 
                    className="category-fill" 
                    style={{ 
                      width: `${(item.amount / stats.categoryBreakdown[0]?.amount) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Statistics