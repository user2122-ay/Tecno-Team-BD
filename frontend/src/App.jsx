import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import PendingApproval from "./pages/PendingApproval";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Attendance from "./pages/Attendance";
import Activities from "./pages/Activities";
import Subdivisions from "./pages/Subdivisions";
import AdminUsers from "./pages/AdminUsers";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

function Page({ children, roles }) {
  return (
    <ProtectedRoute roles={roles}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/esperando-aprobacion" element={<PendingApproval />} />

      <Route path="/" element={<Page><Dashboard /></Page>} />
      <Route path="/miembros" element={<Page><Members /></Page>} />
      <Route path="/asistencia" element={<Page><Attendance /></Page>} />
      <Route path="/actividades" element={<Page><Activities /></Page>} />
      <Route
        path="/subdivisiones"
        element={
          <Page roles={["admin", "coordinador"]}>
            <Subdivisions />
          </Page>
        }
      />
      <Route
        path="/usuarios"
        element={
          <Page roles={["admin"]}>
            <AdminUsers />
          </Page>
        }
      />
    </Routes>
  );
}
