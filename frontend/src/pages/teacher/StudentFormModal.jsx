import { useState, useEffect } from "react";
import { User, Mail, Lock, Users } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";

const empty = {
  fullName: "",
  email: "",
  password: "",
  groupId: "",
};

const StudentFormModal = ({ open, onClose, onSave, groups, loading }) => {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(empty);
      setErrors({});
    }
  }, [open]);

  const update = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "To'liq ismni kiriting";
    if (!form.email.trim()) e.email = "Emailni kiriting";
    if (!form.password.trim() || form.password.length < 6) e.password = "Parol kamida 6ta belgi";
    if (!form.groupId) e.groupId = "Guruhni tanlang";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({ ...form, role: "student" });
  };

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      title="Yangi o'quvchi qo'shish"
      description="Talaba hisobini yarating va uni guruhga biriktiring"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Bekor qilish
          </Button>
          <Button variant="brand" onClick={handleSubmit} loading={loading}>
            Qo'shish
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="To'liq ism *"
          icon={User}
          value={form.fullName}
          onChange={(e) => update("fullName", e.target.value)}
          placeholder="Aliyev Valiy"
          error={errors.fullName}
        />
        <Input
          label="Email *"
          icon={Mail}
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="student@mail.com"
          error={errors.email}
        />
        <Input
          label="Parol *"
          icon={Lock}
          type="password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          placeholder="••••••••"
          error={errors.password}
        />
        <Select
          label="Guruh *"
          value={form.groupId}
          onChange={(e) => update("groupId", parseInt(e.target.value) || "")}
          error={errors.groupId}
        >
          <option value="">Guruhni tanlang</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
      </div>
    </Modal>
  );
};

export default StudentFormModal;
