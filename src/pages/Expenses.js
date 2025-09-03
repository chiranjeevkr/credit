import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'

const Expenses = () => {
  const [expenses, setExpenses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [total, setTotal] = useState(0)
  const [givenTransactions, setGivenTransactions] = useState([])
  const [receivedTransactions, setReceivedTransactions] = useState([])

  useEffect(() => {
    fetchExpenses()
    fetchGivenTransactions()
    fetchReceivedTransactions()
  }, [])

  useEffect(() => {
    const expenseTotal = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
    const givenTotal = givenTransactions.reduce((sum, trans) => sum + parseFloat(trans.amount), 0)
    setTotal(expenseTotal + givenTotal)
  }, [expenses, givenTransactions])

  const fetchExpenses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setExpenses(data || [])
    } catch (error) {
      console.error('Error fetching expenses:', error)
    }
  }

  const fetchGivenTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('transactions')
        .select('*, friends(friend_name)')
        .eq('user_id', user.id)
        .eq('type', 'credit')
        .neq('status', 'deleted')
        .order('created_at', { ascending: false })

      if (error) throw error
      setGivenTransactions(data || [])
    } catch (error) {
      console.error('Error fetching given transactions:', error)
    }
  }

  const fetchReceivedTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('transactions')
        .select('*, friends(friend_name)')
        .eq('user_id', user.id)
        .eq('type', 'debit')
        .neq('status', 'deleted')
        .order('created_at', { ascending: false })

      if (error) throw error
      setReceivedTransactions(data || [])
    } catch (error) {
      console.error('Error fetching received transactions:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (editingId) {
        const { error } = await supabase
          .from('expenses')
          .update({
            title: formData.title,
            amount: parseFloat(formData.amount),
            category: formData.category,
            date: formData.date
          })
          .eq('id', editingId)

        if (error) throw error
        setEditingId(null)
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert([{
            user_id: user.id,
            title: formData.title,
            amount: parseFloat(formData.amount),
            category: formData.category,
            date: formData.date
          }])

        if (error) throw error
      }

      setFormData({ title: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] })
      setShowForm(false)
      fetchExpenses()
    } catch (error) {
      console.error('Error saving expense:', error)
      alert(`Error: ${error.message}`)
    }
  }

  const handleEdit = (expense) => {
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date
    })
    setEditingId(expense.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', id)

        if (error) throw error
        fetchExpenses()
      } catch (error) {
        console.error('Error deleting expense:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({ title: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] })
    setShowForm(false)
    setEditingId(null)
  }

  return (
    <div className="expenses">
      <div className="expenses-header">
        <h1>Daily Expenses</h1>
        <button 
          className="add-btn"
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} />
          Add Expense
        </button>
      </div>

      {showForm && (
        <div className="expense-form">
          <h3>{editingId ? 'Edit Expense' : 'Add New Expense'}</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Expense Title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Amount (₹)"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Category"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
            <div className="form-actions">
              <button type="submit">
                <Save size={18} />
                {editingId ? 'Update' : 'Save'}
              </button>
              <button type="button" onClick={resetForm}>
                <X size={18} />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="total-display">
        <h2>Total: ₹{total.toFixed(2)}</h2>
      </div>

      <div className="expenses-list">
        {/* Combined and sorted transactions */}
        {[
          ...expenses.map(expense => ({...expense, type: 'expense', sortDate: new Date(expense.created_at || expense.date)})),
          ...givenTransactions.map(transaction => ({...transaction, type: 'given', sortDate: new Date(transaction.created_at)})),
          ...receivedTransactions.map(transaction => ({...transaction, type: 'received', sortDate: new Date(transaction.created_at)}))
        ]
        .sort((a, b) => b.sortDate - a.sortDate)
        .map((item) => {
          if (item.type === 'expense') {
            return (
              <div key={`expense-${item.id}`} className="expense-item">
                <div className="expense-info">
                  <h4>{item.title}</h4>
                  <p className="expense-category">{item.category}</p>
                  <p className="expense-date">{item.date}</p>
                </div>
                <div className="expense-amount">
                  ₹{parseFloat(item.amount).toFixed(2)}
                </div>
                <div className="expense-actions">
                  <button onClick={() => handleEdit(item)}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          } else if (item.type === 'given') {
            return (
              <div key={`given-${item.id}`} className="expense-item" style={{borderLeft: '4px solid #10b981'}}>
                <div className="expense-info">
                  <h4>Given to {item.friends?.friend_name || 'Friend'}</h4>
                  <p className="expense-category">{item.note || 'Friend payment'}</p>
                  <p className="expense-date">{new Date(item.created_at).toLocaleDateString()}</p>
                </div>
                <div className="expense-amount">
                  ₹{parseFloat(item.amount).toFixed(2)}
                </div>
                <div className="expense-actions">
                  <span style={{color: '#10b981', fontSize: '12px'}}>Given</span>
                </div>
              </div>
            )
          } else {
            return (
              <div key={`received-${item.id}`} className="expense-item" style={{borderLeft: '4px solid #3b82f6', opacity: '0.8'}}>
                <div className="expense-info">
                  <h4>Received from {item.friends?.friend_name || 'Friend'}</h4>
                  <p className="expense-category">{item.note || 'Friend payment'}</p>
                  <p className="expense-date">{new Date(item.created_at).toLocaleDateString()}</p>
                </div>
                <div className="expense-amount" style={{color: '#3b82f6'}}>
                  ₹{parseFloat(item.amount).toFixed(2)}
                </div>
                <div className="expense-actions">
                  <span style={{color: '#3b82f6', fontSize: '12px'}}>Received</span>
                </div>
              </div>
            )
          }
        })}
      </div>
    </div>
  )
}

export default Expenses