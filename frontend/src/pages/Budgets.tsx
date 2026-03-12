import { useState, useEffect, type FormEvent } from "react";
import { api } from "../api/api";

interface Budget {
  id: number;
  amount: number;
  month: number;
  year: number;
  category_id: number | null;
  user_id: number;
}

interface Category {
  id: number;
  name: string;
}

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [b, c] = await Promise.all([
        api.get("/budgets/"),
        api.get("/categories/"),
      ]);
      setBudgets(b);
      setCategories(c);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/budgets/", {
        amount: parseFloat(amount),
        month: parseInt(month),
        year: parseInt(year),
        category_id: categoryId ? parseInt(categoryId) : null,
      });
      setAmount("");
      setMonth("");
      setYear("");
      setCategoryId("");
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/budgets/${id}`);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const getCategoryName = (id: number | null) => {
    if (!id) return "Overall";
    return categories.find((c) => c.id === id)?.name || "Unknown";
  };

  return (
    <div>
      <h2>Budgets</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleAdd} className="inline-form">
        <input
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
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
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Overall (no category)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit">Add Budget</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Year</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {budgets.map((b) => (
            <tr key={b.id}>
              <td>{b.month}</td>
              <td>{b.year}</td>
              <td>{b.amount.toFixed(2)}</td>
              <td>{getCategoryName(b.category_id)}</td>
              <td>
                <button onClick={() => handleDelete(b.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
