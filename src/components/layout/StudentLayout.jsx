import { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  LayoutDashboard, FileText, BarChart3, Settings as SettingsIcon,
} from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const studentNavItems = [
  { to: "/student",           icon: LayoutDashboard, label: "Boshqaruv paneli", end: true },
  { to: "/student/semesters", icon: FileText,        label: "Mening testlarim" },
  { to: "/student/results",   icon: BarChart3,       label: "Natijalar" },
  { to: "/student/settings",  icon: SettingsIcon,    label: "Sozlamalar" },
];

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen flex bg-canvas">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navItems={studentNavItems}
        subtitle="O'quvchi paneli"
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
export default StudentLayout;