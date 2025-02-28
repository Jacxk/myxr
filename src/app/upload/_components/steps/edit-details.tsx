"use client";

import { Session } from "next-auth";
import { useEffect, useState } from "react";
import Sound, { SoundProperties } from "~/components/sound";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { AudioProvider } from "~/context/AudioContext";
import { useSteps } from "~/context/StepsContext";
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";

export function EditDetailsStep({
  session,
}: Readonly<{ session: Session | null }>) {
  const { files, reset } = useSteps();
  const [fileProps, setFileProps] = useState<SoundProperties>({
    name: "",
    createdBy: { id: "", name: "" },
    emoji: "",
    id: "",
    url: URL.createObjectURL(files[0] as Blob),
  });

  useEffect(() => {
    console.log(session);
    if (files.length > 0) {
      setFileProps({
        name: "Enter title",
        createdBy: {
          id: session?.user.id ?? "",
          name: session?.user.name ?? "",
        },
        emoji: "🎵",
        id: "",
        url: URL.createObjectURL(files[0] as Blob),
      });
    }
    console.log(fileProps.emoji);
  }, [session, files]);

  return (
    <AudioProvider>
      <div className="flex h-full flex-col gap-20 p-10 sm:flex-row">
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
              <Input id="tags" />
            </div>
            <EmojiPicker
              emojiStyle={EmojiStyle.TWITTER}
              onEmojiClick={(emoji) =>
                setFileProps((prop) => ({ ...prop, emoji: emoji.emoji }))
              }
            />
            <div className="flex gap-2">
              <Button>Save Changes</Button>
              <Button onClick={reset} variant="destructive">
                Cancel
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-5 align-top">
          <h1 className="text-center">Preview</h1>
          <div className="flex justify-center">
            <Sound {...fileProps} />
          </div>
        </div>
      </div>
    </AudioProvider>
  );
}
