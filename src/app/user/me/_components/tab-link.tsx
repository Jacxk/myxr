"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TabLink({
  children,
  href,
  className = "",
}: Readonly<{
  children: React.ReactNode;
  href: string;
  className?: string;
}>) {
  if (!href) throw Error("No href defined");
  const pathname = usePathname();

  const activeClass =
    pathname.startsWith(href)
      ? "bg-secondary/50"
      : "";

  return (
    <Link
      href={href}
      className={`block rounded-md p-2 hover:bg-secondary px-4 ${activeClass} ${className}`}
    >
      {children}
    </Link>
  );
}
