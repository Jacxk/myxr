import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import {
  getGuild,
  getGuildSounds,
  getSoundMasterRoles,
  handleSoundGuildCreate,
  hasSoundBoardCreatePermission,
  setSoundMasterRoles,
} from "~/utils/db";
import {
  createSound,
  deleteSound,
  getGuildRoles,
  getSoundBoard,
  isBotInGuild,
} from "~/utils/discord-requests";

export const guildRouter = createTRPCRouter({
  getGuild: publicProcedure.input(z.string()).query(async ({ input }) => {
    return getGuild(input);
  }),
  isBotIn: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    return {
      success: true,
      value: await isBotInGuild(input),
    };
  }),
  createSound: protectedProcedure
    .input(
      z.object({
        soundId: z.string(),
        guildId: z.string(),
        guildName: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const hasPermission = await hasSoundBoardCreatePermission(
        input.guildId,
        ctx.session.session.userId,
      );
      const isAdmin =
        ctx.session.user.guilds.filter((guild) => guild.id === input.guildId)
          .length > 0;

      if (!(hasPermission || isAdmin)) throw Error("NO_PERMISSION");

      const data = await ctx.db.sound.findFirst({
        where: { id: input.soundId },
      });
      if (!data) throw Error("SOUND_NOT_FOUND");

      const guildSound = await ctx.db.guildSound.findFirst({
        where: { guildId: input.guildId, soundId: input.soundId },
      });
      if (guildSound) throw Error("SOUND_EXISTS");

      const sound = await downloadSoundToBase64(data?.url);
      const soundData = await createSound({
        emoji: data.emoji,
        guildId: input.guildId,
        name: data.name,
        sound,
      });

      await handleSoundGuildCreate({
        discordSoundId: soundData.sound_id,
        ...input,
      });

      return soundData;
    }),
  getSoundBoard: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return await getSoundBoard(input);
    }),
  deleteSound: protectedProcedure
    .input(
      z.object({
        guildId: z.string(),
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

      await deleteSound(input.guildId, input.soundId).catch(() => null);
      return { success: true };
    }),
  getGuildSounds: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return getGuildSounds(input);
    }),
  getGuildRoles: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const guildRoles = await getGuildRoles(input);
      const roles = await getSoundMasterRoles(input);

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
  setSoundMasterRoles: protectedProcedure
    .input(
      z.object({
        guildId: z.string(),
        roles: z.array(z.string()),
      }),
    )
    .mutation(async ({ input }) => {
      return setSoundMasterRoles(input.guildId, input.roles);
    }),
});
async function downloadSoundToBase64(url: string) {
  const file = await fetch(url);
  const arrayBuffer = await file.arrayBuffer();
  const base64String = Buffer.from(arrayBuffer).toString("base64");
  return `data:audio/mp3;base64,${base64String}`;
}
