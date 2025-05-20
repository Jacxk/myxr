"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";

export function TabLink({
  children,
  path,
  className = "",
}: Readonly<{
  children: React.ReactNode;
  path: string;
  className?: string;
}>) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(path);

  return (
    <Link
      href={path}
      className={cn(
        "hover:bg-secondary block rounded-md p-2 px-4",
        isActive ? "bg-secondary/50 text-primary/75" : "text-primary/50",
        className,
      )}
    >
      {children}
    </Link>
  );
}
