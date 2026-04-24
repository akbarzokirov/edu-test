import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, GraduationCap, UsersRound, BookOpen,
  FileText, Sparkles, X,
} from "lucide-react";
import { cn } from "../../utils/helpers";

const navItems = [
  { to: "/admin",           icon: LayoutDashboard, label: "Boshqaruv paneli", end: true },
  { to: "/admin/teachers",  icon: GraduationCap,   label: "O'qituvchilar" },
  { to: "/admin/students",  icon: UsersRound,      label: "O'quvchilar" },
];

const Sidebar = ({ open, onClose }) => (
  <>
    {open && <div className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in" onClick={onClose} />}
    <aside className={cn(
      "fixed top-0 left-0 z-50 h-screen w-72 bg-white border-r border-ink-100",
      "transform transition-transform duration-300 ease-out",
      "lg:translate-x-0 lg:static lg:z-auto",
      open ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-5 h-16 border-b border-ink-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-brand-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-ink-900 text-[15px]">EduTest</div>
              <div className="text-[11px] text-ink-500 font-medium">AI Admin Panel</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-ink-500 hover:bg-ink-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-ink-400 uppercase tracking-wider">Asosiy</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to} to={item.to} end={item.end} onClick={onClose}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive ? "bg-ink-900 text-white shadow-soft" : "text-ink-700 hover:bg-ink-100"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("w-[18px] h-[18px]", !isActive && "text-ink-500 group-hover:text-ink-700")} />
                  <span>{item.label}</span>
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 pb-5">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/20 text-[11px] font-semibold backdrop-blur-sm">
                <Sparkles className="w-3 h-3" /> AI Powered
              </div>
              <h4 className="mt-3 font-semibold text-[15px] leading-tight">Testlarni avtomatik yarating</h4>
              <p className="mt-1 text-xs text-white/80 leading-relaxed">Groq AI yordamida istalgan darslikdan test tuzing.</p>
            </div>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -right-2 -top-2 w-16 h-16 rounded-full bg-white/10 blur-xl" />
          </div>
        </div>
      </div>
    </aside>
  </>
);
export default Sidebar;
