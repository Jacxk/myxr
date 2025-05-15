import { AudioProvider } from "~/context/AudioContext";
import { cn } from "~/lib/utils";

interface SoundGridProps {
  children: React.ReactNode;
  className?: string;
}

export function SoundsGrid({
  children,
  className = "",
}: Readonly<SoundGridProps>) {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-fr grid-cols-[repeat(auto-fit,160px)] justify-center gap-2 sm:justify-normal",
        className,
      )}
    >
      <AudioProvider>{children}</AudioProvider>
    </div>
  );
}
