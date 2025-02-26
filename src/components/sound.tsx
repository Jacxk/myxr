import { useRef } from "react";
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

export default function Sound({
  id,
  name,
  emoji,
  url,
  createdBy,
}: Readonly<{
  id: string | number;
  name: string;
  emoji: string;
  url: string;
  createdBy: { name: string | null; id: string };
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
    <Card className="cursor-pointer w-52 h-52" onClick={play}>
      <CardHeader>
        <CardTitle>
            <Link href={`/sound/${id}`} onClick={(e) => e.stopPropagation()}>{name}</Link>
        </CardTitle>
        <CardDescription className="text-center text-2xl">
          {emoji}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <audio ref={audioRef} controls hidden>
          <source src={url} type="audio/mpeg" />
        </audio>
      </CardContent>
      <CardFooter>
        <Link href={`/user/${createdBy.id}`} onClick={(e) => e.stopPropagation()}>
            <p>{createdBy.name ?? "Unknown"}</p>
        </Link>
      </CardFooter>
    </Card>
  );
}
