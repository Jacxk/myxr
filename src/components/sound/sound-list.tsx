"use client";

import type { GuildSound, Sound, User } from "@prisma/client";
import { Snowflake } from "discord-api-types/globals";
import Link from "next/link";
import { useRef } from "react";
import Twemoji from "react-twemoji";
import { AudioProvider, useAudio } from "~/context/AudioContext";
import { Button } from "../ui/button";
import { DeleteSoundButton } from "./delete-button";

interface SoundData extends GuildSound {
  sound: SoundIncludedUser;
  external: boolean;
}

interface SoundIncludedUser extends Sound {
  createdBy: User;
}

function SoundRow({
  sound,
  discordSoundId,
  guildId,
  className = "",
}: Readonly<{
  sound: SoundIncludedUser;
  discordSoundId: Snowflake;
  guildId: Snowflake;
  className?: string;
}>) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentAudio, setCurrentAudio } = useAudio();

  const play = () => {
    if (audioRef.current) {
      if (currentAudio && currentAudio !== audioRef.current) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      if (audioRef.current.paused) {
        audioRef.current.play();
        setCurrentAudio(audioRef.current);
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setCurrentAudio(null);
      }
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={play}
      className={`gap-0 rounded-none ${className}`}
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

          <audio ref={audioRef} controls hidden>
            <source src={sound.url} type="audio/mpeg" />
            <track kind="captions" />
          </audio>
        </div>
        <span className="col-span-2">{sound.name}</span>
        <div className="flex justify-between">
          <Button className="p-0" variant="link" asChild>
            <Link
              onClick={(e) => e.stopPropagation()}
              href={`/user/${sound.createdById}`}
            >
              {sound.createdBy.name}
            </Link>
          </Button>
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

export function SoundTableList({
  guildSounds,
}: Readonly<{
  guildSounds: SoundData[];
}>) {
  return (
    <AudioProvider>
      <div className="flex w-full flex-col">
        <SoundTableHeader />
        <div className="divide-y">
          {guildSounds.map((guildSound) => (
            <SoundRow
              key={guildSound.soundId}
              sound={guildSound.sound}
              discordSoundId={guildSound.discordSoundId}
              guildId={guildSound.guildId}
              className={guildSound.external ? "bg-yellow-100/5" : ""}
            />
          ))}
        </div>
      </div>
    </AudioProvider>
  );
}
