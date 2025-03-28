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
    .query(async ({ input }) => {
      return (await getSounds({ take: input.limit })) ?? [];
    }),
  getSound: publicProcedure.input(z.string()).query(({ input }) => {
    return getSound(input);
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
});
