import { useState } from "react";
import { Copy, Check, AlertTriangle, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { copyToClipboard } from "../../utils/helpers";

const CredentialsModal = ({ open, onClose, credentials, mode = "created" }) => {
  const [copiedField, setCopiedField] = useState("");

  if (!credentials) return null;

  const title = mode === "reset" ? "Parol yangilandi" : "Kirish ma'lumotlari tayyor";
  const subtitle = credentials.fullName || "";

  const copy = async (label, value) => {
    if (await copyToClipboard(value)) {
      setCopiedField(label);
      toast.success("Nusxa olindi");
      setTimeout(() => setCopiedField(""), 1500);
    }
  };

  const copyAll = async () => {
    const text = `Login: ${credentials.username}\nParol: ${credentials.password}`;
    if (await copyToClipboard(text)) toast.success("Ma'lumotlar nusxalandi");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={copyAll} icon={Copy}>Hammasini nusxa olish</Button>
          <Button variant="brand" onClick={onClose}>Tushundim</Button>
        </>
      }
    >
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-success-50 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-success-600" />
          </div>
          <div>
            <h3 className="font-semibold text-ink-900">{title}</h3>
            {subtitle && <p className="text-sm text-ink-500">{subtitle}</p>}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-warning-50 border border-warning-100 flex gap-2.5 mb-5">
          <AlertTriangle className="w-4 h-4 text-warning-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-warning-700 leading-relaxed">
            <strong>Ogohlantirish:</strong> Bu parolni faqat hozir ko'rasiz.
            O'qituvchiga yuboring va xavfsiz saqlang.
          </div>
        </div>

        <div className="space-y-3">
          <CredField label="Login" value={credentials.username}
            onCopy={() => copy("username", credentials.username)}
            copied={copiedField === "username"}
          />
          <CredField label="Parol" value={credentials.password}
            onCopy={() => copy("password", credentials.password)}
            copied={copiedField === "password"}
          />
        </div>
      </div>
    </Modal>
  );
};

const CredField = ({ label, value, onCopy, copied }) => (
  <div>
    <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wide mb-1.5">
      {label}
    </label>
    <div className="flex gap-2">
      <div className="flex-1 px-3.5 py-2.5 bg-ink-50 border border-ink-200 rounded-lg font-mono text-sm text-ink-900 select-all">
        {value}
      </div>
      <button
        onClick={onCopy}
        className="w-11 h-11 rounded-lg bg-ink-900 text-white hover:bg-ink-700 flex items-center justify-center transition-colors flex-shrink-0"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  </div>
);

export default CredentialsModal;
