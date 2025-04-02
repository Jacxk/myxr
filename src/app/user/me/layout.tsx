import { Castle, Volume2 } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import { TabLink } from "./_components/tab-link";

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
        <TabLink href="/user/me/sounds" className="flex flex-row gap-2">
          <Volume2 />
          <span className="hidden sm:block">My Sounds</span>
        </TabLink>
        <TabLink href="/user/me/guilds" className="flex flex-row gap-2">
          <Castle />
          <span className="hidden sm:block">Guilds</span>
        </TabLink>
      </div>
      {children}
    </div>
  );
}
