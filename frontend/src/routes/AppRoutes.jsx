import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import AdminLayout from "../components/layout/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import Teachers from "../pages/admin/Teachers";
import Students from "../pages/admin/Students";

const AppRoutes = () => {
  const { user } = useAuth();
  const homeRoute = () => {
    if (!user) return "/login";
    if (user.role === "ADMIN") return "/admin";
    if (user.role === "TEACHER") return "/teacher";
    if (user.role === "STUDENT") return "/student";
    return "/login";
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to={homeRoute()} replace />} />
      <Route path="/login" element={user ? <Navigate to={homeRoute()} replace /> : <Login />} />
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={["ADMIN"]}><AdminLayout /></ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="students" element={<Students />} />
      </Route>
      <Route path="/teacher" element={
        <ProtectedRoute allowedRoles={["TEACHER"]}>
          <div className="min-h-screen flex items-center justify-center p-6 text-center">
            <div>
              <p className="text-lg font-semibold">Teacher Panel</p>
              <p className="text-ink-500 mt-2">Keyingi bosqichda tayyorlanadi</p>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={["STUDENT"]}>
          <div className="min-h-screen flex items-center justify-center p-6 text-center">
            <div>
              <p className="text-lg font-semibold">Student Panel</p>
              <p className="text-ink-500 mt-2">Keyingi bosqichda tayyorlanadi</p>
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
export default AppRoutes;
