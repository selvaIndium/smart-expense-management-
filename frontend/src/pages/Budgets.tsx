import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

export default function Budgets() {
  const [budgets, setBudgets] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ category_id: '', limit: '', month: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const load = () => {
    fetch('/budgets', { headers: authHeader() }).then(r => r.json()).then(setBudgets).catch(() => {})
    fetch('/categories', { headers: authHeader() }).then(r => r.json()).then(setCategories).catch(() => {})
  }
  useEffect(() => { load() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    const res = await fetch('/budgets', {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, limit: parseFloat(form.limit), category_id: parseInt(form.category_id) }),
    })
    if (res.ok) { setShowModal(false); setForm({ category_id: '', limit: '', month: '' }); load() }
    else { const d = await res.json(); setError(d.detail || 'Failed') }
  }

  const del = async (id: number) => {
    await fetch(`/budgets/${id}`, { method: 'DELETE', headers: authHeader() })
    load()
  }

  const pct = (b: any) => Math.min(((b.spent || 0) / (b.limit || b.amount || 1)) * 100, 100)
  const logout = () => { localStorage.removeItem('token'); navigate('/login') }

  return (
    <>
      <nav>
        <span className="logo">💸 ExpenseIQ</span>
        <div className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/expenses">Expenses</Link>
          <Link to="/budgets" className="active">Budgets</Link>
          <Link to="/categories">Categories</Link>
        </div>
        <button className="logout" onClick={logout}>Logout</button>
      </nav>
      <div className="page">
        <div className="top-bar">
          <div className="page-title">Budgets</div>
          <button className="btn btn-success" onClick={() => setShowModal(true)}>+ Set Budget</button>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:'1rem'}}>
          {budgets.map((b: any) => {
            const p = pct(b)
            return (
              <div className="card" key={b.id}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem'}}>
                  <span style={{fontWeight:600}}>{b.category_name || b.category || 'Category'}</span>
                  <button className="btn btn-danger btn-small" onClick={() => del(b.id)}>✕</button>
                </div>
                <div style={{color:'#94a3b8', fontSize:'0.85rem', marginBottom:'0.5rem'}}>{b.month || '—'}</div>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.4rem'}}>
                  <span style={{fontSize:'0.85rem', color:'#64748b'}}>Spent: <b style={{color:'#f87171'}}>₹{b.spent || 0}</b></span>
                  <span style={{fontSize:'0.85rem', color:'#64748b'}}>Limit: <b style={{color:'#4ade80'}}>₹{b.limit || b.amount}</b></span>
                </div>
                <div className="progress-bar-wrap">
                  <div className={`progress-bar ${p >= 100 ? 'over' : p >= 75 ? 'warn' : ''}`} style={{width:`${p}%`}} />
                </div>
                <div style={{textAlign:'right', fontSize:'0.8rem', color: p>=100?'#f87171':p>=75?'#f59e0b':'#4ade80', marginTop:'0.3rem'}}>{p.toFixed(0)}% used</div>
              </div>
            )
          })}
          {budgets.length === 0 && <p style={{color:'#64748b'}}>No budgets set yet.</p>}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Set Budget</h3>
            <form onSubmit={submit}>
              <div className="form-group"><label>Category</label>
                <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} required>
                  <option value="">Select category</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Budget Limit (₹)</label>
                  <input type="number" step="0.01" value={form.limit} onChange={e => setForm({...form, limit: e.target.value})} required />
                </div>
                <div className="form-group"><label>Month (YYYY-MM)</label>
                  <input placeholder="2025-03" value={form.month} onChange={e => setForm({...form, month: e.target.value})} required />
                </div>
              </div>
              {error && <p className="error">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-success">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
