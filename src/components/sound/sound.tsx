"use client";

import Link from "next/link";
import { memo } from "react";
import { cn } from "~/lib/utils";
import type { RouterOutputs } from "~/trpc/react";
import { useAudio } from "../../context/AudioContext";
import { EmojiImage } from "../emoji-image";
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
      <EmojiImage emoji={emoji} size={{ width: size, height: size }} />
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
        "flex aspect-square size-40 flex-col items-center justify-center gap-2 p-2",
        className,
      )}
    >
      <div className="flex flex-1 items-center justify-center">
        <EmojiButton id={sound.id} url={sound.url} emoji={sound.emoji} />
      </div>
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
