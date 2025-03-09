'use client'

import { useSession } from "next-auth/react";

export function Authenticated({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  return session?.user ? <>{children}</> : null;
}

export function NotAuthenticated({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { data: session } = useSession();
  return !session?.user ? <>{children}</> : null;
}
