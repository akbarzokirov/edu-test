import { useEffect, useState } from "react";
import {
  Search, Award, Clock, CheckCircle2, BarChart3, TrendingUp,
} from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Select from "../../components/ui/Select";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonTable } from "../../components/ui/Skeleton";
import { studentApi } from "../../api/studentApi";
import { formatDateTime, cn } from "../../utils/helpers";

const getScoreVariant = (s) => s >= 85 ? "success" : s >= 70 ? "info" : s >= 50 ? "warning" : "danger";
const scoreLabel = (s) => s >= 85 ? "A'lo" : s >= 70 ? "Yaxshi" : s >= 50 ? "Qoniqarli" : "Qoniqarsiz";

const Results = () => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    studentApi.getMyResults()
      .then(({ data }) => setResults(data.data || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = results.filter((r) => {
    const q = search.trim().toLowerCase();
    const name = r.semester?.name || "";
    const mq = !q || name.toLowerCase().includes(q);
    const score = r.grade || 0;
    const mf =
      filter === "all" ||
      (filter === "excellent" && score >= 85) ||
      (filter === "good" && score >= 70 && score < 85) ||
      (filter === "fair" && score >= 50 && score < 70) ||
      (filter === "poor" && score < 50);
    return mq && mf;
  });

  const stats = {
    total: results.length,
    avgScore: results.length ? Math.round(results.reduce((a, r) => a + (r.grade || 0), 0) / results.length) : 0,
    best: results.length ? Math.max(...results.map((r) => r.grade || 0)) : 0,
    excellent: results.filter((r) => (r.grade || 0) >= 85).length,
  };

  return (
    <div>
      <PageHeader title="Mening natijalarim" description="Barcha topshirilgan testlar natijalari" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MiniStat icon={CheckCircle2} label="Topshirilgan" value={stats.total} color="bg-brand-50 text-brand-600" />
        <MiniStat icon={BarChart3} label="O'rtacha" value={`${stats.avgScore}%`} color="bg-success-50 text-success-600" />
        <MiniStat icon={TrendingUp} label="Eng yaxshi" value={`${stats.best}%`} color="bg-amber-50 text-amber-600" />
        <MiniStat icon={Award} label="A'lo baho" value={stats.excellent} color="bg-violet-50 text-violet-600" />
      </div>

      <Card className="mb-4" padded={false}>
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Test nomi bo'yicha..."
              className="input-base pl-10"
            />
          </div>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="sm:w-48">
            <option value="all">Barcha ballar</option>
            <option value="excellent">A'lo (85+)</option>
            <option value="good">Yaxshi (70-84)</option>
            <option value="fair">Qoniqarli (50-69)</option>
            <option value="poor">Qoniqarsiz (&lt;50)</option>
          </Select>
        </div>
      </Card>

      {loading ? (
        <SkeletonTable rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={BarChart3} title="Natijalar yo'q" description="Hali hech qanday testni topshirmagansiz" />
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const score = r.grade || 0;
            return (
              <Card key={r.id} className="hover:shadow-pop hover:border-ink-300 transition-all" padded={false}>
                <div className="p-5 flex items-center gap-4">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 font-bold",
                    score >= 85 ? "bg-success-100 text-success-700" :
                    score >= 70 ? "bg-brand-100 text-brand-700" :
                    score >= 50 ? "bg-warning-100 text-warning-700" :
                    "bg-danger-100 text-danger-700"
                  )}>
                    <div className="text-xl leading-none">{Math.round(score)}</div>
                    <div className="text-[10px] font-medium mt-0.5 opacity-80">ball</div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-ink-900 truncate">{r.semester?.name || "—"}</h3>
                      <Badge variant={getScoreVariant(score)} className="text-[10px]">{scoreLabel(score)}</Badge>
                    </div>
                    {r.comment && (
                      <div className="text-sm text-ink-600 line-clamp-2 mt-1">{r.comment}</div>
                    )}
                    <div className="mt-2 text-xs text-ink-500">
                      {formatDateTime(r.createdAt)}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

const MiniStat = ({ icon: Icon, label, value, color }) => (
  <Card className="flex items-center gap-3">
    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <div className="text-xl font-bold text-ink-900 leading-tight">{value}</div>
      <div className="text-xs text-ink-500">{label}</div>
    </div>
  </Card>
);

export default Results;
