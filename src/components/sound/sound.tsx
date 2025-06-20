"use client";

import Link from "next/link";
import { memo } from "react";
import { cn } from "~/lib/utils";
import type { RouterOutputs } from "~/trpc/react";
import { useAudio } from "../../context/AudioContext";
import { EmojiImage, type EmojiImageProps } from "../emoji-image";
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

export const EmojiButton = memo(function EmojiButtonMemoized({
  id,
  url,
  emoji,
  ...emojiProps
}: {
  id: string;
  url: string;
} & EmojiImageProps) {
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
      <EmojiImage
        emoji={emoji}
        size={{ width: size, height: size }}
        {...emojiProps}
      />
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
        "flex aspect-square w-40 flex-col items-center justify-center gap-2 p-2",
        className,
      )}
    >
      <div className="mb-3 flex flex-1 items-center justify-center">
        <EmojiButton id={sound.id} url={sound.url} emoji={sound.emoji} />
      </div>
      <Button
        className="p-0 text-center text-sm font-medium break-words whitespace-normal"
        variant="link"
        asChild
      >
        {!isPreview ? (
          <Link href={`/sounds/${sound.id}`}>{sound.name}</Link>
        ) : (
          <span>{sound.name}</span>
        )}
      </Button>

      <div className="flex flex-row gap-2">
        {displayAddButton ? (
          <AddToGuildButton
            soundName={sound.name}
            soundId={sound.id}
            isPreview={isPreview}
          />
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
      <div className="text-muted-foreground flex gap-4 text-xs">
        <span>{Intl.NumberFormat().format(sound.usegeCount)} uses</span>
        <span>{Intl.NumberFormat().format(sound.likes)} likes</span>
      </div>
    </div>
  );
});
