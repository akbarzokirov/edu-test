import { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UsersRound,
  FileText,
  BarChart3,
  Settings as SettingsIcon,
} from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const teacherNavItems = [
  {
    to: "/teacher",
    icon: LayoutDashboard,
    label: "Boshqaruv paneli",
    end: true,
  },
  { to: "/teacher/groups", icon: Users, label: "Mening guruhlarim" },
  { to: "/teacher/students", icon: UsersRound, label: "O'quvchilar" },
  { to: "/teacher/semesters", icon: FileText, label: "Semestrlar" },
  { to: "/teacher/results", icon: BarChart3, label: "Natijalar" },
  { to: "/teacher/settings", icon: SettingsIcon, label: "Sozlamalar" },
];

const TeacherLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen flex bg-canvas">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navItems={teacherNavItems}
        subtitle="O'qituvchi paneli"
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 lg:px-6 py-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default TeacherLayout;
