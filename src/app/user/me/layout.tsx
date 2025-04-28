import { Castle, Flag, Heart, Volume2 } from "lucide-react";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getServerSession } from "~/lib/auth";
import { api } from "~/trpc/server";
import { TabLink } from "./_components/tab-link";

function Tab({
  path,
  exact,
  label,
  icon,
}: {
  path: string;
  exact?: boolean;
  label: string;
  icon: ReactNode;
}) {
  return (
    <TabLink
      href={`/user/me/${path}`}
      matchExact={exact ? "/user/me" : undefined}
      className="flex flex-row gap-2"
    >
      {icon}
      <span className="hidden sm:block">{label}</span>
    </TabLink>
  );
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  if (session?.user) {
    const {
      user: { id: userId, guilds },
    } = session;

    void api.user.getGuildSounds.prefetch(userId);

    if (guilds.length > 0 && guilds[0]?.id) {
      void api.user.getGuildSounds.prefetch(guilds[0].id);
    }
  } else {
    return redirect("/");
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="flex flex-row justify-center gap-2 sm:w-1/2 sm:flex-col sm:justify-start lg:w-1/4">
        <Tab path="sounds" label="My Sounds" icon={<Volume2 className="shrink-0" />} exact />
        <Tab path="liked-sounds" label="Liked Sounds" icon={<Heart className="shrink-0" />} />
        <Tab path="guilds" label="Guilds" icon={<Castle className="shrink-0" />} />
        <Tab path="reports" label="Reports" icon={<Flag className="shrink-0" />} />
      </div>
      {children}
    </div>
  );
}
