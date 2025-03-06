"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import Twemoji from "react-twemoji";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useAudio } from "../context/AudioContext";
import { PlusIcon } from "./icons/plus";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

export interface SoundProperties {
  id: number;
  name: string;
  emoji: string;
  url: string;
  tags?: string[];
  createdBy: { name: string | null; id: string };
  className?: string;
}

export default function Sound({
  id,
  name,
  emoji,
  url,
  createdBy,
  className,
}: Readonly<SoundProperties>) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentAudio, setCurrentAudio } = useAudio();
  const { mutate, isPending, isSuccess, isError } = api.guild.createSound.useMutation();

  const play = () => {
    if (audioRef.current) {
      if (currentAudio && currentAudio !== audioRef.current) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      if (audioRef.current.paused) {
        void audioRef.current.play();
        setCurrentAudio(audioRef.current);
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setCurrentAudio(null);
      }
    }
  };

  function addSoundToGuild(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void {
    event.stopPropagation();
    mutate({
      soundId: id,
      // TODO: get the selected guild
      guildId: "",
    });
  }

  useEffect(() => {
    if (isSuccess) toast("Sound added to guild");
    if (isError) toast.error("There was an error!")
  }, [isSuccess, isError]);

  return (
    <Card
      className={`flex w-48 cursor-pointer flex-col justify-between ${className}`}
      onClick={play}
    >
      <CardHeader>
        <CardTitle>
          <Link
            href={`/sound/${id}`}
            onClick={(e) => e.stopPropagation()}
            className="underline"
          >
            {name}
          </Link>
        </CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center p-0">
        <Twemoji options={{ className: "twemoji" }}>{emoji}</Twemoji>
        <audio ref={audioRef} controls hidden>
          <source src={url} type="audio/mpeg" />
          <track kind="captions" />
        </audio>
      </CardContent>
      <CardFooter className="flex w-full justify-between gap-4 p-6">
        <Button
          variant="outline"
          onClick={addSoundToGuild}
          disabled={isPending}
        >
          <PlusIcon />
        </Button>
        {/* <Link
          href={`/user/${createdBy.id}`}
          onClick={(e) => e.stopPropagation()}
          className="underline"
        >
          <p>{createdBy.name ?? "Unknown"}</p>
        </Link> */}
      </CardFooter>
    </Card>
  );
}
