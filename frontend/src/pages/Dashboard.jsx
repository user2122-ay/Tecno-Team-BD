import { useEffect, useState } from "react";
import { Users, Layers, CalendarCheck, ClipboardList } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-widest text-muted">{label}</span>
        <Icon size={18} className="text-gold" />
      </div>
      <p className="font-display text-3xl text-cream">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ members: 0, subdivisions: 0, activities: 0, attendanceToday: 0 });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    async function load() {
      const [membersRes, subsRes, activitiesRes] = await Promise.all([
        api.get("/members"),
        user.role !== "coordinador_sub" ? api.get("/subdivisions") : Promise.resolve({ data: [] }),
        api.get("/activities"),
      ]);
      setStats({
        members: membersRes.data.length,
        subdivisions: subsRes.data.length,
        activities: activitiesRes.data.length,
        attendanceToday: 0,
      });
      setRecentActivities(activitiesRes.data.slice(0, 5));
    }
    load();
  }, []);

  return (
    <div>
      <header className="mb-8">
        <p className="text-xs tracking-widest text-gold uppercase mb-1">Panel general</p>
        <h1 className="font-display text-2xl text-cream">Bienvenido, {user.name.split(" ")[0]}</h1>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard icon={Users} label="Miembros" value={stats.members} />
        {user.role !== "coordinador_sub" && (
          <StatCard icon={Layers} label="Subdivisiones" value={stats.subdivisions} />
        )}
        <StatCard icon={ClipboardList} label="Actividades" value={stats.activities} />
        <StatCard icon={CalendarCheck} label="Sábados activos" value="—" />
      </div>

      <section className="card p-6">
        <h2 className="font-display text-lg text-cream mb-4">Actividad reciente</h2>
        {recentActivities.length === 0 ? (
          <p className="text-sm text-muted">Todavía no se ha registrado ninguna actividad.</p>
        ) : (
          <ul className="space-y-3">
            {recentActivities.map((a) => (
              <li key={a._id} className="flex items-start justify-between border-b border-line pb-3 last:border-0">
                <div>
                  <p className="text-sm text-cream">{a.title}</p>
                  <p className="text-xs text-muted">{a.subdivision?.name}</p>
                </div>
                <span className="text-xs text-muted font-mono">
                  {new Date(a.date).toLocaleDateString("es-PA")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
