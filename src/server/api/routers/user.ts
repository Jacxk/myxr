import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getSoundsFromUser } from "~/utils/db";

export const userRouter = createTRPCRouter({
  getSounds: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return await getSoundsFromUser(input);
  }),
});
