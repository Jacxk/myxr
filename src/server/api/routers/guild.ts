import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { createSound } from "~/utils/discord-requests";

export const guildRouter = createTRPCRouter({
  isBotIn: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
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

      return await createSound({
        emoji: data.emoji,
        guildId: input.guildId,
        name: data.name,
        sound,
      });
    }),
});

async function downloadSoundToBase64(url: string) {
  const file = await fetch(url);
  const arrayBuffer = await file.arrayBuffer();
  const base64String = Buffer.from(arrayBuffer).toString("base64");
  return `data:audio/mp3;base64,${base64String}`;
}
