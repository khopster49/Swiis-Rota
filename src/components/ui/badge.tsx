import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "orange" | "blue" | "green" | "purple" | "red";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  orange: "bg-swiis-orange-light text-swiis-orange dark:bg-swiis-orange/20",
  blue: "bg-swiis-blue-light text-swiis-blue dark:bg-swiis-blue/20",
  green: "bg-swiis-green-light text-swiis-green dark:bg-swiis-green/20",
  purple: "bg-swiis-purple-light text-swiis-purple dark:bg-swiis-purple/20",
  red: "bg-swiis-red-light text-swiis-red dark:bg-swiis-red/20",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
