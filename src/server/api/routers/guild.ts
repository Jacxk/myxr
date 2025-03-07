import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { createSound } from "~/utils/discord-requests";

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
        guildId: z.string({
          message: "Test",
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.db.sound.findFirst({
        where: { id: input.soundId },
      });

      if (!data) throw Error("Cound not find the sound: " + input.soundId);
      const sound = await downloadSoundToBase64(data?.url);

      const soundData = await createSound({
        emoji: data.emoji,
        guildId: input.guildId,
        name: data.name,
        sound,
      });

      void ctx.db.guildSound.create({
        data: {
          guildId: input.guildId,
          soundId: input.soundId,
          discordSoundId: soundData.sound_id,
        },
      });

      void ctx.db.sound.update({
        where: { id: input.soundId },
        data: { usegeCount: { increment: 1 } },
      });

      return soundData;
    }),
});

async function downloadSoundToBase64(url: string) {
  const file = await fetch(url);
  const arrayBuffer = await file.arrayBuffer();
  const base64String = Buffer.from(arrayBuffer).toString("base64");
  return `data:audio/mp3;base64,${base64String}`;
}
