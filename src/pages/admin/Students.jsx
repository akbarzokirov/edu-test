import { useEffect, useState } from "react";
import {
  Search,
  Users,
  Trash2,
  TrendingUp,
  BookOpen,
  Eye,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/layout/PageHeader";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Avatar from "../../components/ui/Avatar";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Select from "../../components/ui/Select";
import { SkeletonTable } from "../../components/ui/Skeleton";
import { mockStudents, mockGroups, mockTeachers } from "../../utils/mockData";
import { cn, formatDate } from "../../utils/helpers";

const getScoreVariant = (s) =>
  s >= 85 ? "success" : s >= 70 ? "brand" : s >= 50 ? "warning" : "danger";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    student: null,
    loading: false,
  });

  useEffect(() => {
    const t = setTimeout(() => {
      setStudents(mockStudents);
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const matches =
      !q ||
      s.fullName.toLowerCase().includes(q) ||
      s.username.toLowerCase().includes(q);
    const matchesGroup =
      groupFilter === "all" || s.groupId === Number(groupFilter);
    return matches && matchesGroup;
  });

  const active = students.filter((s) => s.status === "active").length;
  const avgScore =
    students.length === 0
      ? 0
      : (students.reduce((a, s) => a + s.averageScore, 0) / students.length).toFixed(1);
  const totalTests = students.reduce((a, s) => a + s.testsCompleted, 0);

  const handleDelete = async () => {
    setDeleteModal((d) => ({ ...d, loading: true }));
    await new Promise((r) => setTimeout(r, 400));
    setStudents((prev) => prev.filter((s) => s.id !== deleteModal.student.id));
    toast.success("O'quvchi o'chirildi");
    setDeleteModal({ open: false, student: null, loading: false });
  };

  return (
    <div>
      <PageHeader
        title="O'quvchilar"
        description="Tizimdagi barcha o'quvchilar va ularning natijalari."
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MiniStat
          icon={Users}
          label="Jami"
          value={students.length}
          color="brand"
        />
        <MiniStat
          icon={CheckCircle2}
          label="Faol"
          value={active}
          color="success"
        />
        <MiniStat
          icon={TrendingUp}
          label="O'rtacha ball"
          value={`${avgScore}%`}
          color="warning"
        />
        <MiniStat
          icon={BookOpen}
          label="Yakunlangan testlar"
          value={totalTests}
          color="violet"
        />
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism yoki login bo'yicha qidirish..."
            className="input-base pl-10"
          />
        </div>
        <Select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          containerClassName="sm:w-56"
        >
          <option value="all">Barcha guruhlar</option>
          {mockGroups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <SkeletonTable />
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title="Natija topilmadi"
            description="Qidiruv shartlarini o'zgartirib ko'ring."
          />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card overflow-hidden hidden lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink-50/50 text-left">
                  <Th>O'quvchi</Th>
                  <Th>Guruh</Th>
                  <Th>O'qituvchi</Th>
                  <Th className="text-center">Testlar</Th>
                  <Th className="text-center">O'rtacha ball</Th>
                  <Th>Holat</Th>
                  <Th>Qo'shildi</Th>
                  <Th className="text-right pr-5">Amallar</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((s) => {
                  const group = mockGroups.find((g) => g.id === s.groupId);
                  const teacher = mockTeachers.find(
                    (t) => t.id === s.teacherId
                  );
                  return (
                    <tr key={s.id} className="hover:bg-ink-50/30 transition">
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar name={s.fullName} size="sm" />
                          <div className="min-w-0">
                            <div className="font-medium text-ink-900 truncate">
                              {s.fullName}
                            </div>
                            <div className="text-xs text-ink-500 truncate">
                              @{s.username}
                            </div>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        {group ? <Badge variant="gray">{group.name}</Badge> : "—"}
                      </Td>
                      <Td className="text-ink-700">
                        {teacher?.fullName || "—"}
                      </Td>
                      <Td className="text-center font-semibold">
                        {s.testsCompleted}
                      </Td>
                      <Td className="text-center">
                        <Badge variant={getScoreVariant(s.averageScore)}>
                          {s.averageScore}%
                        </Badge>
                      </Td>
                      <Td>
                        <Badge
                          variant={s.status === "active" ? "success" : "gray"}
                          dot
                        >
                          {s.status === "active" ? "Faol" : "Nofaol"}
                        </Badge>
                      </Td>
                      <Td className="text-ink-500">{formatDate(s.createdAt)}</Td>
                      <Td className="text-right pr-5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-ink-500 hover:text-ink-900 hover:bg-ink-100"
                            aria-label="Ko'rish"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteModal({
                                open: true,
                                student: s,
                                loading: false,
                              })
                            }
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-ink-500 hover:text-danger-600 hover:bg-danger-50"
                            aria-label="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {filtered.map((s) => {
              const group = mockGroups.find((g) => g.id === s.groupId);
              return (
                <div key={s.id} className="card p-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={s.fullName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-ink-900 truncate">
                        {s.fullName}
                      </div>
                      <div className="text-xs text-ink-500 truncate mb-2">
                        @{s.username}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {group && <Badge variant="gray">{group.name}</Badge>}
                        <Badge variant={getScoreVariant(s.averageScore)}>
                          {s.averageScore}%
                        </Badge>
                        <Badge
                          variant={s.status === "active" ? "success" : "gray"}
                          dot
                        >
                          {s.status === "active" ? "Faol" : "Nofaol"}
                        </Badge>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setDeleteModal({
                          open: true,
                          student: s,
                          loading: false,
                        })
                      }
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-ink-500 hover:text-danger-600 hover:bg-danger-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <ConfirmDialog
        open={deleteModal.open}
        onClose={() =>
          setDeleteModal({ open: false, student: null, loading: false })
        }
        onConfirm={handleDelete}
        loading={deleteModal.loading}
        title="O'quvchini o'chirasizmi?"
        description={
          deleteModal.student
            ? `"${deleteModal.student.fullName}" va test natijalari o'chadi.`
            : ""
        }
        confirmText="O'chirish"
      />
    </div>
  );
};

const MiniStat = ({ icon: Icon, label, value, color }) => {
  const cm = {
    brand: "bg-brand-50 text-brand-600",
    success: "bg-success-50 text-success-600",
    warning: "bg-warning-50 text-warning-600",
    violet: "bg-violet-50 text-violet-600",
  }[color];
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", cm)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] text-ink-500 truncate">{label}</div>
        <div className="text-lg font-bold text-ink-900 truncate">{value}</div>
      </div>
    </div>
  );
};

const Th = ({ children, className = "" }) => (
  <th className={cn("px-5 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide", className)}>
    {children}
  </th>
);

const Td = ({ children, className = "" }) => (
  <td className={cn("px-5 py-3", className)}>{children}</td>
);

export default Students;
