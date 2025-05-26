import { unauthorized } from "next/navigation";
import { getServerSession } from "~/lib/auth";
import { UserTabsAccount } from "./_components/tab-link";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session?.user) return unauthorized();

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <UserTabsAccount />
      {children}
    </div>
  );
}
