import { Role } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { customSession } from "better-auth/plugins";
import { headers } from "next/headers";
import { env } from "~/env";
import { db } from "~/server/db";
import { UserMutation } from "~/utils/db/mutations/user";
import { GuildQuery } from "~/utils/db/queries/guild";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  plugins: [
    nextCookies(),
    customSession(async ({ user, session }) => {
      await UserMutation.updateGuildMemberShip(session.userId);

      const guilds = await GuildQuery.getUserGuilds(session.userId);
      guilds?.sort((a, b) => a.guild.name.localeCompare(b.guild.name));

      return {
        user: {
          ...user,
          role: Role.USER,
          guilds: guilds?.map(({ guild }) => ({ ...guild })) ?? [],
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
