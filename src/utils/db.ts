import type { APIGuild } from "discord-api-types/v10";
import { db } from "~/server/db";
import { getDiscordGuilds } from "./discord-requests";
import { GuildSound } from "@prisma/client";

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
    select: { accessToken: true },
  });

  return `Bearer ${user?.accessToken}`;
};

export const getSounds = async ({
  take,
  skip,
  userId,
}: {
  take?: number;
  skip?: number;
  userId?: string;
} = {}) => {
  const sounds = await db.sound.findMany({
    orderBy: { createdAt: "desc" },
    take,
    skip,
    include: {
      ...soundInclude,
      likedBy: { where: { userId } },
    },
  });

  return (
    sounds.map((sound) => ({
      ...sound,
      liked: sound.likedBy.length > 0,
    })) ?? []
  );
};

export const getSoundsFromUser = async (id: string) => {
  const getData = (createdById: string) =>
    db.sound.findMany({
      orderBy: { createdAt: "desc" },
      where: { createdById },
      include: { ...soundInclude, likedBy: { where: { userId: id } } },
    });
  const sounds = await getData(id);

  if (sounds.length > 0)
    return sounds.map((sound) => ({
      ...sound,
      liked: sound.likedBy.length > 0,
    }));

  const user = await db.account.findFirst({
    where: { accountId: id },
  });

  if (user)
    return (await getData(user.userId)).map((sound) => ({
      ...sound,
      liked: sound.likedBy.length > 0,
    }));

  return [];
};

export const getSound = (id: string, userId?: string) => {
  return db.sound.findFirst({
    where: { id },
    include: {
      createdBy: true,
      guildSounds: { select: { guild: { select: { name: true, id: true } } } },
      tags: true,
      likedBy: true,
    },
  });
};

export const updateGuildMemberShip = async (
  userId: string,
  force?: boolean,
) => {
  const user = await db.user.findFirst({
    where: { id: userId },
    select: { updatedAt: true },
  });

  if (!user?.updatedAt) return;

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60000);
  if (!force && user.updatedAt > fiveMinutesAgo) return;

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

export const handleSoundGuildCreate = async ({
  guildId,
  guildName,
  soundId,
  discordSoundId,
}: GuildSound & { guildName: string }) => {
  await db.guildSound.create({
    data: {
      guildId,
      soundId,
      discordSoundId,
    },
  });

  await db.guild.update({
    where: { id: guildId },
    data: { name: guildName },
  });

  await db.sound.update({
    where: { id: soundId },
    data: { usegeCount: { increment: 1 } },
  });
};
