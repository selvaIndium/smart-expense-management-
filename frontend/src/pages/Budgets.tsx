import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/errors'
import { useAuth } from '../context/AuthContext'

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

export default function Budgets() {
  const [budgets, setBudgets] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ category_id: '', limit: '', month: '', year: '' })
  const [error, setError] = useState('')
  const { logout } = useAuth()
  const navigate = useNavigate()

  const load = () => {
    fetch('/budgets/', { headers: authHeader() }).then(r => r.json()).then(setBudgets).catch(() => {})
    fetch('/expenses/', { headers: authHeader() }).then(r => r.json()).then(setExpenses).catch(() => {})
    fetch('/categories/', { headers: authHeader() }).then(r => r.json()).then(setCategories).catch(() => {})
  }
  useEffect(() => { load() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    const parsedCategoryId = form.category_id ? parseInt(form.category_id) : null
    const res = await fetch('/budgets/', {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: parseFloat(form.limit),
        month: parseInt(form.month),
        year: parseInt(form.year),
        category_id: parsedCategoryId,
      }),
    })
    if (res.ok) { setShowModal(false); setForm({ category_id: '', limit: '', month: '', year: '' }); load() }
    else { const d = await res.json(); setError(getApiErrorMessage(d, 'Failed to save budget')) }
  }

  const del = async (id: number) => {
    await fetch(`/budgets/${id}`, { method: 'DELETE', headers: authHeader() })
    load()
  }

  const getSpent = (b: any) => {
    const month = Number(b.month)
    const year = Number(b.year)
    const categoryId = b.category_id ? Number(b.category_id) : null

    return expenses.reduce((sum, e) => {
      const rawDate = e.expense_date || e.date
      if (!rawDate) return sum

      const d = new Date(rawDate)
      if (Number.isNaN(d.getTime())) return sum

      const sameMonthYear = d.getMonth() + 1 === month && d.getFullYear() === year
      if (!sameMonthYear) return sum

      // If budget is category-specific, count only matching category expenses.
      if (categoryId !== null && Number(e.category_id) !== categoryId) return sum

      return sum + Number(e.amount || 0)
    }, 0)
  }

  const getCategoryName = (b: any) => {
    if (!b.category_id) return 'Overall'
    return categories.find((c: any) => Number(c.id) === Number(b.category_id))?.name || `Category ${b.category_id}`
  }

  const pct = (spent: number, amount: number) => Math.min((spent / (amount || 1)) * 100, 100)
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <>
      <nav>
        <span className="logo">💸 ExpenseIQ</span>
        <div className="nav-links">
          <Link to="/">Expenses</Link>
          <Link to="/budgets" className="active">Budgets</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/insights">Insights</Link>
        </div>
        <button className="logout" onClick={handleLogout}>Logout</button>
      </nav>
      <div className="page">
        <div className="top-bar">
          <div className="page-title">Budgets</div>
          <button className="btn btn-success" onClick={() => setShowModal(true)}>+ Set Budget</button>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:'1rem'}}>
          {budgets.map((b: any) => {
            const spent = getSpent(b)
            const limit = Number(b.amount || b.limit || 0)
            const p = pct(spent, limit)
            return (
              <div className="card" key={b.id}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem'}}>
                  <span style={{fontWeight:600}}>{getCategoryName(b)}</span>
                  <button className="btn btn-danger btn-small" onClick={() => del(b.id)}>✕</button>
                </div>
                <div style={{color:'#94a3b8', fontSize:'0.85rem', marginBottom:'0.5rem'}}>{b.month || '—'}/{b.year || '—'}</div>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.4rem'}}>
                  <span style={{fontSize:'0.85rem', color:'#64748b'}}>Spent: <b style={{color:'#f87171'}}>₹{spent.toFixed(2)}</b></span>
                  <span style={{fontSize:'0.85rem', color:'#64748b'}}>Limit: <b style={{color:'#4ade80'}}>₹{limit.toFixed(2)}</b></span>
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
                <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                  <option value="">Entire month (all categories)</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Budget Limit (₹)</label>
                  <input type="number" step="0.01" value={form.limit} onChange={e => setForm({...form, limit: e.target.value})} required />
                </div>
                <div className="form-group"><label>Month (1-12)</label>
                  <input type="number" min="1" max="12" value={form.month} onChange={e => setForm({...form, month: e.target.value})} required />
                </div>
              </div>
              <div className="form-group"><label>Year</label>
                <input type="number" min="2000" max="2100" placeholder="2026" value={form.year} onChange={e => setForm({...form, year: e.target.value})} required />
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
