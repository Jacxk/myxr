import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { ReportMutations } from "~/utils/db/mutations/report";
import { SoundMutations } from "~/utils/db/mutations/sound";
import { ReportQuery } from "~/utils/db/queries/report";
import { SoundQuery } from "~/utils/db/queries/sound";
import { SearchType } from "~/utils/db/types";

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
      SoundQuery.getSounds({ take: input.limit, userId: ctx.session?.user.id }),
    ),
  getAllSounds: publicProcedure
    .input(
      z.object({
        filter: z.string().nullish(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
        direction: z.enum(["forward", "backward"]).default("forward"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const sounds = await SoundQuery.getAllSounds(ctx.session?.user.id, input);

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (sounds.length > input.limit) {
        const nextItem = sounds.pop();
        nextCursor = nextItem!.id;
      }

      return {
        sounds,
        nextCursor,
      };
    }),
  getSound: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(({ input, ctx }) => {
      return SoundQuery.getSound(input.id, ctx.session?.user.id);
    }),
  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
        type: SearchType.nullish().transform((value) => value ?? "normal"),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
        direction: z.enum(["forward", "backward"]).default("forward"),
      }),
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.session?.user.id;
      const sounds = await SoundQuery.searchForSoundsInfinite(
        input.query,
        input.type,
        input.limit,
        input.cursor,
        userId,
      );

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (sounds.length > input.limit) {
        const nextItem = sounds.pop();
        nextCursor = nextItem!.id;
      }

      return {
        sounds,
        nextCursor,
      };
    }),
  likeSound: protectedProcedure
    .input(
      z.object({
        soundId: z.string(),
        liked: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return SoundMutations.likeSound(
        ctx.session?.user.id,
        input.soundId,
        input.liked,
      );
    }),
  reportSound: protectedProcedure
    .input(z.object({ id: z.string(), reason: z.string().trim().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id;
      const existingReport = await ReportQuery.getReport(userId, input.id);

      if (existingReport) {
        return { success: false, error: "REPORT_EXISTS" };
      }

      const report = await ReportMutations.createReport(
        userId,
        input.id,
        input.reason,
      );
      return { success: true, value: { caseId: report.id } };
    }),
  download: publicProcedure
    .input(
      z.object({
        soundId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return SoundMutations.incrementDownloadCount(
        input.soundId,
        ctx.session?.user.id,
      );
    }),
});
