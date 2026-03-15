import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/errors'
import { useAuth } from '../context/AuthContext'

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

export default function Expenses() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filterCategoryId, setFilterCategoryId] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', amount: '', category_id: '', date: '' })
  const [error, setError] = useState('')
  const { logout } = useAuth()
  const navigate = useNavigate()

  const load = () => {
    fetch('/expenses/', { headers: authHeader() }).then(r => r.json()).then(setExpenses).catch(() => {})
    fetch('/categories/', { headers: authHeader() }).then(r => r.json()).then(setCategories).catch(() => {})
  }
  useEffect(() => { load() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    const parsedCategoryId = form.category_id ? parseInt(form.category_id) : undefined
    const res = await fetch('/expenses/', {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: parseFloat(form.amount),
        description: form.title,
        expense_date: form.date,
        category_id: parsedCategoryId,
      }),
    })
    if (res.ok) { setShowModal(false); setForm({ title: '', amount: '', category_id: '', date: '' }); load() }
    else { const d = await res.json(); setError(getApiErrorMessage(d, 'Failed to add expense')) }
  }

  const del = async (id: number) => {
    await fetch(`/expenses/${id}`, { method: 'DELETE', headers: authHeader() })
    load()
  }

  const getCategoryName = (expense: any) => {
    if (expense.category_name) return expense.category_name
    if (expense.category) return expense.category
    if (!expense.category_id) return '—'
    return categories.find((c: any) => Number(c.id) === Number(expense.category_id))?.name || '—'
  }

  const filteredExpenses = expenses.filter((e: any) => {
    const text = (e.title || e.description || '').toString().toLowerCase()
    const categoryName = getCategoryName(e).toLowerCase()
    const amountText = String(e.amount || '')
    const query = search.trim().toLowerCase()

    const matchesSearch = !query || text.includes(query) || categoryName.includes(query) || amountText.includes(query)
    const matchesCategory = !filterCategoryId || String(e.category_id || '') === filterCategoryId

    const rawDate = e.expense_date || e.date
    const expenseDate = rawDate ? new Date(rawDate) : null
    const from = fromDate ? new Date(fromDate) : null
    const to = toDate ? new Date(toDate) : null

    const matchesFrom = !from || (expenseDate && expenseDate >= from)
    const matchesTo = !to || (expenseDate && expenseDate <= to)

    return matchesSearch && matchesCategory && matchesFrom && matchesTo
  })

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <>
      <nav>
        <span className="logo">💸 ExpenseIQ</span>
        <div className="nav-links">
          <Link to="/" className="active">Expenses</Link>
          <Link to="/budgets">Budgets</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/insights">Insights</Link>
        </div>
        <button className="logout" onClick={handleLogout}>Logout</button>
      </nav>
      <div className="page">
        <div className="top-bar">
          <div className="page-title">Expenses</div>
          <button className="btn btn-success" onClick={() => setShowModal(true)}>+ Add Expense</button>
        </div>
        <div className="filters-row">
          <input
            className="filter-input"
            placeholder="Search title, category, or amount"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="filter-input" value={filterCategoryId} onChange={e => setFilterCategoryId(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c: any) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
          </select>
          <input className="filter-input" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          <input className="filter-input" type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Category</th><th>Amount</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>
              {filteredExpenses.map((e: any) => (
                <tr key={e.id}>
                  <td>{e.title || e.description}</td>
                  <td><span className="badge blue">{getCategoryName(e)}</span></td>
                  <td style={{color:'#f87171',fontWeight:600}}>₹{e.amount}</td>
                  <td style={{color:'#64748b'}}>{e.expense_date ? new Date(e.expense_date).toLocaleDateString() : '—'}</td>
                  <td><button className="btn btn-danger btn-small" onClick={() => del(e.id)}>Delete</button></td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && <tr><td colSpan={5} style={{textAlign:'center',color:'#64748b',padding:'2rem'}}>No expenses match your filters.</td></tr>}
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
