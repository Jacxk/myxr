import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getDiscordGuilds } from "~/utils/discord-requests";

export const discordRouter = createTRPCRouter({
  guilds: protectedProcedure.query(({ ctx }) => {
    return getDiscordGuilds(ctx.session?.user.id);
  }),
});
