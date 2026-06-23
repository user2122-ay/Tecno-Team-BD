import { useEffect, useState } from "react";
import { Plus, Trash2, Link as LinkIcon } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Activities() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [subdivisions, setSubdivisions] = useState([]);
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    subdivision: user.role === "coordinador_sub" ? user.subdivision : "",
    title: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    mediaUrls: "",
    participants: [],
  });

  // Carga los miembros disponibles para la subdivisión elegida en el formulario.
  async function loadMembers(subdivisionId) {
    if (!subdivisionId) {
      setMembers([]);
      return;
    }
    const res = await api.get("/members", { params: { subdivision: subdivisionId } });
    setMembers(res.data);
  }

  function toggleParticipant(memberId) {
    setForm((f) => {
      const isSelected = f.participants.includes(memberId);
      return {
        ...f,
        participants: isSelected
          ? f.participants.filter((id) => id !== memberId)
          : [...f.participants, memberId],
      };
    });
  }

  async function loadAll() {
    const [actRes, subRes] = await Promise.all([
      api.get("/activities"),
      user.role !== "coordinador_sub" ? api.get("/subdivisions") : Promise.resolve({ data: [] }),
    ]);
    setActivities(actRes.data);
    setSubdivisions(subRes.data);
  }

  useEffect(() => {
    loadAll();
    if (user.role === "coordinador_sub") {
      loadMembers(user.subdivision);
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      mediaUrls: form.mediaUrls
        ? form.mediaUrls.split(",").map((u) => u.trim()).filter(Boolean)
        : [],
    };
    await api.post("/activities", payload);
    setShowForm(false);
    setForm({ ...form, title: "", description: "", mediaUrls: "", participants: [] });
    loadAll();
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar esta actividad?")) return;
    await api.delete(`/activities/${id}`);
    loadAll();
  }

  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs tracking-widest text-gold uppercase mb-1">Bitácora</p>
          <h1 className="font-display text-2xl text-cream">Actividades</h1>
        </div>
        <button className="btn-gold" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Registrar actividad
        </button>
      </header>

      <div className="space-y-4">
        {activities.map((a) => (
          <div key={a._id} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="badge bg-gold/10 text-gold border-gold/30 mb-2">{a.subdivision?.name}</span>
                <h3 className="font-display text-lg text-cream">{a.title}</h3>
                <p className="text-xs text-muted font-mono mb-2">
                  {new Date(a.date).toLocaleDateString("es-PA", { weekday: "long", day: "numeric", month: "long" })}
                </p>
                {a.description && <p className="text-sm text-muted mb-2">{a.description}</p>}
                {a.participants?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {a.participants.map((p) => (
                      <span key={p._id} className="badge bg-white/5 text-muted border-line text-xs">
                        {p.name}
                      </span>
                    ))}
                  </div>
                )}
                {a.mediaUrls?.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {a.mediaUrls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-gold hover:text-gold-light flex items-center gap-1"
                      >
                        <LinkIcon size={12} /> Evidencia {i + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => handleDelete(a._id)} className="text-muted hover:text-bad">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="card p-8 text-center text-muted text-sm">
            Todavía no hay actividades registradas.
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50">
          <form onSubmit={handleSubmit} className="card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-lg text-cream mb-5">Nueva actividad</h2>
            <div className="space-y-4">
              {user.role !== "coordinador_sub" && (
                <div>
                  <label className="text-xs text-muted block mb-1">Subdivisión</label>
                  <select
                    className="input"
                    required
                    value={form.subdivision}
                    onChange={(e) => {
                      const subdivision = e.target.value;
                      setForm({ ...form, subdivision, participants: [] });
                      loadMembers(subdivision);
                    }}
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
                <label className="text-xs text-muted block mb-1">Título</label>
                <input
                  className="input"
                  required
                  placeholder="ej. Fotos del acto cívico"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Fecha</label>
                <input
                  type="date"
                  className="input"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Descripción (opcional)</label>
                <textarea
                  className="input"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">
                  Participantes {form.participants.length > 0 && `(${form.participants.length} seleccionados)`}
                </label>
                {!form.subdivision ? (
                  <p className="text-xs text-muted italic">
                    Selecciona una subdivisión para ver sus miembros.
                  </p>
                ) : members.length === 0 ? (
                  <p className="text-xs text-muted italic">No hay miembros registrados en esta subdivisión.</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto border border-line rounded-md p-2 space-y-1">
                    {members.map((m) => (
                      <label
                        key={m._id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={form.participants.includes(m._id)}
                          onChange={() => toggleParticipant(m._id)}
                        />
                        <span className="text-cream">{m.name}</span>
                        {m.grade && <span className="text-xs text-muted">— {m.grade}</span>}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">
                  Enlaces a fotos/videos (separados por coma)
                </label>
                <input
                  className="input"
                  placeholder="https://drive.google.com/..."
                  value={form.mediaUrls}
                  onChange={(e) => setForm({ ...form, mediaUrls: e.target.value })}
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
