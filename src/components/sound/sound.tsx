"use client";

import Link from "next/link";
import { useRef } from "react";
import Twemoji from "react-twemoji";
import { useAudio } from "../../context/AudioContext";
import { Button } from "../ui/button";
import { AddToGuildButton } from "./add-button";
import { DeleteSoundButton } from "./delete-button";

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
}

export default function Sound({
  id,
  name,
  emoji,
  url,
  className,
  displayAddButton = true,
  displayDeleteButton,
  discordSoundId,
  guildId,
}: Readonly<SoundProperties>) {
  const { audioRef, play } = useAudio();

  return (
    <div
      className={`flex h-44 w-32 flex-col items-center justify-center ${className}`}
    >
      <button
        className="flex transform cursor-pointer transition-transform active:scale-90"
        onClick={play}
      >
        <Twemoji options={{ className: "twemoji" }}>{emoji}</Twemoji>
      </button>

      <Button className="p-0" variant="link" asChild>
        <Link href={`/sound/${id}`} className="w-full truncate text-ellipsis">
          {name}
        </Link>
      </Button>

      <div className="flex flex-row gap-2">
        <div>{displayAddButton ? <AddToGuildButton soundId={id} /> : null}</div>

        {displayDeleteButton ? (
          <DeleteSoundButton
            discordSoundId={discordSoundId!}
            guildId={guildId!}
          />
        ) : null}
      </div>

      <audio ref={audioRef} controls hidden>
        <source src={url} type="audio/mpeg" />
        <track kind="captions" />
      </audio>
    </div>
  );
}
