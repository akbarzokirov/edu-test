import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error("Email va parolni kiriting");
      return;
    }
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: form.username,
        password: form.password,
      });

      const { user, token } = response.data;

      login(user, token);
      toast.success(`Xush kelibsiz, ${user.fullName}!`);

      const role = user.role.toUpperCase();
      if (role === "ADMIN") navigate("/admin");
      else if (role === "TEACHER") navigate("/teacher");
      else navigate("/student");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error.response?.data?.message || "Login yoki parol noto'g'ri",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden bg-gradient-to-br from-brand-50 via-canvas to-brand-100">
      {/* Dekorativ orqa fon shakllar */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-brand-300/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-brand-400/20 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-200/10 blur-3xl" />

      {/* Login kartochkasi */}
      <div className="relative w-full max-w-md">
        {/* Logo va sarlavha */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-brand-glow mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-bold text-xl text-ink-900">EduTest AI</h1>
          <p className="text-xs text-ink-500 mt-1">Admin Panel</p>
        </div>

        {/* Asosiy karta */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 sm:p-10">
          <div className="text-center mb-7">
            <h2 className="text-2xl font-bold text-ink-900 tracking-tight">
              Xush kelibsiz
            </h2>
            <p className="mt-2 text-sm text-ink-500">
              Hisobingizga kirish uchun ma'lumotlaringizni kiriting
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                Login
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  value={form.username}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, username: e.target.value }))
                  }
                  className="w-full h-11 pl-11 pr-4 rounded-xl border border-ink-200 bg-white text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                  placeholder="admin@example.com"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                Parol
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  className="w-full h-11 pl-11 pr-11 rounded-xl border border-ink-200 bg-white text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-2 rounded-xl bg-ink-900 text-white font-semibold text-sm shadow-lg shadow-ink-900/20 inline-flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Kirilmoqda...</span>
                </>
              ) : (
                "Kirish"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-ink-400 mt-6">
          © 2026 EduTest AI. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </div>
  );
};

export default Login;
