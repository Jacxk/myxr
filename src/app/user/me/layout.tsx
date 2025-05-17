import { Castle, Flag, Heart, Trash, Volume2 } from "lucide-react";
import { redirect } from "next/navigation";
import { type ReactNode } from "react";
import { getServerSession } from "~/lib/auth";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/server";
import { TabLink } from "./_components/tab-link";

function Tab({
  path,
  exact,
  label,
  icon,
  className,
}: {
  path: string;
  exact?: boolean;
  className?: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <TabLink
      href={`/user/me/${path}`}
      matchExact={exact ? "/user/me" : undefined}
      className={cn("flex flex-row gap-2", className)}
    >
      {icon}
      <span className="hidden sm:block">{label}</span>
    </TabLink>
  );
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session?.user) return redirect("/");

  const {
    user: { id: userId, guilds },
  } = session;

  void api.guild.getGuildSounds.prefetch(userId);

  if (guilds.length > 0 && guilds[0]?.id) {
    void api.guild.getGuildSounds.prefetch(guilds[0].id);
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="flex flex-row justify-center gap-2 sm:w-1/2 sm:flex-col sm:justify-start lg:w-1/4">
        <Tab
          path="sounds"
          label="My Sounds"
          icon={<Volume2 className="shrink-0" />}
          exact
        />
        <Tab
          path="liked-sounds"
          label="Liked Sounds"
          icon={<Heart className="shrink-0" />}
        />
        <Tab
          path={`guilds/${guilds[0]?.id ?? ""}`}
          label="Guilds"
          icon={<Castle className="shrink-0" />}
        />
        <Tab
          path="reports"
          label="Reports"
          icon={<Flag className="shrink-0" />}
        />
        <Tab
          path="delete-account"
          label="Delete Account"
          icon={<Trash />}
          className="text-red-500 hover:bg-red-500/20"
        />
      </div>
      {children}
    </div>
  );
}
