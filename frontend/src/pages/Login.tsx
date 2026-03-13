import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const form = new FormData()
    form.append('username', username)
    form.append('password', password)
    try {
      const res = await fetch('/auth/login', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) { setError(data.detail || 'Login failed'); return }
      localStorage.setItem('token', data.access_token)
      navigate('/')
    } catch {
      setError('Server error. Is the backend running?')
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <h2>💸 Welcome Back</h2>
        <p>Sign in to your expense manager</p>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="your_username" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" style={{marginTop:'1rem'}}>Sign In</button>
        </form>
        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  )
}
