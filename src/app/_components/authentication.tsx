import { auth } from "~/server/auth";

export async function Authenticated({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return session?.user ? <>{children}</> : null;
}

export async function NotAuthenticated({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  return !session?.user ? <>{children}</> : null;
}
