import "server-only";

import type { ActionStatus, GuildSound, LikedSound } from "@prisma/client";
import type { APIGuild } from "discord-api-types/v10";
import { z } from "zod";
import { db } from "~/server/db";
import { getDiscordGuilds, getUserRoles } from "./discord-requests";

const soundInclude = {
  tags: true,
  createdBy: {
    select: {
      image: true,
      name: true,
      role: true,
      removed: true,
      id: true,
    },
  },
  guildSounds: {
    select: {
      guild: {
        select: {
          name: true,
          id: true,
          image: true,
        },
      },
    },
  },
};

const populateLike = (likedBy: LikedSound[], userId?: string) => {
  return {
    likes: likedBy.length,
    likedByUser: likedBy.filter((user) => user.userId === userId).length > 0,
  };
};

export const discordAuthorization = async (id: string) => {
  const user = await db.account.findFirst({
    where: { userId: id },
    select: { accessToken: true },
  });

  return `Bearer ${user?.accessToken}`;
};

export const getDiscordId = async (userId: string) => {
  const account = await db.account.findFirst({
    where: { userId },
    select: { accountId: true },
  });

  return account?.accountId;
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
      ...populateLike(sound.likedBy, userId),
    })) ?? []
  );
};

export const getSoundsFromUser = async (userId: string) => {
  const getData = (createdById: string) =>
    db.sound.findMany({
      orderBy: { createdAt: "desc" },
      where: { createdById },
      include: { ...soundInclude, likedBy: { where: { userId: userId } } },
    });
  const sounds = await getData(userId);

  if (sounds.length > 0)
    return sounds.map((sound) => ({
      ...sound,
      ...populateLike(sound.likedBy, userId),
    }));

  const user = await db.account.findFirst({
    where: { accountId: userId },
  });

  if (user)
    return (await getData(user.userId)).map((sound) => ({
      ...sound,
      ...populateLike(sound.likedBy, userId),
    }));

  return [];
};

export const getSound = async (id: string, userId?: string) => {
  const sound = await db.sound.findFirst({
    where: { id },
    include: {
      ...soundInclude,
      likedBy: true,
    },
  });

  if (!sound) return null;

  return {
    ...sound,
    ...populateLike(sound.likedBy, userId),
  };
};

export const getUserLikedSounds = async (userId: string) => {
  const sounds = await db.sound.findMany({
    where: { likedBy: { some: { userId } } },
    include: { ...soundInclude, likedBy: { where: { userId } } },
  });

  return sounds.map((sound) => ({
    ...sound,
    ...populateLike(sound.likedBy, userId),
  }));
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

  const existingGuildIds = guilds.map((guild) => guild.id);
  if (existingGuildIds.length > 0)
    await db.guildMembership.deleteMany({
      where: {
        userId,
        NOT: {
          guildId: {
            in: existingGuildIds,
          },
        },
      },
    });

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
  const image = guild.icon
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
    : null;

  await db.guild.upsert({
    where: { id: guild.id },
    create: { id: guild.id, name: guild.name, image },
    update: { name: guild.name, image },
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

export const getSoundsFromTag = async (
  tag: string,
  limit: number,
  cursor?: string | null,
  userId?: string,
) => {
  const data = await db.tag.findFirst({
    take: limit + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { name: cursor } : undefined,
    where: { name: tag },
    include: { sounds: { include: { likedBy: { where: { userId } } } } },
  });

  return (
    data?.sounds.map((sound) => ({
      ...sound,
      ...populateLike(sound.likedBy, userId),
    })) ?? []
  );
};

export const SearchType = z.enum(["normal", "tag"]);

export const searchForSoundsInfinite = async (
  query: string,
  type: z.infer<typeof SearchType>,
  limit: number,
  cursor?: string | null,
  userId?: string,
) => {
  let sounds = null;
  const formattedQuery = query
    .trim()
    .replace(/[()|&:*!]/g, "")
    .split(/\s+/)
    .map((word) => word + ":*");

  const soundSearch = formattedQuery.join(" & ");
  const tagSearch = formattedQuery.join(" | ");

  if (type === "normal") {
    sounds = await db.sound.findMany({
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: { likedBy: { where: { userId } } },
      where: {
        OR: [
          { name: { search: soundSearch } },
          { tags: { some: { name: { search: tagSearch } } } },
        ],
      },
    });
  } else {
    sounds = await getSoundsFromTag(query, limit, cursor, userId);
  }

  return sounds.map((sound) => ({
    ...sound,
    ...populateLike(sound.likedBy, userId),
  }));
};

export const getAllSounds = async (
  limit: number,
  cursor?: string | null,
  userId?: string,
) => {
  const sounds = await db.sound.findMany({
    take: limit + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { usegeCount: "desc" },
    include: {
      createdBy: true,
      likedBy: { where: { userId } },
    },
  });

  return sounds.map((sound) => ({
    ...sound,
    ...populateLike(sound.likedBy, userId),
  }));
};

export const getGuildSounds = async (guildId: string) => {
  return await db.guildSound.findMany({
    where: { guildId },
    include: { sound: { include: { createdBy: true } }, guild: true },
  });
};

export const getGuild = async (guildId: string) => {
  return db.guild.findFirst({
    where: { id: guildId },
  });
};

export const getSoundMasterRoles = async (guildId: string) => {
  return db.guild.findFirst({
    where: { id: guildId },
    select: {
      soundMasterRoles: true,
    },
  });
};

export const setSoundMasterRoles = async (guildId: string, roles: string[]) => {
  const { soundMasterRoles } = await db.guild.update({
    where: { id: guildId },
    data: { soundMasterRoles: roles },
  });

  return soundMasterRoles;
};

export const hasSoundBoardCreatePermission = async (
  guildId: string,
  userId: string,
) => {
  const guildRoles = await getSoundMasterRoles(guildId);
  const discordId = await getDiscordId(userId);

  if (!discordId) return false;

  const userRoles = await getUserRoles(guildId, discordId);
  const hasPermission = userRoles.roles.some((role) =>
    guildRoles?.soundMasterRoles.some((guildRole) => guildRole === role),
  );

  return hasPermission;
};

export const getSoundCount = () => {
  return db.sound.count();
};

export const getAllSoundsIds = () => {
  return db.sound.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
  });
};

export const getUserCount = () => {
  return db.user.count();
};

export const getAllUsersIds = () => {
  return db.user.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
  });
};

export const getUserRole = (userId: string) => {
  return db.user.findFirst({
    where: { id: userId },
    select: { role: true },
  });
};

export const getAllReports = () => {
  return db.soundReport.findMany({
    include: {
      sound: true,
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const takeActionOnReport = async (
  reportId: string,
  actionTaken: ActionStatus,
  actionText: string,
) => {
  return db.soundReport.update({
    where: { id: reportId },
    data: { actionTaken, actionText },
  });
};
