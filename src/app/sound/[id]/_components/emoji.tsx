"use client";

import Twemoji from "react-twemoji";

export function SoundEmoji({ emoji }: Readonly<{ emoji: string }>) {
  return <Twemoji options={{ className: "h-24 w-24" }}>{emoji}</Twemoji>;
}
