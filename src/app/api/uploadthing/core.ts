import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

const f = createUploadthing();

export const ourFileRouter = {
  soundUploader: f({
    audio: {
      maxFileSize: "1MB",
    },
  })
    .middleware(async ({ req }) => {
      const session = await auth();

      if (!session || !session?.user)
        throw new UploadThingError("Unauthorized");

      return { userId: session?.user.id, emoji: "🎵", name: "change me" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.ufsUrl);

      await db.sound.create({
        data: {
          url: file.ufsUrl,
          createdById: metadata.userId,
          emoji: metadata.emoji,
          name: metadata.name,
        },
      });

      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
