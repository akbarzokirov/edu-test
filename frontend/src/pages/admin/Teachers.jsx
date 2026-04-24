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
import { mockTeachers, mockGroups } from "../../utils/mockData";
import { cn, formatDate, generatePassword, generateUsername } from "../../utils/helpers";

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formModal, setFormModal] = useState({ open: false, teacher: null });
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

  useEffect(() => {
    const t = setTimeout(() => {
      setTeachers(mockTeachers);
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  const filtered = teachers.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      t.fullName.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.username.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSave = (data) => {
    if (formModal.teacher) {
      // edit
      setTeachers((prev) =>
        prev.map((t) =>
          t.id === formModal.teacher.id ? { ...t, ...data } : t
        )
      );
      setFormModal({ open: false, teacher: null });
      toast.success("O'qituvchi yangilandi");
    } else {
      // create
      const newTeacher = {
        id: Date.now(),
        ...data,
        studentsCount: 0,
        semestersCount: 0,
        status: "active",
        createdAt: new Date().toISOString(),
      };
      setTeachers((prev) => [newTeacher, ...prev]);
      setFormModal({ open: false, teacher: null });
      setCredsModal({
        open: true,
        creds: { username: data.username, password: data.password },
        mode: "created",
      });
      toast.success("O'qituvchi yaratildi");
    }
  };

  const handleResetPassword = (teacher) => {
    const newPwd = generatePassword(10);
    setCredsModal({
      open: true,
      creds: { username: teacher.username, password: newPwd },
      mode: "reset",
    });
    toast.success("Parol yangilandi");
  };

  const handleDelete = async () => {
    setDeleteModal((d) => ({ ...d, loading: true }));
    await new Promise((r) => setTimeout(r, 400));
    setTeachers((prev) => prev.filter((t) => t.id !== deleteModal.teacher.id));
    toast.success("O'qituvchi o'chirildi");
    setDeleteModal({ open: false, teacher: null, loading: false });
  };

  return (
    <div>
      <PageHeader
        title="O'qituvchilar"
        description="Tizimdagi barcha o'qituvchilar ro'yxati va boshqaruvi."
        action={
          <Button
            variant="brand"
            icon={Plus}
            onClick={() => setFormModal({ open: true, teacher: null })}
          >
            Yangi qo'shish
          </Button>
        }
      />

      {/* Filters */}
      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism, login yoki fan bo'yicha qidirish..."
            className="input-base pl-10"
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
        <div className="card">
          <EmptyState
            icon={GraduationCap}
            title={search ? "Natija topilmadi" : "O'qituvchilar yo'q"}
            description={
              search
                ? "Boshqa kalit so'z bilan qidirib ko'ring."
                : "Birinchi o'qituvchini qo'shib, tizimni to'ldiring."
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
          {/* Desktop table */}
          <div className="card overflow-hidden hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink-50/50 text-left">
                  <Th>O'qituvchi</Th>
                  <Th>Fan</Th>
                  <Th>Guruhlar</Th>
                  <Th className="text-center">O'quvchi</Th>
                  <Th>Holat</Th>
                  <Th>Yaratildi</Th>
                  <Th className="text-right pr-5">Amallar</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-ink-50/30 transition">
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar name={t.fullName} />
                        <div className="min-w-0">
                          <div className="font-medium text-ink-900 truncate">
                            {t.fullName}
                          </div>
                          <div className="text-xs text-ink-500 truncate">
                            @{t.username}
                          </div>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <Badge variant="brand">{t.subject}</Badge>
                    </Td>
                    <Td>
                      <GroupChips ids={t.groups} />
                    </Td>
                    <Td className="text-center">
                      <span className="font-semibold text-ink-900">
                        {t.studentsCount}
                      </span>
                    </Td>
                    <Td>
                      <Badge
                        variant={t.status === "active" ? "success" : "gray"}
                        dot
                      >
                        {t.status === "active" ? "Faol" : "Nofaol"}
                      </Badge>
                    </Td>
                    <Td className="text-ink-500">{formatDate(t.createdAt)}</Td>
                    <Td className="text-right pr-5">
                      <RowMenu
                        onEdit={() => setFormModal({ open: true, teacher: t })}
                        onReset={() => handleResetPassword(t)}
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
              <div key={t.id} className="card p-4">
                <div className="flex items-start gap-3">
                  <Avatar name={t.fullName} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium text-ink-900 truncate">
                          {t.fullName}
                        </div>
                        <div className="text-xs text-ink-500 truncate">
                          @{t.username}
                        </div>
                      </div>
                      <RowMenu
                        onEdit={() => setFormModal({ open: true, teacher: t })}
                        onReset={() => handleResetPassword(t)}
                        onDelete={() =>
                          setDeleteModal({ open: true, teacher: t, loading: false })
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="brand">{t.subject}</Badge>
                      <Badge
                        variant={t.status === "active" ? "success" : "gray"}
                        dot
                      >
                        {t.status === "active" ? "Faol" : "Nofaol"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-ink-500">
                      <span>
                        <Users className="w-3 h-3 inline mr-1" />
                        {t.studentsCount} o'quvchi
                      </span>
                      <span>{t.groups.length} guruh</span>
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

const Th = ({ children, className = "" }) => (
  <th className={cn("px-5 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide", className)}>
    {children}
  </th>
);

const Td = ({ children, className = "" }) => (
  <td className={cn("px-5 py-3.5", className)}>{children}</td>
);

const GroupChips = ({ ids }) => {
  const names = ids.map((id) => mockGroups.find((g) => g.id === id)?.name).filter(Boolean);
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
        <div className="absolute right-0 mt-1 w-44 bg-white border border-ink-100 rounded-xl shadow-pop py-1 z-10 animate-scale-in">
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
