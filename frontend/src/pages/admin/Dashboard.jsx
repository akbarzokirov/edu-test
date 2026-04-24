import { useEffect, useState } from "react";
import {
  GraduationCap,
  UsersRound,
  BookOpen,
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  UserPlus,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import { SkeletonCard, SkeletonTable } from "../../components/ui/Skeleton";
import { dashboardApi } from "../../api/adminApi";
import { timeAgo, cn } from "../../utils/helpers";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, activityRes] = await Promise.all([
        dashboardApi.stats(),
        dashboardApi.activity(),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (activityRes.data.success) setActivity(activityRes.data.data || []);
    } catch (error) {
      setError("Dashboard ma'lumotlarini yuklab bo'lmadi.");
      toast.error("Dashboard ma'lumotlarini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const cards = [
    {
      key: "teachers",
      label: "O'qituvchilar",
      value: stats?.teachers,
      change: stats?.teachersChange,
      icon: GraduationCap,
      accent: "from-brand-500 to-brand-700",
      to: "/admin/teachers",
    },
    {
      key: "students",
      label: "O'quvchilar",
      value: stats?.students,
      change: stats?.studentsChange,
      icon: UsersRound,
      accent: "from-emerald-500 to-emerald-700",
      to: "/admin/students",
    },
    {
      key: "groups",
      label: "Guruhlar",
      value: stats?.groups,
      change: null,
      icon: BookOpen,
      accent: "from-amber-500 to-amber-700",
      to: "/admin/groups",
    },
    {
      key: "semesters",
      label: "Faol semestrlar",
      value: stats?.activeSemesters,
      change: stats?.semestersChange,
      icon: FileText,
      accent: "from-violet-500 to-violet-700",
      to: "/admin/semesters",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Salom, Admin 👋"
        description="Platformadagi so'nggi faoliyat va statistika"
      />

      {/* Stat cards */}
      {error && (
        <Card className="border-danger-200 bg-danger-50/40">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-danger-700 font-medium">{error}</p>
            <Button size="sm" variant="secondary" onClick={fetchData}>
              Qayta urinish
            </Button>
          </div>
        </Card>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : cards.map((c) => {
            const { key, ...rest } = c;
            return <StatCard key={key} {...rest} />;
          })}
      </div>

      {/* Recently Added Section */}
      <div className="animate-slide-up" style={{ animationDelay: "150ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-ink-900">So'nggi qo'shilganlar</h3>
        </div>
        
        <Card padded={false} className="overflow-hidden">
          {loading ? (
            <div className="p-4"><SkeletonTable rows={5} /></div>
          ) : activity.length > 0 ? (
            <div className="divide-y divide-ink-100">
              {activity.map((a) => (
                <ActivityRow key={a.id} item={a} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-ink-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Hozircha hech qanday ma'lumot qo'shilmagan</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, change, icon: Icon, accent, to }) => (
  <Link to={to} className="group block">
    <Card className="hover:shadow-pop hover:border-ink-300 transition-all h-full">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-soft",
            accent,
          )}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change != null && (
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
              change >= 0
                ? "bg-success-50 text-success-700"
                : "bg-danger-50 text-danger-700",
            )}
          >
            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
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

const activityStyles = {
  teacher_created: {
    bg: "bg-brand-50",
    color: "text-brand-600",
    Icon: UserPlus,
  },
  semester_created: {
    bg: "bg-violet-50",
    color: "text-violet-600",
    Icon: FileText,
  },
  test_completed: {
    bg: "bg-success-50",
    color: "text-success-600",
    Icon: FileText,
  },
  student_joined: { bg: "bg-amber-50", color: "text-amber-600", Icon: UsersRound },
};

const ActivityRow = ({ item }) => {
  const s = activityStyles[item.type] || activityStyles.teacher_created;
  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-ink-50/50 transition-colors">
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
          s.bg,
        )}
      >
        <s.Icon className={cn("w-5 h-5", s.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-ink-900 truncate">{item.title}</p>
          <span className="text-xs text-ink-400 whitespace-nowrap">{timeAgo(item.timestamp)}</span>
        </div>
        <p className="text-sm text-ink-500 mt-0.5 truncate font-medium">
          {item.description}
        </p>
        {item.email && (
          <p className="text-xs text-ink-400 mt-0.5 truncate">
            {item.email}
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
