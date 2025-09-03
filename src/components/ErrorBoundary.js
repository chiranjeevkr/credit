import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh', 
          padding: '20px', 
          textAlign: 'center'
        }}>
          <h2>Something went wrong</h2>
          <p>The application encountered an error: {this.state.error?.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '10px 20px', 
              marginTop: '10px', 
              cursor: 'pointer',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px'
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary