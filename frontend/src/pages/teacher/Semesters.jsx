import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Search,
  FileText,
  Trash2,
  Edit3,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  FileQuestion,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Select from "../../components/ui/Select";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { SkeletonCard } from "../../components/ui/Skeleton";
import SemesterFormModal from "./SemesterFormModal";
import { formatDate, cn } from "../../utils/helpers";
import api from "../../api/axios";

const Semesters = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formModal, setFormModal] = useState({ open: false, semester: null });
  const [formLoading, setFormLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    semester: null,
    loading: false,
  });

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      const res = await api.get("/teacher/semesters");
      const sems = res.data.data || [];
      const enriched = sems.map(s => ({
        ...s,
        submitted: s.results?.length || 0,
        total: s.group?.studentsCount || s.group?.students?.length || 0 // Assuming students relation is returned
      }));
      setItems(enriched);
    } catch (error) {
      console.error(error);
      toast.error("Semestrlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter((s) => {
    const q = search.trim().toLowerCase();
    const mq =
      !q ||
      s.name.toLowerCase().includes(q) ||
      (s.subject && s.subject.toLowerCase().includes(q));
    const ms = statusFilter === "all" || s.status === statusFilter;
    return mq && ms;
  });

  const stats = {
    total: items.length,
    active: items.filter((s) => s.status === "active").length,
    completed: items.filter((s) => s.status === "completed").length,
    draft: items.filter((s) => s.status === "draft").length,
  };

  const handleSave = async (data) => {
    setFormLoading(true);
    try {
      if (formModal.semester) {
        await api.put(`/teacher/semesters/${formModal.semester.id}`, data);
        toast.success("Semestr yangilandi");
      } else {
        await api.post("/teacher/semesters", data);
        toast.success("Semestr yaratildi! AI test tayyorlanmoqda...");
      }
      fetchSemesters();
    } catch (error) {
      console.error(error);
      toast.error("Xatolik yuz berdi");
    } finally {
      setFormLoading(false);
      setFormModal({ open: false, semester: null });
    }
  };

  const confirmDelete = async () => {
    setDeleteModal((p) => ({ ...p, loading: true }));
    try {
      await api.delete(`/teacher/semesters/${deleteModal.semester.id}`);
      setItems((prev) => prev.filter((s) => s.id !== deleteModal.semester.id));
      toast.success("Semestr o'chirildi");
    } catch (error) {
      console.error(error);
      toast.error("O'chirishda xatolik");
    } finally {
      setDeleteModal({ open: false, semester: null, loading: false });
    }
  };

  return (
    <div>
      <PageHeader
        title="Semestrlar"
        description="Sizning semestrlaringiz va AI testlar"
        action={
          <Button
            variant="brand"
            icon={Plus}
            onClick={() => setFormModal({ open: true, semester: null })}
          >
            Yangi semestr
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MiniStat
          icon={FileText}
          label="Jami"
          value={stats.total}
          color="bg-brand-50 text-brand-600"
        />
        <MiniStat
          icon={Zap}
          label="Faol"
          value={stats.active}
          color="bg-success-50 text-success-600"
        />
        <MiniStat
          icon={CheckCircle2}
          label="Yakunlangan"
          value={stats.completed}
          color="bg-ink-100 text-ink-700"
        />
        <MiniStat
          icon={FileQuestion}
          label="Qoralama"
          value={stats.draft}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      <Card className="mb-4" padded={false}>
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Semestr nomi yoki fan bo'yicha qidirish..."
              className="input-base pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="sm:w-48"
          >
            <option value="all">Barchasi</option>
            <option value="active">Faol</option>
            <option value="completed">Yakunlangan</option>
            <option value="draft">Qoralama</option>
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={
            search || statusFilter !== "all"
              ? "Semestrlar topilmadi"
              : "Hali semestr yo'q"
          }
          description={
            search || statusFilter !== "all"
              ? "Filtrni o'zgartirib ko'ring"
              : "Birinchi semestringizni yarating — AI sizga yordam beradi"
          }
          action={
            !search &&
            statusFilter === "all" && (
              <Button
                variant="brand"
                icon={Sparkles}
                onClick={() => setFormModal({ open: true, semester: null })}
              >
                Birinchi semestrni yaratish
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <SemesterCard
              key={s.id}
              semester={s}
              group={s.group}
              onEdit={() => setFormModal({ open: true, semester: s })}
              onDelete={() =>
                setDeleteModal({ open: true, semester: s, loading: false })
              }
            />
          ))}
        </div>
      )}

      {formModal.open && <SemesterFormModal
        open={formModal.open}
        onClose={() => setFormModal({ open: false, semester: null })}
        onSave={handleSave}
        semester={formModal.semester}
        loading={formLoading}
      />}

      <ConfirmDialog
        open={deleteModal.open}
        onClose={() =>
          setDeleteModal({ open: false, semester: null, loading: false })
        }
        onConfirm={confirmDelete}
        loading={deleteModal.loading}
        title="Semestrni o'chirish"
        description={`"${deleteModal.semester?.name}" semestri va uning barcha natijalari o'chiriladi. Bu amalni qaytarib bo'lmaydi.`}
        confirmText="Ha, o'chirish"
      />
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

