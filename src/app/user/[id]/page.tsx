import { notFound } from "next/navigation";
import Sound from "~/components/sound/sound";
import { SoundsGrid } from "~/components/sound/sounds-grid";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { api } from "~/trpc/server";
import { FollowButton } from "./follow-button";

export default async function Home({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const sounds = await api.user.getSounds(id);

  if (sounds.length === 0) return notFound();

  const createdBy = sounds[0]?.createdBy;
  const name = createdBy?.name ?? "Unknown User";
  const followerCount = 20000;

  return (
    <>
      <title>{`${name} - User`}</title>
      <meta name="author" content={name} />

      <div className="flex w-full flex-col gap-20">
        <div className="flex flex-row gap-10">
          <Avatar className="size-24 shrink-0 rounded-full">
            <AvatarImage
              src={createdBy?.image + "?size=96"}
              alt={createdBy?.name ?? ""}
            />
            <AvatarFallback delayMs={500}>
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex w-full justify-between">
            <div className="flex w-full flex-col gap-2">
              <h1 className="text-4xl font-bold">{name}</h1>
              <div className="flex gap-6">
                <div className="flex gap-1">
                  <span className="font-bold">
                    {followerCount.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">followers</span>
                </div>
                <div className="flex gap-1">
                  <span className="font-bold">
                    {sounds.length.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">sounds</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <FollowButton />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Sounds</h2>
          <SoundsGrid>
            {sounds.map((sound) => (
              <Sound key={sound.id} {...sound} />
            ))}
          </SoundsGrid>
        </div>
      </div>
    </>
  );
}
