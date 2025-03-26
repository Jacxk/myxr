import Sound from "~/components/sound/sound";
import { AudioProvider } from "~/context/AudioContext";
import { api } from "~/trpc/server";

export default async function ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { page = "1", tag = "", q = "" } = await searchParams;
  const data = await api.sound.search({
    type: !tag ? "Normal" : "Tag",
    query: q || tag,
  });

  if (data.length === 0)
    return <span>No sounds where found matching the criteria.</span>;

  return (
    <AudioProvider>
      <div className="flex flex-row gap-4 ">
        {data.map((sound) => (
          <Sound key={sound.id} {...sound} />
        ))}
      </div>
    </AudioProvider>
  );
}
