// Offline storage utilities
export const OfflineStorage = {
  // Save expense offline
  saveExpenseOffline: (expense) => {
    const offlineExpenses = JSON.parse(localStorage.getItem('offlineExpenses') || '[]')
    const expenseWithId = { ...expense, id: Date.now(), offline: true }
    offlineExpenses.push(expenseWithId)
    localStorage.setItem('offlineExpenses', JSON.stringify(offlineExpenses))
    return expenseWithId
  },

  // Get offline expenses
  getOfflineExpenses: () => {
    return JSON.parse(localStorage.getItem('offlineExpenses') || '[]')
  },

  // Clear offline expenses after sync
  clearOfflineExpenses: () => {
    localStorage.removeItem('offlineExpenses')
  },

  // Check if online
  isOnline: () => navigator.onLine,

  // Save user data for offline access
  saveUserData: (expenses, friends, transactions) => {
    localStorage.setItem('cachedExpenses', JSON.stringify(expenses))
    localStorage.setItem('cachedFriends', JSON.stringify(friends))
    localStorage.setItem('cachedTransactions', JSON.stringify(transactions))
  },

  // Get cached data
  getCachedData: () => ({
    expenses: JSON.parse(localStorage.getItem('cachedExpenses') || '[]'),
    friends: JSON.parse(localStorage.getItem('cachedFriends') || '[]'),
    transactions: JSON.parse(localStorage.getItem('cachedTransactions') || '[]')
  })
}