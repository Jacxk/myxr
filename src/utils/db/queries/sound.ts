import "server-only";

import { type Prisma } from "@prisma/client";
import { db } from "~/server/db";
import type { SearchType } from "../types";
import { populateLike, soundInclude } from "../types";

export const SoundQuery = {
  getSounds: async ({
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
  },

  getSound: async (id: string, userId?: string) => {
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
  },

  getSoundsFromUser: async (userId: string) => {
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
  },

  getUserLikedSounds: async (userId: string) => {
    const sounds = await db.sound.findMany({
      where: { likedBy: { some: { userId } } },
      include: { ...soundInclude, likedBy: { where: { userId } } },
    });

    return sounds.map((sound) => ({
      ...sound,
      ...populateLike(sound.likedBy, userId),
    }));
  },

  getSoundsFromTag: async (
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
  },

  searchForSoundsInfinite: async (
    query: string,
    type: SearchType,
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
      sounds = await SoundQuery.getSoundsFromTag(query, limit, cursor, userId);
    }

    return sounds.map((sound) => ({
      ...sound,
      ...populateLike(sound.likedBy, userId),
    }));
  },

  getAllSounds: async (
    userId: string | undefined,
    {
      limit,
      cursor,
      filter,
    }: {
      limit: number;
      cursor?: string | null;
      filter?: string | null;
    },
  ) => {
    const getOrderBy = (): Prisma.SoundOrderByWithRelationInput[] => {
      switch (filter) {
        case "most-used":
          return [{ usegeCount: "desc" }];
        case "most-liked":
          return [{ likedBy: { _count: "desc" } }];
        default:
          return [{ createdAt: "desc" }];
      }
    };

    let sounds;

    if (filter === "trending") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const trendingSounds = await db.sound.findMany({
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          createdBy: true,
          downloadedSound: true,
          likedBy: true,
        },
      });

      sounds = trendingSounds
        .map((sound) => {
          const recentLikes = sound.likedBy.filter(
            (like) => like.createdAt >= thirtyDaysAgo,
          );
          const recentDownloads = sound.downloadedSound.filter(
            (download) => download.createdAt >= thirtyDaysAgo,
          );

          const trendingScore =
            recentLikes.length * 3 +
            recentDownloads.length * 2 +
            sound.usegeCount * 5;

          return {
            ...sound,
            trendingScore,
          };
        })
        .sort((a, b) => b.trendingScore - a.trendingScore);
    } else {
      sounds = await db.sound.findMany({
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: getOrderBy(),
        include: {
          createdBy: true,
          likedBy: { where: { userId } },
        },
      });
    }

    return sounds.map((sound) => ({
      ...sound,
      ...populateLike(sound.likedBy, userId),
    }));
  },

  getSoundCount: () => {
    return db.sound.count();
  },

  getAllSoundsIds: () => {
    return db.sound.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
    });
  },
};
