import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const guildRouter = createTRPCRouter({
  isBotIn: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const query = await ctx.db.guild.findFirst({
      where: { id: input },
    });
    return {
      success: true,
      value: !!query?.id,
    };
  }),
});
