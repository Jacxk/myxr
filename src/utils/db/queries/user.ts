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
        banned: false,
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

  hasSoundBoardManagePermission: async (guildId: string, userId: string) => {
    const guildRoles = await db.guild.findFirst({
      where: { id: guildId },
      select: {
        soundMasterRoles: true,
        users: {
          where: {
            userId,
          },
          select: {
            canManage: true,
          },
        },
      },
    });
    const discordId = await UserQuery.getDiscordId(userId);

    if (!discordId) return false;

    const userRoles = await BotDiscordApi.getUserRoles(guildId, discordId);
    const hasPermission = userRoles.some((role) =>
      guildRoles?.soundMasterRoles.some((guildRole) => guildRole === role),
    );

    return hasPermission || guildRoles?.users[0]?.canManage;
  },

  getUser: async (id: string) => {
    const user = await db.user.findFirst({
      where: {
        OR: [{ id }, { accounts: { some: { accountId: id } } }],
        banned: false,
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
          banned: false,
        },
        user: {
          banned: false,
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
          banned: false,
        },
        user: {
          banned: false,
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
