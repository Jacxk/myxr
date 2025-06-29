import Sound from "~/components/sound/sound";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { AudioProvider } from "~/context/AudioContext";
import { api } from "~/trpc/server";

interface RelatedSoundsProps {
  tags: { name: string }[];
  currentSoundId: string;
  soundName: string;
  createdByName?: string | null;
}

export async function RelatedSounds({
  tags,
  currentSoundId,
  soundName,
  createdByName,
}: RelatedSoundsProps) {
  const tagNames = tags.map((tag) => tag.name).join(" ");
  const searchQuery = [tagNames, soundName, createdByName].join(" ").trim();

  const { sounds } = await api.sound.search({
    query: searchQuery,
    type: "normal",
    limit: 7,
  });

  const relatedSounds = sounds.filter((sound) => sound.id !== currentSoundId);

  if (relatedSounds.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Related Sounds</h2>
      <AudioProvider>
        <ScrollArea className="">
          <div className="flex flex-row">
            {relatedSounds.map((sound) => (
              <Sound key={sound.id} sound={sound} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </AudioProvider>
    </div>
  );
}
