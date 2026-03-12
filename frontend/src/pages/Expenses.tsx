import { useState, useEffect, type FormEvent } from "react";
import { api } from "../api/api";

interface Expense {
  id: number;
  amount: number;
  description: string | null;
  expense_date: string | null;
  category_id: number | null;
  user_id: number;
}

interface Category {
  id: number;
  name: string;
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [exp, cats] = await Promise.all([
        api.get("/expenses/"),
        api.get("/categories/"),
      ]);
      setExpenses(exp);
      setCategories(cats);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setExpenseDate("");
    setCategoryId("");
    setEditingId(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const body = {
      amount: parseFloat(amount),
      description: description || null,
      expense_date: expenseDate || null,
      category_id: categoryId ? parseInt(categoryId) : null,
    };
    try {
      if (editingId) {
        await api.put(`/expenses/${editingId}`, body);
      } else {
        await api.post("/expenses/", body);
      }
      resetForm();
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const handleEdit = (exp: Expense) => {
    setEditingId(exp.id);
    setAmount(String(exp.amount));
    setDescription(exp.description || "");
    setExpenseDate(exp.expense_date || "");
    setCategoryId(exp.category_id ? String(exp.category_id) : "");
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/expenses/${id}`);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const getCategoryName = (id: number | null) => {
    if (!id) return "—";
    return categories.find((c) => c.id === id)?.name || "Unknown";
  };

  return (
    <div>
      <h2>Expenses</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="inline-form">
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
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="date"
          value={expenseDate}
          onChange={(e) => setExpenseDate(e.target.value)}
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit">{editingId ? "Update" : "Add"}</button>
        {editingId && (
          <button type="button" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Description</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp.id}>
              <td>{exp.expense_date || "—"}</td>
              <td>{exp.amount.toFixed(2)}</td>
              <td>{exp.description || "—"}</td>
              <td>{getCategoryName(exp.category_id)}</td>
              <td>
                <button onClick={() => handleEdit(exp)}>Edit</button>
                <button onClick={() => handleDelete(exp.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
