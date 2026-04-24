import { useEffect, useState } from "react";
import {
  Users,
  UsersRound,
  FileText,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowUpRight,
  FilePlus,
  BookOpenCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Link } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import { SkeletonCard } from "../../components/ui/Skeleton";
import {
  mockTeacherStats,
  mockTeacherChart,
  mockTeacherSemesters,
  mockTeacherActivity,
} from "../../utils/mockData";
import { timeAgo, cn } from "../../utils/helpers";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setStats(mockTeacherStats);
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const cards = [
    {
      key: "myGroups",
      label: "Mening guruhlarim",
      value: stats?.myGroups,
      change: stats?.groupsChange,
      icon: Users,
      accent: "from-brand-500 to-brand-700",
      to: "/teacher/groups",
    },
    {
      key: "myStudents",
      label: "O'quvchilar",
      value: stats?.myStudents,
      change: stats?.studentsChange,
      icon: UsersRound,
      accent: "from-emerald-500 to-emerald-700",
      to: "/teacher/students",
    },
    {
      key: "semesters",
      label: "Faol semestrlar",
      value: stats?.activeSemesters,
      change: stats?.semestersChange,
      icon: FileText,
      accent: "from-amber-500 to-amber-700",
      to: "/teacher/semesters",
    },
    {
      key: "tests",
      label: "Yakunlangan testlar",
      value: stats?.completedTests,
      change: stats?.scoreChange,
      icon: BookOpenCheck,
      accent: "from-violet-500 to-violet-700",
      to: "/teacher/results",
    },
  ];

  const firstName = (user?.fullName || "O'qituvchi").split(" ")[0];
  const upcoming = mockTeacherSemesters
    .filter((s) => s.status === "active")
    .slice(0, 3);

  return (
    <div>
      <PageHeader
        title={`Salom, ${firstName} 👋`}
        description="Bugun nima qilamiz?"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : cards.map((c) => {
              const { key, ...rest } = c;
              return <StatCard key={key} {...rest} />;
            })}
      </div>

      <Link to="/teacher/semesters" className="group block mb-6">
        <Card className="bg-gradient-to-br from-brand-600 to-brand-800 text-white border-0 overflow-hidden relative">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg">
                AI bilan yangi semestr yarating
              </h3>
              <p className="text-sm text-white/80 mt-1">
                PDF yoki Word yuklang — Groq AI avtomatik test yaratadi
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-brand-700 font-semibold text-sm self-start sm:self-auto group-hover:bg-brand-50 transition-colors">
              <FilePlus className="w-4 h-4" /> Boshlash
            </div>
          </div>
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-1/3 -bottom-16 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
        </Card>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2" padded={false}>
          <div className="p-5 pb-0 flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-ink-900">
                Test topshiruvchilar dinamikasi
              </h3>
              <p className="text-xs text-ink-500 mt-0.5">So'nggi 8 oy</p>
            </div>
            <div className="flex items-center gap-4">
              <LegendDot color="#4F46E5" label="Topshiruvchilar" />
              <LegendDot color="#10B981" label="O'rtacha ball" />
            </div>
          </div>
          <div className="h-72 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTeacherChart}>
                <defs>
                  <linearGradient id="sub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="score" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F1F5F9"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0F172A",
                    border: "none",
                    borderRadius: 12,
                    color: "#fff",
                    fontSize: 12,
                    padding: "8px 12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="submissions"
                  stroke="#4F46E5"
                  strokeWidth={2.5}
                  fill="url(#sub)"
                />
                <Area
                  type="monotone"
                  dataKey="avgScore"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fill="url(#score)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card padded={false}>
          <div className="p-5 pb-3">
            <h3 className="font-semibold text-ink-900">
              Tez-tez kelayotgan deadline'lar
            </h3>
            <p className="text-xs text-ink-500 mt-0.5">Faol semestrlar</p>
          </div>
          <div className="divide-y divide-ink-100">
            {upcoming.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-ink-500">
                Faol semestrlar yo'q
              </div>
            ) : (
              upcoming.map((s) => {
                const daysLeft = Math.ceil(
                  (new Date(s.deadline) - Date.now()) / 86400000,
                );
                const urgency =
                  daysLeft <= 3 ? "danger" : daysLeft <= 7 ? "warning" : "ok";
                return (
                  <div
                    key={s.id}
                    className="px-5 py-3.5 hover:bg-ink-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                          urgency === "danger"
                            ? "bg-danger-50 text-danger-600"
                            : urgency === "warning"
                              ? "bg-warning-50 text-warning-600"
                              : "bg-brand-50 text-brand-600",
                        )}
                      >
                        {urgency === "danger" ? (
                          <AlertCircle className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink-900 truncate">
                          {s.name}
                        </p>
                        <p className="text-xs text-ink-500 mt-0.5">
                          {daysLeft > 0
                            ? `${daysLeft} kun qoldi`
                            : "Muddati o'tdi"}
                        </p>
                      </div>
                      <div className="text-xs font-semibold text-ink-700">
                        {s.submitted}/{s.total}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      <Card padded={false}>
        <div className="flex items-center justify-between p-5 pb-3">
          <h3 className="font-semibold text-ink-900">So'nggi faoliyat</h3>
          <Link
            to="/teacher/results"
            className="text-xs text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1"
          >
            Barcha natijalar <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-ink-100">
          {mockTeacherActivity.map((a) => (
            <ActivityRow key={a.id} item={a} />
          ))}
        </div>
      </Card>
    </div>
  );
};

const StatCard = ({ label, value, change, icon: Icon, accent, to }) => (
  <Link to={to} className="group block">
    <Card className="hover:shadow-pop hover:border-ink-300 transition-all">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-soft",
            accent,
          )}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change != null && change !== 0 && (
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
              change >= 0
                ? "bg-success-50 text-success-700"
                : "bg-danger-50 text-danger-700",
            )}
          >
            {change >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {change >= 0 ? "+" : ""}
            {change}%
          </div>
        )}
      </div>
      <div className="mt-5">
        <div className="text-3xl font-bold text-ink-900 tracking-tight">
          {value?.toLocaleString() ?? 0}
        </div>
        <div className="text-sm text-ink-500 mt-1 flex items-center justify-between">
          {label}
          <ArrowUpRight className="w-4 h-4 text-ink-400 group-hover:text-ink-700 transition-colors" />
        </div>
      </div>
    </Card>
  </Link>
);

