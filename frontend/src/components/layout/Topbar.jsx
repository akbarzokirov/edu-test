import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, Bell, ChevronDown, LogOut, User as UserIcon, Settings } from "lucide-react";
import toast from "react-hot-toast";
import Avatar from "../ui/Avatar";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../utils/helpers";

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const notifRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Tizimdan chiqdingiz");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-canvas/80 backdrop-blur-xl border-b border-ink-100">
      <div className="h-16 px-4 lg:px-6 flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 rounded-lg text-ink-700 hover:bg-ink-100">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            <input placeholder="Qidirish..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-ink-200 text-sm placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none transition-colors" />
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div ref={notifRef} className="relative">
            <button onClick={() => setNotifOpen(v => !v)} className="relative p-2 rounded-xl text-ink-700 hover:bg-ink-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger-500 ring-2 ring-canvas" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-pop border border-ink-100 overflow-hidden animate-slide-up">
                <div className="px-4 py-3 border-b border-ink-100 flex items-center justify-between">
                  <div className="font-semibold text-sm">Bildirishnomalar</div>
                  <button className="text-xs text-brand-600 hover:text-brand-700 font-medium">Hammasini o'qildi</button>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-ink-100">
                  {[
                    { title: "Yangi o'qituvchi qo'shildi", desc: "Jasur Abdullayev — Tarix", time: "15 daqiqa oldin" },
                    { title: "Semestr boshlandi", desc: "Algebra asoslari — 11-A", time: "2 soat oldin" },
                    { title: "Test yakunlandi", desc: "24 o'quvchi topshirdi", time: "5 soat oldin" },
                  ].map((n, i) => (
                    <div key={i} className="px-4 py-3 hover:bg-ink-50 cursor-pointer">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-ink-900">{n.title}</p>
                          <p className="text-xs text-ink-500 mt-0.5 truncate">{n.desc}</p>
                          <p className="text-[11px] text-ink-400 mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className={cn("flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-ink-100 transition-colors", menuOpen && "bg-ink-100")}
            >
              <Avatar name={user?.fullName || "Admin"} size="sm" />
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-sm font-semibold text-ink-900">{user?.fullName || "Admin"}</div>
                <div className="text-[11px] text-ink-500">Administrator</div>
              </div>
              <ChevronDown className="w-4 h-4 text-ink-500" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-pop border border-ink-100 overflow-hidden animate-slide-up">
                <div className="px-3 py-3 border-b border-ink-100">
                  <div className="text-sm font-semibold">{user?.fullName || "Admin"}</div>
                  <div className="text-xs text-ink-500 truncate">{user?.email || "admin@edutest.uz"}</div>
                </div>
                <div className="p-1.5">
                  
                  
                </div>
                <div className="p-1.5 border-t border-ink-100">
                  <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-danger-600 hover:bg-danger-50">
                    <LogOut className="w-4 h-4" /> Chiqish
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Topbar;
