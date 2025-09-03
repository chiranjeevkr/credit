import React from 'react'

function App() {
  console.log('App component loaded successfully')
  
  return (
    <div style={{padding: '20px', fontFamily: 'Arial, sans-serif'}}>
      <h1 style={{color: 'green'}}>✅ React App is Working!</h1>
      <p>Expense Tracker - Deployment Test</p>
      <div style={{background: '#f0f0f0', padding: '10px', marginTop: '20px'}}>
        <p>Environment: {process.env.NODE_ENV}</p>
        <p>Timestamp: {new Date().toLocaleString()}</p>
      </div>
    </div>
  )
}

export default App