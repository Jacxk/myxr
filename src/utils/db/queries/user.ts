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

  getUserCount: () => {
    return db.user.count();
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
    return db.user.findFirst({
      where: { id },
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
    });
  },

  isFollowing: async (followerId: string | undefined, userId: string) => {
    if (!followerId) return false;

    const isFollow = await db.userFollow.findFirst({
      where: {
        followerId,
        userId,
      },
    });

    return !!isFollow;
  },

  followUser: async (followerId: string, userId: string) => {
    const data = {
      followerId,
      userId,
    };
    const isFollow = await UserQuery.isFollowing(followerId, userId);

    if (isFollow) {
      await db.userFollow.delete({
        where: {
          followerId_userId: data,
        },
      });
      return false;
    } else {
      await db.userFollow.create({
        data,
      });
      return true;
    }
  },
};
