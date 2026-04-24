import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Award,
  Clock,
  CheckCircle2,
  BarChart3,
  Download,
} from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonTable } from "../../components/ui/Skeleton";
import {
  mockResults,
  mockStudents,
  mockTeacherSemesters,
  mockGroups,
} from "../../utils/mockData";
import { formatDateTime, cn } from "../../utils/helpers";

const CURRENT_TEACHER_ID = 1;

const getScoreVariant = (score) => {
  if (score >= 85) return "success";
  if (score >= 70) return "info";
  if (score >= 50) return "warning";
  return "danger";
};
const scoreLabel = (score) => {
  if (score >= 85) return "A'lo";
  if (score >= 70) return "Yaxshi";
  if (score >= 50) return "Qoniqarli";
  return "Qoniqarsiz";
};

const Results = () => {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const mySemesters = useMemo(
    () =>
      mockTeacherSemesters.filter((s) => s.teacherId === CURRENT_TEACHER_ID),
    [],
  );
  const mySemesterIds = mySemesters.map((s) => s.id);
  const semMap = useMemo(
    () => Object.fromEntries(mySemesters.map((s) => [s.id, s])),
    [mySemesters],
  );
  const studentMap = useMemo(
    () => Object.fromEntries(mockStudents.map((s) => [s.id, s])),
    [],
  );
  const groupMap = useMemo(
    () => Object.fromEntries(mockGroups.map((g) => [g.id, g])),
    [],
  );

  const myResults = mockResults.filter((r) =>
    mySemesterIds.includes(r.semesterId),
  );

  const filtered = myResults.filter((r) => {
    const student = studentMap[r.studentId];
    const sem = semMap[r.semesterId];
    if (!student || !sem) return false;

    const q = search.trim().toLowerCase();
    const mq =
      !q ||
      student.fullName.toLowerCase().includes(q) ||
      sem.name.toLowerCase().includes(q);
    const ms =
      semesterFilter === "all" || r.semesterId === parseInt(semesterFilter);
    const msc =
      scoreFilter === "all" ||
      (scoreFilter === "excellent" && r.score >= 85) ||
      (scoreFilter === "good" && r.score >= 70 && r.score < 85) ||
      (scoreFilter === "fair" && r.score >= 50 && r.score < 70) ||
      (scoreFilter === "poor" && r.score < 50);
    return mq && ms && msc;
  });

  const stats = {
    total: myResults.length,
    avgScore: myResults.length
      ? Math.round(
          myResults.reduce((a, r) => a + r.score, 0) / myResults.length,
        )
      : 0,
    excellent: myResults.filter((r) => r.score >= 85).length,
    avgDuration: myResults.length
      ? Math.round(
          myResults.reduce((a, r) => a + r.duration, 0) / myResults.length,
        )
      : 0,
  };

  return (
    <div>
      <PageHeader
        title="Natijalar"
        description="O'quvchilarning test natijalari"
        action={
          <Button variant="secondary" icon={Download}>
            Export
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MiniStat
          icon={CheckCircle2}
          label="Topshirilgan"
          value={stats.total}
          color="bg-brand-50 text-brand-600"
        />
        <MiniStat
          icon={BarChart3}
          label="O'rtacha ball"
          value={`${stats.avgScore}%`}
          color="bg-success-50 text-success-600"
        />
        <MiniStat
          icon={Award}
          label="A'lo baholar"
          value={stats.excellent}
          color="bg-amber-50 text-amber-600"
        />
        <MiniStat
          icon={Clock}
          label="O'rt. vaqt"
          value={`${stats.avgDuration} daq`}
          color="bg-violet-50 text-violet-600"
        />
      </div>

      <Card className="mb-4" padded={false}>
        <div className="p-4 flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="O'quvchi yoki semestr nomi..."
              className="input-base pl-10"
            />
          </div>
          <div className="grid grid-cols-2 lg:flex gap-3">
            <Select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="lg:w-52"
            >
              <option value="all">Barcha semestrlar</option>
              {mySemesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
            <Select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              className="lg:w-44"
            >
              <option value="all">Barcha ballar</option>
              <option value="excellent">A'lo (85+)</option>
              <option value="good">Yaxshi (70-84)</option>
              <option value="fair">Qoniqarli (50-69)</option>
              <option value="poor">Qoniqarsiz (&lt;50)</option>
            </Select>
          </div>
        </div>
      </Card>

      {loading ? (
        <SkeletonTable rows={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Natijalar topilmadi"
          description={
            search || semesterFilter !== "all" || scoreFilter !== "all"
              ? "Filtrni o'zgartirib ko'ring"
              : "Hali hech qanday o'quvchi test topshirmagan"
          }
        />
      ) : (
        <>
          <Card className="hidden lg:block overflow-hidden" padded={false}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/50">
                  <Th>O'quvchi</Th>
                  <Th>Semestr</Th>
                  <Th>Guruh</Th>
                  <Th>Ball</Th>
                  <Th>Vaqt</Th>
                  <Th>Urinish</Th>
                  <Th>Topshirilgan</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((r) => {
                  const student = studentMap[r.studentId];
                  const sem = semMap[r.semesterId];
                  const group = sem ? groupMap[sem.groupId] : null;
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-ink-50/50 transition-colors"
                    >
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar name={student?.fullName} size="sm" />
                          <div className="leading-tight">
                            <div className="text-sm font-semibold text-ink-900">
                              {student?.fullName}
                            </div>
                            <div className="text-xs text-ink-500">
                              @{student?.username}
                            </div>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <div className="text-sm font-medium text-ink-900 max-w-[200px] truncate">
                          {sem?.name}
                        </div>
                        <div className="text-xs text-ink-500">
                          {sem?.subject}
                        </div>
                      </Td>
                      <Td>
                        <Badge variant="info">{group?.name}</Badge>
                      </Td>
                      <Td>
                        <Badge variant={getScoreVariant(r.score)} dot>
                          {r.score}% · {scoreLabel(r.score)}
                        </Badge>
                      </Td>
                      <Td className="text-sm text-ink-700">{r.duration} daq</Td>
                      <Td>
                        <span className="text-sm text-ink-700 font-medium">
                          {r.attempts}
                        </span>
                      </Td>
                      <Td className="text-xs text-ink-500">
                        {formatDateTime(r.submittedAt)}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          <div className="lg:hidden space-y-3">
            {filtered.map((r) => {
              const student = studentMap[r.studentId];
              const sem = semMap[r.semesterId];
              return (
                <Card key={r.id} padded={false}>
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar name={student?.fullName} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-ink-900 truncate">
                          {student?.fullName}
                        </div>
                        <div className="text-xs text-ink-500 truncate">
                          {sem?.name}
                        </div>
                      </div>
                      <Badge variant={getScoreVariant(r.score)}>
                        {r.score}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-ink-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {r.duration} daq
                      </span>
                      <span>Urinish: {r.attempts}</span>
                      <span className="ml-auto">
                        {formatDateTime(r.submittedAt)}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

const MiniStat = ({ icon: Icon, label, value, color }) => (
  <Card className="flex items-center gap-3">
    <div
      className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center",
        color,
      )}
    >
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <div className="text-xl font-bold text-ink-900 leading-tight">
        {value}
      </div>
      <div className="text-xs text-ink-500">{label}</div>
    </div>
  </Card>
);

const Th = ({ children }) => (
  <th className="px-5 py-3 text-left text-[11px] font-semibold text-ink-500 uppercase tracking-wider">
    {children}
  </th>
);
const Td = ({ children, className = "" }) => (
  <td className={cn("px-5 py-3", className)}>{children}</td>
);

export default Results;
