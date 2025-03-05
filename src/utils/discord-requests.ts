import { env } from "~/env";
import { discordAuthorization } from "./db";

enum DiscordPermission {
  MANAGE_GUILD_EXPRESSIONS = 1 << 30,
}

function hasPermission(userPermission: number, permission: DiscordPermission) {
  return (userPermission & permission) === permission;
}

async function createDiscordRequest(
  path: string,
  authorization: string,
  opts?: RequestInit,
): Promise<Response> {
  if (path.startsWith("/")) path = path.slice(1);

  return await fetch(`https://discord.com/api/v10/${path}`, {
    ...opts,
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
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

export async function createSound({
  guildId,
  name,
  emoji,
  sound,
}: {
  guildId: string;
  name: string;
  emoji: string;
  sound: string;
}) {
  const body = JSON.stringify({
    name,
    emoji_name: emoji,
    sound,
  });
  const authorization = `Bot ${env.DISCORD_BOT_TOKEN}`;
  const res = await createDiscordRequest(
    `/guilds/${guildId}/soundboard-sounds`,
    authorization,
    {
      body,
      method: "POST",
    },
  );
  const data = await res.json();
  console.log(data);

  if (!res.ok) {
    throw new Error(data.message || "Failed to create sound");
  }

  return data;
}
