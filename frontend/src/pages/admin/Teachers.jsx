import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Search,
  GraduationCap,
  MoreHorizontal,
  Edit3,
  Trash2,
  KeyRound,
  Users,
  Mail,
  BookOpen,
  CheckCircle2,
  ShieldAlert,
  Languages,
  Beaker,
  Calculator,
  Globe,
  Palette,
  Dna,
  Cpu,
  Atom,
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
import TeacherFormModal from "./TeacherFormModal";
import CredentialsModal from "./CredentialsModal";
import PasswordResetModal from "./PasswordResetModal";
import { teachersApi, groupsApi, api } from "../../api/adminApi";
import { cn, formatDate, generatePassword, generateUsername } from "../../utils/helpers";

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formModal, setFormModal] = useState({ open: false, teacher: null });
  const [resetModal, setResetModal] = useState({ open: false, teacher: null });
  const [credsModal, setCredsModal] = useState({
    open: false,
    creds: null,
    mode: "created",
  });
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    teacher: null,
    loading: false,
  });

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await teachersApi.list({ search: search || undefined });
      if (response.data.success) {
        setTeachers(response.data.data);
      }
    } catch (error) {
      console.error("Fetch teachers error:", error);
      toast.error("O'qituvchilarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
    groupsApi.list().then(res => {
      if (res.data.success) setGroups(res.data.data);
    });
  }, []);

  // Qidiruv va status bo'yicha filterlashni front-endda ham saqlab qolamiz (tezkorlik uchun)
  const filtered = teachers.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      t.fullName.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      (t.username && t.username.toLowerCase().includes(q));
    
    const status = t.isActive ? "active" : "inactive";
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSave = async (data) => {
    try {
      if (formModal.teacher) {
        // edit
        const res = await teachersApi.update(formModal.teacher.id, data);
        if (res.data.success) {
          toast.success("O'qituvchi yangilandi");
          fetchTeachers();
        }
      } else {
        // create
        const res = await teachersApi.create(data);
        if (res.data.success) {
          toast.success("O'qituvchi yaratildi");
          setCredsModal({
            open: true,
            creds: { username: data.email, password: data.password },
            mode: "created",
          });
          fetchTeachers();
        }
      }
      setFormModal({ open: false, teacher: null });
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  const handleResetPassword = async (teacherId, newPassword) => {
    try {
      const res = await teachersApi.resetPassword(teacherId, { password: newPassword });
      if (res.data.success) {
        toast.success("Parol muvaffaqiyatli yangilandi");
      }
    } catch (error) {
      toast.error("Parolni yangilashda xatolik");
    }
  };

  const handleDelete = async () => {
    setDeleteModal((d) => ({ ...d, loading: true }));
    try {
      const res = await teachersApi.remove(deleteModal.teacher.id);
      if (res.data.success) {
        toast.success("O'qituvchi o'chirildi");
        fetchTeachers();
      }
    } catch (error) {
      toast.error("O'chirishda xatolik");
    } finally {
      setDeleteModal({ open: false, teacher: null, loading: false });
    }
  };

  const handleToggleStatus = async (teacher) => {
    try {
      const res = await api.patch(`/admin/users/${teacher.id}/toggle-status`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchTeachers();
      }
    } catch (error) {
      toast.error("Holatni o'zgartirishda xatolik");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="O'qituvchilar"
        description="Tizimdagi o'qituvchilar ro'yxati va ularning faoliyati."
        action={
          <Button
            variant="brand"
            icon={Plus}
            onClick={() => setFormModal({ open: true, teacher: null })}
            className="shadow-brand-glow animate-fade-in"
          >
            Yangi o'qituvchi
          </Button>
        }
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up">
        <TeacherStat label="Jami" value={teachers.length} icon={GraduationCap} color="brand" />
        <TeacherStat label="Faol" value={teachers.filter(t => t.isActive).length} icon={CheckCircle2} color="success" />
        <TeacherStat label="Nofaol" value={teachers.filter(t => !t.isActive).length} icon={ShieldAlert} color="danger" />
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3 shadow-sm border-ink-100">
        <div className="flex-1 relative group">
          <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-brand-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism, email yoki fan..."
            className="input-base pl-10 focus:ring-brand-100 focus:border-brand-500"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          containerClassName="sm:w-48"
        >
          <option value="all">Barcha holatlar</option>
          <option value="active">Faol</option>
          <option value="inactive">Nofaol</option>
        </Select>
      </div>

      {loading ? (
        <SkeletonTable />
      ) : filtered.length === 0 ? (
        <div className="card py-16">
          <EmptyState
            icon={GraduationCap}
            title={search ? "Natija topilmadi" : "O'qituvchilar ro'yxati bo'sh"}
            description={
              search
                ? "Boshqa kalit so'zlar bilan qidirib ko'ring."
                : "Tizimga birinchi o'qituvchini qo'shish uchun tugmani bosing."
            }
            action={
              !search && (
                <Button
                  variant="brand"
                  icon={Plus}
                  onClick={() => setFormModal({ open: true, teacher: null })}
                >
                  O'qituvchi qo'shish
                </Button>
              )
            }
          />
        </div>
      ) : (
        <>
          <div className="card overflow-visible hidden md:block shadow-sm border-ink-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink-50/50 text-left border-b border-ink-100">
                  <Th>O'qituvchi</Th>
                  <Th>Fan / Mavzu</Th>
                  <Th>Guruhlar</Th>
                  <Th>Holat</Th>
                  <Th>Qo'shildi</Th>
                  <Th className="text-right pr-6">Amallar</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((t, idx) => (
                  <tr 
                    key={t.id} 
                    className="hover:bg-ink-50/30 transition-colors group relative hover:z-10"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar name={t.fullName} className="ring-2 ring-transparent group-hover:ring-brand-100 transition-all" />
                        <div className="min-w-0">
                          <div className="font-semibold text-ink-900 truncate">
                            {t.fullName}
                          </div>
                          <div className="text-xs text-ink-500 truncate flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {t.email}
                          </div>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                          <SubjectIcon subject={t.subject} />
                        </div>
                        <span className="font-medium text-ink-700">{t.subject || "Fan biriktirilmagan"}</span>
                      </div>
                    </Td>
                    <Td>
                      <GroupChips ids={t.taughtGroups?.map(g => g.id) || []} groups={groups} />
                    </Td>
                    <Td>
                      <button 
                        onClick={() => handleToggleStatus(t)}
                        className="transition-transform active:scale-95"
                      >
                        <Badge
                          variant={t.isActive ? "success" : "gray"}
                          dot
                          className="cursor-pointer hover:opacity-80"
                        >
                          {t.isActive ? "Faol" : "Nofaol"}
                        </Badge>
                      </button>
                    </Td>
                    <Td className="text-ink-500 whitespace-nowrap">
                      {formatDate(t.createdAt)}
                    </Td>
                    <Td className="text-right pr-6">
                      <RowMenu
                        onEdit={() => setFormModal({ open: true, teacher: t })}
                        onReset={() => setResetModal({ open: true, teacher: t })}
                        onDelete={() =>
                          setDeleteModal({ open: true, teacher: t, loading: false })
                        }
                      />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((t) => (
              <div key={t.id} className="card p-4 shadow-sm border-ink-100">
                <div className="flex items-start gap-3">
                  <Avatar name={t.fullName} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-ink-900 truncate">
                          {t.fullName}
                        </div>
                        <div className="text-xs text-ink-500 truncate mt-0.5">
                          {t.email}
                        </div>
                      </div>
                      <RowMenu
                        onEdit={() => setFormModal({ open: true, teacher: t })}
                        onReset={() => setResetModal({ open: true, teacher: t })}
                        onDelete={() =>
                          setDeleteModal({ open: true, teacher: t, loading: false })
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-ink-100 text-ink-700 text-xs font-medium">
                        <SubjectIcon subject={t.subject} className="w-3.5 h-3.5" />
                        {t.subject}
                      </div>
                      <button onClick={() => handleToggleStatus(t)}>
                        <Badge variant={t.isActive ? "success" : "gray"} dot>
                          {t.isActive ? "Faol" : "Nofaol"}
                        </Badge>
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mt-3.5 text-xs text-ink-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {t.studentsCount || 0} o'quvchi
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {t.taughtGroups?.length || 0} guruh
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <TeacherFormModal
        open={formModal.open}
        onClose={() => setFormModal({ open: false, teacher: null })}
        onSave={handleSave}
        teacher={formModal.teacher}
        groups={groups}
      />

      <PasswordResetModal
        open={resetModal.open}
        onClose={() => setResetModal({ open: false, teacher: null })}
        onConfirm={handleResetPassword}
        user={resetModal.teacher}
      />

      <CredentialsModal
        open={credsModal.open}
        onClose={() => setCredsModal({ open: false, creds: null, mode: "created" })}
        credentials={credsModal.creds}
        mode={credsModal.mode}
      />

      <ConfirmDialog
        open={deleteModal.open}
        onClose={() =>
          setDeleteModal({ open: false, teacher: null, loading: false })
        }
        onConfirm={handleDelete}
        loading={deleteModal.loading}
        title="O'qituvchini o'chirasizmi?"
        description={
          deleteModal.teacher
            ? `"${deleteModal.teacher.fullName}" va unga bog'langan barcha ma'lumotlar o'chadi. Bu amalni qaytarib bo'lmaydi.`
            : ""
        }
        confirmText="O'chirish"
      />
    </div>
  );
};

const Th = ({ children, className }) => (
  <th className={cn("px-6 py-4 font-semibold text-ink-600", className)}>
    {children}
  </th>
);

const Td = ({ children, className }) => (
  <td className={cn("px-6 py-4 align-middle", className)}>{children}</td>
);

const TeacherStat = ({ label, value, icon: Icon, color }) => {
  const colors = {
    brand: "bg-brand-50 text-brand-600",
    success: "bg-success-50 text-success-600",
    danger: "bg-danger-50 text-danger-600",
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

const SubjectIcon = ({ subject, className = "w-5 h-5" }) => {
  const s = subject?.toLowerCase() || "";
  if (s.includes("matem")) return <Calculator className={className} />;
  if (s.includes("ingliz") || s.includes("til")) return <Languages className={className} />;
  if (s.includes("fizika")) return <Atom className={className} />;
  if (s.includes("kimyo")) return <Beaker className={className} />;
  if (s.includes("biol")) return <Dna className={className} />;
  if (s.includes("geogr")) return <Globe className={className} />;
  if (s.includes("informat") || s.includes("it")) return <Cpu className={className} />;
  if (s.includes("tarix")) return <BookOpen className={className} />;
  if (s.includes("ona tili")) return <Languages className={className} />;
  if (s.includes("adabiyot")) return <BookOpen className={className} />;
  if (s.includes("san'at")) return <Palette className={className} />;
  return <GraduationCap className={className} />;
};

const GroupChips = ({ ids, groups }) => {
  const names = ids.map((id) => groups.find((g) => g.id === id)?.name).filter(Boolean);
  const visible = names.slice(0, 2);
  const rest = names.length - visible.length;
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visible.map((n) => (
        <span
          key={n}
          className="inline-flex items-center px-2 py-0.5 rounded-md bg-ink-100 text-ink-700 text-xs font-medium"
        >
          {n}
        </span>
      ))}
      {rest > 0 && (
        <span className="text-xs text-ink-500 font-medium">+{rest}</span>
      )}
    </div>
  );
};

const RowMenu = ({ onEdit, onReset, onDelete }) => {
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
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-8 w-8 rounded-lg flex items-center justify-center text-ink-500 hover:text-ink-900 hover:bg-ink-100 transition"
        aria-label="Amallar"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white border border-ink-100 rounded-xl shadow-pop py-1 z-50 animate-scale-in">
          <MenuItem
            icon={Edit3}
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            Tahrirlash
          </MenuItem>
          <MenuItem
            icon={KeyRound}
            onClick={() => {
              setOpen(false);
              onReset();
            }}
          >
            Parolni yangilash
          </MenuItem>
          <div className="my-1 h-px bg-ink-100" />
          <MenuItem
            icon={Trash2}
            danger
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            O'chirish
          </MenuItem>
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

export default Teachers;
