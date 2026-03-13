import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

export default function Expenses() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', amount: '', category_id: '', date: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const load = () => {
    fetch('/expenses', { headers: authHeader() }).then(r => r.json()).then(setExpenses).catch(() => {})
    fetch('/categories', { headers: authHeader() }).then(r => r.json()).then(setCategories).catch(() => {})
  }
  useEffect(() => { load() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    const res = await fetch('/expenses', {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount), category_id: parseInt(form.category_id) }),
    })
    if (res.ok) { setShowModal(false); setForm({ title: '', amount: '', category_id: '', date: '' }); load() }
    else { const d = await res.json(); setError(d.detail || 'Failed') }
  }

  const del = async (id: number) => {
    await fetch(`/expenses/${id}`, { method: 'DELETE', headers: authHeader() })
    load()
  }

  const logout = () => { localStorage.removeItem('token'); navigate('/login') }

  return (
    <>
      <nav>
        <span className="logo">💸 ExpenseIQ</span>
        <div className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/expenses" className="active">Expenses</Link>
          <Link to="/budgets">Budgets</Link>
          <Link to="/categories">Categories</Link>
        </div>
        <button className="logout" onClick={logout}>Logout</button>
      </nav>
      <div className="page">
        <div className="top-bar">
          <div className="page-title">Expenses</div>
          <button className="btn btn-success" onClick={() => setShowModal(true)}>+ Add Expense</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Category</th><th>Amount</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>
              {expenses.map((e: any) => (
                <tr key={e.id}>
                  <td>{e.title || e.description}</td>
                  <td><span className="badge blue">{e.category_name || e.category || '—'}</span></td>
                  <td style={{color:'#f87171',fontWeight:600}}>₹{e.amount}</td>
                  <td style={{color:'#64748b'}}>{e.date ? new Date(e.date).toLocaleDateString() : '—'}</td>
                  <td><button className="btn btn-danger btn-small" onClick={() => del(e.id)}>Delete</button></td>
                </tr>
              ))}
              {expenses.length === 0 && <tr><td colSpan={5} style={{textAlign:'center',color:'#64748b',padding:'2rem'}}>No expenses yet. Add one!</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add Expense</h3>
            <form onSubmit={submit}>
              <div className="form-group"><label>Title</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group"><label>Amount (₹)</label>
                  <input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                </div>
                <div className="form-group"><label>Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                </div>
              </div>
              <div className="form-group"><label>Category</label>
                <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} required>
                  <option value="">Select category</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
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
