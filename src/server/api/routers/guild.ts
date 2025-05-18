import { z } from "zod";
import {
  allowedToManageGuildProtectedProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { GuildMutation } from "~/utils/db/mutations/guild";
import { GuildQuery } from "~/utils/db/queries/guild";
import { BotDiscordApi } from "~/utils/discord/bot-api";

export const guildRouter = createTRPCRouter({
  getGuild: publicProcedure.input(z.string()).query(async ({ input }) => {
    return GuildQuery.getGuild(input);
  }),
  isBotIn: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    return {
      success: true,
      value: await BotDiscordApi.isBotInGuild(input),
    };
  }),
  createSound: allowedToManageGuildProtectedProcedure
    .input(
      z.object({
        soundId: z.string(),
        guildName: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return GuildMutation.createSoundBoardSound(input);
    }),
  getSoundBoard: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return await BotDiscordApi.getSoundBoard(input);
    }),
  deleteSound: allowedToManageGuildProtectedProcedure
    .input(
      z.object({
        soundId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const guildSound = await ctx.db.guildSound.findFirst({
        where: { guildId: input.guildId, discordSoundId: input.soundId },
      });

      if (guildSound) {
        await ctx.db.guildSound.delete({
          where: { discordSoundId: input.soundId },
        });
      }

      await BotDiscordApi.deleteSound(input.guildId, input.soundId).catch(
        () => null,
      );
      return { success: true };
    }),
  getGuildSounds: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return GuildQuery.getGuildSounds(input);
    }),
  getGuildRoles: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const guildRoles = await BotDiscordApi.getGuildRoles(input);
      const roles = await GuildQuery.getSoundMasterRoles(input);

      return guildRoles
        .filter(
          (role) => !["@everyone", "Myxr"].includes(role.name) && !role.managed,
        )
        .sort((a, b) => a.position - b.position)
        .map((role) => ({
          ...role,
          isMasterRole: !!roles?.soundMasterRoles.includes(role.id),
        }));
    }),
  setSoundMasterRoles: allowedToManageGuildProtectedProcedure
    .input(
      z.object({
        roles: z.array(z.string()),
      }),
    )
    .mutation(async ({ input }) => {
      return GuildMutation.setSoundMasterRoles(input.guildId, input.roles);
    }),
});