const statusCfg = {
  active: { label: "Faol", variant: "success" },
  completed: { label: "Yakunlangan", variant: "gray" },
  draft: { label: "Qoralama", variant: "warning" },
};

const SemesterCard = ({ semester, group, onEdit, onDelete }) => {
  const expired =
    semester.deadline && new Date(semester.deadline) < new Date() && semester.status === "active";
  const daysLeft = semester.deadline ? Math.ceil(
    (new Date(semester.deadline) - Date.now()) / 86400000,
  ) : 0;
  const progress =
    semester.total > 0 ? (semester.submitted / semester.total) * 100 : 0;
  const cfg = statusCfg[semester.status] || statusCfg.draft;

  return (
    <Card
      className="hover:shadow-pop hover:border-ink-300 transition-all group flex flex-col"
      padded={false}
    >
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-3">
          <Badge variant={expired ? "danger" : cfg.variant} dot>
            {expired ? "Muddati o'tgan" : cfg.label}
          </Badge>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg text-ink-400 hover:text-ink-900 hover:bg-ink-100"
              title="Tahrirlash"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg text-ink-400 hover:text-danger-600 hover:bg-danger-50"
              title="O'chirish"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h3 className="font-semibold text-ink-900 leading-tight line-clamp-2">
          {semester.name}
        </h3>
        <div className="mt-1 text-sm text-ink-500">{semester.subject}</div>

        {semester.sourceFile && (
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-brand-700 bg-brand-50 border border-brand-100 px-2 py-1 rounded-md">
            <FileText className="w-3 h-3" /> {semester.sourceFile}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-ink-100 space-y-2">
          <InfoRow icon={Users} label={group?.name || "—"} />
          <InfoRow
            icon={Calendar}
            label={semester.deadline ? formatDate(semester.deadline) : "Muddatsiz"}
            suffix={
              semester.status === "active" && !expired && semester.deadline
                ? `${daysLeft} kun qoldi`
                : expired
                  ? "Muddati o'tdi"
                  : null
            }
            danger={expired}
          />
          <InfoRow
            icon={Clock}
            label={`${semester.duration} daqiqa`}
            suffix={`${semester.attempts} urinish`}
          />
        </div>

        <div className="mt-4 pt-4 border-t border-ink-100 grid grid-cols-2 gap-3">
          <MiniBlock label="Savollar" value={semester.questionCount} />
          <MiniBlock
            label="Topshirdi"
            value={`${semester.submitted}/${semester.total}`}
          />
        </div>

        {semester.total > 0 && (
          <div className="mt-4">
            <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  progress >= 80
                    ? "bg-success-500"
                    : progress >= 40
                      ? "bg-brand-500"
                      : "bg-warning-500",
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1 text-[11px] text-ink-500 font-medium">
              {Math.round(progress)}% topshirilgan
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

const InfoRow = ({ icon: Icon, label, suffix, danger }) => (
  <div
    className={cn(
      "flex items-center gap-2 text-xs",
      danger ? "text-danger-600" : "text-ink-700",
    )}
  >
    <Icon className="w-3.5 h-3.5 text-ink-400 flex-shrink-0" />
    <span className="truncate">{label}</span>
    {suffix && (
      <span
        className={cn(
          "ml-auto font-medium flex-shrink-0",
          danger ? "text-danger-600" : "text-ink-500",
        )}
      >
        {suffix}
      </span>
    )}
  </div>
);

const MiniBlock = ({ label, value }) => (
  <div className="bg-ink-50 rounded-lg px-3 py-2">
    <div className="text-[10px] text-ink-500 uppercase tracking-wide font-semibold">
      {label}
    </div>
    <div className="text-sm font-bold text-ink-900">{value}</div>
  </div>
);

export default Semesters;
