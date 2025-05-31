import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { GuildQuery } from "~/utils/db/queries/guild";
import { SoundQuery } from "~/utils/db/queries/sound";
import { UserQuery } from "~/utils/db/queries/user";

export const globalRouter = createTRPCRouter({
  getGlobalStats: publicProcedure.query(async () => {
    const [soundCount, userCount, guildCount] = await Promise.all([
      SoundQuery.getSoundCount(),
      UserQuery.getUserCount(),
      GuildQuery.getGuildsWithSoundsCount(),
    ]);

    return {
      soundCount,
      userCount,
      guildCount,
    };
  }),
});
