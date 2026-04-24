import { useEffect, useState } from "react";
import { Search, FileText, Clock, Play, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { SkeletonTable } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { formatDate, cn } from "../../utils/helpers";
import api from "../../api/axios";

const Semesters = () => {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [semesters, setSemesters] = useState([]);

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      const res = await api.get("/student/semesters");
      setSemesters(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = semesters.filter((s) => {
    const q = search.trim().toLowerCase();
    return !q || s.name.toLowerCase().includes(q) || s.subject.toLowerCase().includes(q);
  });

  return (
    <div>
      <PageHeader
        title="Testlar"
        description="Sizning guruhingizga biriktirilgan barcha testlar"
      />

      <Card className="mb-6" padded={false}>
        <div className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Test yoki fan nomini qidiring..."
              className="input-base pl-10"
            />
          </div>
        </div>
      </Card>

      {loading ? (
        <SkeletonTable rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Testlar topilmadi"
          description={search ? "Qidiruvingiz bo'yicha hech qanday test topilmadi." : "Hozircha sizning guruhingizda faol testlar yo'q."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => {
            const results = s.results || [];
            const isCompleted = results.length >= s.attempts;
            let daysLeft = null;
            if (s.deadline) {
               daysLeft = Math.ceil((new Date(s.deadline) - Date.now()) / 86400000);
            }
            const isExpired = s.status !== "active" || (daysLeft !== null && daysLeft <= 0);

            return (
              <Card key={s.id} className={cn("flex flex-col relative", isExpired && "opacity-75 grayscale-[50%]")}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  {isCompleted ? (
                    <Badge variant="success" dot>Topshirilgan</Badge>
                  ) : isExpired ? (
                    <Badge variant="gray">Yakunlangan</Badge>
                  ) : daysLeft !== null && daysLeft <= 3 ? (
                    <Badge variant="danger" dot>Deadline yaqin</Badge>
                  ) : (
                    <Badge variant="info">Faol</Badge>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-lg text-ink-900 leading-tight mb-1">{s.name}</h3>
                  <p className="text-sm text-ink-500 mb-4">{s.subject} · {s.teacher?.fullName}</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6 text-sm text-ink-700">
                    <div className="flex items-center gap-1.5 bg-ink-50 px-2.5 py-1.5 rounded-lg">
                      <Clock className="w-4 h-4 text-ink-400" />
                      <span>{s.duration} daqiqa</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-ink-50 px-2.5 py-1.5 rounded-lg">
                      <FileText className="w-4 h-4 text-ink-400" />
                      <span>{s.questionCount} savol</span>
                    </div>
                    {s.deadline && (
                       <div className="col-span-2 flex items-center gap-1.5 bg-ink-50 px-2.5 py-1.5 rounded-lg">
                         <AlertCircle className="w-4 h-4 text-ink-400" />
                         <span>Tugaydi: {formatDate(s.deadline)}</span>
                       </div>
                    )}
                    <div className="col-span-2 flex items-center gap-1.5 bg-ink-50 px-2.5 py-1.5 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-ink-400" />
                      <span>Urinishlar: {results.length}/{s.attempts}</span>
                    </div>
                  </div>
                </div>

                {isCompleted ? (
                  <Link to="/student/results">
                    <Button variant="secondary" className="w-full">Natijani ko'rish</Button>
                  </Link>
                ) : isExpired ? (
                  <Button variant="secondary" className="w-full" disabled>Vaqt o'tgan</Button>
                ) : (
                  <Link to={`/student/semesters/${s.id}/take`}>
                    <Button variant="brand" className="w-full" icon={Play}>Testni boshlash</Button>
                  </Link>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Semesters;