import { useEffect, useState, useRef } from "react";
import {
  Upload,
  FileText,
  X,
  Sparkles,
  Clock,
  RotateCcw,
  Calendar,
  CheckCircle2,
  Zap,
  AlertCircle,
} from "lucide-react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { SUBJECTS } from "../../utils/mockData";
import { cn } from "../../utils/helpers";
import api from "../../api/axios";

const empty = {
  name: "",
  subject: "Matematika",
  groupId: "",
  description: "",
  aiPrompt: "",
  questionCount: 20,
  attempts: 2,
  duration: 60,
  deadline: "",
  autoGrade: true,
  sourceFile: null,
};

const SemesterFormModal = ({
  open,
  onClose,
  onSave,
  semester,
  loading = false,
}) => {
  const isEdit = !!semester;
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [dragOver, setDragOver] = useState(false);
  const [groups, setGroups] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      fetchGroups();
      if (semester) {
        setForm({
          name: semester.name || "",
          subject: semester.subject || "Matematika",
          groupId: semester.groupId || "",
          description: semester.description || "",
          aiPrompt: semester.aiPrompt || "",
          questionCount: semester.questionCount || 20,
          attempts: semester.attempts || 2,
          duration: semester.duration || 60,
          deadline: semester.deadline ? new Date(semester.deadline).toISOString().slice(0, 16) : "",
          autoGrade: semester.autoGrade ?? true,
          sourceFile: semester.sourceFile
            ? { name: semester.sourceFile, size: null }
            : null,
        });
      } else {
        setForm(empty);
      }
      setErrors({});
    }
  }, [open, semester]);

  const fetchGroups = async () => {
    try {
      const res = await api.get("/teacher/groups");
      setGroups(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const update = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const handleFile = (file) => {
    if (!file) return;
    const ok = /\.(pdf|docx?|txt)$/i.test(file.name);
    if (!ok) {
      setErrors((e) => ({
        ...e,
        sourceFile: "Faqat PDF, DOCX, DOC yoki TXT formatdagi fayllar",
      }));
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrors((e) => ({
        ...e,
        sourceFile: "Fayl hajmi 20MB dan oshmasligi kerak",
      }));
      return;
    }
    update("sourceFile", file);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Semestr nomini kiriting";
    if (!form.groupId) e.groupId = "Guruhni tanlang";
    if (!form.aiPrompt.trim() || form.aiPrompt.length < 10)
      e.aiPrompt = "AI prompt kamida 10 ta belgi bo'lsin";
    if (form.questionCount < 5 || form.questionCount > 100)
      e.questionCount = "5-100 oralig'ida";
    if (form.attempts < 1 || form.attempts > 10) e.attempts = "1-10 oralig'ida";
    if (form.duration < 5) e.duration = "Kamida 5 daqiqa";
    if (!form.deadline) e.deadline = "Deadline sanasini kiriting";
    else if (new Date(form.deadline) < new Date())
      e.deadline = "Deadline kelajakda bo'lishi kerak";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      ...form,
      deadline: new Date(form.deadline).toISOString(),
      sourceFile: form.sourceFile?.name || null,
    });
  };

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      size="2xl"
      title={isEdit ? "Semestrni tahrirlash" : "Yangi semestr yaratish"}
      description={
        isEdit
          ? "Semestr sozlamalarini yangilang"
          : "Fayl yuklang, AI avtomatik test yaratadi"
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Bekor qilish
          </Button>
          <Button
            variant="brand"
            onClick={handleSubmit}
            loading={loading}
            icon={Sparkles}
          >
            {isEdit ? "Saqlash" : "Semestr yaratish"}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <Section
          title="Asosiy ma'lumotlar"
          description="Semestr haqidagi umumiy ma'lumotlar"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Semestr nomi *"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Masalan: Algebra asoslari"
              error={errors.name}
            />
            <Select
              label="Fan *"
              value={form.subject}
              onChange={(e) => update("subject", e.target.value)}
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Select
              label="Guruh *"
              value={form.groupId}
              onChange={(e) =>
                update("groupId", parseInt(e.target.value) || "")
              }
              error={errors.groupId}
            >
              <option value="">Guruhni tanlang</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} — {g.students?.length || 0} o'quvchi
                </option>
              ))}
            </Select>
            <Input
              label="Deadline *"
              type="datetime-local"
              icon={Calendar}
              value={form.deadline}
              onChange={(e) => update("deadline", e.target.value)}
              error={errors.deadline}
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-ink-700 mb-1.5">
              Tavsif
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Semestr haqida qisqacha (ixtiyoriy)"
              rows={2}
              className="input-base resize-none"
            />
          </div>
        </Section>

        <Section
          title="Manba fayl"
          description="Darslik/qo'llanma PDF, Word yoki TXT formatda (ixtiyoriy, AI to'ldiriladi)"
        >
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all text-center",
              dragOver
                ? "border-brand-500 bg-brand-50"
                : "border-ink-200 hover:border-ink-300 hover:bg-ink-50",
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="hidden"
            />
            {form.sourceFile ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-sm font-semibold text-ink-900 truncate">
                    {form.sourceFile.name}
                  </div>
                  {form.sourceFile.size && (
                    <div className="text-xs text-ink-500">
                      {(form.sourceFile.size / 1024).toFixed(1)} KB
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    update("sourceFile", null);
                  }}
                  className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-ink-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-ink-900">
                  Faylni tashlang yoki{" "}
                  <span className="text-brand-600">tanlash uchun bosing</span>
                </p>
                <p className="text-xs text-ink-500 mt-1">
                  PDF, DOCX, DOC, TXT · maks 20MB
                </p>
              </>
            )}
          </div>
          {errors.sourceFile && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-danger-600">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.sourceFile}
            </div>
          )}
        </Section>

        <Section
          title="AI ko'rsatmasi"
          description="AI qanday testlar yaratishi kerakligini tavsiflab bering"
          icon={Sparkles}
          iconColor="text-brand-600"
        >
          <div>
            <textarea
              value={form.aiPrompt}
              onChange={(e) => update("aiPrompt", e.target.value)}
              placeholder="Masalan: 11-sinf algebra darsligidan kvadrat tenglamalar mavzusida 20 ta test yarating. Savollar oson, o'rta va qiyin darajalarda bo'lsin. LaTeX formulalarini qo'llang."
              rows={4}
              className={cn(
                "input-base resize-none",
                errors.aiPrompt && "border-danger-500",
              )}
            />
            {errors.aiPrompt && (
              <p className="mt-1.5 text-xs text-danger-600">
                {errors.aiPrompt}
              </p>
            )}
            <div className="mt-2 flex items-start gap-2 text-xs text-ink-500">
              <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <span>
                AI o'zbek, rus yoki ingliz tilida ishlaydi. Matematik formulalar
                LaTeX sintaksisida yoziladi.
              </span>
            </div>
          </div>
        </Section>

        <Section
          title="Test parametrlari"
          description="Savollar soni, urinishlar, vaqt"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Savollar soni"
              type="number"
              min="5"
              max="100"
              icon={FileText}
              value={form.questionCount}
              onChange={(e) =>
                update("questionCount", parseInt(e.target.value) || 0)
              }
              hint="5-100 oralig'ida"
              error={errors.questionCount}
            />
            <Input
              label="Urinishlar"
              type="number"
              min="1"
              max="10"
              icon={RotateCcw}
              value={form.attempts}
              onChange={(e) =>
                update("attempts", parseInt(e.target.value) || 0)
              }
              hint="1-10 marta"
              error={errors.attempts}
            />
            <Input
              label="Vaqt (daqiqa)"
              type="number"
              min="5"
              icon={Clock}
              value={form.duration}
              onChange={(e) =>
                update("duration", parseInt(e.target.value) || 0)
              }
              hint="Test uchun vaqt"
              error={errors.duration}
            />
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-ink-50 border border-ink-100 flex items-start gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                form.autoGrade
                  ? "bg-success-100 text-success-700"
                  : "bg-ink-200 text-ink-500",
              )}
            >
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm text-ink-900">
                Avtomatik tekshiruv
              </div>
              <div className="text-xs text-ink-500 mt-0.5">
                Test yakunlanishi bilan AI natijalarni avtomatik baholaydi
              </div>
            </div>
            <button
              onClick={() => update("autoGrade", !form.autoGrade)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0",
                form.autoGrade ? "bg-brand-600" : "bg-ink-200",
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow",
                  form.autoGrade ? "translate-x-6" : "translate-x-1",
                )}
              />
            </button>
          </div>
        </Section>
      </div>
    </Modal>
  );
};

const Section = ({ title, description, children, icon: Icon, iconColor }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      {Icon && <Icon className={cn("w-4 h-4", iconColor || "text-ink-500")} />}
      <h4 className="text-sm font-semibold text-ink-900">{title}</h4>
    </div>
    {description && (
      <p className="text-xs text-ink-500 mb-4 -mt-2">{description}</p>
    )}
    {children}
  </div>
);

export default SemesterFormModal;
