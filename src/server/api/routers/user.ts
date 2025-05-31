import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { NotificationMutations } from "~/utils/db/mutations/notification";
import { GuildQuery } from "~/utils/db/queries/guild";
import { NotificationQueries } from "~/utils/db/queries/notification";
import { ReportQuery } from "~/utils/db/queries/report";
import { SoundQuery } from "~/utils/db/queries/sound";
import { UserQuery } from "~/utils/db/queries/user";
import { UserDiscordApi } from "~/utils/discord/user-api";

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
    return ReportQuery.getReportsFromUser(userId);
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
  getNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        cursor: z.string().nullish(),
        direction: z.enum(["forward", "backward"]).default("forward"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const notifications = await NotificationQueries.getNotifications(userId, {
        limit: input.limit,
        cursor: input.cursor,
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (notifications.length > input.limit) {
        const nextItem = notifications.pop();
        nextCursor = nextItem!.id;
      }

      return {
        notifications,
        nextCursor,
      };
    }),

  handleNotification: protectedProcedure
    .input(
      z.discriminatedUnion("type", [
        z.object({ type: z.literal("markAllAsRead") }),
        z.object({
          type: z.literal("markManyAsRead"),
          ids: z.array(z.string()),
        }),
        z.object({ type: z.literal("markAsRead"), id: z.string() }),
        z.object({ type: z.literal("deleteAll") }),
        z.object({ type: z.literal("deleteMany"), ids: z.array(z.string()) }),
        z.object({ type: z.literal("deleteSingle"), id: z.string() }),
      ]),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (input.type === "markAllAsRead") {
        return NotificationMutations.markAllAsRead(userId);
      }

      if (input.type === "markAsRead") {
        return NotificationMutations.markAsRead(input.id);
      }

      if (input.type === "markManyAsRead") {
        return NotificationMutations.markManyAsRead(input.ids);
      }

      if (input.type === "deleteAll") {
        return NotificationMutations.deleteAll(userId);
      }

      if (input.type === "deleteSingle") {
        return NotificationMutations.deleteSingle(input.id);
      }

      if (input.type === "deleteMany") {
        return NotificationMutations.deleteMany(input.ids);
      }
    }),
  getGuilds: protectedProcedure.query(({ ctx }) => {
    const userId = ctx.session.user.id;
    return UserDiscordApi.getGuilds(userId);
  }),
  getDbGuilds: protectedProcedure.query(({ ctx }) => {
    const userId = ctx.session.user.id;

    return GuildQuery.getUserGuilds(userId);
  }),
});
