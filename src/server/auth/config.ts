import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

import { db } from "~/server/db";
import {
  getDatabaseSession,
  getUserGuilds,
  getUserTokenAndExpiration,
  updateAccessToken,
  updateGuildMemberShip,
} from "~/utils/db";
import { refreshAccessToken } from "~/utils/discord-requests";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      guilds: Guild[];
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  interface Guild {
    id: string;
    name: string;
    icon: string;
    owner: boolean;
    permissions: number;
    features: string[];
    banner: string;
  }
  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    DiscordProvider({
      authorization:
        "https://discord.com/api/oauth2/authorize?scope=identify%20email%20guilds",
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    authorized: async ({ auth }) => {
      return !!auth;
    },
    signIn: async ({ account }) => {
      if (account?.userId) {
        await updateGuildMemberShip(account.userId, true);
        await updateAccessToken(account.userId, {
          access_token: account.access_token!,
          refresh_token: account.refresh_token!,
          expires_at: Math.floor(Date.now() / 1000) + account.expires_in!,
        });
      }
      return true;
    },
    session: async ({ session }) => {
      const dbSession = await getDatabaseSession(session.sessionToken);
      if (!dbSession) return session;

      const { expired, refresh_token } = await getUserTokenAndExpiration(
        session.userId,
      );

      if (expired && refresh_token) {
        const data = await refreshAccessToken(refresh_token);
        await updateAccessToken(session.userId, data);
      }

      await updateGuildMemberShip(session.userId);

      const guilds = await getUserGuilds(session.userId);
      guilds?.sort((a, b) => a.guild.name.localeCompare(b.guild.name));

      return {
        ...session,
        user: {
          ...session.user,
          guilds: guilds?.map(({ guild }) => ({ ...guild })),
        },
      };
    },
  },
} satisfies NextAuthConfig;
