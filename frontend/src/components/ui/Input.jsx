import { forwardRef } from "react";
import { cn } from "../../utils/helpers";

const Input = forwardRef(
  ({ label, error, icon: Icon, iconRight: IconRight, className = "", hint, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-ink-700 mb-1.5">{label}</label>}
        <div className="relative">
          {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />}
          <input
            ref={ref}
            className={cn(
              "input-base",
              Icon && "pl-10",
              IconRight && "pr-10",
              error && "border-danger-500 focus:border-danger-500 focus:ring-danger-100",
              className
            )}
            {...props}
          />
          {IconRight && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <IconRight className="w-4 h-4 text-ink-400" />
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-danger-600">{error}</p>}
        {!error && hint && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
export default Input;
