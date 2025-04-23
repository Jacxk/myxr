"use client";

import EmojiPicker, {
  EmojiStyle,
  SuggestionMode,
  Theme,
} from "emoji-picker-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { SoundPage } from "~/app/sound/[id]/_components/sound-page";
import { type SoundProperties } from "~/components/sound/sound";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useSteps } from "~/context/StepsContext";
import { useSession } from "~/lib/auth-client";
import { uploadFiles } from "~/utils/uploadthing";
import { type SoundUploadProps } from "./select-file";

const FileSchema = z.object({
  emoji: z.string({ description: "You need to provide an emoji" }),
  name: z
    .string({ description: "You need to provide a name" })
    .min(1, "Name is too short")
    .max(20, "Name is too long"),
  tags: z.array(z.object({ name: z.string() })).optional(),
});

export function EditDetailsStep() {
  const router = useRouter();
  const { theme } = useTheme();
  const { data: session } = useSession();

  const { data, prevStep } = useSteps<SoundUploadProps>();

  const [uploading, setUploading] = useState<boolean>(false);
  const [fileProps, setFileProps] = useState<SoundProperties>({
    name: "",
    emoji: "",
    id: "",
    url: URL.createObjectURL(data.newFile as Blob),
  });

  const uploadFile = useCallback(() => {
    const newFile = data.newFile;
    if (!newFile) {
      toast.error("There was an error while uploading.");
      return;
    }
    const file = new File(
      [newFile],
      `${session?.user.id ?? "unknown"}_${newFile.name}`,
      { type: newFile.type },
    );

    const { success, error } = FileSchema.safeParse(fileProps);
    if (!success) {
      toast.error(error?.errors[0]?.message);
      return;
    }

    setUploading(true);

    toast.loading("Uploading file...", { id: "uploading", duration: 9999999 });

    uploadFiles("soundUploader", {
      files: [file],
      input: {
        emoji: fileProps.emoji,
        name: fileProps.name,
        tags: fileProps.tags,
      },
    })
      .then(() => {
        toast("File uploaded successfully!");
        router.push("/");
      })
      .catch((error) => {
        toast.error("There was an error while uploading.");
        console.error(error);
        setUploading(false);
      })
      .finally(() => {
        toast.dismiss("uploading");
      });
  }, [data.newFile, fileProps]);

  useEffect(() => {
    setFileProps({
      name: "",
      createdBy: {
        id: session?.user.id ?? "",
        name: session?.user.name ?? "",
        image: session?.user.image ?? "",
      },
      emoji: "🎵",
      id: "",
      url: URL.createObjectURL(data.newFile as Blob),
    });
  }, [data.newFile]);

  return (
    <div className="flex h-full flex-col justify-around gap-10 transition sm:flex-row sm:gap-0">
      <div className="flex flex-col items-center gap-4">
        <h1>Edit details</h1>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              onChange={(e) =>
                setFileProps((prop) => ({ ...prop, name: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              onChange={(e) =>
                setFileProps((prop) => ({
                  ...prop,
                  tags: e.target.value
                    .trim()
                    .split(" ")
                    .filter((tag) => tag !== "")
                    .map((tag) => ({ name: tag.trim() })),
                }))
              }
            />
          </div>
          <div>
            <Label>Emoji</Label>
            <EmojiPicker
              lazyLoadEmojis
              autoFocusSearch={false}
              suggestedEmojisMode={SuggestionMode.RECENT}
              emojiStyle={EmojiStyle.TWITTER}
              onEmojiClick={(emoji) =>
                setFileProps((prop) => ({ ...prop, emoji: emoji.emoji }))
              }
              theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
            />
          </div>
          <div className="flex justify-stretch gap-2">
            <Button
              className="w-full"
              onClick={prevStep}
              variant="outline"
              disabled={uploading}
            >
              Back
            </Button>
            <Button
              className="w-full"
              onClick={uploadFile}
              disabled={uploading}
            >
              {uploading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex min-w-[50%] flex-col items-center gap-4">
        <h1>Preview</h1>
        <SoundPage
          id="none"
          sound={{
            createdAt: new Date(),
            createdBy: {
              id: session?.user.id ?? "",
              name: session?.user.name ?? "Me",
              image: session?.user.image ?? "",
            },
            emoji: fileProps.emoji,
            guildSounds: [],
            id: "none",
            likedBy: Array(Math.floor(Math.random() * 1000)).fill({}),
            name: fileProps.name.length > 0 ? fileProps.name : "No name provided",
            tags: fileProps.tags,
            usegeCount: Math.floor(Math.random() * 10000),
            url: URL.createObjectURL(data.newFile as Blob),
          }}
          user={session?.user}
          isPreview
        />
      </div>
    </div>
  );
}
