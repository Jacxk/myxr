import "server-only";

import { env } from "~/env";
import { rateLimiter } from "./rate-limiter";
import { type DiscordPermissionValue } from "./types";

export const BOT_AUTHORIZATION = `Bot ${env.DISCORD_BOT_TOKEN}`;

export function hasPermission(
  permissions: string | number,
  permission: DiscordPermissionValue,
): boolean {
  const perms = BigInt(permissions);
  return (perms & BigInt(permission)) === BigInt(permission);
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

  return rateLimiter.executeRequest<T>(path, () =>
    fetch(url, {
      ...opts,
      headers,
    }),
  );
}
