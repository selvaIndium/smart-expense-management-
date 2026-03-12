import { useState, type FormEvent } from "react";
import { api } from "../api/api";

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
    <div>
      <h2>Monthly Insights</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleFetch} className="inline-form">
        <input
          type="number"
          min="1"
          max="12"
          placeholder="Month (1-12)"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          required
        />
        <input
          type="number"
          min="2000"
          max="2100"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
        />
        <button type="submit">Get Insight</button>
      </form>
      {insight && (
        <div className="insight-card">
          <h3>
            {insight.month}/{insight.year}
          </h3>
          <p>
            Total Spent: <strong>${insight.total_spent.toFixed(2)}</strong>
          </p>
          <p>
            Budget Limit:{" "}
            <strong>
              {insight.budget_limit != null
                ? `$${insight.budget_limit.toFixed(2)}`
                : "Not set"}
            </strong>
          </p>
          <p>
            Remaining:{" "}
            <strong>
              {insight.remaining != null
                ? `$${insight.remaining.toFixed(2)}`
                : "N/A"}
            </strong>
          </p>
          <p
            className={`status ${insight.status.includes("Over") ? "over" : "under"}`}
          >
            {insight.status}
          </p>
        </div>
      )}
    </div>
  );
}
