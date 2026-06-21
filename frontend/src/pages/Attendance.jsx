import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function nextOrTodaySaturday() {
  const d = new Date();
  const day = d.getDay(); // 0=domingo ... 6=sábado
  const diff = (6 - day + 7) % 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export default function Attendance() {
  const { user } = useAuth();
  const [subdivisions, setSubdivisions] = useState([]);
  const [subdivision, setSubdivision] = useState(user.role === "coordinador_sub" ? user.subdivision : "");
  const [date, setDate] = useState(nextOrTodaySaturday());
  const [members, setMembers] = useState([]);
  const [presence, setPresence] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user.role !== "coordinador_sub") {
      api.get("/subdivisions").then((res) => setSubdivisions(res.data));
    }
  }, []);

  useEffect(() => {
    if (!subdivision) return;
    api.get("/members", { params: { subdivision } }).then((res) => {
      setMembers(res.data);
      const initial = {};
      res.data.forEach((m) => (initial[m._id] = true));
      setPresence(initial);
    });
  }, [subdivision]);

  function toggle(memberId) {
    setPresence((p) => ({ ...p, [memberId]: !p[memberId] }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    const records = members.map((m) => ({ member: m._id, present: !!presence[m._id] }));
    await api.post("/attendance", { subdivision, date, records });
    setSaving(false);
    setSaved(true);
  }

  return (
    <div>
      <header className="mb-8">
        <p className="text-xs tracking-widest text-gold uppercase mb-1">Registro</p>
        <h1 className="font-display text-2xl text-cream">Asistencia de los sábados</h1>
      </header>

      <div className="card p-5 mb-6 flex flex-wrap gap-4 items-end">
        {user.role !== "coordinador_sub" && (
          <div>
            <label className="text-xs text-muted block mb-1">Subdivisión</label>
            <select className="input" value={subdivision} onChange={(e) => setSubdivision(e.target.value)}>
              <option value="">Selecciona…</option>
              {subdivisions.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="text-xs text-muted block mb-1">Sábado</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      {subdivision && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted border-b border-line">
                <th className="px-5 py-3">Miembro</th>
                <th className="px-5 py-3">Grado</th>
                <th className="px-5 py-3 text-right">Presente</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m._id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 text-cream">{m.name}</td>
                  <td className="px-5 py-3 text-muted">{m.grade || "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => toggle(m._id)}
                      className={`badge cursor-pointer select-none ${
                        presence[m._id]
                          ? "bg-ok/15 text-ok border-ok/40"
                          : "bg-bad/15 text-bad border-bad/40"
                      }`}
                    >
                      {presence[m._id] ? "Presente" : "Ausente"}
                    </button>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-muted">
                    Esta subdivisión todavía no tiene miembros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {subdivision && members.length > 0 && (
        <div className="mt-5 flex items-center gap-3">
          <button className="btn-gold" onClick={handleSave} disabled={saving}>
            <CalendarCheck size={18} /> {saving ? "Guardando…" : "Guardar asistencia"}
          </button>
          {saved && <span className="text-sm text-ok">Asistencia guardada ✓</span>}
        </div>
      )}
    </div>
  );
}
