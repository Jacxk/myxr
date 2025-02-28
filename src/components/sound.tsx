"use client";

import { useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useAudio } from "../context/AudioContext";
import Link from "next/link";
import Twemoji from "react-twemoji";

export interface SoundProperties {
  id: string | number;
  name: string;
  emoji: string;
  url: string;
  createdBy: { name: string | null; id: string };
}

export default function Sound({
  id,
  name,
  emoji,
  url,
  createdBy,
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
      className="flex h-52 w-52 cursor-pointer flex-col justify-around"
      onClick={play}
    >
      <CardHeader>
        <CardTitle>
          <Link href={`/sound/${id}`} onClick={(e) => e.stopPropagation()}>
            {name}
          </Link>
        </CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <Twemoji options={{ className: "twemoji" }}>{emoji}</Twemoji>
        <audio ref={audioRef} controls hidden>
          <source src={url} type="audio/mpeg" />
        </audio>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <Link
          href={`/user/${createdBy.id}`}
          onClick={(e) => e.stopPropagation()}
        >
          <p>{createdBy.name ?? "Unknown"}</p>
        </Link>
      </CardFooter>
    </Card>
  );
}
