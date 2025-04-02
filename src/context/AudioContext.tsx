"use client";

import {
  createContext,
  type ReactNode,
  type RefObject,
  useContext,
  useMemo,
  useState,
} from "react";

interface AudioContextType {
  currentAudio: HTMLAudioElement | null;
  play: (ref: RefObject<HTMLAudioElement>) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null,
  );

  const play = (ref: RefObject<HTMLAudioElement>) => {
    if (ref.current) {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      ref.current.play();
      setCurrentAudio(ref.current);
    }
  };

  const value = useMemo(
    () => ({ currentAudio, play }),
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
