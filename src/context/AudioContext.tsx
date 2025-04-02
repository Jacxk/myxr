"use client";

import {
  createContext,
  type ReactNode,
  type RefObject,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

interface AudioContextType {
  currentAudio: HTMLAudioElement | null;
  setCurrentAudio: (audio: HTMLAudioElement | null) => void;
  audioRef: RefObject<HTMLAudioElement>;
  play: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null,
  );

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

  const value = useMemo(
    () => ({ currentAudio, audioRef, play, setCurrentAudio }),
    [currentAudio],
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
