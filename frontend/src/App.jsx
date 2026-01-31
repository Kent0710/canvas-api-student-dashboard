import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    // Fetch health check from backend
    fetch('/health')
      .then(res => res.json())
      .then(data => setMessage(`Backend connected! Status: ${data.data.status}`))
      .catch(err => setMessage('Error connecting to backend'))
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>Canvas API Student Dashboard</h1>
        <p>{message}</p>
      </header>
    </div>
  )
}

export default App
