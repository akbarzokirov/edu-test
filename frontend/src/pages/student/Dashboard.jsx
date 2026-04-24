import { useEffect, useState } from "react";
import {
  FileText, CheckCircle2, Clock, Award, Play,
  AlertCircle, ArrowUpRight, Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { timeAgo, formatDate, cn } from "../../utils/helpers";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resStats, resSemesters, resResults] = await Promise.all([
        api.get("/student/stats"),
        api.get("/student/semesters"),
        api.get("/student/results")
      ]);
      setStats(resStats.data.data);
      setSemesters(resSemesters.data.data || []);
      setResults(resResults.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const firstName = (user?.fullName || "O'quvchi").split(" ")[0];

  const activeTests = semesters
    .filter((s) => s.status === "active" && (!s.results || s.results.length < s.attempts))
    .sort((a, b) => new Date(a.deadline || "9999") - new Date(b.deadline || "9999"));
    
  const nextTest = activeTests[0];

  const recentResults = [...results]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 5);

  const cards = [
    { key: "total",   label: "Faol testlar",   value: stats?.activeTests,    icon: FileText,     accent: "from-brand-500 to-brand-700" },
    { key: "done",    label: "Topshirilgan testlar",    value: stats?.completedTests,     icon: CheckCircle2, accent: "from-success-500 to-success-700" },
    { key: "pending", label: "Guruh testlari", value: semesters.length,       icon: Clock,        accent: "from-amber-500 to-amber-700" },
    { key: "avg",     label: "O'rtacha ball",  value: `${stats?.averageScore || 0}%`, icon: Award, accent: "from-violet-500 to-violet-700" },
  ];

  return (
    <div>
      <PageHeader
        title={`Salom, ${firstName} 👋`}
        description="Sizni kutayotgan testlar va natijalar"
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : cards.map((c) => {
              const { key, ...rest } = c;
              return <StatCard key={key} {...rest} />;
            })}
      </div>

      {nextTest && (
        <Card className="mb-6 bg-gradient-to-br from-brand-600 to-brand-800 text-white border-0 overflow-hidden relative" padded={false}>
          <div className="relative z-10 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/15 backdrop-blur-sm text-xs font-semibold">
                  <Sparkles className="w-3 h-3" /> Keyingi test
                </div>
                <h3 className="mt-3 text-xl lg:text-2xl font-bold leading-tight">{nextTest.name}</h3>
                <div className="mt-1 text-sm text-white/80">
                  {nextTest.subject} · {nextTest.teacher?.fullName}
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/90">
                  <InfoChip icon={FileText} label={`${nextTest.questionCount} savol`} />
                  <InfoChip icon={Clock} label={`${nextTest.duration} daqiqa`} />
                  {nextTest.deadline && (
                    <InfoChip icon={AlertCircle} label={`Deadline: ${formatDate(nextTest.deadline)}`} />
                  )}
                </div>
              </div>
              <Link
                to={`/student/semesters/${nextTest.id}/take`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-brand-700 font-semibold hover:bg-brand-50 transition-colors self-start lg:self-auto z-20 relative"
              >
                <Play className="w-4 h-4 fill-current" /> Boshlash
              </Link>
            </div>
          </div>
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute right-1/3 -bottom-16 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card padded={false}>
          <div className="flex items-center justify-between p-5 pb-3">
            <h3 className="font-semibold text-ink-900">Faol testlar</h3>
            <Link to="/student/semesters" className="text-xs text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1">
              Barchasi <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-ink-100">
            {activeTests.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-ink-500">Faol testlar yo'q 🎉</div>
            ) : (
              activeTests.slice(0, 4).map((s) => {
                let daysLeft = null;
                if (s.deadline) {
                  daysLeft = Math.ceil((new Date(s.deadline) - Date.now()) / 86400000);
                }
                return (
                  <div key={s.id} className="px-5 py-4 flex items-center gap-4 hover:bg-ink-50/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-ink-900">{s.name}</p>
                        {daysLeft !== null && (
                          <Badge variant={daysLeft <= 3 ? "danger" : daysLeft <= 7 ? "warning" : "info"} className="text-[10px]">
                            {daysLeft > 0 ? `${daysLeft} kun` : "Muddati o'tdi"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-ink-500 mt-0.5">
                        {s.subject} · {s.teacher?.fullName} · {s.questionCount} savol
                      </p>
                    </div>
                    <Link to={`/student/semesters/${s.id}/take`}>
                      <Button variant="brand" size="sm" icon={Play}>Boshlash</Button>
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card padded={false}>
          <div className="flex items-center justify-between p-5 pb-3">
            <h3 className="font-semibold text-ink-900">So'nggi natijalar</h3>
            <Link to="/student/results" className="text-xs text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1">
              Barchasi <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-ink-100">
            {recentResults.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-ink-500">Hali natija yo'q</div>
            ) : (
              recentResults.map((r) => (
                <Link key={r.id} to={`/student/results/${r.id}`} className="block px-5 py-3.5 hover:bg-ink-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0",
                      r.score >= 85 ? "bg-success-100 text-success-700" :
                      r.score >= 70 ? "bg-brand-100 text-brand-700" :
                      r.score >= 50 ? "bg-warning-100 text-warning-700" :
                      "bg-danger-100 text-danger-700"
                    )}>
                      {r.score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-900 truncate">{r.semester?.name}</p>
                      <p className="text-xs text-ink-500 mt-0.5">{timeAgo(r.submittedAt)}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-ink-400 flex-shrink-0" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>
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
      <div className="text-3xl font-bold text-ink-900 tracking-tight">{value ?? "—"}</div>
      <div className="text-sm text-ink-500 mt-1">{label}</div>
    </div>
  </Card>
);

const InfoChip = ({ icon: Icon, label }) => (
  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/10 backdrop-blur-sm">
    <Icon className="w-3.5 h-3.5" />
    <span>{label}</span>
  </div>
);

export default Dashboard;