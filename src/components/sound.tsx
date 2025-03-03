"use client";

import Link from "next/link";
import { useRef } from "react";
import Twemoji from "react-twemoji";
import { useAudio } from "../context/AudioContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

export interface SoundProperties {
  id: string | number;
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
    <Card
      className={`relative flex h-44 w-44 cursor-pointer flex-col justify-between ${className}`}
      onClick={play}
    >
      <CardHeader className="static">
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
      <CardContent className="h-30 absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center p-0 pointer-events-none">
        <Twemoji options={{ className: "twemoji" }}>{emoji}</Twemoji>
        <audio ref={audioRef} controls hidden>
          <source src={url} type="audio/mpeg" />
        </audio>
      </CardContent>
      <CardFooter className="static justify-end p-6 pb-3">
        <Link
          href={`/user/${createdBy.id}`}
          onClick={(e) => e.stopPropagation()}
          className="underline"
        >
          <p>{createdBy.name ?? "Unknown"}</p>
        </Link>
      </CardFooter>
    </Card>
  );
}
