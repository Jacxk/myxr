import Sound from "~/components/sound";
import { AudioProvider } from "~/context/AudioContext";
import { api } from "~/trpc/server";

export default async function Home({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const userSounds = await api.user.getSounds(id);
  const name = userSounds[0]?.createdBy.name;

  return (
    <AudioProvider>
      <div className="flex flex-col gap-4">
        <h1>Sounds uploaded by {name}</h1>
        <div className="flex flex-row gap-4">
          {userSounds.map((soundData) => (
            <Sound key={soundData.id} {...soundData} />
          ))}
        </div>
      </div>
    </AudioProvider>
  );
}
