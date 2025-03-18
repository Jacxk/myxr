"use client";

import Link from "next/link";
import { useRef } from "react";
import Twemoji from "react-twemoji";
import { useAudio } from "../../context/AudioContext";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { AddToGuildButton } from "./add-button";
import { DeleteSoundButton } from "./delete-button";

export interface SoundProperties {
  id: number;
  name: string;
  emoji: string;
  url: string;
  tags?: string[];
  createdBy: { name: string | null; id: string };
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
  createdBy,
  className,
  displayAddButton = true,
  displayDeleteButton,
  discordSoundId,
  guildId,
}: Readonly<SoundProperties>) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentAudio, setCurrentAudio } = useAudio();

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

  return (
    <Card
      className={`flex w-48 cursor-pointer flex-col justify-between ${className}`}
      onClick={play}
    >
      <CardHeader>
        <CardTitle>
          <Button className="p-0" variant="link" asChild>
            <Link href={`/sound/${id}`} onClick={(e) => e.stopPropagation()}>
              {name}
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center p-0">
        <Twemoji options={{ className: "twemoji" }}>{emoji}</Twemoji>
        <audio ref={audioRef} controls hidden>
          <source src={url} type="audio/mpeg" />
          <track kind="captions" />
        </audio>
      </CardContent>
      <CardFooter className="flex w-full justify-between gap-4 p-6">
        {displayAddButton ? <AddToGuildButton soundId={id} /> : null}
        {displayDeleteButton ? (
          <DeleteSoundButton
            discordSoundId={discordSoundId!}
            guildId={guildId!}
          />
        ) : null}
      </CardFooter>
    </Card>
  );
}
