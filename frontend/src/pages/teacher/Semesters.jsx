import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  FileText,
  Edit2,
  Trash2,
  Sparkles,
  Clock,
  Users,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import { SkeletonCard } from "../../components/ui/Skeleton";
import SemesterFormModal from "./SemesterFormModal";
import { teacherApi } from "../../api/teacherApi";
import { formatDate } from "../../utils/helpers";

const Semesters = () => {
  const [items, setItems] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = () => {
    teacherApi
      .listSemesters()
      .then(({ data }) => setItems(data.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    teacherApi.groups().then(({ data }) => setGroups(data.data || []));
    load();
  }, []);

  const filtered = items.filter((s) => {
    const q = search.trim().toLowerCase();
    const mq =
      !q ||
      s.name.toLowerCase().includes(q) ||
      (s.subject || "").toLowerCase().includes(q);
    const mf = filter === "all" || s.status === filter;
    return mq && mf;
  });

  const handleAddClick = () => {
    if (groups.length === 0) {
      toast.error("Avval admin sizga guruh biriktirishi kerak");
      return;
    }
    setEditing(null);
    setModalOpen(true);
  };

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editing) {
        await teacherApi.updateSemester(editing.id, data);
        toast.success("Semestr yangilandi");
      } else {
        await teacherApi.createSemester(data);
        toast.success("Semestr yaratildi");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Xato");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await teacherApi.deleteSemester(deleteId);
      toast.success("Semestr o'chirildi");
      setDeleteId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Xato");
    }
  };

  return (
    <div>
      {/* Sarlavha + Yangi test tugmasi yonma-yon */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 tracking-tight">
            Mening testlarim
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Yangi AI testlar yarating va ularni boshqaring
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-brand-600 text-white text-sm font-semibold shadow-soft transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Yangi test</span>
        </button>
      </div>

      {groups.length === 0 && (
        <Card className="mb-4 bg-warning-50 border-warning-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-warning-700">
              Sizga hali guruh biriktirilmagan. Test yaratish uchun avval admin
              sizga guruh biriktirishi kerak.
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
              placeholder="Test nomi yoki fan bo'yicha..."
              className="input-base pl-10"
            />
          </div>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="sm:w-48"
          >
            <option value="all">Barcha holatlar</option>
            <option value="active">Faol</option>
            <option value="draft">Qoralama</option>
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Testlar yo'q"
          description={
            search || filter !== "all"
              ? "Filtrni o'zgartirib ko'ring"
              : "Yangi test yarating"
          }
          action={
            <Button variant="brand" icon={Plus} onClick={handleAddClick}>
              Yangi test
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <Card
              key={s.id}
              className="hover:shadow-pop hover:border-ink-300 transition-all flex flex-col"
              padded={false}
            >
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-3">
                  <Badge
                    variant={s.status === "active" ? "success" : "gray"}
                    dot
                  >
                    {s.status === "active" ? "Faol" : "Qoralama"}
                  </Badge>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditing(s);
                        setModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-500 hover:text-ink-900"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(s.id)}
                      className="p-1.5 rounded-lg hover:bg-danger-50 text-ink-500 hover:text-danger-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-ink-900 leading-tight line-clamp-2">
                  {s.name}
                </h3>
                <div className="mt-1 text-sm text-ink-500">
                  {s.subject || "—"} · {s.groupName}
                </div>

                <div className="mt-4 pt-4 border-t border-ink-100 space-y-2">
                  <InfoRow
                    icon={Sparkles}
                    label={`${s.questionCount} savol · AI`}
                  />
                  <InfoRow icon={Clock} label={`${s.duration} daq`} />
                  <InfoRow
                    icon={Users}
                    label={`${s.submitted}/${s.total} topshirdi`}
                  />
                  <InfoRow
                    icon={AlertCircle}
                    label={s.deadline ? formatDate(s.deadline) : "—"}
                  />
                </div>
              </div>
              <div className="p-5 pt-0">
                <div className="p-3 rounded-xl bg-brand-50 flex items-center justify-between">
                  <span className="text-xs font-medium text-ink-700">
                    Topshirish
                  </span>
                  <span className="text-sm font-bold text-ink-900">
                    {s.total > 0
                      ? Math.round((s.submitted / s.total) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <SemesterFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        semester={editing}
        groups={groups}
        loading={saving}
      />

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>
              Bekor qilish
            </Button>
            <Button variant="danger" icon={Trash2} onClick={handleDelete}>
              O'chirish
            </Button>
          </>
        }
      >
        <div className="flex gap-4">
          <div className="w-11 h-11 rounded-full bg-danger-50 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-danger-600" />
          </div>
          <div>
            <h3 className="font-semibold text-ink-900">Semestrni o'chirish</h3>
            <p className="mt-1 text-sm text-ink-600">
              Barcha urinishlar ham o'chadi. Bu amalni bekor qilib bo'lmaydi.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-2 text-xs text-ink-700">
    <Icon className="w-3.5 h-3.5 text-ink-400 flex-shrink-0" />
    <span className="truncate">{label}</span>
  </div>
);

export default Semesters;
