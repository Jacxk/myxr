"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { cn } from "~/lib/utils";
import type { RouterOutputs } from "~/trpc/react";
import { useAudio } from "../../context/AudioContext";
import { Button } from "../ui/button";
import { AddToGuildButton } from "./add-button";
import { DeleteSoundButton } from "./delete-button";
import { LikeButton } from "./like-button";

type Sound = RouterOutputs["sound"]["getSound"];
type SearchSound = RouterOutputs["sound"]["search"]["sounds"][number];

export type SoundProperties = {
  sound: NonNullable<Sound | SearchSound>;
  className?: string;
  displayAddButton?: boolean;
  displayDeleteButton?: boolean;
  discordSoundId?: string;
  guildId?: string;
  isPreview?: boolean;
};

export function getEmojiUrl(emoji: string, svg = false) {
  const codePoints = Array.from(emoji)
    .map((char) => char.codePointAt(0)!)
    .filter((cp) => cp !== 0xfe0f)
    .map((cp) => cp.toString(16))
    .join("-");

  const ext = svg ? "svg" : "png";
  const folder = svg ? "svg" : "72x72";
  return `https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/${folder}/${codePoints}.${ext}`;
}

const EmojiButton = memo(function EmojiButtonMemoized({
  id,
  url,
  emoji,
}: {
  id: string;
  url: string;
  emoji: string;
}) {
  const { isPlaying, currentId, play, preload } = useAudio();
  const currentlyPlay = isPlaying && currentId === id;
  const size = 72;

  return (
    <button
      className={cn("flex transform cursor-pointer transition-transform", {
        "scale-90": currentlyPlay,
      })}
      onMouseOver={() => preload(url)}
      onClick={() => play(id, url)}
    >
      <Image width={size} height={size} src={getEmojiUrl(emoji)} alt={emoji} />
    </button>
  );
});

export default memo(function Sound({
  sound,
  className,
  displayAddButton = true,
  displayDeleteButton,
  discordSoundId,
  guildId,
  isPreview,
}: SoundProperties) {
  return (
    <div
      className={cn(
        "flex shrink flex-col items-center justify-center",
        className,
      )}
    >
      <EmojiButton id={sound.id} url={sound.url} emoji={sound.emoji} />
      <Button
        className="p-0 text-center break-words whitespace-normal"
        variant="link"
        asChild
      >
        {!isPreview ? (
          <Link href={`/sound/${sound.id}`}>{sound.name}</Link>
        ) : (
          <span>{sound.name}</span>
        )}
      </Button>

      <div className="flex flex-row gap-2">
        {displayAddButton ? (
          <AddToGuildButton soundId={sound.id} isPreview={isPreview} />
        ) : null}
        {displayAddButton ? (
          <LikeButton
            soundId={sound.id}
            liked={"likedByUser" in sound ? sound.likedByUser : false}
            isPreview={isPreview}
          />
        ) : null}

        {displayDeleteButton ? (
          <DeleteSoundButton
            discordSoundId={discordSoundId!}
            guildId={guildId!}
          />
        ) : null}
      </div>
    </div>
  );
});
