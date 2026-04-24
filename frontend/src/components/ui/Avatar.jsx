import { cn, getInitials, getAvatarColor } from "../../utils/helpers";

const sizes = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
  "2xl": "w-24 h-24 text-2xl",
};

const Avatar = ({ name, src, size = "md", className = "" }) => {
  const colors = getAvatarColor(name);
  return (
    <div
      className={cn(
        "rounded-full inline-flex items-center justify-center font-semibold flex-shrink-0 overflow-hidden",
        !src && colors.bg,
        !src && colors.text,
        sizes[size],
        className
      )}
    >
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : getInitials(name)}
    </div>
  );
};
export default Avatar;
