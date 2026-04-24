import { useEffect, useState } from "react";
import {
  Users, UsersRound, FileText, TrendingUp, Sparkles, ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { teacherApi } from "../../api/teacherApi";
import { cn } from "../../utils/helpers";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [semesters, setSemesters] = useState([]);

  useEffect(() => {
    Promise.all([
      teacherApi.stats(),
      teacherApi.listSemesters(),
    ])
      .then(([s, sem]) => {
        setStats(s.data.data);
        setSemesters(sem.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const firstName = (user?.fullName || "O'qituvchi").split(" ")[0];

  const cards = [
    { label: "Guruhlar", value: stats?.myGroups ?? 0, icon: UsersRound, accent: "from-brand-500 to-brand-700" },
    { label: "O'quvchilar", value: stats?.myStudents ?? 0, icon: Users, accent: "from-success-500 to-success-700" },
    { label: "Faol testlar", value: stats?.activeSemesters ?? 0, icon: FileText, accent: "from-amber-500 to-amber-700" },
    { label: "O'rtacha ball", value: `${stats?.averageScore ?? 0}%`, icon: TrendingUp, accent: "from-violet-500 to-violet-700" },
  ];

  return (
    <div>
      <PageHeader title={`Salom, ${firstName} 👋`} description="O'qituvchi paneli" />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : cards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      <Card className="mb-6 bg-gradient-to-br from-brand-600 to-brand-800 text-white border-0" padded={false}>
        <div className="p-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/15 backdrop-blur-sm text-xs font-semibold">
            <Sparkles className="w-3 h-3" /> AI Platform
          </div>
          <h3 className="mt-3 text-xl lg:text-2xl font-bold leading-tight">
            Groq AI savollar yaratadi
          </h3>
          <p className="mt-2 text-sm text-white/80">
            Siz faqat ko'rsatma berasiz. Talaba fayl yuklaydi, AI savollarni yaratadi va avtomatik baholaydi.
          </p>
        </div>
      </Card>

      <Card padded={false}>
        <div className="flex items-center justify-between p-5 pb-3">
          <h3 className="font-semibold text-ink-900">Mening testlarim</h3>
          <Link to="/teacher/semesters" className="text-xs text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1">
            Barchasi <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-ink-100">
          {semesters.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-ink-500">
              <Link to="/teacher/semesters" className="text-brand-600 font-medium">+ Yangi test yarating</Link>
            </div>
          ) : (
            semesters.slice(0, 5).map((s) => (
              <div key={s.id} className="px-5 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-ink-100 text-ink-700 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-900 truncate">{s.name}</p>
                  <p className="text-xs text-ink-500 mt-0.5">
                    {s.subject || "—"} · {s.groupName} · {s.submitted}/{s.total} topshirdi
                  </p>
                </div>
                <span className={cn(
                  "px-2 py-1 rounded-md text-[10px] font-medium",
                  s.status === "active" ? "bg-success-50 text-success-700" : "bg-ink-100 text-ink-700"
                )}>
                  {s.status === "active" ? "Faol" : "Qoralama"}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, accent }) => (
  <Card>
    <div className="flex items-start justify-between">
      <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-soft", accent)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <div className="mt-5">
      <div className="text-3xl font-bold text-ink-900 tracking-tight">{value}</div>
      <div className="text-sm text-ink-500 mt-1">{label}</div>
    </div>
  </Card>
);

export default Dashboard;
