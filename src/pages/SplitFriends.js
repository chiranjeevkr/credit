import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'
import { Plus, ArrowUp, ArrowDown, Clock, Edit2, Trash2, X, Trash } from 'lucide-react'

const SplitFriends = () => {
  const [friends, setFriends] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [formData, setFormData] = useState({
    friendName: '',
    friendNumber: '',
    amount: '',
    type: 'credit',
    note: ''
  })
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [showPopup, setShowPopup] = useState(null)
  const [showFriendPopup, setShowFriendPopup] = useState(null)
  const [editingFriend, setEditingFriend] = useState(null)
  const [showDeleteForm, setShowDeleteForm] = useState(null)
  const [deleteFormData, setDeleteFormData] = useState({
    uniqueNumber: '',
    captchaInput: ''
  })
  const [deleteCaptcha, setDeleteCaptcha] = useState('')
  const [deleteCaptchaAnswer, setDeleteCaptchaAnswer] = useState(0)
  const [totalSummary, setTotalSummary] = useState({ totalToGive: 0, totalToTake: 0 })

  useEffect(() => {
    fetchFriends()
  }, [])

  useEffect(() => {
    if (selectedFriend) {
      fetchTransactions(selectedFriend.id)
    }
  }, [selectedFriend])

  const fetchFriends = async () => {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setFriends(data || [])
    } catch (error) {
      console.error('Error fetching friends:', error)
    }
  }

  const fetchTransactions = async (friendId) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('friend_id', friendId)
        .neq('status', 'deleted')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const handleAddFriend = async (e) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (editingFriend) {
        return handleUpdateFriend(e)
      }

      const { error } = await supabase
        .from('friends')
        .insert([{
          user_id: user.id,
          friend_name: formData.friendName,
          friend_number: formData.friendNumber,
          balance: 0
        }])

      if (error) throw error
      
      setFormData({ friendName: '', friendNumber: '', amount: '', type: 'credit', note: '' })
      setEditingFriend(null)
      setShowAddForm(false)
      fetchFriends()
    } catch (error) {
      console.error('Error adding friend:', error)
      alert(`Error: ${error.message}`)
    }
  }

  const handleTransaction = async (e) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const amount = parseFloat(formData.amount)
      
      // Calculate new balance
      const balanceChange = formData.type === 'credit' ? amount : -amount
      const newBalance = selectedFriend.balance + balanceChange

      if (editingTransaction) {
        return handleUpdateTransaction(e)
      }

      // Add transaction with balance at time
      const { error: transError } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          friend_id: selectedFriend.id,
          amount: amount,
          type: formData.type,
          note: formData.note,
          balance_at_time: newBalance,
          status: 'active'
        }])

      if (transError) throw transError

      // Update friend balance
      const { error: updateError } = await supabase
        .from('friends')
        .update({ balance: newBalance })
        .eq('id', selectedFriend.id)

      if (updateError) throw updateError

      setFormData({ ...formData, amount: '', note: '' })
      setEditingTransaction(null)
      fetchFriends()
      fetchTransactions(selectedFriend.id)
      calculateTotalSummary()
      
      // Update selected friend balance
      setSelectedFriend({ ...selectedFriend, balance: newBalance })
    } catch (error) {
      console.error('Error adding transaction:', error)
      alert(`Error: ${error.message}`)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      ...formData,
      amount: transaction.amount.toString(),
      type: transaction.type,
      note: transaction.note || ''
    })
  }

  const handleUpdateTransaction = async (e) => {
    e.preventDefault()
    try {
      const amount = parseFloat(formData.amount)

      // Update transaction with edited status
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          amount: amount,
          type: formData.type,
          note: formData.note,
          status: 'edited'
        })
        .eq('id', editingTransaction.id)

      if (updateError) throw updateError

      // Recalculate balance from all transactions and update balance_at_time
      const { data: allTransactions, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('friend_id', selectedFriend.id)
        .neq('status', 'deleted')
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError

      let runningBalance = 0
      for (const trans of allTransactions) {
        runningBalance += (trans.type === 'credit' ? parseFloat(trans.amount) : -parseFloat(trans.amount))
        
        // Update balance_at_time for this transaction
        await supabase
          .from('transactions')
          .update({ balance_at_time: runningBalance })
          .eq('id', trans.id)
      }

      // Update friend balance
      const { error: friendError } = await supabase
        .from('friends')
        .update({ balance: runningBalance })
        .eq('id', selectedFriend.id)

      if (friendError) throw friendError

      setFormData({ ...formData, amount: '', note: '' })
      setEditingTransaction(null)
      fetchFriends()
      fetchTransactions(selectedFriend.id)
      setSelectedFriend({ ...selectedFriend, balance: runningBalance })
    } catch (error) {
      console.error('Error updating transaction:', error)
      alert(`Error: ${error.message}`)
    }
  }

  const handleDeleteTransaction = async (transaction) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        // Calculate balance adjustment
        const oldChange = transaction.type === 'credit' ? parseFloat(transaction.amount) : -parseFloat(transaction.amount)
        const newBalance = selectedFriend.balance - oldChange

        // Mark transaction as deleted
        const { error: updateError } = await supabase
          .from('transactions')
          .update({ 
            status: 'deleted',
            balance_at_time: newBalance
          })
          .eq('id', transaction.id)

        if (updateError) throw updateError

        // Update friend balance
        const { error: friendError } = await supabase
          .from('friends')
          .update({ balance: newBalance })
          .eq('id', selectedFriend.id)

        if (friendError) throw friendError

        fetchFriends()
        fetchTransactions(selectedFriend.id)
        setSelectedFriend({ ...selectedFriend, balance: newBalance })
        alert('Expense deleted successfully!')
      } catch (error) {
        console.error('Error deleting transaction:', error)
        alert(`Error: ${error.message}`)
      }
    }
  }

  const handleTransactionClick = (transaction) => {
    setShowPopup(transaction.id)
  }

  const handleFriendClick = (friend, e) => {
    e.stopPropagation()
    setShowFriendPopup(friend.id)
  }

  const closePopup = () => {
    setShowPopup(null)
    setShowFriendPopup(null)
  }

  const handleEditFriend = (friend) => {
    setEditingFriend(friend)
    setFormData({
      ...formData,
      friendName: friend.friend_name,
      friendNumber: friend.friend_number
    })
    setShowFriendPopup(null)
  }

  const handleUpdateFriend = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('friends')
        .update({
          friend_name: formData.friendName
        })
        .eq('id', editingFriend.id)

      if (error) throw error

      setFormData({ friendName: '', friendNumber: '', amount: '', type: 'credit', note: '' })
      setEditingFriend(null)
      setShowAddForm(false)
      fetchFriends()
    } catch (error) {
      console.error('Error updating friend:', error)
      alert(`Error: ${error.message}`)
    }
  }

  const generateDeleteCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    const result = num1 + num2
    setDeleteCaptcha(`${num1} + ${num2} = ?`)
    setDeleteCaptchaAnswer(result)
    return result
  }

  const handleDeleteFriend = (friend) => {
    setShowDeleteForm(friend)
    setShowFriendPopup(null)
    generateDeleteCaptcha()
    setDeleteFormData({ uniqueNumber: '', captchaInput: '' })
  }

  const handleDeleteFormSubmit = async (e) => {
    e.preventDefault()
    const friend = showDeleteForm

    if (deleteFormData.uniqueNumber !== friend.friend_number) {
      alert('Incorrect unique number')
      return
    }

    if (parseInt(deleteFormData.captchaInput) !== deleteCaptchaAnswer) {
      alert('Incorrect captcha')
      generateDeleteCaptcha()
      setDeleteFormData({ ...deleteFormData, captchaInput: '' })
      return
    }

    if (window.confirm(`Are you sure you want to delete ${friend.friend_name} and all related transactions?`)) {
      try {
        const { error } = await supabase
          .from('friends')
          .delete()
          .eq('id', friend.id)

        if (error) throw error

        fetchFriends()
        if (selectedFriend?.id === friend.id) {
          setSelectedFriend(null)
        }
        setShowDeleteForm(null)
        alert('Friend and all transactions deleted successfully')
      } catch (error) {
        console.error('Error deleting friend:', error)
        alert(`Error: ${error.message}`)
      }
    }
  }

  const refreshDeleteCaptcha = () => {
    generateDeleteCaptcha()
    setDeleteFormData({ ...deleteFormData, captchaInput: '' })
  }

  const calculateTotalSummary = useCallback(() => {
    const summary = friends.reduce((acc, friend) => {
      if (friend.balance > 0) {
        acc.totalToTake += friend.balance // Friend owes you
      } else {
        acc.totalToGive += Math.abs(friend.balance) // You owe friend
      }
      return acc
    }, { totalToGive: 0, totalToTake: 0 })

    setTotalSummary(summary)
  }, [friends])

  useEffect(() => {
    calculateTotalSummary()
  }, [calculateTotalSummary])

  const handleClearChat = async () => {
    if (window.confirm(`Are you sure you want to clear all transactions with ${selectedFriend.friend_name}? This will reset the balance to ₹0.`)) {
      try {
        // Delete all transactions for this friend
        const { error: deleteError } = await supabase
          .from('transactions')
          .delete()
          .eq('friend_id', selectedFriend.id)

        if (deleteError) throw deleteError

        // Reset friend balance to 0
        const { error: updateError } = await supabase
          .from('friends')
          .update({ balance: 0 })
          .eq('id', selectedFriend.id)

        if (updateError) throw updateError

        // Refresh data
        fetchFriends()
        fetchTransactions(selectedFriend.id)
        setSelectedFriend({ ...selectedFriend, balance: 0 })
        
        alert('All transactions cleared successfully!')
      } catch (error) {
        console.error('Error clearing transactions:', error)
        alert(`Error: ${error.message}`)
      }
    }
  }

  return (
    <div className="split-friends">
      <div className="friends-header">
        <h1>Split Friends</h1>
        <button 
          className="add-btn"
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={18} />
          Add Friend
        </button>
      </div>

      {showAddForm && (
        <div className="friend-form">
          <h3>{editingFriend ? 'Edit Friend' : 'Add New Friend'}</h3>
          <form onSubmit={handleAddFriend}>
            <input
              type="text"
              placeholder="Friend Name"
              value={formData.friendName}
              onChange={(e) => setFormData({...formData, friendName: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Unique Number"
              value={formData.friendNumber}
              onChange={(e) => setFormData({...formData, friendNumber: e.target.value})}
              disabled={editingFriend}
              required
            />
            <div className="form-actions">
              <button type="submit">{editingFriend ? 'Update Friend' : 'Add Friend'}</button>
              <button type="button" onClick={() => {
                setShowAddForm(false)
                setEditingFriend(null)
                setFormData({ friendName: '', friendNumber: '', amount: '', type: 'credit', note: '' })
              }}>Cancel</button>
            </div>
          </form>
        </div>
      )}



      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card give-card">
          <div className="card-icon">💸</div>
          <div className="card-content">
            <h4>I Have to Give</h4>
            <p>₹{totalSummary.totalToGive.toFixed(2)}</p>
          </div>
        </div>
        <div className="summary-card take-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h4>I Have to Take</h4>
            <p>₹{totalSummary.totalToTake.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="friends-list">
        {friends.map((friend) => (
          <div 
            key={friend.id} 
            className={`friend-card ${selectedFriend?.id === friend.id ? 'selected' : ''}`}
            onClick={() => setSelectedFriend(friend)}
            onContextMenu={(e) => handleFriendClick(friend, e)}
            onDoubleClick={(e) => handleFriendClick(friend, e)}
          >
            <div className="friend-info">
              <h4>{friend.friend_name}</h4>
              <p>#{friend.friend_number}</p>
            </div>
            <div>
              <div className={`friend-balance ${friend.balance >= 0 ? 'positive' : 'negative'}`}>
                ₹{Math.abs(friend.balance).toFixed(2)}
                {friend.balance >= 0 ? ' (To take)' : ' (To give)'}
              </div>


            </div>
          </div>
        ))}
      </div>

      {selectedFriend && (
        <div className="transaction-section">
          <div className="transaction-header">
            <h3>Transactions with {selectedFriend.friend_name}</h3>
            <button 
              className="clear-chat-btn"
              onClick={() => handleClearChat()}
              title="Clear all transactions"
            >
              <Trash size={16} />
              Clear Chat
            </button>
          </div>
          
          <div className="transaction-form">
            <form onSubmit={handleTransaction}>
              <div className="transaction-type">
                <label>
                  <input
                    type="radio"
                    value="debit"
                    checked={formData.type === 'debit'}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  />
                  Received (Friend paid for you)
                </label>
                <label>
                  <input
                    type="radio"
                    value="credit"
                    checked={formData.type === 'credit'}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  />
                  Given (You paid for friend)
                </label>
              </div>
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
                placeholder="Note (optional)"
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
              />
              <button type="submit">
                {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
              </button>
              {editingTransaction && (
                <button type="button" onClick={() => {
                  setEditingTransaction(null)
                  setFormData({ ...formData, amount: '', note: '' })
                }}>
                  Cancel Edit
                </button>
              )}
            </form>
          </div>

          <div className="transactions-list">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="transaction-row">
                {transaction.type === 'debit' ? (
                  <>
                    <div 
                      className="transaction-item taken-item"
                      onClick={() => handleTransactionClick(transaction)}
                    >
                      <div className="transaction-amount">
                        <ArrowDown className="taken-icon" />
                        ₹{transaction.amount.toFixed(2)}
                      </div>
                      <div className="transaction-details">
                        <p className="transaction-note">{transaction.note || 'No note'}</p>
                        <p className="transaction-time">
                          <Clock size={14} />
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                      <div className="transaction-total">
                        ₹{Math.abs(transaction.balance_at_time || 0).toFixed(2)} {(transaction.balance_at_time || 0) >= 0 ? '(To take)' : '(To give)'}
                      </div>
                      {transaction.status !== 'active' && (
                        <div className="transaction-status">
                          {transaction.status === 'edited' ? '✏️ Edited' : '🗑️ Deleted'}
                        </div>
                      )}
                    </div>
                    <div className="transaction-spacer"></div>
                    <div className="transaction-empty"></div>
                  </>
                ) : (
                  <>
                    <div className="transaction-empty"></div>
                    <div className="transaction-spacer"></div>
                    <div 
                      className="transaction-item given-item"
                      onClick={() => handleTransactionClick(transaction)}
                    >
                      <div className="transaction-amount">
                        <ArrowUp className="given-icon" />
                        ₹{transaction.amount.toFixed(2)}
                      </div>
                      <div className="transaction-details">
                        <p className="transaction-note">{transaction.note || 'No note'}</p>
                        <p className="transaction-time">
                          <Clock size={14} />
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                      <div className="transaction-total">
                        ₹{Math.abs(transaction.balance_at_time || 0).toFixed(2)} {(transaction.balance_at_time || 0) >= 0 ? '(To take)' : '(To give)'}
                      </div>
                      {transaction.status !== 'active' && (
                        <div className="transaction-status">
                          {transaction.status === 'edited' ? '✏️ Edited' : '🗑️ Deleted'}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Transaction Popup Menu */}
          {showPopup && (
            <div className="popup-overlay" onClick={closePopup}>
              <div className="popup-menu" onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                  <h4>Transaction Options</h4>
                  <button className="popup-close" onClick={closePopup}>
                    <X size={16} />
                  </button>
                </div>
                <div className="popup-actions">
                  <button 
                    className="popup-edit"
                    onClick={() => {
                      const transaction = transactions.find(t => t.id === showPopup)
                      handleEditTransaction(transaction)
                      closePopup()
                    }}
                  >
                    <Edit2 size={16} />
                    Edit Transaction
                  </button>
                  <button 
                    className="popup-delete"
                    onClick={() => {
                      const transaction = transactions.find(t => t.id === showPopup)
                      handleDeleteTransaction(transaction)
                      closePopup()
                    }}
                  >
                    <Trash2 size={16} />
                    Delete Transaction
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Friend Popup Menu */}
          {showFriendPopup && (
            <div className="popup-overlay" onClick={closePopup}>
              <div className="popup-menu" onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                  <h4>Friend Options</h4>
                  <button className="popup-close" onClick={closePopup}>
                    <X size={16} />
                  </button>
                </div>
                <div className="popup-actions">
                  <button 
                    className="popup-edit"
                    onClick={() => {
                      const friend = friends.find(f => f.id === showFriendPopup)
                      handleEditFriend(friend)
                      setShowAddForm(true)
                    }}
                  >
                    <Edit2 size={16} />
                    Edit Friend
                  </button>
                  <button 
                    className="popup-delete"
                    onClick={() => {
                      const friend = friends.find(f => f.id === showFriendPopup)
                      handleDeleteFriend(friend)
                    }}
                  >
                    <Trash2 size={16} />
                    Delete Friend
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Friend Form */}
          {showDeleteForm && (
            <div className="popup-overlay" onClick={() => setShowDeleteForm(null)}>
              <div className="delete-form" onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                  <h4>Delete Friend: {showDeleteForm.friend_name}</h4>
                  <button className="popup-close" onClick={() => setShowDeleteForm(null)}>
                    <X size={16} />
                  </button>
                </div>
                <form onSubmit={handleDeleteFormSubmit}>
                  <div className="delete-warning">
                    ⚠️ This will permanently delete the friend and ALL transactions!
                  </div>
                  <input
                    type="text"
                    placeholder="Enter friend's unique number"
                    value={deleteFormData.uniqueNumber}
                    onChange={(e) => setDeleteFormData({...deleteFormData, uniqueNumber: e.target.value})}
                    required
                  />
                  <div className="captcha-container">
                    <div className="captcha-display">
                      <span>{deleteCaptcha}</span>
                      <button type="button" onClick={refreshDeleteCaptcha} className="refresh-btn">
                        ↻
                      </button>
                    </div>
                    <input
                      type="number"
                      placeholder="Enter answer"
                      value={deleteFormData.captchaInput}
                      onChange={(e) => setDeleteFormData({...deleteFormData, captchaInput: e.target.value})}
                      required
                    />
                  </div>
                  <div className="delete-actions">
                    <button type="submit" className="delete-confirm-btn">
                      Delete Friend
                    </button>
                    <button type="button" onClick={() => setShowDeleteForm(null)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SplitFriends