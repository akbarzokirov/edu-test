import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Users,
  BookOpenCheck,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Avatar from "../../components/ui/Avatar";
import Select from "../../components/ui/Select";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonTable } from "../../components/ui/Skeleton";
import {
  mockStudents,
  mockGroups,
  mockTeachers,
  mockResults,
} from "../../utils/mockData";
import { cn, formatDate } from "../../utils/helpers";

const CURRENT_TEACHER_ID = 1;

const getScoreVariant = (score) => {
  if (score >= 85) return "success";
  if (score >= 70) return "info";
  if (score >= 50) return "warning";
  return "danger";
};

const Students = () => {
  const [searchParams] = useSearchParams();
  const initialGroup = searchParams.get("groupId") || "all";

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState(initialGroup);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const myTeacher = useMemo(
    () => mockTeachers.find((t) => t.id === CURRENT_TEACHER_ID),
    [],
  );
  const myGroupIds = myTeacher?.groups || [];

  const myStudents = useMemo(() => {
    return mockStudents
      .filter((s) => myGroupIds.includes(s.groupId))
      .map((s) => {
        const results = mockResults.filter((r) => r.studentId === s.id);
        const avg = results.length
          ? Math.round(
              results.reduce((a, r) => a + r.score, 0) / results.length,
            )
          : null;
        return { ...s, myTestsCompleted: results.length, myAvgScore: avg };
      });
  }, [myGroupIds]);

  const groupMap = useMemo(
    () => Object.fromEntries(mockGroups.map((g) => [g.id, g])),
    [],
  );

  const filtered = myStudents.filter((s) => {
    const q = search.trim().toLowerCase();
    const mq =
      !q ||
      s.fullName.toLowerCase().includes(q) ||
      s.username.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q);
    const mg = groupFilter === "all" || s.groupId === parseInt(groupFilter);
    return mq && mg;
  });

  const scored = myStudents.filter((s) => s.myAvgScore != null);
  const stats = {
    total: myStudents.length,
    active: myStudents.filter((s) => s.status === "active").length,
    avgScore: scored.length
      ? Math.round(scored.reduce((a, s) => a + s.myAvgScore, 0) / scored.length)
      : 0,
    completed: myStudents.reduce((a, s) => a + (s.myTestsCompleted || 0), 0),
  };

  const myGroups = mockGroups.filter((g) => myGroupIds.includes(g.id));

  return (
    <div>
      <PageHeader
        title="O'quvchilar"
        description="Sizning guruhlaringizdagi o'quvchilar"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MiniStat
          icon={UsersRound}
          label="Jami"
          value={stats.total}
          color="bg-brand-50 text-brand-600"
        />
        <MiniStat
          icon={Users}
          label="Faol"
          value={stats.active}
          color="bg-success-50 text-success-600"
        />
        <MiniStat
          icon={TrendingUp}
          label="O'rtacha ball"
          value={stats.avgScore ? `${stats.avgScore}%` : "—"}
          color="bg-amber-50 text-amber-600"
        />
        <MiniStat
          icon={BookOpenCheck}
          label="Yakunlangan testlar"
          value={stats.completed}
          color="bg-violet-50 text-violet-600"
        />
      </div>

      <Card className="mb-4" padded={false}>
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ism, username yoki email..."
              className="input-base pl-10"
            />
          </div>
          <Select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="sm:w-52"
          >
            <option value="all">Barcha guruhlar</option>
            {myGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {loading ? (
        <SkeletonTable rows={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="O'quvchilar topilmadi"
          description={
            search || groupFilter !== "all"
              ? "Filtrni o'zgartirib ko'ring"
              : "Sizning guruhlaringizda hali o'quvchi yo'q"
          }
        />
      ) : (
        <>
          <Card className="hidden lg:block overflow-hidden" padded={false}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/50">
                  <Th>O'quvchi</Th>
                  <Th>Guruh</Th>
                  <Th>Testlar</Th>
                  <Th>O'rtacha ball</Th>
                  <Th>Holat</Th>
                  <Th>Qo'shilgan</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-ink-50/50 transition-colors"
                  >
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar name={s.fullName} size="sm" />
                        <div className="leading-tight">
                          <div className="text-sm font-semibold text-ink-900">
                            {s.fullName}
                          </div>
                          <div className="text-xs text-ink-500">
                            @{s.username}
                          </div>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <Badge variant="info">
                        {groupMap[s.groupId]?.name || "—"}
                      </Badge>
                    </Td>
                    <Td className="text-sm text-ink-700 font-semibold">
                      {s.myTestsCompleted}
                    </Td>
                    <Td>
                      {s.myAvgScore != null ? (
                        <Badge variant={getScoreVariant(s.myAvgScore)} dot>
                          {s.myAvgScore}%
                        </Badge>
                      ) : (
                        <span className="text-xs text-ink-400">—</span>
                      )}
                    </Td>
                    <Td>
                      <Badge
                        variant={s.status === "active" ? "success" : "gray"}
                        dot
                      >
                        {s.status === "active" ? "Faol" : "Nofaol"}
                      </Badge>
                    </Td>
                    <Td className="text-xs text-ink-500">
                      {formatDate(s.createdAt)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="lg:hidden space-y-3">
            {filtered.map((s) => (
              <Card key={s.id} padded={false}>
                <div className="p-4 flex items-center gap-3">
                  <Avatar name={s.fullName} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-ink-900 truncate">
                        {s.fullName}
                      </div>
                      {s.myAvgScore != null && (
                        <Badge variant={getScoreVariant(s.myAvgScore)}>
                          {s.myAvgScore}%
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-ink-500 mt-0.5 truncate">
                      @{s.username}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="info" className="text-[10px]">
                        {groupMap[s.groupId]?.name}
                      </Badge>
                      <span className="text-xs text-ink-500">
                        {s.myTestsCompleted} test
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
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

export default Students;
