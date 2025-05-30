import { unauthorized } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { getServerSession } from "~/lib/auth";
import { api } from "~/trpc/server";
import { TabLink } from "../_components/tab-link";

const getImage = (icon: string | null, id: string) =>
  icon ? `https://cdn.discordapp.com/icons/${id}/${icon}.png` : null;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session) return unauthorized();

  const guilds = await api.user.getGuilds();

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-row gap-1 overflow-x-auto border-b sm:justify-center">
        {guilds?.map((guild) => (
          <TabLink
            className="rounded-b-none"
            key={guild.id}
            path={`/user/me/guilds/${guild.id}`}
          >
            <Avatar title={guild.name}>
              {getImage(guild.icon, guild.id) && (
                <AvatarImage
                  className="rounded-full"
                  src={getImage(guild.icon, guild.id) + "?size=32"}
                  alt={guild.name}
                  useNextImage
                />
              )}
              <AvatarFallback className="flex items-center justify-center text-xs">
                {guild.name.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </TabLink>
        ))}
      </div>
      <div className="flex py-2">{children}</div>
    </div>
  );
}
