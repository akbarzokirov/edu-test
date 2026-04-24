import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/helpers";

const sizes = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-2xl", "2xl": "max-w-4xl" };

const Modal = ({ open, onClose, title, description, children, size = "md", footer, className = "" }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        "relative bg-white rounded-2xl shadow-pop w-full max-h-[90vh] flex flex-col animate-scale-in",
        sizes[size], className
      )}>
        {title && (
          <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-ink-100">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
              {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-ink-100 bg-ink-50/50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
export default Modal;
