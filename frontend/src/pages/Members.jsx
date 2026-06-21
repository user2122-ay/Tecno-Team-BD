import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Members() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [subdivisions, setSubdivisions] = useState([]);
  const [filterSub, setFilterSub] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", grade: "", subdivision: "", contact: "" });
  const [editingId, setEditingId] = useState(null);

  async function loadAll() {
    const [membersRes, subsRes] = await Promise.all([
      api.get("/members", { params: filterSub ? { subdivision: filterSub } : {} }),
      api.get("/subdivisions"),
    ]);
    setMembers(membersRes.data);
    setSubdivisions(subsRes.data);
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

  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs tracking-widest text-gold uppercase mb-1">Gestión</p>
          <h1 className="font-display text-2xl text-cream">Miembros</h1>
        </div>
        <button className="btn-gold" onClick={openNew}>
          <Plus size={18} /> Añadir miembro
        </button>
      </header>

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
    </div>
  );
}
