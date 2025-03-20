import { auth } from "~/server/auth";
import { TabLink } from "../_components/tab-link";

export default async function ({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row flex-wrap gap-2 w-full">
        {session?.user.guilds.map((guild) => (
          <TabLink key={guild.id} href={`/user/me/guilds/${guild.id}`}>
            {guild.name}
          </TabLink>
        ))}
      </div>
      {children}
    </div>
  );
}
