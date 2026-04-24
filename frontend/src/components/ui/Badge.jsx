import { cn } from "../../utils/helpers";

const variants = {
  gray: "bg-ink-100 text-ink-700 border-ink-200",
  success: "bg-success-50 text-success-700 border-success-100",
  danger: "bg-danger-50 text-danger-700 border-danger-100",
  warning: "bg-warning-50 text-warning-600 border-warning-100",
  info: "bg-brand-50 text-brand-700 border-brand-100",
  purple: "bg-violet-50 text-violet-700 border-violet-100",
};
const dotColors = {
  gray: "bg-ink-400", success: "bg-success-500", danger: "bg-danger-500",
  warning: "bg-warning-500", info: "bg-brand-500", purple: "bg-violet-500",
};

const Badge = ({ children, variant = "gray", dot = false, className = "" }) => (
  <span className={cn(
    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border",
    variants[variant], className
  )}>
    {dot && <span className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])} />}
    {children}
  </span>
);
export default Badge;
