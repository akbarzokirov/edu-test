import { useEffect, useState } from "react";
import { Search, FileText, CheckCircle2, Clock, AlertTriangle, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { SkeletonTable } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { formatDate, timeAgo, cn } from "../../utils/helpers";
import api from "../../api/axios";

const Results = () => {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await api.get("/student/results");
      setResults(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = results.filter((r) => {
    const q = search.trim().toLowerCase();
    const semName = r.semester?.name?.toLowerCase() || "";
    const semSub = r.semester?.subject?.toLowerCase() || "";
    return !q || semName.includes(q) || semSub.includes(q);
  });

  return (
    <div>
      <PageHeader
        title="Mening natijalarim"
        description="Barcha topshirgan testlaringiz va ularning baholari"
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
        <SkeletonTable rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Natijalar topilmadi"
          description={search ? "Qidiruvingiz bo'yicha natija topilmadi." : "Hali hech qanday test topshirmagansiz."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => {
            const passed = r.score >= 50;
            return (
              <Link key={r.id} to={`/student/results/${r.id}`} className="group block">
                <Card className="hover:shadow-pop hover:border-ink-300 transition-all h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-bold",
                      r.score >= 85 ? "bg-success-100 text-success-700" :
                      r.score >= 70 ? "bg-brand-100 text-brand-700" :
                      r.score >= 50 ? "bg-warning-100 text-warning-700" :
                      "bg-danger-100 text-danger-700"
                    )}>
                      {r.score}
                    </div>
                    <Badge variant={passed ? "success" : "danger"} dot>
                      {passed ? "O'tdi" : "Yiqildi"}
                    </Badge>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-ink-900 leading-tight mb-1 group-hover:text-brand-600 transition-colors">
                      {r.semester?.name}
                    </h3>
                    <p className="text-sm text-ink-500 mb-4">{r.semester?.subject}</p>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm text-ink-700">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-ink-400" />
                        <span>{r.duration} daq</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-ink-400" />
                        <span>{r.semester?.questionCount} savol</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-1.5 text-xs text-ink-500 mt-2">
                        Topshirildi: {formatDate(r.submittedAt)} ({timeAgo(r.submittedAt)})
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Results;