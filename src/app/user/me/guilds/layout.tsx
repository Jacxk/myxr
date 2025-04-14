import { auth } from "~/server/auth";
import { TabLink } from "../_components/tab-link";

export default async function ({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-row flex-wrap justify-center gap-1 border-b">
        {session?.user.guilds.map((guild, i) => (
          <TabLink
            className="rounded-b-none"
            key={guild.id}
            href={`/user/me/guilds/${guild.id}`}
            matchExact={i === 0 ? `/user/me/guilds` : undefined}
          >
            {guild.name}
          </TabLink>
        ))}
      </div>
      <div className="flex py-6">{children}</div>
    </div>
  );
}
