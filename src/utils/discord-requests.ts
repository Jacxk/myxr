import { discordAuthorization } from "./db";

async function _discordRequest(path: string, authorization: string) {
  if (path.startsWith("/")) path = path.slice(1);

  const res = await fetch(`https://discord.com/api/v10/${path}`, {
    headers: {
      Authorization: authorization,
    },
  });

  return await res.json();
}

export async function getDiscordGuilds(id: string) {
  const authorization = await discordAuthorization(id);
  const guilds = await _discordRequest("users/@me/guilds", authorization);

  return guilds.filter(
    (guild: any) => guild.owner || (guild.permissions & 0x20) === 0x20,
  );
}
