import { soundRouter } from "~/server/api/routers/sound";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { globalRouter } from "./routers/global";
import { guildRouter } from "./routers/guild";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  sound: soundRouter,
  user: userRouter,
  guild: guildRouter,
  global: globalRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
