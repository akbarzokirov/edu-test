import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/helpers";

const Select = ({ label, error, className = "", containerClassName = "", children, ...props }) => {
  return (
    <div className={cn("w-full", containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-ink-700 mb-1.5">{label}</label>
      )}
      <div className="relative">
        <select
          className={cn(
            "input-base appearance-none pr-10 cursor-pointer",
            error && "border-danger-500 focus:border-danger-500 focus:ring-danger-100",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
      </div>
      {error && <p className="mt-1.5 text-xs text-danger-600">{error}</p>}
    </div>
  );
};

export default Select;
