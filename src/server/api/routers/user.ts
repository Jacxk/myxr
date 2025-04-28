import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import {
  getGuildSounds,
  getSoundsFromUser,
  getUserLikedSounds,
} from "~/utils/db";

export const userRouter = createTRPCRouter({
  getSounds: publicProcedure.input(z.string()).query(async ({ input }) => {
    return await getSoundsFromUser(input);
  }),
  getGuildSounds: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return getGuildSounds(input);
    }),
  me: protectedProcedure.query(async ({ ctx }) => {
    const sounds = await getSoundsFromUser(ctx.session.user.id);
    const guildSounds = await ctx.db.guildSound.findMany({
      where: { soundId: { in: sounds.map((sound) => sound.id) } },
      include: { sound: { include: { createdBy: true } }, guild: true },
    });

    return { sounds, guildSounds };
  }),
  likedSounds: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return getUserLikedSounds(userId);
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
    .query(({ ctx, input }) => {
      return ctx.db.user.findFirst({
        where: { id: input.id },
        include: { followers: true },
      });
    }),
  followUser: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const isFollow = await ctx.db.userFollow.findFirst({
        where: {
          followerId: userId,
          followingId: input.id,
        },
      });

      let following;

      if (isFollow) {
        await ctx.db.userFollow.delete({
          where: {
            followingId_followerId: {
              followerId: userId,
              followingId: input.id,
            },
          },
        });
        following = false;
      } else {
        await ctx.db.userFollow.create({
          data: {
            followerId: userId,
            followingId: input.id,
          },
        });
        following = true;
      }

      return { success: true, value: { following } };
    }),
});
