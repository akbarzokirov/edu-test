import { useEffect, useState } from "react";
import { User, Mail, Lock, Plus, X, BookOpen, Lightbulb } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { cn } from "../../utils/helpers";

const emptyForm = {
  fullName: "",
  email: "",
  subject: "",
  groups: [], // Bu yerda guruh nomlari saqlanadi
  password: "",
};

const TeacherFormModal = ({ open, onClose, onSave, teacher }) => {
  const isEdit = Boolean(teacher);
  const [form, setForm] = useState(emptyForm);
  const [groupInput, setGroupInput] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (teacher) {
      setForm({
        fullName: teacher.fullName || "",
        email: teacher.email || "",
        subject: teacher.subject || "",
        groups: teacher.taughtGroups?.map(g => g.name) || [],
        password: "",
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [open, teacher]);

  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: null }));
  };

  const addGroup = () => {
    if (!groupInput.trim()) return;
    if (!form.groups.includes(groupInput.trim())) {
      update("groups", [...form.groups, groupInput.trim()]);
    }
    setGroupInput("");
  };

  const removeGroup = (name) => {
    update("groups", form.groups.filter(g => g !== name));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Ism Familiya kiriting";
    if (!form.subject.trim()) e.subject = "Fan nomini kiriting";
    if (!form.email.trim()) e.email = "Email kiriting";
    if (!isEdit && !form.password) e.password = "Parol kiriting";
    else if (!isEdit && form.password.length < 6) e.password = "Kamida 6 belgi";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    // Backendga yuborishda guruh nomlarini groupId larga o'tkazish logikasi kerak bo'lishi mumkin
    // Hozircha form ma'lumotlarini uzatamiz
    await onSave(form);
    setLoading(false);
  };

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      size="lg"
      title={isEdit ? "O'qituvchini Tahrirlash" : "Yangi O'qituvchi Qo'shish"}
      footer={
        <div className="flex gap-3 w-full">
          <Button 
            variant="secondary" 
            onClick={onClose} 
            disabled={loading}
            className="flex-1 py-3"
          >
            Bekor
          </Button>
          <Button 
            variant="brand" 
            onClick={handleSubmit} 
            loading={loading}
            className="flex-1 py-3 bg-brand-600 hover:bg-brand-700"
          >
            {isEdit ? "Saqlash" : "Yaratish"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6 pb-2">
        {/* Ism Familiya */}
        <div className="space-y-1.5">
          <label className="text-[15px] font-semibold text-ink-900 flex items-center gap-1">
            Ism Familiya <span className="text-danger-500">*</span>
          </label>
          <div className="relative group">
            <input
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="Abdullayev Jasur"
              className={cn(
                "w-full px-4 py-3 rounded-xl border border-ink-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all outline-none text-[15px]",
                errors.fullName && "border-danger-300 ring-danger-50"
              )}
            />
          </div>
          {errors.fullName && <p className="text-xs text-danger-600">{errors.fullName}</p>}
        </div>

        {/* Fan Nomi */}
        <div className="space-y-1.5">
          <label className="text-[15px] font-semibold text-ink-900">
            Fan Nomi <span className="text-danger-500">*</span>
          </label>
          <input
            value={form.subject}
            onChange={(e) => update("subject", e.target.value)}
            placeholder="Matematika, Fizika, Ingliz tili..."
            className={cn(
              "w-full px-4 py-3 rounded-xl border border-ink-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all outline-none text-[15px]",
              errors.subject && "border-danger-300 ring-danger-50"
            )}
          />
          {errors.subject && <p className="text-xs text-danger-600">{errors.subject}</p>}
        </div>

        {/* Guruhlar */}
        <div className="space-y-1.5">
          <label className="text-[15px] font-semibold text-ink-900">
            Boshqaradigan Guruhlar <span className="text-danger-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              value={groupInput}
              onChange={(e) => setGroupInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGroup()}
              placeholder="Guruh nomi (1-A, MT-22, ...)"
              className="flex-1 px-4 py-3 rounded-xl border border-ink-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all outline-none text-[15px]"
            />
            <button
              type="button"
              onClick={addGroup}
              className="w-[52px] h-[52px] rounded-xl bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 active:scale-95 transition-all shadow-md shadow-brand-100"
            >
              <Plus className="w-6 h-6" strokeWidth={3} />
            </button>
          </div>
          <p className="text-[13px] text-ink-400">Guruh nomini yozing va + tugmasini bosing</p>
          
          {/* Tanlangan guruhlar listi */}
          {form.groups.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {form.groups.map((g) => (
                <div key={g} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-sm font-medium border border-brand-100">
                  {g}
                  <button onClick={() => removeGroup(g)} className="hover:text-danger-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-[15px] font-semibold text-ink-900">
            Email <span className="text-danger-500">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="teacher@email.com"
            className={cn(
              "w-full px-4 py-3 rounded-xl border border-ink-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all outline-none text-[15px]",
              errors.email && "border-danger-300 ring-danger-50"
            )}
          />
          {errors.email && <p className="text-xs text-danger-600">{errors.email}</p>}
        </div>

        {/* Parol */}
        {!isEdit && (
          <div className="space-y-1.5">
            <label className="text-[15px] font-semibold text-ink-900">
              Parol <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="Kamida 6 belgi"
              className={cn(
                "w-full px-4 py-3 rounded-xl border border-ink-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-50 transition-all outline-none text-[15px]",
                errors.password && "border-danger-300 ring-danger-50"
              )}
            />
            {errors.password && <p className="text-xs text-danger-600">{errors.password}</p>}
          </div>
        )}

        {/* Info box */}
        <div className="p-4 rounded-xl bg-brand-50/50 border border-brand-100 flex gap-3">
          <div className="w-5 h-5 rounded-full bg-warning-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-[10px]">💡</span>
          </div>
          <p className="text-[13px] text-brand-700 leading-relaxed font-medium">
            O'qituvchi faqat belgilangan guruhlardagi talabalarni ko'ra va boshqara oladi
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default TeacherFormModal;
