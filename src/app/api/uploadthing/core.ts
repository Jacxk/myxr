import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
import { env } from "~/env";
import { getServerSession } from "~/lib/auth";
import { SoundMutations } from "~/utils/db/mutations/sound";
import { BotDiscordApi } from "~/utils/discord/bot-api";

const f = createUploadthing();

export const ourFileRouter = {
  soundUploader: f({
    audio: {
      maxFileSize: "1MB",
    },
  })
    .input(
      z.object({
        emoji: z.string(),
        name: z.string().max(20),
        tags: z.array(z.object({ name: z.string() })).optional(),
      }),
    )
    .middleware(async ({ input }) => {
      const session = await getServerSession();

      // eslint-disable-next-line @typescript-eslint/only-throw-error
      if (!session?.user) throw new UploadThingError("Unauthorized");

      return {
        userId: session?.user.id,
        emoji: input.emoji,
        name: input.name,
        tags: input.tags,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.ufsUrl);

      const data = await SoundMutations.createSound({
        name: metadata.name,
        url: file.ufsUrl,
        emoji: metadata.emoji,
        userId: metadata.userId,
        tags: metadata.tags ?? [],
      });

      void BotDiscordApi.sendNewSoundNotification(
        data.value,
        env.DISCORD_NEW_SOUND_CHANNEL_ID,
      );

      return { createdBy: metadata.userId, id: data.value.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
