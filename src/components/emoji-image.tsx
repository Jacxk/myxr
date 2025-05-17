import Image from "next/image";

export function getEmojiUrl(emoji: string, svg = false) {
  const codePoints = Array.from(emoji)
    .map((char) => char.codePointAt(0)!)
    .filter((cp) => cp !== 0xfe0f)
    .map((cp) => cp.toString(16))
    .join("-");

  const ext = svg ? "svg" : "png";
  const folder = svg ? "svg" : "72x72";
  return `https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/${folder}/${codePoints}.${ext}`;
}

type EmojiImageProps = {
  emoji: string;
  size?: {
    width: number;
    height: number;
  };
  className?: string;
  displayIfEmpty?: boolean;
};

export function EmojiImage({
  emoji,
  className,
  size,
  displayIfEmpty = false,
}: EmojiImageProps) {
  if (!emoji && !displayIfEmpty) return null;

  const emojiUrl = emoji.startsWith("http") ? emoji : getEmojiUrl(emoji);

  return (
    <Image
      src={emojiUrl}
      alt={emoji}
      width={size?.width ?? 100}
      height={size?.height ?? 100}
      className={className}
      draggable={false}
    />
  );
}
