import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

export default function Dashboard() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [budgets, setBudgets] = useState<any[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/expenses', { headers: authHeader() }).then(r => r.json()).then(setExpenses).catch(() => {})
    fetch('/budgets', { headers: authHeader() }).then(r => r.json()).then(setBudgets).catch(() => {})
  }, [])

  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0)
  const thisMonth = expenses.filter(e => new Date(e.date).getMonth() === new Date().getMonth())
  const monthTotal = thisMonth.reduce((s, e) => s + (e.amount || 0), 0)

  const logout = () => { localStorage.removeItem('token'); navigate('/login') }

  return (
    <>
      <nav>
        <span className="logo">💸 ExpenseIQ</span>
        <div className="nav-links">
          <Link to="/" className="active">Dashboard</Link>
          <Link to="/expenses">Expenses</Link>
          <Link to="/budgets">Budgets</Link>
          <Link to="/categories">Categories</Link>
        </div>
        <button className="logout" onClick={logout}>Logout</button>
      </nav>
      <div className="page">
        <div className="page-title">Dashboard</div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="label">Total Expenses</div>
            <div className="value red">₹{total.toFixed(2)}</div>
          </div>
          <div className="stat-card">
            <div className="label">This Month</div>
            <div className="value">₹{monthTotal.toFixed(2)}</div>
          </div>
          <div className="stat-card">
            <div className="label">Transactions</div>
            <div className="value green">{expenses.length}</div>
          </div>
          <div className="stat-card">
            <div className="label">Active Budgets</div>
            <div className="value">{budgets.length}</div>
          </div>
        </div>

        <div className="card">
          <div className="top-bar">
            <h3>Recent Expenses</h3>
            <Link to="/expenses"><button className="btn btn-outline btn-small">View All</button></Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Category</th><th>Amount</th><th>Date</th></tr></thead>
              <tbody>
                {expenses.slice(0,5).map((e, i) => (
                  <tr key={i}>
                    <td>{e.title || e.description || '—'}</td>
                    <td><span className="badge blue">{e.category_name || e.category || '—'}</span></td>
                    <td style={{color:'#f87171'}}>₹{e.amount}</td>
                    <td style={{color:'#64748b'}}>{e.date ? new Date(e.date).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
                {expenses.length === 0 && <tr><td colSpan={4} style={{textAlign:'center',color:'#64748b',padding:'2rem'}}>No expenses yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}