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
  likedSounds: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return SoundQuery.getUserLikedSounds(userId);
  }),
  reports: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return UserQuery.getReports(userId);
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
