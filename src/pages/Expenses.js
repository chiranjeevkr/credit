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

  useEffect(() => {
    fetchExpenses()
  }, [])

  useEffect(() => {
    const dailyTotal = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
    setTotal(dailyTotal)
  }, [expenses])

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      setExpenses(data || [])
    } catch (error) {
      console.error('Error fetching expenses:', error)
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
        {expenses.map((expense) => (
          <div key={expense.id} className="expense-item">
            <div className="expense-info">
              <h4>{expense.title}</h4>
              <p className="expense-category">{expense.category}</p>
              <p className="expense-date">{expense.date}</p>
            </div>
            <div className="expense-amount">
              ₹{parseFloat(expense.amount).toFixed(2)}
            </div>
            <div className="expense-actions">
              <button onClick={() => handleEdit(expense)}>
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(expense.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Expenses