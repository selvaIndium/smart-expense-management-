import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/errors'
import { useAuth } from '../context/AuthContext'

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

const ICONS = ['🍔','🚗','🏠','💊','🎮','✈️','📚','👗','💡','🛒','💰','🎁']

export default function Categories() {
  const [cats, setCats] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', icon: '🍔' })
  const [error, setError] = useState('')
  const { logout } = useAuth()
  const navigate = useNavigate()

  const load = () => fetch('/categories/', { headers: authHeader() }).then(r => r.json()).then(setCats).catch(() => {})
  useEffect(() => { load() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    try {
      const res = await fetch('/categories/', {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim() }),
      })
      if (res.ok) { setShowModal(false); setForm({ name: '', icon: '🍔' }); load(); return }
      const d = await res.json().catch(() => ({}))
      setError(getApiErrorMessage(d, 'Failed to add category'))
    } catch {
      setError('Server error. Please try again.')
    }
  }

  const del = async (id: number) => {
    await fetch(`/categories/${id}`, { method: 'DELETE', headers: authHeader() })
    load()
  }

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <>
      <nav>
        <span className="logo">💸 ExpenseIQ</span>
        <div className="nav-links">
          <Link to="/">Expenses</Link>
          <Link to="/budgets">Budgets</Link>
          <Link to="/categories" className="active">Categories</Link>
          <Link to="/insights">Insights</Link>
        </div>
        <button className="logout" onClick={handleLogout}>Logout</button>
      </nav>
      <div className="page">
        <div className="top-bar">
          <div className="page-title">Categories</div>
          <button className="btn btn-success" onClick={() => setShowModal(true)}>+ Add Category</button>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:'1rem'}}>
          {cats.map((c: any) => (
            <div className="card" key={c.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
                <span style={{fontSize:'1.8rem'}}>{c.icon || '📂'}</span>
                <span style={{fontWeight:600}}>{c.name}</span>
              </div>
              <button className="btn btn-danger btn-small" onClick={() => del(c.id)}>✕</button>
            </div>
          ))}
          {cats.length === 0 && <p style={{color:'#64748b'}}>No categories yet.</p>}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add Category</h3>
            <form onSubmit={submit}>
              <div className="form-group"><label>Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Food" required />
              </div>
              <div className="form-group"><label>Pick Icon</label>
                <div style={{display:'flex', flexWrap:'wrap', gap:'0.5rem', marginTop:'0.5rem'}}>
                  {ICONS.map(icon => (
                    <span key={icon} onClick={() => setForm({...form, icon})}
                      style={{fontSize:'1.5rem', cursor:'pointer', padding:'0.3rem', borderRadius:'8px',
                        background: form.icon === icon ? '#334155' : 'transparent',
                        border: form.icon === icon ? '1px solid #38bdf8' : '1px solid transparent'}}>
                      {icon}
                    </span>
                  ))}
                </div>
              </div>
              {error && <p className="error">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-success">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
