import { Castle, Flag, Heart, Volume2 } from "lucide-react";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import { TabLink } from "./_components/tab-link";

function Tab({
  path,
  exact,
  label,
  icon,
}: Readonly<{
  path: string;
  exact?: boolean;
  label: string;
  icon: ReactNode;
}>) {
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

export default async function ({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (session?.user) {
    void api.user.getGuildSounds.prefetch(session.user.id);
    void api.user.getGuildSounds.prefetch(session.user.guilds[0]?.id!);
  } else {
    return redirect("/");
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="flex flex-row justify-center gap-2 sm:w-1/2 sm:flex-col sm:justify-start lg:w-1/4">
        <Tab path="sounds" label="My Sounds" icon={<Volume2 />} exact />
        <Tab path="liked-sounds" label="Liked Sounds" icon={<Heart />} />
        <Tab path="guilds" label="Guilds" icon={<Castle />} />
        <Tab path="reports" label="Reports" icon={<Flag />} />
      </div>
      {children}
    </div>
  );
}
