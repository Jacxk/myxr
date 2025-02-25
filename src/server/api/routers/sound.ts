import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

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
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const sounds = await ctx.db.sound.findMany({
        orderBy: { createdAt: "desc" },
        take: input.limit,
        include: {
          createdBy: {
            select: { image: true, name: true, role: true, removed: true },
          },
        },
      });

      return sounds ?? [];
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
