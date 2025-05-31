"use client";

import type { Snowflake } from "discord-api-types/globals";
import Link from "next/link";
import { ShareButton } from "~/app/sounds/[id]/_components/action-button/share";
import { AudioProvider, useAudio } from "~/context/AudioContext";
import { cn } from "~/lib/utils";
import type { RouterOutputs } from "~/trpc/react";
import { EmojiImage } from "../emoji-image";
import { AddToGuildButton } from "./add-button";
import { DeleteSoundButton } from "./delete-button";
import { LikeButton } from "./like-button";

type Sound = NonNullable<
  RouterOutputs["sound"]["getAllSounds"]["sounds"]
>[number];

export type SoundListData = {
  sound: Sound;
  guildId?: Snowflake;
  discordSoundId?: Snowflake;
  external?: boolean;
  available?: boolean;
  isGuildAvailable?: boolean;
};

type SoundTableListProps = {
  className?: string;
  data: SoundListData[];
  isGuildAvailable?: boolean;
};

function SoundRow({
  sound,
  discordSoundId,
  guildId,
  external,
  className,
  isGuildAvailable = true,
}: SoundListData & { className: string }) {
  const { play } = useAudio();
  const size = 70;

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    play(discordSoundId ?? sound.id, sound.url);
  };

  return (
    <div
      className={cn(
        "hover:bg-accent/50 flex flex-col gap-4 p-4 transition-colors sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex gap-4">
        <div
          onClick={handleIconClick}
          className="cursor-pointer transition-opacity hover:opacity-80"
        >
          <EmojiImage
            emoji={sound.emoji}
            size={{ width: size, height: size }}
          />
        </div>
        <div className="flex flex-col">
          {external ? (
            <span className="font-medium">{sound.name}</span>
          ) : (
            <Link className="hover:underline" href={`/sounds/${sound.id}`}>
              {sound.name}
            </Link>
          )}
          <Link
            className="text-muted-foreground hover:underline"
            href={`/user/${sound.createdBy.id}`}
          >
            {sound.createdBy.name}
          </Link>
          {!external && (
            <div className="text-muted-foreground mt-1 flex gap-4 text-xs">
              <span>{sound.likes || 0} likes</span>
              <span>{sound.shareCount || 0} shares</span>
              <span>{sound.usegeCount || 0} uses</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 self-end">
        {!external ? (
          <>
            <AddToGuildButton soundId={sound.id} soundName={sound.name} />
            <LikeButton soundId={sound.id} liked={sound.likedByUser} />
            <ShareButton soundId={sound.id} soundName={sound.name} />
          </>
        ) : (
          <span className="text-muted-foreground mr-4 text-xs italic">
            External Sound
          </span>
        )}
        {discordSoundId && guildId && isGuildAvailable && (
          <DeleteSoundButton
            discordSoundId={discordSoundId}
            guildId={guildId}
          />
        )}
      </div>
    </div>
  );
}

function SoundTableHeader({
  isGuildAvailable = true,
}: {
  isGuildAvailable?: boolean;
}) {
  return (
    <div>
      {isGuildAvailable === false && (
        <h1 className="text-muted-foreground text-right italic">read only</h1>
      )}
    </div>
  );
}

export function SoundsList({ data, isGuildAvailable }: SoundTableListProps) {
  return (
    <AudioProvider>
      <div className="flex w-full flex-col">
        <SoundTableHeader isGuildAvailable={isGuildAvailable} />
        <div className="divide-y">
          {data.map((guildSound) => (
            <SoundRow
              key={guildSound.sound.id}
              sound={guildSound.sound}
              discordSoundId={guildSound.discordSoundId}
              guildId={guildSound.guildId}
              external={guildSound.external}
              className={cn({
                "bg-yellow-100/5": guildSound.external,
                "bg-red-500/5": guildSound.available === false,
              })}
              isGuildAvailable={isGuildAvailable}
            />
          ))}
        </div>
      </div>
    </AudioProvider>
  );
}
