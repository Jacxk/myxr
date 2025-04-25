"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface AudioContextType {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  currentId: string | null;
  play: (id: string, src: string) => void;
  pause: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const play = (id: string, src: string) => {
    if (audioRef.current) {
      audioRef.current.src = src;
      void audioRef.current.play();
      setCurrentId(id);
    }
  };
  const pause = () => {
    audioRef.current?.pause();
  };

  const value = useMemo(
    () => ({ audioRef, isPlaying, currentId, play, pause }),
    [audioRef, isPlaying, currentId],
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handleStop = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handleStop);
    audio.addEventListener("ended", handleStop);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handleStop);
      audio.removeEventListener("ended", handleStop);
    };
  }, []);

  return (
    <AudioContext value={value}>
      {children}
      <audio ref={audioRef} preload="auto" controls hidden>
        <track kind="captions" />
      </audio>
    </AudioContext>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
