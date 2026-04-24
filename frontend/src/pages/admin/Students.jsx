import { useEffect, useState, useRef } from "react";
import { 
  Users, 
  Search, 
  Trash2, 
  Mail, 
  CheckCircle2, 
  GraduationCap,
  MoreHorizontal,
  KeyRound
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
import { studentsApi, groupsApi, teachersApi, api } from "../../api/adminApi";
import { cn } from "../../utils/helpers";
import PasswordResetModal from "./PasswordResetModal";

const getScoreVariant = (s) =>
  s >= 85 ? "success" : s >= 70 ? "brand" : s >= 50 ? "warning" : "danger";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [resetModal, setResetModal] = useState({ open: false, student: null });
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    student: null,
    loading: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsRes, groupsRes] = await Promise.all([
        studentsApi.list({ 
          search: search || undefined, 
          groupId: groupFilter !== "all" ? groupFilter : undefined 
        }),
        groupsApi.list()
      ]);

      if (studentsRes.data.success) setStudents(studentsRes.data.data);
      if (groupsRes.data.success) setGroups(groupsRes.data.data);
    } catch (error) {
      console.error("Fetch students error:", error);
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, groupFilter]);

  const handleResetPassword = async (studentId, newPassword) => {
    try {
      const res = await api.post(`/admin/users/${studentId}/reset-password`, { password: newPassword });
      if (res.data.success) {
        toast.success("Parol muvaffaqiyatli yangilandi");
      }
    } catch (error) {
      toast.error("Parolni yangilashda xatolik");
    }
  };

  const handleToggleStatus = async (student) => {
    try {
      const res = await api.patch(`/admin/users/${student.id}/toggle-status`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchData();
      }
    } catch (error) {
      toast.error("Holatni o'zgartirishda xatolik");
    }
  };

  const handleDelete = async () => {
    setDeleteModal((d) => ({ ...d, loading: true }));
    try {
      const res = await studentsApi.remove(deleteModal.student.id);
      if (res.data.success) {
        toast.success("Talaba o'chirildi");
        fetchData();
      }
    } catch (error) {
      toast.error("O'chirishda xatolik");
    } finally {
      setDeleteModal({ open: false, student: null, loading: false });
    }
  };

  const activeCount = students.filter(s => s.isActive).length;
  const avgScore = students.length === 0 ? 0 : (students.reduce((a, s) => a + (s.averageScore || 0), 0) / students.length).toFixed(1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Talabalar"
        description="Tizimdagi barcha o'quvchilar ro'yxati va ularning ko'rsatkichlari."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up">
        <StatCard label="Jami talabalar" value={students.length} icon={Users} color="brand" />
        <StatCard label="Faol talabalar" value={activeCount} icon={CheckCircle2} color="success" />
        <StatCard label="O'rtacha o'zlashtirish" value={`${avgScore}%`} icon={GraduationCap} color="warning" />
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3 shadow-sm border-ink-100 overflow-visible">
        <div className="flex-1 relative group">
          <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-brand-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Talaba ismi yoki email..."
            className="input-base pl-10 focus:ring-brand-100 focus:border-brand-500"
          />
        </div>
        <Select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          containerClassName="sm:w-56"
        >
          <option value="all">Barcha guruhlar</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </Select>
      </div>

      {loading ? (
        <SkeletonTable />
      ) : students.length === 0 ? (
        <div className="card py-16">
          <EmptyState
            icon={Users}
            title={search ? "Natija topilmadi" : "Talabalar ro'yxati bo'sh"}
            description={search ? "Boshqa kalit so'zlar bilan qidirib ko'ring." : "Hali hech qanday talaba qo'shilmagan."}
          />
        </div>
      ) : (
        <>
          <div className="card shadow-sm border-ink-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink-50/50 text-left border-b border-ink-100">
                  <Th>Talaba</Th>
                  <Th>Guruh</Th>
                  <Th>O'qituvchi</Th>
                  <Th className="text-center">Testlar</Th>
                  <Th className="text-center">Ball</Th>
                  <Th>Holat</Th>
                  <Th className="text-right pr-6">Amallar</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {students.map((s, idx) => {
                  const groupName = s.group?.name || "Guruhsiz";
                  const teacherName = s.group?.teacher?.fullName || "Biriktirilmagan";
                  return (
                    <tr 
                      key={s.id} 
                      className="hover:bg-ink-50/30 transition-colors group relative hover:z-10" 
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar name={s.fullName} className="ring-2 ring-transparent group-hover:ring-brand-100 transition-all" />
                          <div className="min-w-0">
                            <div className="font-semibold text-ink-900 truncate">{s.fullName}</div>
                            <div className="text-xs text-ink-500 truncate flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {s.email}
                            </div>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <Badge variant="gray" className="bg-ink-100">{groupName}</Badge>
                      </Td>
                      <Td className="text-ink-700 font-medium">{teacherName}</Td>
                      <Td className="text-center font-semibold text-ink-900">{s.testsCompleted || 0}</Td>
                      <Td className="text-center">
                        <Badge variant={getScoreVariant(s.averageScore || 0)} className="font-bold">
                          {s.averageScore || 0}%
                        </Badge>
                      </Td>
                      <Td>
                        <button onClick={() => handleToggleStatus(s)} className="transition-transform active:scale-95">
                          <Badge variant={s.isActive ? "success" : "gray"} dot className="cursor-pointer hover:opacity-80">
                            {s.isActive ? "Faol" : "Nofaol"}
                          </Badge>
                        </button>
                      </Td>
                      <Td className="text-right pr-6">
                        <RowMenu 
                          onReset={() => setResetModal({ open: true, student: s })}
                          onDelete={() => setDeleteModal({ open: true, student: s, loading: false })}
                        />
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-3">
            {students.map((s) => (
              <div key={s.id} className="card p-4 shadow-sm border-ink-100">
                <div className="flex items-start gap-3">
                  <Avatar name={s.fullName} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-ink-900 truncate">{s.fullName}</div>
                        <div className="text-xs text-ink-500 truncate mt-0.5">{s.email}</div>
                      </div>
                      <RowMenu 
                        onReset={() => setResetModal({ open: true, student: s })}
                        onDelete={() => setDeleteModal({ open: true, student: s, loading: false })}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <Badge variant="gray">{s.group?.name || "Guruhsiz"}</Badge>
                      <Badge variant={getScoreVariant(s.averageScore || 0)}>{s.averageScore || 0}%</Badge>
                      <button onClick={() => handleToggleStatus(s)}>
                        <Badge variant={s.isActive ? "success" : "gray"} dot>{s.isActive ? "Faol" : "Nofaol"}</Badge>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <PasswordResetModal
        open={resetModal.open}
        onClose={() => setResetModal({ open: false, student: null })}
        onConfirm={handleResetPassword}
        user={resetModal.student}
      />

      <ConfirmDialog
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, student: null, loading: false })}
        onConfirm={handleDelete}
        loading={deleteModal.loading}
        title="Talabani o'chirasizmi?"
        description={deleteModal.student ? `"${deleteModal.student.fullName}" va unga bog'langan barcha natijalar o'chadi.` : ""}
        confirmText="O'chirish"
      />
    </div>
  );
};

const Th = ({ children, className }) => (
  <th className={cn("px-6 py-4 font-semibold text-ink-600", className)}>{children}</th>
);

const Td = ({ children, className }) => (
  <td className={cn("px-6 py-4 align-middle", className)}>{children}</td>
);

const StatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    brand: "bg-brand-50 text-brand-600",
    success: "bg-success-50 text-success-600",
    warning: "bg-warning-50 text-warning-600",
  };
  return (
    <div className="card p-4 flex items-center gap-4 shadow-sm border-ink-100 transition-transform hover:scale-[1.02]">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colors[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-2xl font-bold text-ink-900 leading-none">{value}</div>
        <div className="text-sm text-ink-500 mt-1">{label}</div>
      </div>
    </div>
  );
};

const RowMenu = ({ onReset, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-8 w-8 rounded-lg flex items-center justify-center text-ink-500 hover:text-ink-900 hover:bg-ink-100 transition"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white border border-ink-100 rounded-xl shadow-pop py-1 z-50 animate-scale-in">
          <MenuItem icon={KeyRound} onClick={() => { setOpen(false); onReset(); }}>Parolni yangilash</MenuItem>
          <div className="my-1 h-px bg-ink-100" />
          <MenuItem icon={Trash2} danger onClick={() => { setOpen(false); onDelete(); }}>O'chirish</MenuItem>
        </div>
      )}
    </div>
  );
};

const MenuItem = ({ icon: Icon, children, onClick, danger }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition",
      danger ? "text-danger-600 hover:bg-danger-50" : "text-ink-700 hover:bg-ink-50"
    )}
  >
    <Icon className="w-4 h-4" />
    {children}
  </button>
);

export default Students;
