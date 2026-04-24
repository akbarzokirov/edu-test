import { useEffect, useState, useMemo } from "react";
import {
  Users,
  UsersRound,
  FileText,
  TrendingUp,
  TrendingDown,
  BookOpenCheck,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { formatDate, cn } from "../../utils/helpers";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);

  const fetchData = async () => {
    try {
      const [resStats, resStudents] = await Promise.all([
        api.get("/teacher/stats"),
        api.get("/teacher/students")
      ]);
      setStats(resStats.data.data);

      const st = resStudents.data.data || [];
      // Sort by createdAt DESC and take top 5
      const recent = st.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
      setRecentStudents(recent);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  return (
    <div>
      <PageHeader
        title={`Salom, ${firstName} 👋`}
        description="Bugun nima qilamiz?"
      />

      {/* 4 Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : cards.map((c) => {
              const { key, ...rest } = c;
              return <StatCard key={key} {...rest} />;
            })}
      </div>

      {/* Recent Students Section */}
      <Card padded={false} className="overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-3">
          <div>
            <h3 className="font-semibold text-ink-900">Oxirgi qo'shilgan o'quvchilar</h3>
            <p className="text-xs text-ink-500 mt-0.5">Sizning guruhlaringizdagi so'nggi 5 ta o'quvchi</p>
          </div>
          <Link
            to="/teacher/students"
            className="text-xs text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1"
          >
            Barchasini ko'rish <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        {loading ? (
          <div className="p-5 text-sm text-ink-500">Yuklanmoqda...</div>
        ) : recentStudents.length === 0 ? (
          <div className="p-5 text-sm text-ink-500">Hali o'quvchilar yo'q.</div>
        ) : (
          <div className="divide-y divide-ink-100">
            {recentStudents.map(s => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-ink-50/50 transition-colors">
                <Avatar name={s.fullName} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-ink-900 truncate">
                    {s.fullName}
                  </div>
                  <div className="text-xs text-ink-500 mt-0.5 truncate">
                    @{s.email ? s.email.split('@')[0] : "user"}
                  </div>
                </div>
                <div className="hidden sm:block">
                  <Badge variant="info" className="text-[10px]">
                    {s.group?.name || "Guruhsiz"}
                  </Badge>
                </div>
                <div className="text-xs text-ink-400 whitespace-nowrap">
                  {formatDate(s.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
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

export default Dashboard;
