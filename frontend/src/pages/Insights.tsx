import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";

interface InsightData {
  month: number;
  year: number;
  total_spent: number;
  budget_limit: number | null;
  remaining: number | null;
  status: string;
}

export default function Insights() {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [error, setError] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleFetch = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setInsight(null);
    try {
      const data = await api.get(`/budgets/insight/${year}/${month}`);
      setInsight(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    }
  };

  return (
    <>
      <nav>
        <span className="logo">💸 ExpenseIQ</span>
        <div className="nav-links">
          <Link to="/">Expenses</Link>
          <Link to="/budgets">Budgets</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/insights" className="active">Insights</Link>
        </div>
        <button className="logout" onClick={handleLogout}>Logout</button>
      </nav>
      <div className="page">
        <div className="top-bar">
          <div className="page-title">Insights</div>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <form onSubmit={handleFetch} className="insights-form">
            <input
              className="filter-input"
              type="number"
              min="1"
              max="12"
              placeholder="Month (1-12)"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
            />
            <input
              className="filter-input"
              type="number"
              min="2000"
              max="2100"
              placeholder="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-success">Get Insight</button>
          </form>
        </div>
        {insight && (
          <div className="insights-grid">
            <div className="stat-card">
              <div className="label">Period</div>
              <div className="value">{insight.month}/{insight.year}</div>
            </div>
            <div className="stat-card">
              <div className="label">Total Spent</div>
              <div className="value red">₹{insight.total_spent.toFixed(2)}</div>
            </div>
            <div className="stat-card">
              <div className="label">Budget Limit</div>
              <div className="value green">
                {insight.budget_limit != null ? `₹${insight.budget_limit.toFixed(2)}` : 'Not set'}
              </div>
            </div>
            <div className="stat-card">
              <div className="label">Remaining</div>
              <div className={`value ${insight.remaining != null && insight.remaining < 0 ? 'red' : 'green'}`}>
                {insight.remaining != null ? `₹${insight.remaining.toFixed(2)}` : 'N/A'}
              </div>
            </div>
            <div className="card insights-status-card">
              <span className={`badge ${insight.status.includes('Over') ? 'red' : 'green'}`}>{insight.status}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
