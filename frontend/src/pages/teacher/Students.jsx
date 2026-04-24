import { useEffect, useState } from "react";
import {
  Search, Users, Award, CheckCircle2, Plus, Edit2, Trash2,
  User as UserIcon, Mail, Lock, AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import Avatar from "../../components/ui/Avatar";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonTable } from "../../components/ui/Skeleton";
import { teacherApi } from "../../api/teacherApi";
import { cn } from "../../utils/helpers";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");

  // Modal holatlari
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = yangi, object = tahrirlash
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    const params = {};
    if (search) params.search = search;
    if (groupFilter !== "all") params.groupId = groupFilter;
    teacherApi.students(params)
      .then(({ data }) => setStudents(data.data || []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    teacherApi.groups().then(({ data }) => setGroups(data.data || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, groupFilter]);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editing) {
        await teacherApi.updateStudent(editing.id, payload);
        toast.success("Talaba yangilandi");
      } else {
        await teacherApi.createStudent(payload);
        toast.success("Talaba qo'shildi");
      }
      setFormOpen(false);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Xato");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await teacherApi.deleteStudent(deleteTarget.id);
      toast.success("Talaba o'chirildi");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Xato");
    }
  };

  return (
    <div>
      <PageHeader
        title="Mening o'quvchilarim"
        description="O'z guruhlaringizdagi talabalarni boshqaring"
        actions={
          groups.length > 0 && (
            <Button variant="brand" icon={Plus} onClick={() => { setEditing(null); setFormOpen(true); }}>
              Yangi talaba
            </Button>
          )
        }
      />

      {groups.length === 0 && (
        <Card className="mb-4 bg-warning-50 border-warning-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-warning-700">
              Sizga hali guruh biriktirilmagan. Talaba qo'shish uchun avval admin sizga guruh biriktirishi kerak.
            </div>
          </div>
        </Card>
      )}

      <Card className="mb-4" padded={false}>
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ism yoki email bo'yicha..."
              className="input-base pl-10"
            />
          </div>
          <Select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} className="sm:w-48">
            <option value="all">Barcha guruhlar</option>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </Select>
        </div>
      </Card>

      {loading ? (
        <SkeletonTable rows={5} />
      ) : students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Talabalar yo'q"
          description={
            groups.length === 0
              ? "Avval admin sizga guruh biriktirsin"
              : "Birinchi talabani qo'shing"
          }
          action={
            groups.length > 0 && (
              <Button variant="brand" icon={Plus} onClick={() => { setEditing(null); setFormOpen(true); }}>
                Yangi talaba qo'shish
              </Button>
            )
          }
        />
      ) : (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-500 uppercase">O'quvchi</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-500 uppercase">Guruh</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-500 uppercase">Testlar</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-500 uppercase">O'rtacha</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-ink-500 uppercase">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-ink-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.fullName} size="sm" />
                        <div>
                          <div className="text-sm font-semibold text-ink-900">{s.fullName}</div>
                          <div className="text-xs text-ink-500">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="info">{s.groupName}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 text-sm text-ink-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-success-600" /> {s.testsCompleted}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {s.averageScore != null ? (
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold",
                          s.averageScore >= 85 ? "bg-success-50 text-success-700" :
                          s.averageScore >= 70 ? "bg-brand-50 text-brand-700" :
                          s.averageScore >= 50 ? "bg-warning-50 text-warning-700" :
                          "bg-danger-50 text-danger-700"
                        )}>
                          <Award className="w-3 h-3" /> {s.averageScore}%
                        </span>
                      ) : (
                        <span className="text-xs text-ink-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => { setEditing(s); setFormOpen(true); }}
                          title="Tahrirlash"
                          className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-500 hover:text-ink-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
                          title="O'chirish"
                          className="p-1.5 rounded-lg hover:bg-danger-50 text-ink-500 hover:text-danger-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Yaratish/tahrirlash modal */}
      <StudentFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSave={handleSave}
        student={editing}
        groups={groups}
        loading={saving}
      />

      {/* O'chirish tasdiqlash */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Bekor qilish</Button>
            <Button variant="danger" icon={Trash2} onClick={handleDelete}>O'chirish</Button>
          </>
        }
      >
        <div className="flex gap-4">
          <div className="w-11 h-11 rounded-full bg-danger-50 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-danger-600" />
          </div>
          <div>
            <h3 className="font-semibold text-ink-900">Talabani o'chirish</h3>
            <p className="mt-1 text-sm text-ink-600">
              <strong>{deleteTarget?.fullName}</strong>ni o'chirmoqchimisiz? Barcha natijalar ham o'chadi.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ============ Yaratish/Tahrirlash formasi ============
const StudentFormModal = ({ open, onClose, onSave, student, groups, loading }) => {
  const isEdit = !!student;
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    groupId: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    if (student) {
      setForm({
        fullName: student.fullName || "",
        email: student.email || "",
        password: "", // edit'da bo'sh — faqat o'zgartirish kerak bo'lsa to'ldiriladi
        groupId: student.groupId || "",
      });
    } else {
      setForm({
        fullName: "",
        email: "",
        password: "",
        groupId: groups[0]?.id || "",
      });
    }
    setErrors({});
  }, [open, student, groups]);

  const update = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Ism-familiya kiriting";
    if (!form.email.trim()) e.email = "Email kiriting";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email formati noto'g'ri";
    if (!form.groupId) e.groupId = "Guruhni tanlang";

    // Parol: yaratishda shart, tahrirlashda ixtiyoriy
    if (!isEdit) {
      if (!form.password || form.password.length < 6) e.password = "Parol kamida 6 ta belgi bo'lsin";
    } else if (form.password && form.password.length < 6) {
      e.password = "Parol kamida 6 ta belgi bo'lsin";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      groupId: parseInt(form.groupId),
    };
    // Parol faqat to'ldirilgan bo'lsa yuboriladi
    if (form.password) payload.password = form.password;
    onSave(payload);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={isEdit ? "Talabani tahrirlash" : "Yangi talaba qo'shish"}
      description={isEdit ? "Ma'lumotlarni yangilang" : "O'z guruhingizga yangi talaba qo'shing"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Bekor qilish</Button>
          <Button variant="brand" onClick={handleSubmit} loading={loading}>
            {isEdit ? "Saqlash" : "Yaratish"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Ism-familiya *"
          icon={UserIcon}
          value={form.fullName}
          onChange={(e) => update("fullName", e.target.value)}
          error={errors.fullName}
          placeholder="Alisher Karimov"
        />
        <Input
          label="Email *"
          icon={Mail}
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          error={errors.email}
          placeholder="student@example.com"
        />
        <Input
          label={isEdit ? "Parol (o'zgartirish uchun to'ldiring)" : "Parol *"}
          icon={Lock}
          type="password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          error={errors.password}
          placeholder={isEdit ? "Bo'sh qoldiring — o'zgarmaydi" : "Kamida 6 ta belgi"}
        />
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Guruh *</label>
          <Select
            value={form.groupId}
            onChange={(e) => update("groupId", e.target.value)}
            className={errors.groupId ? "border-danger-500" : ""}
          >
            <option value="">Tanlang</option>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </Select>
          {errors.groupId && (
            <p className="mt-1 text-xs text-danger-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.groupId}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default Students;
