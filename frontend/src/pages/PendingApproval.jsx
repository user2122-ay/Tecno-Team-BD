import Seal from "../components/Seal";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function PendingApproval() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="card max-w-sm w-full p-8 text-center">
        <div className="flex justify-center mb-5">
          <Seal size={72} />
        </div>
        <h1 className="font-display text-xl text-cream mb-2">Cuenta en revisión</h1>
        <p className="text-sm text-muted mb-1">
          Hola {user?.name?.split(" ")[0]}, tu cuenta de Google ya quedó registrada.
        </p>
        <p className="text-sm text-muted mb-8">
          Un administrador debe asignarte un rol antes de que puedas entrar al panel.
        </p>
        <button onClick={handleLogout} className="btn-outline w-full text-sm">
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
}
