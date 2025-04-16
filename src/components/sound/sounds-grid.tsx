import { cn } from "~/lib/utils";

export function SoundsGrid({
  children,
  className = "",
}: Readonly<{ children: React.ReactNode; className?: string }>) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9",
        className,
      )}
    >
      {children}
    </div>
  );
}
