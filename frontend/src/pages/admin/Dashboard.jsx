import { useEffect, useState } from "react";
import {
  GraduationCap, UsersRound, BookOpen, FileText,
  TrendingUp, TrendingDown, Plus, ArrowUpRight,
  UserPlus, BookOpenCheck, Users, Sparkles,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Area, AreaChart,
} from "recharts";
import { Link } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Avatar from "../../components/ui/Avatar";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { mockStats, mockChartData, mockWeekly, mockRecentActivity } from "../../utils/mockData";
import { timeAgo, cn } from "../../utils/helpers";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const cards = [
    { key: "teachers", label: "O'qituvchilar", value: stats?.teachers, change: stats?.teachersChange, icon: GraduationCap, accent: "from-brand-500 to-brand-700", to: "/admin/teachers" },
    { key: "students", label: "O'quvchilar",   value: stats?.students, change: stats?.studentsChange, icon: UsersRound,    accent: "from-emerald-500 to-emerald-700", to: "/admin/students" },
    { key: "groups",   label: "Guruhlar",      value: stats?.groups,   change: null,                  icon: BookOpen,      accent: "from-amber-500 to-amber-700",     to: "/admin/groups" },
    { key: "semesters", label: "Faol semestrlar", value: stats?.activeSemesters, change: stats?.semestersChange, icon: FileText, accent: "from-violet-500 to-violet-700", to: "/admin/semesters" },
  ];

  return (
    <div>
      <PageHeader
        title="Salom, Admin 👋"
        description="Platformadagi so'nggi faoliyat va statistika"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : cards.map((c) => <StatCard key={c.key} {...c} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2" padded={false}>
          <div className="p-5 pb-0 flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-ink-900">Faollik dinamikasi</h3>
              <p className="text-xs text-ink-500 mt-0.5">So'nggi 8 oy</p>
            </div>
            <div className="flex items-center gap-4">
              <LegendDot color="#4F46E5" label="Testlar" />
              <LegendDot color="#10B981" label="O'quvchilar" />
            </div>
          </div>
          <div className="h-72 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="tests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="students" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
                <Tooltip
                  contentStyle={{
                    background: "#0F172A", border: "none", borderRadius: 12, color: "#fff",
                    fontSize: 12, padding: "8px 12px", boxShadow: "0 10px 40px -12px rgba(15,23,42,0.4)",
                  }}
                />
                <Area type="monotone" dataKey="tests" stroke="#4F46E5" strokeWidth={2.5} fill="url(#tests)" />
                <Area type="monotone" dataKey="students" stroke="#10B981" strokeWidth={2.5} fill="url(#students)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card padded={false}>
          <div className="p-5">
            <h3 className="font-semibold text-ink-900">Haftalik testlar</h3>
            <p className="text-xs text-ink-500 mt-0.5">So'nggi 7 kun</p>
          </div>
          <div className="h-56 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockWeekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748B" }} />
                <Tooltip
                  cursor={{ fill: "#F1F5F9" }}
                  contentStyle={{
                    background: "#0F172A", border: "none", borderRadius: 12, color: "#fff",
                    fontSize: 12, padding: "8px 12px",
                  }}
                />
                <Bar dataKey="tests" fill="#4F46E5" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-ink-100 mt-2">
            <div>
              <div className="text-2xl font-bold text-ink-900">391</div>
              <div className="text-xs text-ink-500">Jami shu hafta</div>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-success-50 text-success-700 text-xs font-medium">
              <TrendingUp className="w-3 h-3" /> +12.4%
            </div>
          </div>
        </Card>
      </div>

      {/* Activity + Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" padded={false}>
          <div className="flex items-center justify-between p-5 pb-3">
            <h3 className="font-semibold text-ink-900">So'nggi faoliyat</h3>
            <button className="text-xs text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1">
              Hammasi <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-ink-100">
            {mockRecentActivity.slice(0, 5).map((a) => (
              <ActivityRow key={a.id} item={a} />
            ))}
          </div>
        </Card>

        <Card padded={false}>
          <div className="p-5 pb-3">
            <h3 className="font-semibold text-ink-900">Umumiy ko'rsatkichlar</h3>
            <p className="text-xs text-ink-500 mt-0.5">Bu oydagi natijalar</p>
          </div>
          <div className="px-5 pb-5 space-y-5">
            <ProgressItem label="Yakunlangan testlar" value={stats?.testsCompleted || 0} target={1500} color="bg-brand-600" />
            <ProgressItem label="Faol semestrlar" value={stats?.activeSemesters || 0} target={25} color="bg-success-500" />
            <div className="p-4 rounded-xl bg-ink-900 text-white">
              <div className="flex items-center gap-2 text-xs text-white/70">
                <Sparkles className="w-3.5 h-3.5" /> O'rtacha ball
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold">{stats?.averageScore || 0}</span>
                <span className="text-sm text-white/70">/ 100</span>
                <span className="ml-auto text-xs px-1.5 py-0.5 rounded-md bg-success-500/20 text-success-500">
                  +{stats?.scoreChange || 0}%
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <QuickAction to="/admin/teachers" icon={UserPlus} label="O'qituvchi qo'shish" description="Yangi o'qituvchi yarating va guruhlarga biriktiring" />
        <QuickAction to="/admin/groups" icon={Users} label="Guruh yaratish" description="O'quvchilar uchun yangi sinf-guruh oching" />
        <QuickAction to="/admin/semesters" icon={BookOpenCheck} label="Semestrlarni ko'rish" description="Faol semestrlar va ularning holati" />
      </div>
    </div>
  );
};

const StatCard = ({ label, value, change, icon: Icon, accent, to }) => (
  <Link to={to} className="group block">
    <Card className="hover:shadow-pop hover:border-ink-300 transition-all">
      <div className="flex items-start justify-between">
        <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-soft", accent)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change != null && (
          <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
            change >= 0 ? "bg-success-50 text-success-700" : "bg-danger-50 text-danger-700"
          )}>
            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change >= 0 ? "+" : ""}{change}%
          </div>
        )}
      </div>
      <div className="mt-5">
        <div className="text-3xl font-bold text-ink-900 tracking-tight">{value?.toLocaleString() ?? 0}</div>
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

const activityStyles = {
  teacher_created:  { bg: "bg-brand-50",    color: "text-brand-600",   Icon: UserPlus },
  semester_created: { bg: "bg-violet-50",   color: "text-violet-600",  Icon: BookOpenCheck },
  test_completed:   { bg: "bg-success-50",  color: "text-success-600", Icon: FileText },
  student_joined:   { bg: "bg-amber-50",    color: "text-amber-600",   Icon: Users },
  semester_completed:{ bg: "bg-sky-50",     color: "text-sky-600",     Icon: BookOpen },
};

const ActivityRow = ({ item }) => {
  const s = activityStyles[item.type] || activityStyles.teacher_created;
  return (
    <div className="flex items-start gap-3 px-5 py-3.5 hover:bg-ink-50/50 transition-colors">
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", s.bg)}>
        <s.Icon className={cn("w-4 h-4", s.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-900">{item.title}</p>
        <p className="text-xs text-ink-500 mt-0.5 truncate">{item.description}</p>
      </div>
      <div className="text-xs text-ink-400 whitespace-nowrap">{timeAgo(item.timestamp)}</div>
    </div>
  );
};

const ProgressItem = ({ label, value, target, color }) => {
  const pct = Math.min(100, (value / target) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-ink-700">{label}</span>
        <span className="text-sm font-semibold text-ink-900">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-[11px] text-ink-500">Maqsad: {target.toLocaleString()}</div>
    </div>
  );
};

const QuickAction = ({ to, icon: Icon, label, description }) => (
  <Link
    to={to}
    className="card p-5 hover:shadow-pop hover:border-ink-300 transition-all group flex items-start gap-4"
  >
    <div className="w-11 h-11 rounded-xl bg-ink-900 text-white flex items-center justify-center flex-shrink-0 group-hover:bg-brand-600 transition-colors">
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-ink-900 text-sm">{label}</h4>
        <ArrowUpRight className="w-4 h-4 text-ink-400 group-hover:text-ink-900 transition-colors" />
      </div>
      <p className="text-xs text-ink-500 mt-1 leading-relaxed">{description}</p>
    </div>
  </Link>
);

export default Dashboard;
