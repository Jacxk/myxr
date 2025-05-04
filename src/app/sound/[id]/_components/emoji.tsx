"use client";

import Image from "next/image";
import { getEmojiUrl } from "~/components/sound/sound";

export function SoundEmoji({ emoji }: Readonly<{ emoji: string }>) {
  const emojiUrl = getEmojiUrl(emoji, true);
  return <Image src={emojiUrl} alt={emoji} width={100} height={100} />;
}
