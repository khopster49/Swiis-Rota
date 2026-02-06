import { cn } from "@/lib/utils";

export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("max-w-md mx-auto pb-24", className)}>
      {children}
    </main>
  );
}
