import { cn } from "../../utils/helpers";

const Card = ({ children, className = "", padded = true, ...props }) => {
  return (
    <div className={cn("card", padded && "p-5", className)} {...props}>
      {children}
    </div>
  );
};
export default Card;
