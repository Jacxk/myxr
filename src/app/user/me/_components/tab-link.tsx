"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";

export function TabLink({
  children,
  href,
  className = "",
  matchExact,
}: Readonly<{
  children: React.ReactNode;
  href: string;
  className?: string;
  matchExact?: string;
}>) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href) || pathname === matchExact;

  return (
    <Link
      href={href}
      className={cn(
        "block rounded-md p-2 px-4 hover:bg-secondary",
        isActive ? "bg-secondary/50 text-primary/75" : "text-primary/50",
        className,
      )}
    >
      {children}
    </Link>
  );
}
