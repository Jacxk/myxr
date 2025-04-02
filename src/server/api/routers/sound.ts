import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { getSound, getSounds } from "~/utils/db";

export const soundRouter = createTRPCRouter({
  me: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        page: z.number().default(1),
      }),
    )
    .query(({ ctx, input }) => {
      const sounds = ctx.db.sound.findMany({
        where: { createdById: ctx.session?.user.id },
        orderBy: { createdAt: "desc" },
        take: input.limit,
        skip: (input.page - 1) * input.limit,
      });
      return sounds ?? [];
    }),
  getLatests: publicProcedure
    .input(z.object({ limit: z.number().default(6) }))
    .query(({ input, ctx }) =>
      getSounds({ take: input.limit, userId: ctx.session?.user.id }),
    ),
  getAllSounds: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
        direction: z.enum(["forward", "backward"]).default("forward"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const sounds = await ctx.db.sound.findMany({
        take: input.limit + 1, // Fetch one extra to check if there's a next page
        skip: input.cursor ? 1 : 0, // Skip the cursor if provided
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { usegeCount: "desc" },
        include: {
          createdBy: true,
          likedBy: { where: { userId: ctx.session?.user.id } },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (sounds.length > input.limit) {
        const nextItem = sounds.pop();
        nextCursor = nextItem!.id;
      }

      return {
        sounds: sounds.map((sound) => ({
          ...sound,
          liked: sound.likedBy.length > 0,
        })),
        nextCursor,
      };
    }),
  getSound: publicProcedure
    .input(
      z.object({
        id: z.string(),
        userId: z.string().optional(),
      }),
    )
    .query(({ input }) => {
      return getSound(input.id, input.userId);
    }),
  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
        type: z.enum(["Normal", "Tag"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.type === "Tag") {
        const tag = await ctx.db.tag.findFirst({
          where: { name: input.query },
          include: { sounds: true },
        });

        return tag?.sounds ?? [];
      }

      return ctx.db.sound.findMany({
        where: {
          OR: [
            { name: { search: input.query } },
            { tags: { some: { name: { search: input.query } } } },
          ],
        },
      });
    }),
  likeSound: protectedProcedure
    .input(
      z.object({
        soundId: z.string(),
        liked: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id;
      const data = {
        userId,
        soundId: input.soundId,
      };

      const existingLike = await ctx.db.likedSound.findFirst({ where: data });
      let liked;

      if (existingLike) {
        await ctx.db.likedSound.delete({ where: { userId_soundId: data } });
        liked = false;
      } else {
        await ctx.db.likedSound.create({ data });
        liked = true;
      }

      return { success: true, value: liked };
    }),
});
