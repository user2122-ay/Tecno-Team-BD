import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  ClipboardList,
  ShieldCheck,
  LogOut,
  Layers,
} from "lucide-react";
import Seal from "./Seal";
import { useAuth } from "../context/AuthContext";
import { ROLE_LABELS, ROLE_BADGE_CLASS } from "../lib/roles";

const NAV = [
  { to: "/", label: "Panel", icon: LayoutDashboard, roles: ["admin", "coordinador", "coordinador_sub"] },
  { to: "/miembros", label: "Miembros", icon: Users, roles: ["admin", "coordinador", "coordinador_sub"] },
  { to: "/asistencia", label: "Asistencia", icon: CalendarCheck, roles: ["admin", "coordinador", "coordinador_sub"] },
  { to: "/actividades", label: "Actividades", icon: ClipboardList, roles: ["admin", "coordinador", "coordinador_sub"] },
  { to: "/subdivisiones", label: "Subdivisiones", icon: Layers, roles: ["admin", "coordinador"] },
  { to: "/usuarios", label: "Usuarios y permisos", icon: ShieldCheck, roles: ["admin"] },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const items = NAV.filter((item) => item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-line bg-panel flex flex-col">
        <div className="flex items-center gap-3 px-5 py-6">
          <Seal size={40} withGlow={false} />
          <div>
            <p className="font-display text-lg leading-tight text-cream">Tecno Team</p>
            <p className="text-xs tracking-widest text-gold uppercase">CTG</p>
          </div>
        </div>

        <div className="gold-rule mx-5" />

        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-gold/10 text-gold border border-gold/30"
                    : "text-muted hover:text-cream hover:bg-panel2 border border-transparent"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="gold-rule mx-5" />

        <div className="px-5 py-4">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user.picture}
              alt={user.name}
              className="w-9 h-9 rounded-full border border-line"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <p className="text-sm text-cream truncate">{user.name}</p>
              <span className={`badge ${ROLE_BADGE_CLASS[user.role]}`}>{ROLE_LABELS[user.role]}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-outline w-full text-sm">
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
