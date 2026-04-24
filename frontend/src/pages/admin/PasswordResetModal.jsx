import { useState } from "react";
import { Lock, Eye, EyeOff, ShieldAlert } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const PasswordResetModal = ({ open, onClose, onConfirm, user }) => {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password || password.length < 6) return;
    setLoading(true);
    await onConfirm(user.id, password);
    setLoading(false);
    setPassword("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Parolni yangilash"
      description={`"${user?.fullName}" uchun yangi parol kiriting.`}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Bekor qilish</Button>
          <Button 
            variant="brand" 
            onClick={handleSubmit} 
            loading={loading}
            disabled={password.length < 6}
          >
            Yangilash
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-danger-50 border border-danger-100 flex gap-3 text-xs text-danger-600">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <p>Yangi parolni o'qituvchiga yetkazishni unutmang. Eski parol endi ishlamaydi.</p>
        </div>
        
        <div className="relative">
          <Input
            label="Yangi parol"
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Kamida 6 ta belgi"
            icon={Lock}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 bottom-2.5 p-1 text-ink-400 hover:text-ink-600"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PasswordResetModal;
