import React, { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  if (!showPrompt) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      right: '20px',
      background: '#667eea',
      color: 'white',
      padding: '15px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 1000,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      <div>
        <strong>Install eSpend</strong>
        <p style={{margin: '5px 0 0 0', fontSize: '14px'}}>
          Add to home screen for quick access
        </p>
      </div>
      <div style={{display: 'flex', gap: '10px'}}>
        <button 
          onClick={handleInstall}
          style={{
            background: 'white',
            color: '#667eea',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <Download size={16} />
          Install
        </button>
        <button 
          onClick={() => setShowPrompt(false)}
          style={{
            background: 'transparent',
            color: 'white',
            border: '1px solid white',
            padding: '8px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

export default InstallPrompt