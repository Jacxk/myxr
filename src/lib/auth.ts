import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin, customSession } from "better-auth/plugins";
import { headers } from "next/headers";
import { env } from "~/env";
import { db } from "~/server/db";
import { UserMutation } from "~/utils/db/mutations/user";
import { GuildQuery } from "~/utils/db/queries/guild";
import { UserQuery } from "~/utils/db/queries/user";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    nextCookies(),
    customSession(async ({ user, session }) => {
      await UserMutation.updateGuildMemberShip(session.userId);

      const data = await GuildQuery.getUserGuilds(session.userId);
      const discordId = await UserQuery.getDiscordId(user.id);

      const role = await db.user
        .findUnique({
          where: { id: user.id },
          select: { role: true },
        })
        .then((user) => user?.role ?? "user");

      return {
        user: {
          ...user,
          discordId: discordId!,
          role,
          guilds:
            data?.guilds.map(({ guild, canManage }) => ({
              ...guild,
              canManage,
            })) ?? [],
        },
        session,
      };
    }),
  ],
  socialProviders: {
    discord: {
      clientId: env.AUTH_DISCORD_ID,
      clientSecret: env.AUTH_DISCORD_SECRET,
      scope: ["identify", "email", "guilds"],
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
});

export const getServerSession = async () =>
  await auth.api.getSession({
    headers: await headers(),
  });
