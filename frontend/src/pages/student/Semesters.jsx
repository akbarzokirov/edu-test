import { useEffect, useState } from "react";
import {
  Search, FileText, Clock, Play, CheckCircle2, RotateCcw,
  AlertCircle, Calendar, Lock,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { studentApi } from "../../api/studentApi";
import { formatDate, cn } from "../../utils/helpers";

const Semesters = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    studentApi.listSemesters()
      .then(({ data }) => setItems(data.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((s) => {
    const q = search.trim().toLowerCase();
    const mq = !q || s.name.toLowerCase().includes(q) || (s.subject || "").toLowerCase().includes(q);
    const mf =
      filter === "all" ||
      (filter === "active" && s.status === "active" && s.attemptsUsed < s.attempts) ||
      (filter === "completed" && s.attemptsUsed >= s.attempts) ||
      (filter === "not_started" && s.attemptsUsed === 0);
    return mq && mf;
  });

  return (
    <div>
      <PageHeader title="Mening testlarim" description="Barcha sizga yuborilgan testlar" />

      <Card className="mb-4" padded={false}>
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Test nomi yoki fan bo'yicha qidirish..."
              className="input-base pl-10"
            />
          </div>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="sm:w-48">
            <option value="all">Barchasi</option>
            <option value="active">Faol (topshirilmagan)</option>
            <option value="not_started">Boshlanmagan</option>
            <option value="completed">Yakunlangan</option>
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Testlar topilmadi"
          description={search || filter !== "all" ? "Filtrni o'zgartirib ko'ring" : "Hali sizga test yuborilmagan"}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s) => <TestCard key={s.id} semester={s} />)}
        </div>
      )}
    </div>
  );
};

const TestCard = ({ semester }) => {
  const expired = new Date(semester.deadline) < new Date();
  const daysLeft = Math.ceil((new Date(semester.deadline) - Date.now()) / 86400000);
  const attemptsLeft = semester.attempts - semester.attemptsUsed;
  const done = attemptsLeft === 0;
  const canTake = !expired && !done && semester.status === "active";

  // Status config
  let statusBadge;
  if (done) statusBadge = { variant: "gray", label: "Yakunlangan" };
  else if (expired) statusBadge = { variant: "danger", label: "Muddati o'tgan" };
  else if (semester.attemptsUsed > 0) statusBadge = { variant: "warning", label: "Yarim tugatilgan" };
  else statusBadge = { variant: "success", label: "Yangi" };

  return (
    <Card className="hover:shadow-pop hover:border-ink-300 transition-all flex flex-col" padded={false}>
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-3">
          <Badge variant={statusBadge.variant} dot>{statusBadge.label}</Badge>
          {done && <CheckCircle2 className="w-5 h-5 text-success-600" />}
          {expired && !done && <Lock className="w-5 h-5 text-ink-400" />}
        </div>

        <h3 className="font-semibold text-ink-900 leading-tight line-clamp-2">{semester.name}</h3>
        <div className="mt-1 text-sm text-ink-500">{semester.subject}</div>
        <div className="mt-0.5 text-xs text-ink-400">{semester.teacher}</div>

        <div className="mt-4 pt-4 border-t border-ink-100 space-y-2">
          <InfoRow icon={FileText} label={`${semester.questionCount} savol`} />
          <InfoRow icon={Clock} label={`${semester.duration} daqiqa`} />
          <InfoRow icon={RotateCcw} label={`${attemptsLeft}/${semester.attempts} urinish qoldi`} />
          <InfoRow
            icon={expired ? AlertCircle : Calendar}
            label={formatDate(semester.deadline)}
            suffix={
              done ? null :
              expired ? "Muddati o'tdi" :
              daysLeft <= 3 ? `${daysLeft} kun!` :
              `${daysLeft} kun`
            }
            danger={expired || (daysLeft <= 3 && !done)}
          />
        </div>

        {/* Best score (agar oldin urinib ko'rilgan bo'lsa) */}
        {semester.bestScore != null && (
          <div className={cn(
            "mt-4 p-3 rounded-xl flex items-center justify-between",
            semester.bestScore >= 85 ? "bg-success-50" :
            semester.bestScore >= 70 ? "bg-brand-50" :
            semester.bestScore >= 50 ? "bg-warning-50" : "bg-danger-50"
          )}>
            <div className="text-xs font-medium text-ink-700">Eng yaxshi natija</div>
            <div className={cn(
              "text-lg font-bold",
              semester.bestScore >= 85 ? "text-success-700" :
              semester.bestScore >= 70 ? "text-brand-700" :
              semester.bestScore >= 50 ? "text-warning-700" : "text-danger-700"
            )}>
              {semester.bestScore}%
            </div>
          </div>
        )}
      </div>

      <div className="p-5 pt-0">
        {canTake ? (
          <Link to={`/student/semesters/${semester.id}/take`}>
            <Button variant="brand" icon={Play} className="w-full">
              {semester.attemptsUsed > 0 ? "Qayta urinish" : "Testni boshlash"}
            </Button>
          </Link>
        ) : (
          <Button variant="secondary" disabled className="w-full">
            {done ? "Urinishlar tugadi" : "Muddati o'tgan"}
          </Button>
        )}
      </div>
    </Card>
  );
};

const InfoRow = ({ icon: Icon, label, suffix, danger }) => (
  <div className={cn("flex items-center gap-2 text-xs", danger ? "text-danger-600" : "text-ink-700")}>
    <Icon className="w-3.5 h-3.5 text-ink-400 flex-shrink-0" />
    <span className="truncate">{label}</span>
    {suffix && (
      <span className={cn("ml-auto font-medium flex-shrink-0", danger ? "text-danger-600" : "text-ink-500")}>
        {suffix}
      </span>
    )}
  </div>
);

export default Semesters;