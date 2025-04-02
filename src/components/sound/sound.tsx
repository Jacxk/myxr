"use client";

import Link from "next/link";
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
  const { play } = useAudio();

  return (
    <div
      className={`flex shrink flex-col items-center justify-center ${className}`}
    >
      <button
        className="flex transform cursor-pointer transition-transform active:scale-90"
        onClick={() => play(url)}
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
        <div>{displayAddButton ? <AddToGuildButton soundId={id} /> : null}</div>

        {displayDeleteButton ? (
          <DeleteSoundButton
            discordSoundId={discordSoundId!}
            guildId={guildId!}
          />
        ) : null}
      </div>
    </div>
  );
}
