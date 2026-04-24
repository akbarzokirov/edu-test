import { cn } from "../../utils/helpers";

const EmptyState = ({ icon: Icon, title, description, action, className = "" }) => (
  <div className={cn("flex flex-col items-center justify-center text-center py-12 px-6", className)}>
    {Icon && (
      <div className="w-14 h-14 rounded-2xl bg-ink-100 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-ink-500" />
      </div>
    )}
    <h3 className="text-base font-semibold text-ink-900">{title}</h3>
    {description && <p className="mt-1 text-sm text-ink-500 max-w-sm">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
export default EmptyState;
