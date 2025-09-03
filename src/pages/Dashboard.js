import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalExpenses: 0,
    monthlyExpenses: 0,
    todayExpenses: 0,
    expenseCount: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

      // Total expenses
      const { data: totalData } = await supabase
        .from('expenses')
        .select('amount')

      // Monthly expenses
      const { data: monthlyData } = await supabase
        .from('expenses')
        .select('amount')
        .gte('date', monthStart)

      // Today's expenses
      const { data: todayData } = await supabase
        .from('expenses')
        .select('amount')
        .eq('date', today)

      const totalExpenses = totalData?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0
      const monthlyExpenses = monthlyData?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0
      const todayExpenses = todayData?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0

      setStats({
        totalExpenses,
        monthlyExpenses,
        todayExpenses,
        expenseCount: totalData?.length || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Expenses</h3>
            <p className="stat-value">₹{stats.totalExpenses.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>This Month</h3>
            <p className="stat-value">₹{stats.monthlyExpenses.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>Today</h3>
            <p className="stat-value">₹{stats.todayExpenses.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <TrendingDown size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Records</h3>
            <p className="stat-value">{stats.expenseCount}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard