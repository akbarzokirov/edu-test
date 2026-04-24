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
import { studentApi } from "../../api/studentApi";
import { formatDate, cn } from "../../utils/helpers";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [semesters, setSemesters] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    Promise.all([
      studentApi.listSemesters(),
      studentApi.getMyResults(),
    ])
      .then(([sem, res]) => {
        setSemesters(sem.data.data || []);
        setResults(res.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const firstName = (user?.fullName || "O'quvchi").split(" ")[0];

  const activeTests = semesters.filter(
    (s) => s.canStart && (!s.deadline || new Date(s.deadline) > new Date())
  );
  const nextTest = activeTests[0];

  const avgScore = results.length
    ? Math.round(results.reduce((a, r) => a + (r.grade || 0), 0) / results.length)
    : 0;

  const cards = [
    { label: "Jami testlar", value: semesters.length, icon: FileText, accent: "from-brand-500 to-brand-700" },
    { label: "Yakunlangan", value: results.length, icon: CheckCircle2, accent: "from-success-500 to-success-700" },
    { label: "Faol testlar", value: activeTests.length, icon: Clock, accent: "from-amber-500 to-amber-700" },
    { label: "O'rtacha ball", value: `${avgScore}%`, icon: Award, accent: "from-violet-500 to-violet-700" },
  ];

  return (
    <div>
      <PageHeader title={`Salom, ${firstName} 👋`} description="Testlaringiz va natijalaringiz" />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : cards.map((c) => <StatCard key={c.label} {...c} />)}
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
                  {nextTest.subject || "—"} · {nextTest.teacher}
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-white/90">
                  <InfoChip icon={FileText} label={`${nextTest.questionCount} savol`} />
                  <InfoChip icon={Clock} label={`${nextTest.duration} daq`} />
                  {nextTest.deadline && (
                    <InfoChip icon={AlertCircle} label={`Deadline: ${formatDate(nextTest.deadline)}`} />
                  )}
                </div>
              </div>
              <Link
                to={`/student/semesters/${nextTest.id}/take`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-brand-700 font-semibold hover:bg-brand-50 transition-colors self-start lg:self-auto"
              >
                <Play className="w-4 h-4 fill-current" /> Boshlash
              </Link>
            </div>
          </div>
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        </Card>
      )}

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
              const daysLeft = s.deadline ? Math.ceil((new Date(s.deadline) - Date.now()) / 86400000) : null;
              return (
                <div key={s.id} className="px-5 py-4 flex items-center gap-4 hover:bg-ink-50/50">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-ink-900">{s.name}</p>
                      {daysLeft != null && (
                        <Badge variant={daysLeft <= 3 ? "danger" : daysLeft <= 7 ? "warning" : "info"} className="text-[10px]">
                          {daysLeft > 0 ? `${daysLeft} kun` : "Muddati o'tdi"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-ink-500 mt-0.5">
                      {s.subject || "—"} · {s.questionCount} savol
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

const InfoChip = ({ icon: Icon, label }) => (
  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/10 backdrop-blur-sm">
    <Icon className="w-3.5 h-3.5" />
    <span>{label}</span>
  </div>
);

export default Dashboard;
