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
import Sound, { type SoundProperties } from "~/components/sound/sound";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { AudioProvider } from "~/context/AudioContext";
import { useSteps } from "~/context/StepsContext";
import { uploadFiles } from "~/utils/uploadthing";
import { type SoundUploadProps } from "./select-file";

export function EditDetailsStep() {
  const router = useRouter();
  const {data: session} = useSession()
  const { theme } = useTheme();
  const { data, prevStep } = useSteps<SoundUploadProps>();
  const [uploading, setUploading] = useState<boolean>(false);
  const [fileProps, setFileProps] = useState<SoundProperties>({
    name: "",
    createdBy: { id: "", name: "" },
    emoji: "",
    id: -1,
    url: URL.createObjectURL(data.newFile as Blob),
    tags: [],
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
    console.log(data.newFile);
    setFileProps({
      name: "",
      createdBy: {
        id: session?.user.id ?? "",
        name: session?.user.name ?? "",
      },
      emoji: "🎵",
      id: -1,
      url: URL.createObjectURL(data.newFile as Blob),
    });
  }, [session, data.newFile]);

  useEffect(() => {
    setFileProps((props) => ({
      ...props,
      name: props.name ? props.name : "Enter name",
    }));
  }, [fileProps.name]);

  return (
    <AudioProvider>
      <div className="flex h-full flex-col justify-center gap-20 p-10 transition sm:flex-row">
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
                    tags: e.target.value.split(" "),
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
        <div className="flex flex-col gap-5 align-top">
          <h1 className="text-center">Preview</h1>
          <div className="flex flex-col items-center gap-4">
            <Sound {...fileProps} />
          </div>
        </div>
      </div>
    </AudioProvider>
  );
}
