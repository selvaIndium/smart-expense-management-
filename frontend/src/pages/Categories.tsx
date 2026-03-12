import { useState, useEffect, type FormEvent } from "react";
import { api } from "../api/api";

interface Category {
  id: number;
  name: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await api.get("/categories/");
      setCategories(data);
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
      await api.post("/categories/", { name });
      setName("");
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/categories/${id}`);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <div>
      <h2>Categories</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleAdd} className="inline-form">
        <input
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit">Add</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>
                <button onClick={() => handleDelete(c.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
