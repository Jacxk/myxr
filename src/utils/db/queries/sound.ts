import "server-only";

import { type Prisma } from "@prisma/client";
import { db } from "~/server/db";
import { sortSoundsByWeight } from "..";
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
      where: {
        createdBy: {
          banned: false,
        },
      },
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
      where: {
        id,
        createdBy: {
          banned: false,
        },
      },
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
        where: {
          createdById,
          createdBy: {
            banned: false,
          },
        },
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
      where: {
        likedBy: { some: { userId } },
        createdBy: {
          banned: false,
        },
      },
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
    const cleanQuery = query.trim().replace(/[()|&:*!]/g, "");
    const formattedQuery = cleanQuery.split(/\s+/).map((word) => word + ":*");

    const wholeWord = formattedQuery.join(" & ");
    const separateWords = formattedQuery.join(" | ");
    const tagSearch = formattedQuery.join(" | ");

    if (type === "normal") {
      const matchingSounds = await db.sound.findMany({
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          likedBy: { where: { userId } },
          tags: true,
          createdBy: {
            select: {
              name: true,
            },
          },
        },
        where: {
          createdBy: {
            banned: false,
          },
          OR: [
            {
              OR: [
                { name: { search: wholeWord } },
                { name: { search: separateWords } },
              ],
            },
            { tags: { some: { name: { search: tagSearch } } } },
            {
              createdBy: {
                OR: [
                  { name: { search: wholeWord } },
                  { name: { search: separateWords } },
                ],
              },
            },
          ],
        },
      });

      sounds = sortSoundsByWeight(matchingSounds, cleanQuery);
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
        where: {
          createdBy: {
            banned: false,
          },
        },
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
            sound.usegeCount * 5 +
            recentLikes.length * 4 +
            recentDownloads.length * 3 +
            sound.shareCount;

          return {
            ...sound,
            trendingScore,
          };
        })
        .sort((a, b) => b.trendingScore - a.trendingScore);
    } else {
      sounds = await db.sound.findMany({
        where: {
          createdBy: {
            banned: false,
          },
        },
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
    return db.sound.count({
      where: {
        createdBy: {
          banned: false,
        },
      },
    });
  },

  getAllSoundsIds: () => {
    return db.sound.findMany({
      where: {
        createdBy: {
          banned: false,
        },
      },
      select: {
        id: true,
        updatedAt: true,
      },
    });
  },
};
