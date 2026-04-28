import { useEffect, useState } from "react";
import {
  Search, Award, Clock, CheckCircle2, BarChart3, Download, FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Select from "../../components/ui/Select";
import Avatar from "../../components/ui/Avatar";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonTable } from "../../components/ui/Skeleton";
import { teacherApi } from "../../api/teacherApi";
import { formatDateTime, cn } from "../../utils/helpers";

const getScoreClass = (s) =>
  s >= 85 ? "bg-success-50 text-success-700" :
  s >= 70 ? "bg-brand-50 text-brand-700" :
  s >= 50 ? "bg-warning-50 text-warning-700" :
  "bg-danger-50 text-danger-700";

const formatFileSize = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const Results = () => {
  const [results, setResults] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    teacherApi.listSemesters().then(({ data }) => setSemesters(data.data || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (semesterFilter !== "all") params.semesterId = semesterFilter;
    if (scoreFilter !== "all") params.scoreRange = scoreFilter;
    const t = setTimeout(() => {
      teacherApi.listResults(params)
        .then(({ data }) => setResults(data.data || []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search, semesterFilter, scoreFilter]);

  // ⭐ Faylni download qilish
  const handleDownload = async (attemptId, fileName) => {
    setDownloadingId(attemptId);
    try {
      const response = await teacherApi.downloadAttemptFile(attemptId);
      // Blob → URL → download
      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "attempt-file";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Fayl yuklandi");
    } catch (err) {
      toast.error("Faylni yuklashda xatolik");
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  };

  const stats = {
    total: results.length,
    avgScore: results.length ? Math.round(results.reduce((a, r) => a + r.score, 0) / results.length) : 0,
    excellent: results.filter((r) => r.score >= 85).length,
    poor: results.filter((r) => r.score < 50).length,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900 tracking-tight">Natijalar</h1>
        <p className="mt-1 text-sm text-ink-500">
          O'quvchilaringizning barcha test natijalari va yuklagan fayllari
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MiniStat icon={CheckCircle2} label="Jami" value={stats.total} color="bg-brand-50 text-brand-600" />
        <MiniStat icon={BarChart3} label="O'rtacha" value={`${stats.avgScore}%`} color="bg-success-50 text-success-600" />
        <MiniStat icon={Award} label="A'lo" value={stats.excellent} color="bg-violet-50 text-violet-600" />
        <MiniStat icon={Award} label="Qoniqarsiz" value={stats.poor} color="bg-danger-50 text-danger-600" />
      </div>

      <Card className="mb-4" padded={false}>
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="O'quvchi yoki test bo'yicha..."
              className="input-base pl-10"
            />
          </div>
          <Select value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)} className="sm:w-48">
            <option value="all">Barcha testlar</option>
            {semesters.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Select value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value)} className="sm:w-40">
            <option value="all">Barcha baholar</option>
            <option value="excellent">A'lo (85+)</option>
            <option value="good">Yaxshi (70-84)</option>
            <option value="fair">Qoniqarli (50-69)</option>
            <option value="poor">Qoniqarsiz</option>
          </Select>
        </div>
      </Card>

      {loading ? (
        <SkeletonTable rows={5} />
      ) : results.length === 0 ? (
        <EmptyState icon={BarChart3} title="Natijalar yo'q" description="Hali hech kim test topshirmagan" />
      ) : (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-500 uppercase">O'quvchi</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-500 uppercase">Test</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-500 uppercase">Ball</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-500 uppercase hidden md:table-cell">Vaqt</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-500 uppercase">Yuklangan fayl</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-500 uppercase hidden lg:table-cell">Topshirildi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {results.map((r) => (
                  <tr key={r.id} className="hover:bg-ink-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.studentName} size="sm" />
                        <div>
                          <div className="text-sm font-semibold text-ink-900">{r.studentName}</div>
                          <div className="text-xs text-ink-500">{r.groupName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-sm font-medium text-ink-900 truncate max-w-[200px]">{r.semesterName}</div>
                      <div className="text-xs text-ink-500">{r.subject}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-sm",
                        getScoreClass(r.score)
                      )}>
                        {r.score}
                      </span>
                      <div className="text-[11px] text-ink-500 mt-1">{r.correct}/{r.total} to'g'ri</div>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 text-xs text-ink-700">
                        <Clock className="w-3 h-3" /> {r.duration} daq
                      </span>
                    </td>
                    {/* ⭐ Yuklangan fayl */}
                    <td className="px-5 py-3">
                      {r.hasFile ? (
                        <button
                          onClick={() => handleDownload(r.id, r.fileName)}
                          disabled={downloadingId === r.id}
                          className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 transition-colors disabled:opacity-50"
                          title={`${r.fileName} (${formatFileSize(r.fileSize)}) — yuklash uchun bosing`}
                        >
                          <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                          <div className="text-left max-w-[160px]">
                            <div className="text-xs font-semibold truncate">{r.fileName}</div>
                            <div className="text-[10px] text-brand-600/70">
                              {formatFileSize(r.fileSize)} · yuklash
                            </div>
                          </div>
                          {downloadingId === r.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-ink-400">— fayl yo'q —</span>
                      )}
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell text-xs text-ink-500">
                      {formatDateTime(r.submittedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
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
