import { Loader2 } from "lucide-react";
import { cn } from "../../utils/helpers";

const variants = {
  primary: "bg-ink-900 text-white hover:bg-ink-700 shadow-soft",
  brand: "bg-brand-600 text-white hover:bg-brand-700 shadow-brand-glow",
  secondary: "bg-white text-ink-900 border border-ink-200 hover:bg-ink-50 hover:border-ink-300",
  ghost: "text-ink-700 hover:bg-ink-100",
  danger: "bg-danger-500 text-white hover:bg-danger-600 shadow-soft",
  "danger-ghost": "text-danger-600 hover:bg-danger-50",
  success: "bg-success-600 text-white hover:bg-success-700 shadow-soft",
};

const sizes = {
  xs: "h-7 px-2.5 text-xs gap-1.5",
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-[15px]",
  icon: "h-9 w-9",
  "icon-sm": "h-8 w-8",
};

const Button = ({
  children, variant = "primary", size = "md", loading = false,
  disabled = false, icon: Icon, iconRight: IconRight, className = "",
  type = "button", ...props
}) => {
  const iconOnly = size === "icon" || size === "icon-sm";
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn("btn-base", variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        Icon && <Icon className={cn(size === "xs" ? "w-3.5 h-3.5" : "w-4 h-4")} />
      )}
      {!iconOnly && children}
      {!loading && IconRight && <IconRight className="w-4 h-4" />}
    </button>
  );
};

export default Button;
