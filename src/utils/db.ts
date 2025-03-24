import type { APIGuild } from "discord-api-types/v10";
import { db } from "~/server/db";
import { getDiscordGuilds } from "./discord-requests";

const soundInclude = {
  createdBy: {
    select: {
      image: true,
      name: true,
      role: true,
      removed: true,
      id: true,
    },
  },
};

export const discordAuthorization = async (id: string) => {
  const user = await db.account.findFirst({
    where: { userId: id },
    select: { access_token: true, token_type: true },
  });

  if (user?.token_type?.toLowerCase() !== "bearer") {
    throw new Error("Invalid token type");
  }

  return `Bearer ${user?.access_token}`;
};

export const getSounds = ({
  take,
  skip,
}: {
  take?: number;
  skip?: number;
} = {}) => {
  return db.sound.findMany({
    orderBy: { createdAt: "desc" },
    take,
    skip,
    include: soundInclude,
  });
};

export const getSoundsFromUser = async (id: string) => {
  const getData = (createdById: string) =>
    db.sound.findMany({
      orderBy: { createdAt: "desc" },
      where: { createdById },
      include: soundInclude,
    });
  const sounds = await getData(id);

  if (sounds.length > 0) return sounds;

  const user = await db.account.findFirst({
    where: { providerAccountId: id },
  });

  if (user) return getData(user.userId);

  return [];
};

export const getSound = (id: number) => {
  return db.sound.findFirst({
    where: { id },
    include: {
      createdBy: true,
      guildSounds: { select: { guild: { select: { name: true, id: true } } } },
    },
  });
};

export const updateAccessToken = async (
  userId: string,
  data: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  },
): Promise<boolean> => {
  const discordAccount = await db.account.findFirst({
    where: { userId, provider: "discord" },
  });

  if (!discordAccount) return false;

  await db.account.update({
    where: {
      provider_providerAccountId: {
        providerAccountId: discordAccount.providerAccountId,
        provider: "discord",
      },
    },
    data,
  });

  return true;
};

export const getUserTokenAndExpiration = async (
  userId: string,
): Promise<{
  expires_at?: number;
  refresh_token?: string;
  expired?: boolean;
}> => {
  const data = await db.account.findFirst({
    where: {
      userId,
    },
    select: { expires_at: true, refresh_token: true },
  });

  const expires_at = data?.expires_at!;
  const expired = Math.floor(Date.now() / 1000) >= data?.expires_at!;
  const refresh_token = data?.refresh_token!;

  return {
    expires_at,
    refresh_token,
    expired,
  };
};

export const getDatabaseSession = (sessionId: string) => {
  return db.session.findFirst({
    where: { sessionToken: sessionId },
  });
};

export const updateGuildMemberShip = async (userId: string) => {
  const user = await db.user.findFirst({
    where: { id: userId },
    select: { updatedAt: true },
  });

  if (!user?.updatedAt) return;

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60000);
  if (user.updatedAt > fiveMinutesAgo) return;

  const guilds = await getDiscordGuilds(userId);

  for (const guild of guilds) {
    await upsertGuild(guild);

    const data = {
      guildId: guild.id,
      userId,
    };

    await db.guildMembership.upsert({
      where: { userId_guildId: { guildId: guild.id, userId: userId } },
      create: data,
      update: data,
    });
  }

  await db.user.update({
    where: { id: userId },
    data: { updatedAt: new Date() },
  });
};

export const getUserGuilds = async (userId: string) => {
  const data = await db.user.findFirst({
    where: { id: userId },
    select: { guilds: { select: { guild: true } } },
  });

  return data?.guilds;
};

export const upsertGuild = async (guild: APIGuild) => {
  await db.guild.upsert({
    where: { id: guild.id },
    create: { id: guild.id, name: guild.name },
    update: { name: guild.name },
  });
};
