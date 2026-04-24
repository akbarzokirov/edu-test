import { useEffect, useState } from "react";
import { Sparkles, Clock, RotateCcw, Calendar, AlertCircle } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { cn } from "../../utils/helpers";

const SUBJECTS = [
  "Matematika", "Fizika", "Kimyo", "Biologiya", "Ingliz tili",
  "Rus tili", "Ona tili", "Adabiyot", "Tarix", "Geografiya",
  "Informatika", "Iqtisodiyot",
];

const empty = {
  name: "",
  subject: "Matematika",
  groupId: "",
  aiPrompt: "",
  questionCount: 10,
  attemptsAllowed: 2,
  durationMinutes: 30,
  deadline: "",
  isActive: true,
};

const SemesterFormModal = ({ open, onClose, onSave, semester, groups = [], loading = false }) => {
  const isEdit = !!semester;
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (semester) {
        setForm({
          name: semester.name || "",
          subject: semester.subject || "Matematika",
          groupId: semester.groupId || "",
          aiPrompt: semester.aiPrompt || "",
          questionCount: semester.questionCount || 10,
          attemptsAllowed: semester.attempts || 2,
          durationMinutes: semester.duration || 30,
          deadline: semester.deadline ? String(semester.deadline).slice(0, 16) : "",
          isActive: semester.status === "active",
        });
      } else {
        setForm(empty);
      }
      setErrors({});
    }
  }, [open, semester]);

  const update = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Semestr nomini kiriting";
    if (!form.groupId) e.groupId = "Guruhni tanlang";
    if (!form.aiPrompt.trim() || form.aiPrompt.length < 10)
      e.aiPrompt = "AI ko'rsatma kamida 10 ta belgi bo'lsin";
    if (form.questionCount < 5 || form.questionCount > 50)
      e.questionCount = "5-50 oralig'ida";
    if (!form.deadline) e.deadline = "Deadline sanasini kiriting";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      name: form.name.trim(),
      subject: form.subject,
      groupId: parseInt(form.groupId),
      aiPrompt: form.aiPrompt.trim(),
      questionCount: parseInt(form.questionCount),
      attemptsAllowed: parseInt(form.attemptsAllowed),
      durationMinutes: parseInt(form.durationMinutes),
      deadline: new Date(form.deadline).toISOString(),
      isActive: form.isActive,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? "Semestrni tahrirlash" : "Yangi semestr yaratish"}
      description="O'quvchi test boshlashda o'zi fayl yuklaydi — siz faqat ko'rsatma berasiz"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Bekor qilish</Button>
          <Button variant="brand" onClick={handleSubmit} loading={loading} icon={Sparkles}>
            {isEdit ? "Saqlash" : "Yaratish"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <div className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">Asosiy</div>
          <div className="space-y-3">
            <Input
              label="Semestr nomi *"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Masalan: Algebra asoslari"
              error={errors.name}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Fan</label>
                <Select value={form.subject} onChange={(e) => update("subject", e.target.value)}>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
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
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> AI uchun ko'rsatma *
          </div>
          <textarea
            value={form.aiPrompt}
            onChange={(e) => update("aiPrompt", e.target.value)}
            rows={4}
            className={cn("input-base", errors.aiPrompt && "border-danger-500")}
            placeholder="Masalan: Kvadrat tenglamalar, diskriminant va Vyeta teoremasi bo'yicha 4 variantli savollar. Turli darajada — oson, o'rta, qiyin aralash..."
          />
          {errors.aiPrompt && (
            <p className="mt-1 text-xs text-danger-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.aiPrompt}
            </p>
          )}
          <p className="mt-1.5 text-xs text-ink-500">
            O'quvchi yuklagan fayl + shu ko'rsatma asosida AI savollarni yaratadi.
          </p>
        </div>

        <div>
          <div className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">Parametrlar</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                <Sparkles className="w-3 h-3 inline mr-1" /> Savollar
              </label>
              <input
                type="number" min={5} max={50}
                value={form.questionCount}
                onChange={(e) => update("questionCount", e.target.value)}
                className={cn("input-base", errors.questionCount && "border-danger-500")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                <RotateCcw className="w-3 h-3 inline mr-1" /> Urinishlar
              </label>
              <input
                type="number" min={1} max={10}
                value={form.attemptsAllowed}
                onChange={(e) => update("attemptsAllowed", e.target.value)}
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                <Clock className="w-3 h-3 inline mr-1" /> Vaqt (daq)
              </label>
              <input
                type="number" min={5}
                value={form.durationMinutes}
                onChange={(e) => update("durationMinutes", e.target.value)}
                className="input-base"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-ink-700 mb-1.5">
              <Calendar className="w-3 h-3 inline mr-1" /> Deadline *
            </label>
            <input
              type="datetime-local"
              value={form.deadline}
              onChange={(e) => update("deadline", e.target.value)}
              className={cn("input-base", errors.deadline && "border-danger-500")}
            />
            {errors.deadline && (
              <p className="mt-1 text-xs text-danger-600">{errors.deadline}</p>
            )}
          </div>
          <div className="mt-3 flex items-center gap-3 p-3 rounded-lg bg-ink-50">
            <input
              id="isActive" type="checkbox"
              checked={form.isActive}
              onChange={(e) => update("isActive", e.target.checked)}
              className="w-4 h-4 rounded text-brand-600"
            />
            <label htmlFor="isActive" className="text-sm text-ink-700 flex-1 cursor-pointer">
              Faol (o'quvchilar testni boshlay oladi)
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SemesterFormModal;
