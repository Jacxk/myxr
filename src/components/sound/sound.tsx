"use client";

import Link from "next/link";
import { memo, useMemo } from "react";
import Twemoji from "react-twemoji";
import { useAudio } from "../../context/AudioContext";
import { Button } from "../ui/button";
import { AddToGuildButton } from "./add-button";
import { DeleteSoundButton } from "./delete-button";
import { LikeButton } from "./like-button";
import { cn } from "~/lib/utils";

export interface SoundProperties {
  id: string;
  name: string;
  emoji: string;
  url: string;
  tags?: string[];
  createdBy?: { name: string | null; id: string };
  className?: string;
  displayAddButton?: boolean;
  displayDeleteButton?: boolean;
  discordSoundId?: string;
  guildId?: string;
  liked?: boolean;
}

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
  liked,
}: Readonly<SoundProperties>) {
  const { isPlaying, currentId, play } = useAudio();
  const currentlyPlay = useMemo(
    () => isPlaying && currentId === id,
    [isPlaying, currentId],
  );

  return (
    <div
      className={cn(
        "flex shrink flex-col items-center justify-center",
        className,
      )}
    >
      <button
        className={`flex transform cursor-pointer transition-transform ${currentlyPlay ? "scale-90" : ""}`}
        onClick={() => play(id, url)}
      >
        <Twemoji options={{ className: "twemoji w-20 h-20" }}>{emoji}</Twemoji>
      </button>

      <Button
        className="whitespace-normal break-words p-0 text-center"
        variant="link"
        asChild
      >
        <Link href={`/sound/${id}`}>{name}</Link>
      </Button>

      <div className="flex flex-row gap-2">
        {displayAddButton ? <AddToGuildButton soundId={id} /> : null}
        {displayAddButton ? <LikeButton soundId={id} liked={liked} /> : null}

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
