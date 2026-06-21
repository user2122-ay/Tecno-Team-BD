import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const ICONS = ["Camera", "Newspaper", "Video", "PenTool", "Music", "Code", "Sparkles"];
const COLORS = ["#C9A227", "#8C6E16", "#4C9A6B", "#5A7DA6", "#A65A8A", "#C2503D"];

export default function Subdivisions() {
  const { user } = useAuth();
  const [subdivisions, setSubdivisions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", icon: ICONS[0], color: COLORS[0] });

  async function load() {
    const { data } = await api.get("/subdivisions");
    setSubdivisions(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    await api.post("/subdivisions", form);
    setShowForm(false);
    setForm({ name: "", description: "", icon: ICONS[0], color: COLORS[0] });
    load();
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar esta subdivisión? Esto no borra a sus miembros, pero quedarán sin grupo.")) return;
    await api.delete(`/subdivisions/${id}`);
    load();
  }

  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs tracking-widest text-gold uppercase mb-1">Estructura</p>
          <h1 className="font-display text-2xl text-cream">Subdivisiones</h1>
        </div>
        <button className="btn-gold" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Nueva subdivisión
        </button>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subdivisions.map((s) => (
          <div key={s._id} className="card p-5">
            <div className="flex items-start justify-between mb-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full mt-1.5"
                style={{ backgroundColor: s.color }}
              />
              {user.role === "admin" && (
                <button onClick={() => handleDelete(s._id)} className="text-muted hover:text-bad">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <h3 className="font-display text-lg text-cream mb-1">{s.name}</h3>
            <p className="text-sm text-muted">{s.description || "Sin descripción"}</p>
          </div>
        ))}
        {subdivisions.length === 0 && (
          <div className="card p-8 text-center text-muted text-sm sm:col-span-2 lg:col-span-3">
            Todavía no hay subdivisiones creadas.
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50">
          <form onSubmit={handleSubmit} className="card w-full max-w-md p-6">
            <h2 className="font-display text-lg text-cream mb-5">Nueva subdivisión</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted block mb-1">Nombre</label>
                <input
                  className="input"
                  required
                  placeholder="ej. Fotografía"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Descripción (opcional)</label>
                <input
                  className="input"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Color</label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setForm({ ...form, color: c })}
                      className={`w-7 h-7 rounded-full border-2 ${
                        form.color === c ? "border-cream" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" className="btn-outline flex-1" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn-gold flex-1">
                Crear
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
