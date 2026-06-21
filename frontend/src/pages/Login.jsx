import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Seal from "../components/Seal";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const { loginWithGoogle, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate(user.role === "pendiente" ? "/esperando-aprobacion" : "/");
      return;
    }

    function init() {
      if (!window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          const loggedUser = await loginWithGoogle(response.credential);
          navigate(loggedUser.role === "pendiente" ? "/esperando-aprobacion" : "/");
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "filled_black",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: 280,
      });
    }

    if (window.google) init();
    else window.addEventListener("load", init);
    return () => window.removeEventListener("load", init);
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="card relative overflow-hidden p-8 text-center">
          <div className="absolute inset-x-0 top-0 gold-rule" />
          <div className="flex justify-center mb-5">
            <Seal size={88} />
          </div>
          <p className="text-xs tracking-[0.3em] text-gold uppercase mb-1">Credencial oficial</p>
          <h1 className="font-display text-2xl text-cream mb-1">Tecno Team CTG</h1>
          <p className="text-sm text-muted mb-8">
            Control de miembros, asistencia y actividades del equipo de redes del colegio
          </p>

          <div className="flex justify-center" ref={buttonRef} />

          <p className="text-xs text-muted mt-8">
            Acceso exclusivo para coordinadores y administradores autorizados
          </p>
          <div className="absolute inset-x-0 bottom-0 gold-rule" />
        </div>
      </div>
    </div>
  );
}
