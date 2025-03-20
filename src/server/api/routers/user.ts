import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { getSoundsFromUser } from "~/utils/db";

export const userRouter = createTRPCRouter({
  getSounds: publicProcedure.input(z.string()).query(async ({ input }) => {
    return await getSoundsFromUser(input);
  }),
  getGuildSounds: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return await ctx.db.guildSound.findMany({
        where: { guildId: input },
        include: { sound: { include: { createdBy: true } }, guild: true },
      });
    }),
  me: protectedProcedure.query(async ({ ctx }) => {
    const sounds = await getSoundsFromUser(ctx.session.user.id);
    const guildSounds = await ctx.db.guildSound.findMany({
      where: { soundId: { in: sounds.map((sound) => sound.id) } },
      include: { sound: { include: { createdBy: true } }, guild: true },
    });

    return { sounds, guildSounds };
  }),
});
