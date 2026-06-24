import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Pencil, Settings, X, BarChart3, Table2 } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Members() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [subdivisions, setSubdivisions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [filterSub, setFilterSub] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", grade: "", subdivision: "", contact: "" });
  const [editingId, setEditingId] = useState(null);
  // "list" = tabla normal de miembros; "summary" = resumen de actividad (tabla + gráfico)
  const [viewMode, setViewMode] = useState("list");
  // Subdivisión elegida dentro del resumen ("" = todas)
  const [summarySub, setSummarySub] = useState("");
  // Miembro abierto en el modal de detalle (engranaje)
  const [selectedMember, setSelectedMember] = useState(null);

  async function loadAll() {
    const [membersRes, subsRes, actsRes] = await Promise.all([
      api.get("/members", { params: filterSub ? { subdivision: filterSub } : {} }),
      api.get("/subdivisions"),
      api.get("/activities"),
    ]);
    setMembers(membersRes.data);
    setSubdivisions(subsRes.data);
    setActivities(actsRes.data);
  }

  useEffect(() => {
    loadAll();
  }, [filterSub]);

  function openNew() {
    setForm({
      name: "",
      grade: "",
      subdivision: user.role === "coordinador_sub" ? user.subdivision : "",
      contact: "",
    });
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(member) {
    setForm({
      name: member.name,
      grade: member.grade,
      subdivision: member.subdivision?._id,
      contact: member.contact,
    });
    setEditingId(member._id);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      await api.put(`/members/${editingId}`, form);
    } else {
      await api.post("/members", form);
    }
    setShowForm(false);
    loadAll();
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar este miembro?")) return;
    await api.delete(`/members/${id}`);
    loadAll();
  }

  // Actividades en las que participó un miembro dado, más recientes primero.
  function activitiesOf(memberId) {
    return activities
      .filter((a) => a.participants?.some((p) => p._id === memberId))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // Resumen para la pestaña "Resumen de actividad": todos los miembros (filtrados por
  // subdivisión si aplica) con su conteo de actividades, ordenado de mayor a menor.
  const summaryRows = useMemo(() => {
    const base = summarySub ? members.filter((m) => m.subdivision?._id === summarySub) : members;
    return base
      .map((m) => ({ id: m._id, name: m.name, subdivision: m.subdivision?.name, count: activitiesOf(m._id).length }))
      .sort((a, b) => b.count - a.count);
  }, [members, activities, summarySub]);

  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs tracking-widest text-gold uppercase mb-1">Gestión</p>
          <h1 className="font-display text-2xl text-cream">Miembros</h1>
        </div>
        {viewMode === "list" && (
          <button className="btn-gold" onClick={openNew}>
            <Plus size={18} /> Añadir miembro
          </button>
        )}
      </header>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <button
          onClick={() => setViewMode("list")}
          className={`badge cursor-pointer ${
            viewMode === "list" ? "bg-gold/10 text-gold border-gold/30" : "border-line text-muted"
          }`}
        >
          Miembros
        </button>
        <button
          onClick={() => setViewMode("summary")}
          className={`badge cursor-pointer ${
            viewMode === "summary" ? "bg-gold/10 text-gold border-gold/30" : "border-line text-muted"
          }`}
        >
          Resumen de actividad
        </button>
      </div>

      {viewMode === "list" && (
        <>
          {user.role !== "coordinador_sub" && (
            <div className="mb-5">
              <select className="input max-w-xs" value={filterSub} onChange={(e) => setFilterSub(e.target.value)}>
                <option value="">Todas las subdivisiones</option>
                {subdivisions.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted border-b border-line">
                  <th className="px-5 py-3">Nombre</th>
                  <th className="px-5 py-3">Grado</th>
                  <th className="px-5 py-3">Subdivisión</th>
                  <th className="px-5 py-3">Contacto</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m._id} className="border-b border-line last:border-0 hover:bg-panel2">
                    <td className="px-5 py-3 text-cream">{m.name}</td>
                    <td className="px-5 py-3 text-muted">{m.grade || "—"}</td>
                    <td className="px-5 py-3">
                      <span className="badge bg-cream/5 text-cream border-line">{m.subdivision?.name}</span>
                    </td>
                    <td className="px-5 py-3 text-muted">{m.contact || "—"}</td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedMember(m)}
                        className="text-muted hover:text-gold mr-3"
                        title="Gestionar miembro"
                      >
                        <Settings size={16} />
                      </button>
                      <button onClick={() => openEdit(m)} className="text-muted hover:text-gold mr-3">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(m._id)} className="text-muted hover:text-bad">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {members.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-muted">
                      No hay miembros registrados todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {viewMode === "summary" && (
        <div>
          <div className="mb-5">
            <select className="input max-w-xs" value={summarySub} onChange={(e) => setSummarySub(e.target.value)}>
              <option value="">Todas las subdivisiones</option>
              {subdivisions.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {summaryRows.length === 0 ? (
            <div className="card p-8 text-center text-muted text-sm">
              No hay miembros para mostrar con este filtro.
            </div>
          ) : (
            <>
              <div className="card p-5 mb-5">
                <p className="text-xs tracking-widest text-gold uppercase mb-3 flex items-center gap-2">
                  <BarChart3 size={14} /> Actividades por miembro
                </p>
                <div className="space-y-2">
                  {summaryRows.map((r) => {
                    const max = summaryRows[0]?.count || 1;
                    const pct = r.count === 0 ? 0 : Math.max((r.count / max) * 100, 4);
                    return (
                      <div key={r.id} className="flex items-center gap-3">
                        <span className="text-xs text-cream w-32 truncate" title={r.name}>
                          {r.name}
                        </span>
                        <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gold rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted font-mono w-6 text-right">{r.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-muted border-b border-line">
                      <th className="px-5 py-3 flex items-center gap-2">
                        <Table2 size={12} /> Miembro
                      </th>
                      <th className="px-5 py-3">Subdivisión</th>
                      <th className="px-5 py-3">Actividades</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryRows.map((r) => (
                      <tr key={r.id} className="border-b border-line last:border-0 hover:bg-panel2">
                        <td className="px-5 py-3 text-cream">{r.name}</td>
                        <td className="px-5 py-3">
                          <span className="badge bg-cream/5 text-cream border-line">{r.subdivision}</span>
                        </td>
                        <td className="px-5 py-3 text-muted font-mono">{r.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50">
          <form onSubmit={handleSubmit} className="card w-full max-w-md p-6">
            <h2 className="font-display text-lg text-cream mb-5">
              {editingId ? "Editar miembro" : "Nuevo miembro"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted block mb-1">Nombre</label>
                <input
                  className="input"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Grado / sección</label>
                <input
                  className="input"
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                  placeholder="ej. 9no A"
                />
              </div>
              {user.role !== "coordinador_sub" && (
                <div>
                  <label className="text-xs text-muted block mb-1">Subdivisión</label>
                  <select
                    className="input"
                    required
                    value={form.subdivision}
                    onChange={(e) => setForm({ ...form, subdivision: e.target.value })}
                  >
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
                <label className="text-xs text-muted block mb-1">Contacto (opcional)</label>
                <input
                  className="input"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" className="btn-outline flex-1" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn-gold flex-1">
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedMember && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50">
          <div className="card w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-xs tracking-widest text-gold uppercase mb-1">Gestionar miembro</p>
                <h2 className="font-display text-lg text-cream">{selectedMember.name}</h2>
              </div>
              <button onClick={() => setSelectedMember(null)} className="text-muted hover:text-cream">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-3 mb-5 text-xs text-muted">
              {selectedMember.grade && (
                <span className="badge bg-white/5 border-line">{selectedMember.grade}</span>
              )}
              <span className="badge bg-cream/5 text-cream border-line">
                {selectedMember.subdivision?.name}
              </span>
              {selectedMember.contact && (
                <span className="badge bg-white/5 border-line">{selectedMember.contact}</span>
              )}
            </div>

            <div className="flex gap-3 mb-5">
              <button
                className="btn-outline flex-1"
                onClick={() => {
                  setSelectedMember(null);
                  openEdit(selectedMember);
                }}
              >
                <Pencil size={14} /> Editar datos
              </button>
              <button
                className="btn-outline flex-1 hover:text-bad"
                onClick={() => {
                  setSelectedMember(null);
                  handleDelete(selectedMember._id);
                }}
              >
                <Trash2 size={14} /> Eliminar
              </button>
            </div>

            <p className="text-xs tracking-widest text-gold uppercase mb-3">
              Actividades registradas ({activitiesOf(selectedMember._id).length})
            </p>
            <div className="space-y-3">
              {activitiesOf(selectedMember._id).length === 0 ? (
                <p className="text-sm text-muted">Este miembro todavía no aparece en ninguna actividad.</p>
              ) : (
                activitiesOf(selectedMember._id).map((a) => (
                  <div key={a._id} className="border border-line rounded-md p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm text-cream">{a.title}</h4>
                      <span className="text-xs text-muted font-mono">
                        {new Date(a.date).toLocaleDateString("es-PA", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <span className="badge bg-gold/10 text-gold border-gold/30 text-xs">
                      {a.subdivision?.name}
                    </span>
                    {a.description && <p className="text-xs text-muted mt-2">{a.description}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
