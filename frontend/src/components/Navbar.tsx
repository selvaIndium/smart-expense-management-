import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/">Expenses</Link>
      <Link to="/categories">Categories</Link>
      <Link to="/budgets">Budgets</Link>
      <Link to="/insights">Insights</Link>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}
