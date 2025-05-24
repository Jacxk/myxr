import Link from "next/link";
import { Main } from "~/components/main";
import { EmojiButton } from "~/components/sound/sound";
import { Button } from "~/components/ui/button";
import { AudioProvider } from "~/context/AudioContext";

export default function NotFound() {
  return (
    <Main className="flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-row gap-2 text-8xl font-extrabold">
          <span>4</span>
          <AudioProvider>
            <EmojiButton id="404" url="/404-sound.mp3" emoji="😧" asSvg />
          </AudioProvider>
          <span>4</span>
        </div>
        <p className="text-muted-foreground">
          Seems like this page does not exists, maybe it was deleted?
        </p>
        <div className="mt-5 flex flex-row gap-2">
          <Button variant="secondary">
            <Link href="/sounds">Explore Sounds</Link>
          </Button>
          <Button>
            <Link href="/">Back Home</Link>
          </Button>
        </div>
      </div>
    </Main>
  );
}
