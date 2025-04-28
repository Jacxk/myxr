"use client";

import type { User } from "@prisma/client";
import EmojiPicker, {
  type EmojiClickData,
  EmojiStyle,
  SuggestionMode,
  Theme,
} from "emoji-picker-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { SoundPage } from "~/app/sound/[id]/_components/sound-page";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useSteps } from "~/context/StepsContext";
import { ErrorToast } from "~/lib/messages/toast.global";
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
  const { resolvedTheme: theme } = useTheme();

  const { data, prevStep, setData } = useSteps<SoundUploadProps>();

  const [uploading, setUploading] = useState<boolean>(false);
  const [soundInputName, setSoundInputName] = useState(data.fileProps.name)

  const uploadFile = useCallback(() => {
    const { editedFile, fileProps, user } = data;
    if (!editedFile) {
      ErrorToast.internal()
      return;
    }
    const renamedFile = new File(
      [editedFile],
      `${user.id}_${editedFile.name}`,
      { type: editedFile.type },
    );

    const { success, error } = FileSchema.safeParse(fileProps);
    if (!success) {
      toast.error(error?.errors[0]?.message);
      return;
    }

    setUploading(true);

    toast.loading("Uploading file...", { id: "uploading", duration: 9999999 });

    uploadFiles("soundUploader", {
      files: [renamedFile],
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
        ErrorToast.internal()
        console.error(error);
        setUploading(false);
      })
      .finally(() => {
        toast.dismiss("uploading");
      });
  }, [data, router]);

  const setSoundName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSoundInputName(e.target.value);

    const name = e.target.value.length > 0 ? e.target.value : data.file?.name;
    if (!name) return;

    setData({
      ...data,
      fileProps: { ...data.fileProps, name: name.split(".")[0] ?? name },
    });
  };

  const setSoundTags = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      fileProps: {
        ...data.fileProps,
        tags: e.target.value
          .trim()
          .split(" ")
          .filter((tag) => tag !== "")
          .map((tag) => ({ name: tag.trim() })),
      },
    });
  };

  const setSoundEmoji = (emojiData: EmojiClickData) => {
    setData({
      ...data,
      fileProps: { ...data.fileProps, emoji: emojiData.emoji },
    });
  };

  return (
    <div className="flex h-full flex-col justify-around gap-10 transition sm:flex-row sm:gap-4">
      <div className="flex flex-col items-center gap-4">
        <h1>Edit details</h1>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={soundInputName}
              onChange={setSoundName}
            />
          </div>
          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" onChange={setSoundTags} />
          </div>
          <div>
            <Label>Emoji</Label>
            <EmojiPicker
              lazyLoadEmojis
              autoFocusSearch={false}
              suggestedEmojisMode={SuggestionMode.RECENT}
              emojiStyle={EmojiStyle.TWITTER}
              onEmojiClick={setSoundEmoji}
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
            ...data.fileProps,
            tags: data.fileProps.tags ?? [],
            createdAt: new Date(),
            updatedAt: new Date(),
            createdById: data.user.id,
            createdBy: data.user as User,
            likes: Array(Math.floor(Math.random() * 1000)).length,
            likedByUser: Math.random() > 0.5,
            usegeCount: Math.floor(Math.random() * 10000),
            id: "none",
            guildSounds: [],
            deletedAt: null,
            likedBy: [],
          }}
          isPreview
        />
      </div>
    </div>
  );
}
