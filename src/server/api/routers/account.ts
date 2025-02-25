import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const accountRouter = createTRPCRouter({
  access_token: protectedProcedure.query(({ ctx }) => {
    const acount = ctx.db.account.findFirst({
      where: { id: ctx.session?.user.id },
      select: { access_token: true, token_type: true },
    });
    return acount ?? null;
  }),
});
