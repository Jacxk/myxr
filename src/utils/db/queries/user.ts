import "server-only";

import { db } from "~/server/db";
import { BotDiscordApi } from "~/utils/discord/bot-api";

export const UserQuery = {
  getDiscordId: async (userId: string) => {
    const account = await db.account.findFirst({
      where: { userId },
      select: { accountId: true },
    });

    return account?.accountId;
  },

  getUserCount: async () => {
    return db.user.count({
      where: {
        removed: false,
      },
    });
  },

  getAllUsersIds: async () => {
    return db.user.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
    });
  },

  hasSoundBoardCreatePermission: async (guildId: string, userId: string) => {
    const guildRoles = await db.guild.findFirst({
      where: { id: guildId },
      select: {
        soundMasterRoles: true,
      },
    });
    const discordId = await UserQuery.getDiscordId(userId);

    if (!discordId) return false;

    const userRoles = await BotDiscordApi.getUserRoles(guildId, discordId);
    const hasPermission = userRoles.roles.some((role) =>
      guildRoles?.soundMasterRoles.some((guildRole) => guildRole === role),
    );

    return hasPermission;
  },

  getUser: async (id: string) => {
    const user = await db.user.findFirst({
      where: {
        id,
        removed: false,
      },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            sounds: true,
          },
        },
      },
    });

    return user;
  },

  isFollowing: async (followerId: string | undefined, userId: string) => {
    if (!followerId) return false;

    const follow = await db.userFollow.findFirst({
      where: {
        followerId,
        userId,
        follower: {
          removed: false,
        },
        user: {
          removed: false,
        },
      },
    });

    return !!follow;
  },

  followUser: async (followerId: string, userId: string) => {
    const follow = await db.userFollow.findFirst({
      where: {
        followerId,
        userId,
        follower: {
          removed: false,
        },
        user: {
          removed: false,
        },
      },
    });

    if (follow) {
      await db.userFollow.delete({
        where: {
          followerId_userId: {
            followerId,
            userId,
          },
        },
      });
      return false;
    }

    await db.userFollow.create({
      data: {
        followerId,
        userId,
      },
    });
    return true;
  },
};
