"use client";

import type { Snowflake } from "discord-api-types/globals";
import Link from "next/link";
import Twemoji from "react-twemoji";
import { AudioProvider, useAudio } from "~/context/AudioContext";
import { cn } from "~/lib/utils";
import type { RouterOutputs } from "~/trpc/react";
import { Button } from "../ui/button";
import { DeleteSoundButton } from "./delete-button";

type Sound = NonNullable<RouterOutputs["user"]["getSounds"]>[number];

export type SoundListData = {
  sound: Sound;
  guildId: Snowflake;
  discordSoundId: Snowflake;
  external?: boolean;
};

type SoundTableListProps = {
  className?: string;
  data: SoundListData[];
};

function SoundRow({
  sound,
  discordSoundId,
  guildId,
  external,
  className,
}: SoundListData & { className: string }) {
  const { play } = useAudio();

  return (
    <Button
      variant="ghost"
      onClick={() => play(discordSoundId, sound.url)}
      className={cn("gap-0 rounded-none", className)}
      asChild
    >
      <div className="grid h-fit w-full cursor-pointer grid-cols-4 items-center">
        <div>
          {sound.emoji.startsWith("http") ? (
            <img src={sound.emoji} alt="emoji" className="twemoji-list" />
          ) : (
            <Twemoji options={{ className: "twemoji-list" }}>
              {sound.emoji}
            </Twemoji>
          )}
        </div>
        <div className="col-span-2">
          {external ? (
            <span>{sound.name}</span>
          ) : (
            <Button className="p-0" variant="link" asChild>
              <Link
                onClick={(e) => e.stopPropagation()}
                href={`/sound/${sound.id}`}
              >
                {sound.name}
              </Link>
            </Button>
          )}
        </div>
        <div className="flex items-center justify-between">
          {external ? (
            <span>{sound.createdBy.name}</span>
          ) : (
            <Button className="p-0" variant="link" asChild>
              <Link
                onClick={(e) => e.stopPropagation()}
                href={`/user/${sound.createdBy.id}`}
              >
                {sound.createdBy.name}
              </Link>
            </Button>
          )}
          <DeleteSoundButton
            discordSoundId={discordSoundId}
            guildId={guildId}
          />
        </div>
      </div>
    </Button>
  );
}

function SoundTableHeader() {
  return (
    <div className="grid h-full w-full grid-cols-4 items-center p-4">
      <span>Emoji</span>
      <span className="col-span-2">Name</span>
      <span>Created By</span>
    </div>
  );
}

export function SoundTableList({ data }: SoundTableListProps) {
  return (
    <AudioProvider>
      <div className="flex w-full flex-col">
        <SoundTableHeader />
        <div className="divide-y">
          {data.map((guildSound) => (
            <SoundRow
              key={guildSound.sound.id}
              sound={guildSound.sound}
              discordSoundId={guildSound.discordSoundId}
              guildId={guildSound.guildId}
              external={guildSound.external}
              className={cn({ "bg-yellow-100/5": guildSound.external })}
            />
          ))}
        </div>
      </div>
    </AudioProvider>
  );
}
