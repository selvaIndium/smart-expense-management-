import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { token } = useAuth();
  const storedToken = localStorage.getItem("token");
  if (!token && !storedToken) return <Navigate to="/login" replace />;
  return <Outlet />;
}
