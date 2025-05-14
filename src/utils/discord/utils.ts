import { env } from "~/env";
import { type DiscordError, type DiscordPermissionValue } from "./types";

export const BOT_AUTHORIZATION = `Bot ${env.DISCORD_BOT_TOKEN}`;

export function hasPermission(
  userPermission: string | undefined | null,
  permission: DiscordPermissionValue,
) {
  if (!userPermission) return false;
  return (Number(userPermission) & permission) === permission;
}

export async function createDiscordRequest<T>(
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
