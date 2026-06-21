import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted">Cargando…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "pendiente") return <Navigate to="/esperando-aprobacion" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
