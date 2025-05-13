import { db } from "~/server/db";
import { getUserRoles } from "~/utils/discord-requests";

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

    const userRoles = await getUserRoles(guildId, discordId);
    const hasPermission = userRoles.roles.some((role) =>
      guildRoles?.soundMasterRoles.some((guildRole) => guildRole === role),
    );

    return hasPermission;
  },
};
