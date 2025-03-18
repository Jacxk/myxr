import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import {
  createSound,
  deleteSound,
  getSoundBoard,
} from "~/utils/discord-requests";

export const guildRouter = createTRPCRouter({
  isBotIn: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const query = await ctx.db.guild.findFirst({
        where: { id: input },
      });
      return {
        success: true,
        value: !!query?.id,
      };
    }),
  createSound: protectedProcedure
    .input(
      z.object({
        soundId: z.number(),
        guildId: z.string(),
        guildName: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.db.sound.findFirst({
        where: { id: input.soundId },
      });

      if (!data) throw Error("SOUND_NOT_FOUND");
      const sound = await downloadSoundToBase64(data?.url);

      const guildSound = await ctx.db.guildSound.findFirst({
        where: { guildId: input.guildId, soundId: input.soundId },
      });

      if (guildSound) throw Error("SOUND_EXISTS");

      const soundData = await createSound({
        emoji: data.emoji,
        guildId: input.guildId,
        name: data.name,
        sound,
      });

      await ctx.db.guildSound.create({
        data: {
          guildId: input.guildId,
          soundId: input.soundId,
          discordSoundId: soundData.sound_id,
        },
      });

      await ctx.db.guild.update({
        where: { id: input.guildId },
        data: { name: input.guildName },
      });

      await ctx.db.sound.update({
        where: { id: input.soundId },
        data: { usegeCount: { increment: 1 } },
      });

      return soundData;
    }),
  getSoundBoard: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
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

      await deleteSound(input.guildId, input.soundId);
      return { success: true };
    }),
});

async function downloadSoundToBase64(url: string) {
  const file = await fetch(url);
  const arrayBuffer = await file.arrayBuffer();
  const base64String = Buffer.from(arrayBuffer).toString("base64");
  return `data:audio/mp3;base64,${base64String}`;
}
