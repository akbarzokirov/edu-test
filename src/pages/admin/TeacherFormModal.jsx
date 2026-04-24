import { useEffect, useState } from "react";
import { User, Mail, Phone, RefreshCw } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { cn, generatePassword, generateUsername } from "../../utils/helpers";
import { SUBJECTS, mockGroups } from "../../utils/mockData";

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  groups: [],
  username: "",
  password: "",
};

const TeacherFormModal = ({ open, onClose, onSave, teacher }) => {
  const isEdit = Boolean(teacher);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (teacher) {
      setForm({
        fullName: teacher.fullName || "",
        email: teacher.email || "",
        phone: teacher.phone || "",
        subject: teacher.subject || "",
        groups: teacher.groups || [],
        username: teacher.username || "",
        password: "",
      });
    } else {
      setForm({ ...emptyForm });
    }
    setErrors({});
  }, [open, teacher]);

  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: null }));
  };

  const toggleGroup = (id) => {
    setForm((f) => ({
      ...f,
      groups: f.groups.includes(id)
        ? f.groups.filter((g) => g !== id)
        : [...f.groups, id],
    }));
  };

  const autoUsername = () => {
    const u = generateUsername(form.fullName);
    update("username", u);
  };

  const autoPassword = () => update("password", generatePassword(10));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Ism kiriting";
    if (!form.email.trim()) e.email = "Email kiriting";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Email noto'g'ri";
    if (!form.subject) e.subject = "Fan tanlang";
    if (form.groups.length === 0) e.groups = "Kamida bitta guruh tanlang";
    if (!isEdit) {
      if (!form.username.trim()) e.username = "Login kiriting";
      if (!form.password) e.password = "Parol kiriting";
      else if (form.password.length < 6) e.password = "Kamida 6 ta belgi";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    onSave(form);
    setLoading(false);
  };

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      size="2xl"
      title={isEdit ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi qo'shish"}
      description={
        isEdit
          ? "O'qituvchi ma'lumotlarini yangilang."
          : "Yangi o'qituvchini tizimga qo'shing va unga login ma'lumotlarini bering."
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Bekor qilish
          </Button>
          <Button variant="brand" onClick={handleSubmit} loading={loading}>
            {isEdit ? "Saqlash" : "Yaratish"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Section title="Shaxsiy ma'lumotlar">
          <Input
            label="To'liq ism"
            icon={User}
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            placeholder="Masalan: Nargiza Saidova"
            error={errors.fullName}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email"
              type="email"
              icon={Mail}
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="name@edutest.uz"
              error={errors.email}
            />
            <Input
              label="Telefon"
              icon={Phone}
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+998 __ ___ __ __"
            />
          </div>
        </Section>

        <Section title="O'qitadigan fan">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {SUBJECTS.map((s) => {
              const active = form.subject === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => update("subject", s)}
                  className={cn(
                    "px-3 py-2 rounded-lg border text-sm font-medium transition",
                    active
                      ? "bg-brand-50 border-brand-200 text-brand-700"
                      : "bg-white border-ink-200 text-ink-700 hover:border-ink-300 hover:bg-ink-50"
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
          {errors.subject && (
            <p className="mt-1.5 text-xs text-danger-600">{errors.subject}</p>
          )}
        </Section>

        <Section title="Guruhlar" description="Bir nechta guruh tanlashingiz mumkin">
          <div className="flex flex-wrap gap-2">
            {mockGroups.map((g) => {
              const active = form.groups.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleGroup(g.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full border text-xs font-medium transition",
                    active
                      ? "bg-brand-600 border-brand-600 text-white"
                      : "bg-white border-ink-200 text-ink-700 hover:border-ink-300"
                  )}
                >
                  {g.name}
                </button>
              );
            })}
          </div>
          {errors.groups && (
            <p className="mt-2 text-xs text-danger-600">{errors.groups}</p>
          )}
        </Section>

        {!isEdit && (
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-ink-900 text-sm">
                  Login ma'lumotlari
                </h4>
                <p className="text-xs text-ink-500">
                  O'qituvchi bu ma'lumotlar bilan tizimga kiradi
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-ink-700">Login</label>
                  <button
                    type="button"
                    onClick={autoUsername}
                    className="text-xs text-brand-600 font-medium hover:text-brand-700 inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Avto
                  </button>
                </div>
                <input
                  value={form.username}
                  onChange={(e) => update("username", e.target.value)}
                  placeholder="n.saidova"
                  className={cn(
                    "input-base",
                    errors.username &&
                      "border-danger-300 focus:border-danger-500 focus:ring-danger-100"
                  )}
                />
                {errors.username && (
                  <p className="mt-1 text-xs text-danger-600">{errors.username}</p>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-ink-700">Parol</label>
                  <button
                    type="button"
                    onClick={autoPassword}
                    className="text-xs text-brand-600 font-medium hover:text-brand-700 inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Generatsiya
                  </button>
                </div>
                <input
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="Kamida 6 ta belgi"
                  className={cn(
                    "input-base font-mono",
                    errors.password &&
                      "border-danger-300 focus:border-danger-500 focus:ring-danger-100"
                  )}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-danger-600">{errors.password}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

const Section = ({ title, description, children }) => (
  <div>
    <div className="mb-3">
      <h4 className="font-semibold text-sm text-ink-900">{title}</h4>
      {description && (
        <p className="text-xs text-ink-500 mt-0.5">{description}</p>
      )}
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

export default TeacherFormModal;
