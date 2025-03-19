"use client";

import Link from "next/link";
import { useRef } from "react";
import Twemoji from "react-twemoji";
import { AudioProvider, useAudio } from "~/context/AudioContext";
import { Button } from "../ui/button";

export type SoundData = {
  soundName: string;
  soundId: string;
  soundEmoji: string;
  url: string;
  createdBy: string;
  createdById: string;
  guildName: string;
  guildId: string;
  external: boolean;
};

function SoundRow({
  sound,
  className = "",
}: Readonly<{ sound: SoundData; className?: string }>) {
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
      <div className="grid h-full w-full cursor-pointer grid-cols-4 items-center">
        <div>
          <Twemoji options={{ className: "twemoji-list" }}>
            {sound.soundEmoji}
          </Twemoji>

          <audio ref={audioRef} controls hidden>
            <source src={sound.url} type="audio/mpeg" />
            <track kind="captions" />
          </audio>
        </div>
        <span className="col-span-2">{sound.soundName}</span>
        <div>
          <Button className="p-0" variant="link" asChild>
            <Link
              onClick={(e) => e.stopPropagation()}
              href={`/user/${sound.createdById}`}
            >
              {sound.createdBy}
            </Link>
          </Button>
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
  data,
}: Readonly<{
  data: SoundData[];
}>) {
  return (
    <AudioProvider>
      <div className="flex w-full flex-col">
        <SoundTableHeader />
        <div className="divide-y">
          {data.map((sound) => (
            <SoundRow
              key={sound.soundId + sound.guildId}
              sound={sound}
              className={sound.external ? "bg-yellow-100/5" : ""}
            />
          ))}
        </div>
      </div>
    </AudioProvider>
  );
}
