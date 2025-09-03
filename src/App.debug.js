import React from 'react'

function App() {
  return (
    <div style={{padding: '20px', fontFamily: 'Arial, sans-serif'}}>
      <h1>eSpend Debug Mode</h1>
      <p>✅ React is working</p>
      <p>✅ App component loaded</p>
      <p>Environment: {process.env.NODE_ENV}</p>
      <p>Supabase URL: {process.env.REACT_APP_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
      <p>Supabase Key: {process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
      <button onClick={() => alert('Button works!')}>Test Button</button>
    </div>
  )
}

export default App