import { PrismaAdapter } from "@auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { env } from "~/env";
import { db } from "~/server/db";

export const auth = betterAuth({
  database: PrismaAdapter(db),
  socialProviders: {
    discord: {
      clientId: env.AUTH_DISCORD_ID,
      clientSecret: env.AUTH_DISCORD_SECRET,
    },
  },
});
