import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Expenses from "./pages/Expenses";
import Categories from "./pages/Categories";
import Budgets from "./pages/Budgets";
import Insights from "./pages/Insights";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Expenses />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/insights" element={<Insights />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
