"use client";

import Link from "next/link";
import { useRef } from "react";
import Twemoji from "react-twemoji";
import { AudioProvider, useAudio } from "~/context/AudioContext";
import { Button } from "../ui/button";
import { TrashIcon } from "../icons/trash";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useModal } from "~/context/ModalContext";

export type SoundData = {
  soundName: string;
  soundId: string;
  soundEmoji: string;
  url: string;
  createdBy: string;
  createdById: string;
  discordSoundId: string;
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
  const { mutate } = api.guild.deleteSound.useMutation();
  const { openModal, closeModal } = useModal();

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

  const deleteSound = (e: React.MouseEvent) => {
    e.stopPropagation();

    const onButtonClick = () => {
      mutate(
        { soundId: sound.discordSoundId, guildId: sound.guildId },
        {
          onSuccess: () => {
            toast("Sound deleted successfully!");
          },
          onError: (error) => {
            toast.error("Failed to delete sound.", {
              description: error.message,
            });
          },
        },
      );
      closeModal();
    };

    openModal({
      title: "Delete Sound",
      body: `Are you sure you want to delete the sound "${sound.soundName}"? This action cannot be undone.`,
      footer: <Button onClick={onButtonClick}>Confirm</Button>,
    });
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
        <div className="flex justify-between">
          <Button className="p-0" variant="link" asChild>
            <Link
              onClick={(e) => e.stopPropagation()}
              href={`/user/${sound.createdById}`}
            >
              {sound.createdBy}
            </Link>
          </Button>
          <Button variant="destructive" size="icon" onClick={deleteSound}>
            <TrashIcon />
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
