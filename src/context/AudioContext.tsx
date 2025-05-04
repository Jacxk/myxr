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
  audio: HTMLAudioElement;
  isPlaying: boolean;
  currentId: string;
  play: (id: string, src: string, fromStart?: boolean) => void;
  preload: (src: string) => void;
  pause: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const preloadAudioRef = useRef<HTMLAudioElement>(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentId, setCurrentId] = useState<string>("");

  const play = (id: string, src: string) => {
    const audio = audioRef.current;

    audio.pause();
    audio.currentTime = 0;

    if (audio.src !== src) {
      audio.src = src;
      audio.load();
    }

    setCurrentId(id);
    void audio.play();
  };

  const preload = (src: string) => {
    const preloadAudio = preloadAudioRef.current;
    if (preloadAudio.src !== src) {
      preloadAudio.src = src;
      preloadAudio.load();
    }
  };

  const pause = () => {
    audioRef.current.pause();
  };

  const value = useMemo(
    () => ({
      audio: audioRef.current,
      isPlaying,
      currentId,
      play,
      pause,
      preload,
    }),
    [isPlaying, currentId],
  );

  useEffect(() => {
    const audio = audioRef.current;

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

  return <AudioContext value={value}>{children}</AudioContext>;
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
