import { cn } from "~/lib/utils";

export function Main({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex min-h-full w-full max-w-7xl grow flex-col gap-10 p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
