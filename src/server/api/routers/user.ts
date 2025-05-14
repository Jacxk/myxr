import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { SoundQuery } from "~/utils/db/queries/sound";
import { UserQuery } from "~/utils/db/queries/user";

export const userRouter = createTRPCRouter({
  getSounds: publicProcedure.input(z.string()).query(async ({ input }) => {
    return await SoundQuery.getSoundsFromUser(input);
  }),
  me: protectedProcedure.query(async ({ ctx }) => {
    const sounds = await SoundQuery.getSoundsFromUser(ctx.session.user.id);
    const guildSounds = await ctx.db.guildSound.findMany({
      where: { soundId: { in: sounds.map((sound) => sound.id) } },
      include: { sound: { include: { createdBy: true } }, guild: true },
    });

    return { sounds, guildSounds };
  }),
  likedSounds: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return SoundQuery.getUserLikedSounds(userId);
  }),
  reports: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return ctx.db.soundReport.findMany({
      where: { userId },
      include: { sound: true },
      orderBy: { createdAt: "desc" },
    });
  }),
  getUser: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await UserQuery.getUser(input.id);

      if (!user) return null;

      const isFollowing = await UserQuery.isFollowing(
        ctx.session?.user.id,
        input.id,
      );

      return {
        ...user,
        isFollowing,
      };
    }),
  followUser: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const following = await UserQuery.followUser(
        ctx.session.user.id,
        input.id,
      );

      return { success: true, value: { following } };
    }),
});
