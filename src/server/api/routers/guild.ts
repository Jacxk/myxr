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
    .mutation(async ({ input }) => {
      void GuildMutation.deleteSound(input.guildId, input.soundId);

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

  getAllTextChannels: protectedProcedure
    .input(
      z.object({
        guildId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const [discordChannels, query] = await Promise.all([
        BotDiscordApi.getAllTextChannels(input.guildId),
        GuildQuery.getNotificationChannel(input.guildId),
      ]);

      console.log("🚀 ~ .query ~ query:", query);
      return discordChannels.map((channel) => ({
        ...channel,
        selected: query?.notificationsChannel === channel.id,
      }));
    }),

  setNotificationsChannel: allowedToManageGuildProtectedProcedure
    .input(
      z.object({
        channelId: z.string().nullish(),
      }),
    )
    .mutation(({ input }) => {
      return GuildMutation.setNotificationsChannel(
        input.guildId,
        input.channelId,
      );
    }),
});
