"use client";

import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import prettyBytes from "pretty-bytes";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import Sound, { SoundProperties } from "~/components/sound";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { AudioProvider } from "~/context/AudioContext";
import { useSteps } from "~/context/StepsContext";
import { uploadFiles } from "~/utils/uploadthing";
import { SoundUploadProps } from "./select-file";

export function EditDetailsStep({
  session,
}: Readonly<{ session: Session | null }>) {
  const router = useRouter();
  const { data, reset } = useSteps<SoundUploadProps>();
  const [uploading, setUploading] = useState<boolean>(false);
  const [fileProps, setFileProps] = useState<SoundProperties>({
    name: "",
    createdBy: { id: "", name: "" },
    emoji: "",
    id: "",
    url: URL.createObjectURL(data.file as Blob),
    tags: [],
  });

  const uploadFile = useCallback(async () => {
    toast.loading("Uploading file...", { id: "uploading", duration: 9999999 });
    setUploading(true);
    const res = await uploadFiles("soundUploader", {
      files: [data.file as File],
      input: {
        emoji: fileProps.emoji,
        name: fileProps.name,
        tags: fileProps.tags,
      },
    });

    console.log(fileProps, res);
    toast("File uploaded successfully!");
    toast.dismiss("uploading");
    router.push("/");
  }, [data, fileProps]);

  useEffect(() => {
    setFileProps({
      name: "Enter title",
      createdBy: {
        id: session?.user.id ?? "",
        name: session?.user.name ?? "",
      },
      emoji: "🎵",
      id: "",
      url: URL.createObjectURL(data.file as Blob),
    });
  }, [session, data.file]);

  return (
    <AudioProvider>
      <div className="flex h-full flex-col gap-20 p-10 transition sm:flex-row">
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
                emojiStyle={EmojiStyle.TWITTER}
                onEmojiClick={(emoji) =>
                  setFileProps((prop) => ({ ...prop, emoji: emoji.emoji }))
                }
              />
            </div>
            <div className="flex justify-stretch gap-2">
              <Button
                className="w-full"
                onClick={uploadFile}
                disabled={uploading}
              >
                {uploading ? "Saving..." : "Save Changes"}
              </Button>
              <Button className="w-full" onClick={reset} variant="destructive">
                Cancel
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-5 align-top">
          <h1 className="text-center">Preview</h1>
          <div className="flex flex-col items-center gap-4">
            <Sound {...fileProps} />
            <div className="flex flex-col flex-wrap">
              <p>File name: {data.file?.name}</p>
              <p>File size: {prettyBytes(data.file?.size ?? 0)}</p>
              <p>File type: {data.file?.type}</p>
            </div>
          </div>
        </div>
      </div>
    </AudioProvider>
  );
}
