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
  me: protectedProcedure.query(async ({ ctx }) => {
    const sounds = await getSoundsFromUser(ctx.session.user.id);
    const guildSounds = await ctx.db.guildSound.findMany({
      where: { soundId: { in: sounds.map((sound) => sound.id) } },
      include: { sound: { include: { createdBy: true } }, guild: true },
    });

    return { sounds, guildSounds };
  }),
});
