import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User as UserIcon, Lock, Eye, EyeOff, Sparkles, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error("Login va parolni kiriting");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));

    let role = "ADMIN";
    let fullName = "Admin Foydalanuvchi";
    const u = form.username.toLowerCase();
    if (u.includes("teacher") || u.includes("ustoz")) {
      role = "TEACHER"; fullName = "O'qituvchi";
    } else if (u.includes("student") || u.includes("oquvchi")) {
      role = "STUDENT"; fullName = "O'quvchi";
    }

    login(
      { id: 1, fullName, username: form.username, email: `${form.username}@edutest.uz`, role },
      "mock-jwt-token"
    );
    toast.success(`Xush kelibsiz, ${fullName}!`);
    setLoading(false);

    if (role === "ADMIN") navigate("/admin");
    else if (role === "TEACHER") navigate("/teacher");
    else navigate("/student");
  };

  return (
    <div className="min-h-screen flex bg-canvas">
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 text-white overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 w-[500px] h-[500px] rounded-full bg-brand-400/20 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-lg">EduTest AI</div>
              <div className="text-xs text-white/70">Zamonaviy ta'lim platformasi</div>
            </div>
          </div>
          <div className="max-w-md">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium border border-white/20">
              <Sparkles className="w-3 h-3" /> AI bilan ishlaydigan platforma
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-[1.15] tracking-tight">
              Testlarni avtomatik yarating, natijalarni soniyalarda oling
            </h1>
            <p className="mt-4 text-white/70 leading-relaxed">
              PDF, Word yoki boshqa darsliklardan Groq AI yordamida testlar yarating.
              O'quvchilar va o'qituvchilarni bitta joydan boshqaring.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-md">
            <Stat value="500+" label="O'quvchi" />
            <Stat value="50+" label="O'qituvchi" />
            <Stat value="1K+" label="Test" />
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-10 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-brand-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-ink-900">EduTest AI</div>
              <div className="text-[11px] text-ink-500">Admin Panel</div>
            </div>
          </div>
          <h2 className="text-[28px] font-bold text-ink-900 tracking-tight leading-tight">Xush kelibsiz</h2>
          <p className="mt-2 text-sm text-ink-500">Hisobingizga kirish uchun ma'lumotlaringizni kiriting</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Login</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  className="input-base pl-10" placeholder="login" autoComplete="username"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-ink-700">Parol</label>
                <button type="button" className="text-xs text-brand-600 hover:text-brand-700 font-medium">Unutdingizmi?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="input-base pl-10 pr-10" placeholder="••••••••" autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full h-11 rounded-lg bg-ink-900 text-white font-semibold text-sm hover:bg-ink-700 shadow-soft inline-flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kirish"}
            </button>
            <div className="mt-5 p-3.5 rounded-xl bg-brand-50 border border-brand-100">
              <p className="text-[11px] font-semibold text-brand-700 uppercase tracking-wide">Demo rejimi</p>
              <p className="mt-1 text-xs text-brand-900">
                Istalgan login/parolni kiriting. Login'da "teacher" yoki "student" so'zi bo'lsa tegishli panel ochiladi.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ value, label }) => (
  <div>
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-xs text-white/70 mt-1">{label}</div>
  </div>
);

export default Login;