const LegendDot = ({ color, label }) => (
  <div className="flex items-center gap-1.5 text-xs text-ink-700">
    <span className="w-2 h-2 rounded-full" style={{ background: color }} />
    {label}
  </div>
);

const actStyles = {
  test_submitted: {
    bg: "bg-success-50",
    color: "text-success-600",
    Icon: CheckCircle2,
  },
  ai_generated: { bg: "bg-brand-50", color: "text-brand-600", Icon: Sparkles },
  semester_created: {
    bg: "bg-violet-50",
    color: "text-violet-600",
    Icon: FilePlus,
  },
  deadline_warning: {
    bg: "bg-warning-50",
    color: "text-warning-600",
    Icon: Clock,
  },
};

const ActivityRow = ({ item }) => {
  const s = actStyles[item.type] || actStyles.test_submitted;
  return (
    <div className="flex items-start gap-3 px-5 py-3.5 hover:bg-ink-50/50 transition-colors">
      <div
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
          s.bg,
        )}
      >
        <s.Icon className={cn("w-4 h-4", s.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-900">{item.title}</p>
        <p className="text-xs text-ink-500 mt-0.5 truncate">
          {item.description}
        </p>
      </div>
      <div className="text-xs text-ink-400 whitespace-nowrap">
        {timeAgo(item.timestamp)}
      </div>
    </div>
  );
};

export default Dashboard;
