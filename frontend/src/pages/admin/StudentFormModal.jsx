import { useEffect, useState } from "react";
import { User, Mail, Lock, BookOpen, Search } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import { cn } from "../../utils/helpers";

const emptyForm = {
  fullName: "",
  email: "",
  groupId: "",
  password: "",
};

const StudentFormModal = ({ open, onClose, onSave, student, groups = [] }) => {
  const isEdit = Boolean(student);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (student) {
      setForm({
        fullName: student.fullName || "",
        email: student.email || "",
        groupId: student.groupId || "",
        password: "",
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [open, student]);

  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Ism Familiya kiriting";
    if (!form.groupId) e.groupId = "Guruh tanlang";
    if (!form.email.trim()) e.email = "Email kiriting";
    if (!isEdit && !form.password) e.password = "Parol kiriting";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await onSave(form);
    setLoading(false);
  };

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      size="lg"
      title={isEdit ? "Talaba Ma'lumotlarini Tahrirlash" : "Yangi Talaba Qo'shish"}
      footer={
        <div className="flex gap-3 w-full">
          <Button variant="secondary" onClick={onClose} disabled={loading} className="flex-1">Bekor</Button>
          <Button variant="brand" onClick={handleSubmit} loading={loading} className="flex-1">
            {isEdit ? "Saqlash" : "Yaratish"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <Input
          label="To'liq ism (F.I.SH)"
          value={form.fullName}
          onChange={(e) => update("fullName", e.target.value)}
          placeholder="Abdullayev Jasur"
          error={errors.fullName}
          icon={User}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Guruhni tanlang"
            value={form.groupId}
            onChange={(e) => update("groupId", e.target.value)}
            error={errors.groupId}
          >
            <option value="">Guruh tanlang...</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </Select>

          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="student@email.com"
            error={errors.email}
            icon={Mail}
          />
        </div>

        {!isEdit && (
          <Input
            label="Parol"
            type="text"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="Kamida 6 belgi"
            error={errors.password}
            icon={Lock}
          />
        )}

        <div className="p-4 rounded-xl bg-ink-50 border border-ink-100 flex gap-3">
          <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-[10px]">ℹ️</span>
          </div>
          <p className="text-xs text-ink-600 leading-relaxed">
            Talaba tizimga kirish uchun ushbu email va paroldan foydalanadi. 
            Guruh o'zgartirilsa, barcha natijalar saqlanib qoladi.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default StudentFormModal;
