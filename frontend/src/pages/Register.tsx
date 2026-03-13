import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handle = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    }).then(r => r.json()).then(data => {
      if (data.id || data.username) navigate('/login')
      else setError(data.detail || 'Registration failed')
    }).catch(() => setError('Server error'))
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <h2>🚀 Create Account</h2>
        <p>Start tracking your expenses today</p>
        <form onSubmit={handle}>
          <div className="form-group">
            <label>Username</label>
            <input value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="john_doe" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@email.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" required />
          </div>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" style={{marginTop:'1rem'}}>Create Account</button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
