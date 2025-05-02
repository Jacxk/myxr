"use client";

import { useSession } from "~/lib/auth-client";

export function AuthenticatedClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  return session?.user ? <>{children}</> : null;
}

export function NotAuthenticatedClient({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { data: session } = useSession();
  return !session?.user ? <>{children}</> : null;
}
