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

  const res = await fetch(`https://discord.com/api/v10/${path}`, {
    ...opts,
    headers,
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

export async function refreshAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    client_id: env.AUTH_DISCORD_ID,
    client_secret: env.AUTH_DISCORD_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) throw new Error("Failed to refresh token");

  const refreshedTokens = await response.json();

  return {
    access_token: refreshedTokens.access_token,
    refresh_token: refreshedTokens.refresh_token ?? refreshToken,
    expires_at: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
  };
}

export async function getSoundBoard(guildId: string) {
  try {
    const data = await createDiscordRequest<{ items: APISoundboardSound[] }>(
      `/guilds/${guildId}/soundboard-sounds`,
      BOT_AUTORIZATION,
    );

    return data.items;
  } catch (e) {
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
