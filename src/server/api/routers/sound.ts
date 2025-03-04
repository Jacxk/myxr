import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { getSounds } from "~/utils/db";

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
    .query(async ({ input }) => {
      return (await getSounds({ take: input.limit })) ?? [];
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
