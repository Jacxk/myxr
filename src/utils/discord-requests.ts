import { env } from "~/env";
import { discordAuthorization } from "./db";

enum DiscordPermission {
  MANAGE_GUILD_EXPRESSIONS = 1 << 30,
}

function hasPermission(userPermission: number, permission: DiscordPermission) {
  return (
    (userPermission & DiscordPermission.MANAGE_GUILD_EXPRESSIONS) ===
    DiscordPermission.MANAGE_GUILD_EXPRESSIONS
  );
}

async function createDiscordRequest(
  path: string,
  authorization: string,
): Promise<Response> {
  if (path.startsWith("/")) path = path.slice(1);

  return await fetch(`https://discord.com/api/v10/${path}`, {
    headers: {
      Authorization: authorization,
    },
  });
}

export async function getDiscordGuilds(id: string) {
  const authorization = await discordAuthorization(id);
  const res = await createDiscordRequest("users/@me/guilds", authorization);
  const data = await res.json();

  if (typeof data === "object" && data.message) throw new Error(data.message);

  return data.filter(
    (guild: any) =>
      guild.owner ||
      hasPermission(
        guild.permissions,
        DiscordPermission.MANAGE_GUILD_EXPRESSIONS,
      ),
  );
}
