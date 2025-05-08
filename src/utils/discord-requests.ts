import type { APIGuild, APISoundboardSound } from "discord-api-types/v10";
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  return (Number(userPermission) & permission) === permission;
}

const BOT_AUTORIZATION = `Bot ${env.DISCORD_BOT_TOKEN}`;

async function createDiscordRequest<T>(
  path: string,
  authorization: string,
  opts?: RequestInit & { no_content_type?: boolean },
): Promise<T> {
  if (path.startsWith("/")) path = path.slice(1);

  const headers: HeadersInit = {
    Authorization: authorization,
    "Content-Type": "application/json",
  };

  if (opts?.no_content_type) delete headers["Content-Type"];

  const url = `https://discord.com/api/v10/${path}`;

  console.log(`[Discord Request] ${url}`);
  const res = await fetch(url, {
    ...opts,
    headers,
  });

  const data = (await res.json()) as T;

  if (!res.ok) {
    const { message } = data as DiscordError;
    throw new Error(message || "Failed to fetch data from Discord");
  }

  return data;
}

export async function getDiscordGuilds(id: string) {
  const authorization = await discordAuthorization(id);
  const data = await createDiscordRequest<APIGuild[]>(
    "users/@me/guilds",
    authorization,
  );

  return data.filter(
    (guild: APIGuild) =>
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
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
  const data = await createDiscordRequest<APISoundboardSound>(
    `/guilds/${guildId}/soundboard-sounds`,
    BOT_AUTORIZATION,
    {
      body,
      method: "POST",
    },
  );

  return data;
}

export async function getSoundBoard(guildId: string) {
  try {
    const data = await createDiscordRequest<{ items: APISoundboardSound[] }>(
      `/guilds/${guildId}/soundboard-sounds`,
      BOT_AUTORIZATION,
    );

    return data.items;
  } catch {
    return [];
  }
}

export async function deleteSound(guildId: string, soundId: string) {
  await createDiscordRequest(
    `/guilds/${guildId}/soundboard-sounds/${soundId}`,
    BOT_AUTORIZATION,
    {
      method: "DELETE",
      no_content_type: true,
    },
  );
}

export async function isBotInGuild(guildId: string): Promise<boolean> {
  try {
    await createDiscordRequest<APIGuild>(
      `/guilds/${guildId}`,
      BOT_AUTORIZATION,
    );
    return true;
  } catch {
    return false;
  }
}

export async function getGuild(guildId: string) {
  const data = await createDiscordRequest<APIGuild>(
    `/guilds/${guildId}`,
    BOT_AUTORIZATION,
  );

  return data;
}
