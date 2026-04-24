import { AlertTriangle, Trash2 } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

const ConfirmDialog = ({
  open, onClose, onConfirm,
  title = "Tasdiqlang", description,
  confirmText = "Tasdiqlash", cancelText = "Bekor qilish",
  variant = "danger", loading = false,
}) => {
  const iconCfg = variant === "danger"
    ? { Icon: Trash2, wrap: "bg-danger-50", color: "text-danger-600" }
    : { Icon: AlertTriangle, wrap: "bg-warning-50", color: "text-warning-600" };

  return (
    <Modal
      open={open} onClose={onClose} size="sm"
      footer={<>
        <Button variant="secondary" onClick={onClose} disabled={loading}>{cancelText}</Button>
        <Button variant={variant === "danger" ? "danger" : "brand"} onClick={onConfirm} loading={loading}>{confirmText}</Button>
      </>}
    >
      <div className="flex gap-4">
        <div className={`w-11 h-11 rounded-full ${iconCfg.wrap} flex items-center justify-center flex-shrink-0`}>
          <iconCfg.Icon className={`w-5 h-5 ${iconCfg.color}`} />
        </div>
        <div className="flex-1 pt-0.5">
          <h3 className="text-base font-semibold text-ink-900">{title}</h3>
          {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
        </div>
      </div>
    </Modal>
  );
};
export default ConfirmDialog;
