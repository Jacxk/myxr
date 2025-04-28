import { getServerSession } from "~/lib/auth";
import { TabLink } from "../_components/tab-link";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  const guilds = session?.user.guilds;

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-row flex-wrap justify-center gap-1 border-b">
        {guilds?.map((guild, i) => (
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
