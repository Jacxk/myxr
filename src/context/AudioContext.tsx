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
  audio: HTMLAudioElement | null;
  isPlaying: boolean;
  currentId: string;
  play: (id: string, src: string) => void;
  preload: (src: string) => void;
  pause: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const setupAudioElement = (
  audio: HTMLAudioElement,
  onPlay: () => void,
  onStop: () => void,
) => {
  audio.addEventListener("play", onPlay);
  audio.addEventListener("pause", onStop);
  audio.addEventListener("ended", onStop);
  return () => {
    audio.removeEventListener("play", onPlay);
    audio.removeEventListener("pause", onStop);
    audio.removeEventListener("ended", onStop);
  };
};

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const preloadAudioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentId, setCurrentId] = useState<string>("");

  const handlePlay = () => setIsPlaying(true);
  const handleStop = () => setIsPlaying(false);

  const swapAudioElements = (
    current: HTMLAudioElement,
    preloaded: HTMLAudioElement,
  ) => {
    current.pause();
    current.currentTime = 0;

    setupAudioElement(current, handlePlay, handleStop);
    setupAudioElement(preloaded, handlePlay, handleStop);

    audioRef.current = preloaded;
    preloadAudioRef.current = current;

    return preloaded;
  };

  const play = (id: string, src: string) => {
    let audio = audioRef.current;
    if (!audio) return;

    const preloadAudio = preloadAudioRef.current;
    if (preloadAudio?.src === src) {
      audio = swapAudioElements(audio, preloadAudio);
    } else {
      audio.pause();
      audio.currentTime = 0;
      audio.src = src;
      audio.load();
    }

    setCurrentId(id);
    void audio.play();
  };

  const preload = (src: string) => {
    const preloadAudio = preloadAudioRef.current;
    if (!preloadAudio || preloadAudio.src === src) return;

    preloadAudio.pause();
    preloadAudio.currentTime = 0;
    preloadAudio.src = src;
    preloadAudio.load();
  };

  const pause = () => {
    audioRef.current?.pause();
  };

  useEffect(() => {
    const audio = new Audio();
    const preloadAudio = new Audio();

    audioRef.current = audio;
    preloadAudioRef.current = preloadAudio;

    const cleanup = setupAudioElement(audio, handlePlay, handleStop);

    return () => {
      cleanup();
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

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

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
