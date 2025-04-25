"use client";

import Link from "next/link";
import { memo } from "react";
import Twemoji from "react-twemoji";
import { cn } from "~/lib/utils";
import type { getSound } from "~/utils/db";
import { useAudio } from "../../context/AudioContext";
import { Button } from "../ui/button";
import { AddToGuildButton } from "./add-button";
import { DeleteSoundButton } from "./delete-button";
import { LikeButton } from "./like-button";

export type SoundProperties = {
  className?: string;
  displayAddButton?: boolean;
  displayDeleteButton?: boolean;
  discordSoundId?: string;
  guildId?: string;
  isPreview?: boolean;
} & Awaited<ReturnType<typeof getSound>>

const EmojiButton = memo(function EmojiButtonMemoized({ id, url, emoji }: { id: string; url: string; emoji: string }) {
  const { isPlaying, currentId, play } = useAudio();
  const currentlyPlay = isPlaying && currentId === id;

  return (
    <button
      className={cn("flex transform cursor-pointer transition-transform", {
        "scale-90": currentlyPlay,
      })}
      onClick={() => play(id, url)}
    >
      <Twemoji options={{ className: "twemoji w-20 h-20" }}>{emoji}</Twemoji>
    </button>
  );
},
);

export default memo(function Sound({
  id,
  name,
  emoji,
  url,
  className,
  displayAddButton = true,
  displayDeleteButton,
  discordSoundId,
  guildId,
  likedByUser,
  isPreview,
}: Readonly<SoundProperties>) {
  return (
    <div
      className={cn(
        "flex shrink flex-col items-center justify-center",
        className,
      )}
    >
      <EmojiButton id={id} url={url} emoji={emoji} />
      <Button
        className="whitespace-normal break-words p-0 text-center"
        variant="link"
        asChild
      >
        {!isPreview ? (
          <Link href={`/sound/${id}`}>{name}</Link>
        ) : (
          <span>{name}</span>
        )}
      </Button>

      <div className="flex flex-row gap-2">
        {displayAddButton ? (
          <AddToGuildButton soundId={id} isPreview={isPreview} />
        ) : null}
        {displayAddButton ? (
          <LikeButton soundId={id} liked={likedByUser} isPreview={isPreview} />
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
