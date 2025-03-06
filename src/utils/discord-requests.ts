import { type APIGuild, type APISoundboardSound } from "discord-api-types/v10";
import { env } from "~/env";
import { discordAuthorization } from "./db";

enum DiscordPermission {
  MANAGE_GUILD_EXPRESSIONS = 1 << 30,
}

interface DiscordError {
  message: string;
  code: number;
}

function hasPermission(userPermission: string, permission: DiscordPermission) {
  return (Number(userPermission) & permission) === permission;
}

async function createDiscordRequest<T>(
  path: string,
  authorization: string,
  opts?: RequestInit,
): Promise<T> {
  if (path.startsWith("/")) path = path.slice(1);

  const res = await fetch(`https://discord.com/api/v10/${path}`, {
    ...opts,
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  if (!res.ok) {
    const { message } = data as DiscordError;
    throw new Error(message || "Failed to fetch data from Discord");
  }

  return data as T;
}

export async function getDiscordGuilds(id: string) {
  const authorization = await discordAuthorization(id);
  const data = await createDiscordRequest<APIGuild[]>(
    "users/@me/guilds",
    authorization,
  );

  return data.filter(
    (guild: APIGuild) =>
      guild.owner ||
      hasPermission(
        guild.permissions!,
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
}): Promise<APISoundboardSound> {
  const body = JSON.stringify({
    name,
    sound,
    emoji_name: emoji,
  });
  const authorization = `Bot ${env.DISCORD_BOT_TOKEN}`;
  const data = await createDiscordRequest<APISoundboardSound>(
    `/guilds/${guildId}/soundboard-sounds`,
    authorization,
    {
      body,
      method: "POST",
    },
  );

  return data;
}
