import { useEffect, useState } from "react";
import api from "../api/axios";
import { ROLE_LABELS, ROLE_BADGE_CLASS } from "../lib/roles";

const ASSIGNABLE_ROLES = ["pendiente", "coordinador_sub", "coordinador", "admin"];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [subdivisions, setSubdivisions] = useState([]);
  const [error, setError] = useState("");
  // Mientras se decide la subdivisión, guardamos aquí qué usuarios están
  // "esperando elegir subdivisión" antes de confirmar el cambio a coordinador_sub.
  const [pendingSubRole, setPendingSubRole] = useState({});

  async function load() {
    const [usersRes, subsRes] = await Promise.all([api.get("/users"), api.get("/subdivisions")]);
    setUsers(usersRes.data);
    setSubdivisions(subsRes.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateRole(id, role, subdivision) {
    try {
      setError("");
      await api.put(`/users/${id}/role`, { role, subdivision });
      setPendingSubRole((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      load();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo actualizar el rol.");
    }
  }

  // Al elegir "coordinador_sub" en el primer select, NO mandamos nada todavía:
  // solo marcamos el usuario como "esperando subdivisión" y mostramos el segundo select.
  // El cambio real se guarda cuando se elige la subdivisión (ver el onChange del segundo select).
  function handleRoleChange(u, newRole) {
    if (newRole === "coordinador_sub") {
      setPendingSubRole((prev) => ({ ...prev, [u._id]: true }));
      return;
    }
    setPendingSubRole((prev) => {
      const next = { ...prev };
      delete next[u._id];
      return next;
    });
    updateRole(u._id, newRole, null);
  }

  async function toggleActive(id, active) {
    await api.put(`/users/${id}/active`, { active });
    load();
  }

  return (
    <div>
      <header className="mb-8">
        <p className="text-xs tracking-widest text-gold uppercase mb-1">Administración</p>
        <h1 className="font-display text-2xl text-cream">Usuarios y permisos</h1>
        <p className="text-sm text-muted mt-1">
          Cuando alguien inicia sesión por primera vez con su cuenta de Google queda "pendiente" hasta
          que le asignes un rol aquí.
        </p>
      </header>

      {error && (
        <div className="mb-4 rounded-md border border-bad/30 bg-bad/10 px-4 py-2 text-sm text-bad">
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted border-b border-line">
              <th className="px-5 py-3">Usuario</th>
              <th className="px-5 py-3">Rol</th>
              <th className="px-5 py-3">Subdivisión</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-line last:border-0">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <img src={u.picture} alt={u.name} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                    <div>
                      <p className="text-cream">{u.name}</p>
                      <p className="text-xs text-muted">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <select
                    className="input py-1.5 text-xs"
                    value={pendingSubRole[u._id] ? "coordinador_sub" : u.role}
                    onChange={(e) => handleRoleChange(u, e.target.value)}
                  >
                    {ASSIGNABLE_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3">
                  {u.role === "coordinador_sub" || pendingSubRole[u._id] ? (
                    <select
                      className="input py-1.5 text-xs"
                      value={u.role === "coordinador_sub" ? u.subdivision?._id || "" : ""}
                      onChange={(e) => updateRole(u._id, "coordinador_sub", e.target.value)}
                    >
                      <option value="">Selecciona…</option>
                      {subdivisions.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-muted text-xs">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => toggleActive(u._id, !u.active)}
                    className={`badge cursor-pointer ${
                      u.active ? "bg-ok/10 text-ok border-ok/30" : "bg-bad/10 text-bad border-bad/30"
                    }`}
                  >
                    {u.active ? "Activo" : "Bloqueado"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
