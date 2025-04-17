"use client";

import EmojiPicker, {
  EmojiStyle,
  SuggestionMode,
  Theme,
} from "emoji-picker-react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { SoundPage } from "~/app/sound/[id]/_components/sound-page";
import { type SoundProperties } from "~/components/sound/sound";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useSteps } from "~/context/StepsContext";
import { uploadFiles } from "~/utils/uploadthing";
import { type SoundUploadProps } from "./select-file";

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
    toast.loading("Uploading file...", { id: "uploading", duration: 9999999 });
    setUploading(true);
    uploadFiles("soundUploader", {
      files: [data.newFile!],
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
  }, [data, fileProps]);

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

  useEffect(() => {
    setFileProps((props) => ({
      ...props,
      name: props.name ? props.name : "Enter name",
    }));
  }, [fileProps.name]);

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
            name: fileProps.name,
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
