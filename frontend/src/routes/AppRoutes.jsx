import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound"

import AdminLayout from "../components/layout/AdminLayout";
import AdminDashboard from "../pages/admin/Dashboard";
import AdminTeachers from "../pages/admin/Teachers";
import AdminStudents from "../pages/admin/Students";

import TeacherLayout from "../components/layout/TeacherLayout";
import TeacherDashboard from "../pages/teacher/Dashboard";
import TeacherGroups from "../pages/teacher/Groups";
import TeacherStudents from "../pages/teacher/Students";
import TeacherSemesters from "../pages/teacher/Semesters";
import TeacherResults from "../pages/teacher/Results";
import TeacherSettings from "../pages/teacher/Settings";

import StudentLayout from "../components/layout/StudentLayout";
import StudentDashboard from "../pages/student/Dashboard";
import StudentSemesters from "../pages/student/Semesters";
import StudentTakeTest from "../pages/student/TakeTest";
import StudentResults from "../pages/student/Results";
import StudentResultDetail from "../pages/student/ResultDetail";
import StudentSettings from "../pages/student/Settings";

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

      {/* ADMIN */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={["ADMIN"]}><AdminLayout /></ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="teachers" element={<AdminTeachers />} />
        <Route path="students" element={<AdminStudents />} />
      </Route>

      {/* TEACHER */}
      <Route path="/teacher" element={
        <ProtectedRoute allowedRoles={["TEACHER"]}><TeacherLayout /></ProtectedRoute>
      }>
        <Route index element={<TeacherDashboard />} />
        <Route path="groups" element={<TeacherGroups />} />
        <Route path="students" element={<TeacherStudents />} />
        <Route path="semesters" element={<TeacherSemesters />} />
        <Route path="results" element={<TeacherResults />} />
        <Route path="settings" element={<TeacherSettings />} />
      </Route>

      {/* STUDENT */}
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={["STUDENT"]}><StudentLayout /></ProtectedRoute>
      }>
        <Route index element={<StudentDashboard />} />
        <Route path="semesters" element={<StudentSemesters />} />
        <Route path="semesters/:id/take" element={<StudentTakeTest />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="results/:id" element={<StudentResultDetail />} />
        <Route path="settings" element={<StudentSettings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
export default AppRoutes;