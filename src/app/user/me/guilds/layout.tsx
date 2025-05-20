import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { getServerSession } from "~/lib/auth";
import { TabLink } from "../_components/tab-link";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  const guilds = session?.user.guilds;

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
              {guild.image && (
                <AvatarImage
                  className="rounded-full"
                  src={guild.image + "?size=32"}
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
