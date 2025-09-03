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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = new Date().toISOString().split('T')[0]
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

      // Personal expenses
      const { data: totalData, error: totalError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id)
      
      if (totalError) throw totalError

      const { data: monthlyData } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id)
        .gte('date', monthStart)

      const { data: todayData } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id)
        .eq('date', today)

      // Money given to friends (credit transactions, excluding deleted)
      const { data: givenData } = await supabase
        .from('transactions')
        .select('amount, created_at')
        .eq('user_id', user.id)
        .eq('type', 'credit')
        .neq('status', 'deleted')

      // Monthly given money to friends
      const { data: monthlyGivenData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'credit')
        .neq('status', 'deleted')
        .gte('created_at', monthStart)

      // Today's given money to friends
      const { data: todayGivenData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'credit')
        .neq('status', 'deleted')
        .gte('created_at', today)
        .lt('created_at', new Date(new Date(today).getTime() + 24*60*60*1000).toISOString())

      const personalExpenses = totalData?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0
      const monthlyPersonalExpenses = monthlyData?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0
      const todayPersonalExpenses = todayData?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0
      const givenToFriends = givenData?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0
      const monthlyGivenToFriends = monthlyGivenData?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0
      const todayGivenToFriends = todayGivenData?.reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0

      setStats({
        totalExpenses: personalExpenses + givenToFriends,
        monthlyExpenses: monthlyPersonalExpenses + monthlyGivenToFriends,
        todayExpenses: todayPersonalExpenses + todayGivenToFriends,
        expenseCount: (totalData?.length || 0) + (givenData?.length || 0)
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
            <h3>Total Spend</h3>
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